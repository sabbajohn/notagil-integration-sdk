<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Tests;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use Illuminate\Bus\Dispatcher;
use Illuminate\Config\Repository;
use Illuminate\Contracts\Bus\Dispatcher as DispatcherContract;
use Illuminate\Contracts\Encryption\Encrypter as EncrypterContract;
use Illuminate\Database\DatabaseServiceProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Encryption\Encrypter;
use Illuminate\Events\EventServiceProvider;
use Illuminate\Foundation\Application;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Testing\Fakes\BusFake;
use NotaAgil\Integration\Laravel\Contracts\ProvisioningCredentialResolver;
use NotaAgil\Integration\Laravel\Contracts\ProvisioningSource;
use NotaAgil\Integration\Laravel\Jobs\ProcessProvisioning;
use NotaAgil\Integration\Laravel\NotaAgilServiceProvider;
use NotaAgil\Integration\Laravel\ProvisioningClientFactory;
use NotaAgil\Integration\Laravel\ProvisioningCoordinator;
use NotaAgil\Integration\Laravel\ProvisioningCredentials;
use NotaAgil\Integration\Laravel\ProvisioningSettings;
use NotaAgil\Integration\Laravel\ProvisioningState;
use NotaAgil\Integration\Laravel\ProvisioningStore;
use NotaAgil\Integration\Laravel\ProvisioningWorker;
use NotaAgil\Integration\Provisioning\ActivationRequest;
use NotaAgil\Integration\Provisioning\Owner;
use NotaAgil\Integration\Provisioning\ProvisioningRequest;
use NotaAgil\Integration\Provisioning\ProvisioningResult;
use PHPUnit\Framework\Attributes\Group;
use PHPUnit\Framework\TestCase;
use Psr\Log\AbstractLogger;
use Stringable;

/** Entirely synthetic Application, SQLite memory, fake queue, mock HTTP. No .env. */
#[Group('laravel-provisioning')]
final class LaravelProvisioningTest extends TestCase
{
    private Application $app;
    private BusFake $bus;
    private FixtureLogger $logger;
    private array $history = [];
    private array $config;

    protected function setUp(): void
    {
        if (! class_exists(Application::class)) {
            self::markTestSkipped('Optional Laravel 12 bridge tests require laravel/framework ^12.');
        }
        Carbon::setTestNow(Carbon::parse('2026-10-20 12:00:00', 'UTC'));
        $this->config = [
            'enabled' => true, 'installation_namespace' => 'synthetic-install', 'partner_scope' => 'synthetic-partner',
            'source' => FixtureSource::class, 'credential_resolver' => FixtureCredentials::class,
            'models' => [FixtureEstablishment::class], 'queue_connection' => 'fixture',
            'queue' => 'notaagil-provisioning', 'max_attempts' => 8,
        ];
        $this->app = new Application(sys_get_temp_dir().'/notaagil-synthetic-application');
        $this->app->instance('config', new Repository([
            'app' => ['env' => 'testing', 'timezone' => 'UTC'],
            'database' => ['default' => 'fixture', 'connections' => [
                'fixture' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '', 'foreign_key_constraints' => true, 'sticky' => false],
                'other' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''],
            ]],
            'queue' => ['default' => 'fixture', 'connections' => ['fixture' => ['driver' => 'database']]],
            'notaagil-provisioning' => $this->config,
        ]));
        $this->logger = new FixtureLogger();
        $this->app->instance('log', $this->logger);
        $this->app->instance(EncrypterContract::class, new Encrypter(str_repeat('s', 32), 'AES-256-CBC'));
        $this->bus = new BusFake(new Dispatcher($this->app));
        $this->app->instance(DispatcherContract::class, $this->bus);
        $this->app->instance(FixtureCredentials::class, new FixtureCredentials());
        Facade::clearResolvedInstances();
        Facade::setFacadeApplication($this->app);
        $this->app->register(EventServiceProvider::class);
        $this->app->register(DatabaseServiceProvider::class);
        $this->app->register(NotaAgilServiceProvider::class);
        $this->app->boot();
        $this->migration()->up();
        $this->app['db']->connection()->getSchemaBuilder()->create('fixture_establishments', function (Blueprint $table): void {
            $table->increments('id');
            $table->boolean('first')->default(true);
            $table->string('cnpj')->default('12ABC34501DE35');
            $table->string('owner_email')->nullable();
            $table->string('name')->default('Synthetic account');
        });
    }

    private function migration(): object
    {
        return require __DIR__.'/../database/migrations/2026_10_20_000001_create_notaagil_provisioning_outbox.php';
    }

    protected function tearDown(): void
    {
        if (isset($this->app)) {
            $this->app['db']->disconnect();
            $this->app->flush();
            Model::unsetEventDispatcher();
            Model::unsetConnectionResolver();
            Facade::clearResolvedInstances();
            Facade::setFacadeApplication(null);
            Carbon::setTestNow();
        }
        parent::tearDown();
    }

    private function store(): ProvisioningStore
    {
        return $this->app->make(ProvisioningStore::class);
    }

    private function scopedStore(array $overrides): ProvisioningStore
    {
        return new ProvisioningStore(
            $this->app['db'],
            $this->app->make(EncrypterContract::class),
            new ProvisioningSettings([...$this->config, ...$overrides]),
        );
    }

    /** Simulate CI raw identity columns without claiming a MySQL/MariaDB execution. */
    private function makeRawIdentityColumnsCaseInsensitive(): void
    {
        $db = $this->app['db']->connection();
        $schema = $db->getPdo()->query("select sql from sqlite_master where type='table' and name='notaagil_provisionings'")->fetchColumn();
        $indexes = $db->getPdo()->query("select sql from sqlite_master where type='index' and tbl_name='notaagil_provisionings' and sql is not null")->fetchAll(\PDO::FETCH_COLUMN);
        $schema = preg_replace('/("(?:installation_namespace|partner_scope|source_key)" varchar(?:\(\d+\))?)/', '$1 collate nocase', $schema, -1, $count);
        self::assertSame(3, $count);
        $db->statement('drop table notaagil_provisionings'); // This test's empty SQLite:memory: only.
        $db->statement($schema);
        foreach ($indexes as $sql) {
            $db->statement($sql);
        }
    }

    /** Separate PDO is a genuinely stale replica; sticky is explicitly disabled. */
    private function attachLaggingReplica(?object $row = null): \PDO
    {
        $db = $this->app['db']->connection();
        self::assertFalse($db->getConfig('sticky'));
        $replica = new \PDO('sqlite::memory:');
        $replica->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        $sql = $db->getPdo()->query("select sql from sqlite_master where type='table' and name='notaagil_provisionings'")->fetchColumn();
        $replica->exec($sql);
        if ($row !== null) {
            $values = (array) $row;
            $columns = implode(', ', array_map(fn ($column) => '"'.$column.'"', array_keys($values)));
            $statement = $replica->prepare('insert into notaagil_provisionings ('.$columns.') values ('.implode(', ', array_fill(0, count($values), '?')).')');
            $statement->execute(array_values($values));
        }
        $db->setReadPdo($replica);
        self::assertSame($replica, $db->getReadPdo());

        return $replica;
    }

    private function worker(array $responses): ProvisioningWorker
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($this->history));
        $this->app->instance(ProvisioningClientFactory::class, new ProvisioningClientFactory(new Client(['handler' => $stack])));

        return $this->app->make(ProvisioningWorker::class);
    }

    private function create(): object
    {
        FixtureEstablishment::create(['owner_email' => 'owner@example.test']);

        return $this->store()->get(1);
    }

    private function response(object $row, string $state = 'active', int $status = 201): Response
    {
        return new Response($status, [], json_encode(['data' => ProvisioningClientTest::payload($state, $row->external_customer_id)]));
    }

    private function due(): void
    {
        Carbon::setTestNow(Carbon::now('UTC')->addHours(2));
    }

    public function test_intent_is_transactional_and_dispatch_waits_until_outer_commit(): void
    {
        $db = $this->app['db']->connection();
        $db->beginTransaction();
        $db->beginTransaction();
        $model = FixtureEstablishment::create();
        self::assertNull($this->store()->get(1)->snapshot);
        $this->bus->assertNothingDispatched();
        $db->commit();
        $this->bus->assertNothingDispatched();
        // Owner did not exist at the created event; supplied explicitly before commit.
        $model->update(['owner_email' => 'owner@example.test']);
        $db->commit();
        $this->bus->assertDispatchedTimes(ProcessProvisioning::class, 1);
        $worker = $this->worker([$this->response($this->store()->get(1))]);
        $worker->process(1);
        self::assertSame('concluido', $this->store()->get(1)->state);
    }

    public function test_rollback_removes_intent_and_never_dispatches(): void
    {
        $db = $this->app['db']->connection();
        $db->beginTransaction();
        FixtureEstablishment::create(['owner_email' => 'owner@example.test']);
        $db->rollBack();
        self::assertNull($this->store()->get(1));
        $this->bus->assertNothingDispatched();
        self::assertSame([], $this->history);
    }

    public function test_worker_refuses_http_inside_an_existing_database_transaction(): void
    {
        $row = $this->create();
        $worker = $this->worker([$this->response($row)]);
        $db = $this->app['db']->connection();
        $db->beginTransaction();
        try {
            $worker->process(1);
            self::fail('Worker must refuse a source transaction.');
        } catch (\LogicException) {
            self::assertSame([], $this->history);
            self::assertSame('pendente', $this->store()->get(1)->state);
        } finally {
            $db->rollBack();
        }
    }

    public function test_frozen_encrypted_snapshot_is_replayed_after_timeout_even_if_source_changes(): void
    {
        $row = $this->create();
        $worker = $this->worker([
            new ConnectException('synthetic-secret', new Request('POST', 'https://example.test')),
            $this->response($row),
        ]);
        $worker->process(1);
        $pending = $this->store()->get(1);
        self::assertSame('resultado_incerto', $pending->state);
        self::assertStringNotContainsString('owner@example.test', $pending->snapshot);
        self::assertStringNotContainsString('synthetic-partner-secret', $pending->snapshot);
        FixtureEstablishment::find(1)->update(['name' => 'Changed after first POST', 'owner_email' => 'different@example.test']);
        $this->due();
        $worker->process(1);
        self::assertSame('concluido', $this->store()->get(1)->state);
        self::assertSame($pending->snapshot_hash, $this->store()->get(1)->snapshot_hash);
        self::assertSame((string) $this->history[0]['request']->getBody(), (string) $this->history[1]['request']->getBody());
        self::assertSame($row->idempotency_key, $this->history[1]['request']->getHeaderLine('Idempotency-Key'));
        self::assertStringNotContainsString('synthetic-secret', json_encode($this->logger->entries));
        self::assertStringNotContainsString('owner@example.test', json_encode($this->logger->entries));
    }

    public function test_pending_account_requires_explicit_activation_using_same_identity_and_key(): void
    {
        $row = $this->create();
        $worker = $this->worker([$this->response($row, 'pending_configuration'), $this->response($row, 'active', 200)]);
        $worker->process(1);
        self::assertSame('aguardando_ativacao', $this->store()->get(1)->state);
        self::assertSame([], $this->store()->dueIds());
        $this->app->make(ProvisioningCoordinator::class)->requestActivation(1, new Owner('Explicit owner', 'owner@example.test'));
        $worker->process(1);
        $completed = $this->store()->get(1);
        self::assertSame('concluido', $completed->state);
        self::assertSame('9007199254740993001', $completed->remote_account_id);
        self::assertSame('00042', $completed->remote_empresa_id);
        self::assertSame($row->idempotency_key, $this->history[1]['request']->getHeaderLine('Idempotency-Key'));
        self::assertSame('/api/v2/provisioning/clients/activate', $this->history[1]['request']->getUri()->getPath());
        $this->expectException(\LogicException::class);
        $this->app->make(ProvisioningCoordinator::class)->requestActivation(1, new Owner('Other owner', 'other@example.test'));
    }

    public function test_stale_generation_cannot_mutate_newer_success_or_snapshot(): void
    {
        $row = $this->create();
        $old = $this->store()->claim(1);
        $this->store()->freeze($old, ProvisioningClientTest::snapshot($row->external_customer_id));
        self::assertNull($this->store()->claim(1));
        $this->due();
        $new = $this->store()->claim(1);
        self::assertGreaterThan($old->claim_generation, $new->claim_generation);
        $result = ProvisioningResult::fromArray(ProvisioningClientTest::payload('active', $row->external_customer_id), 201);
        self::assertTrue($this->store()->complete($new, $result));
        self::assertFalse($this->store()->complete($old, $result));
        self::assertFalse($this->store()->defer($old, ProvisioningState::Blocked, 'conflict', 409));
        self::assertNull($this->store()->freeze($old, ProvisioningClientTest::snapshot($row->external_customer_id)));
        self::assertSame('concluido', $this->store()->get(1)->state);
    }

    public function test_invalid_credentials_block_then_rotation_replays_original_identity(): void
    {
        $row = $this->create();
        $worker = $this->worker([new Response(401, [], 'private-server-details'), $this->response($row)]);
        $worker->process(1);
        self::assertSame('bloqueado', $this->store()->get(1)->state);
        self::assertSame([], $this->store()->dueIds());
        $worker->process(1);
        self::assertCount(1, $this->history);
        $this->app->make(FixtureCredentials::class)->token = 'rotated-synthetic-secret';
        $this->app->make(ProvisioningCoordinator::class)->retryBlocked(1);
        $worker->process(1);
        self::assertSame('concluido', $this->store()->get(1)->state);
        self::assertSame($row->external_customer_id, $this->store()->get(1)->external_customer_id);
        self::assertSame($row->idempotency_key, $this->history[1]['request']->getHeaderLine('Idempotency-Key'));
        self::assertSame('Bearer rotated-synthetic-secret', $this->history[1]['request']->getHeaderLine('Authorization'));
    }

    public function test_retry_after_is_respected_and_no_http_before_due(): void
    {
        $row = $this->create();
        $worker = $this->worker([new Response(429, ['Retry-After' => '180']), $this->response($row)]);
        $worker->process(1);
        self::assertSame('2026-10-20 12:03:00', $this->store()->get(1)->next_retry_at);
        self::assertSame([], $this->store()->dueIds());
        $worker->process(1);
        self::assertCount(1, $this->history);
        $this->due();
        $worker->process(1);
        self::assertSame('concluido', $this->store()->get(1)->state);
    }

    public function test_partner_namespace_fences_jobs_and_partner_change_does_not_duplicate_source(): void
    {
        $row = $this->create();
        $other = new ProvisioningStore($this->app['db'], $this->app->make(EncrypterContract::class), new ProvisioningSettings([
            ...$this->config, 'partner_scope' => 'other-partner',
        ]));
        self::assertNull($other->get((int) $row->id));
        self::assertNull($other->claim((int) $row->id));
        self::assertSame([], $other->dueIds());
        try {
            $other->record('establishment:1');
            self::fail('Partner change must require review.');
        } catch (\RuntimeException) {
            self::assertSame(1, $this->app['db']->table('notaagil_provisionings')->count());
        }
        $this->expectException(\LogicException::class);
        $other->prepareActivation((int) $row->id, new ActivationRequest($row->external_customer_id, new Owner('Owner', 'owner@example.test')));
    }

    public function test_lost_dispatch_is_recoverable_and_queue_payload_contains_only_local_id(): void
    {
        $row = $this->create();
        self::assertSame([1], $this->store()->dueIds());
        $job = new ProcessProvisioning((int) $row->id);
        self::assertStringNotContainsString('owner@example.test', serialize($job));
        self::assertStringNotContainsString('synthetic-partner-secret', serialize($job));
        $this->bus->assertDispatched(ProcessProvisioning::class, fn ($job) => $job->connection === 'fixture' && $job->provisioningId === 1);
        $this->worker([$this->response($row)])->process(1);
        self::assertSame([], $this->store()->dueIds());
    }

    public function test_queue_outage_does_not_erase_committed_intent(): void
    {
        $bus = new class ($this->app) extends Dispatcher {
            public function dispatch($command)
            {
                throw new \RuntimeException('private queue details');
            }
        };
        $this->app->instance(DispatcherContract::class, $bus);
        $row = $this->create();
        self::assertSame([1], $this->store()->dueIds());
        self::assertSame('pendente', $row->state);
        self::assertStringNotContainsString('private queue details', json_encode($this->logger->entries));
    }

    public function test_missing_explicit_owner_blocks_before_any_http_and_no_backfill_is_scanned(): void
    {
        FixtureEstablishment::create();
        $this->worker([])->process(1);
        self::assertSame('bloqueado', $this->store()->get(1)->state);
        self::assertSame('invalid_source_snapshot', $this->store()->get(1)->last_error_code);
        self::assertSame([], $this->history);
    }

    public function test_adapter_can_exclude_cpf_and_subsequent_establishments(): void
    {
        FixtureEstablishment::create(['cnpj' => '12345678901', 'owner_email' => 'owner@example.test']);
        FixtureEstablishment::create(['first' => false, 'owner_email' => 'owner@example.test']);
        self::assertSame([], $this->store()->dueIds());
        $this->bus->assertNothingDispatched();
    }

    public function test_rate_limit_is_shared_across_rotation_and_is_conservative(): void
    {
        for ($i = 0; $i < 30; $i++) {
            self::assertSame(0, $this->store()->rateDelay('https://api.example.test'));
        }
        self::assertSame(60, $this->store()->rateDelay('https://api.example.test'));
        $this->due();
        self::assertSame(0, $this->store()->rateDelay('https://api.example.test'));
    }

    public function test_migration_rollback_preserves_binding_and_snapshot(): void
    {
        $row = $this->create();
        $this->worker([$this->response($row)])->process(1);
        $before = $this->store()->get(1);
        $this->migration()->down();
        $this->migration()->up(); // Re-applying after a preserving rollback is safe.
        self::assertSame($before->snapshot, $this->store()->get(1)->snapshot);
        self::assertSame($before->remote_account_id, $this->store()->get(1)->remote_account_id);
    }

    public function test_disabled_job_does_not_resolve_worker_or_call_http(): void
    {
        $this->create();
        $this->app['config']->set('notaagil-provisioning.enabled', false);
        (new ProcessProvisioning(1))->handle();
        self::assertSame('pendente', $this->store()->get(1)->state);
        self::assertSame([], $this->history);
    }

    public function test_actual_sync_driver_is_rejected_even_with_different_connection_name(): void
    {
        $this->app['config']->set('queue.connections.fixture.driver', 'sync');
        $this->expectException(\LogicException::class);
        (new NotaAgilServiceProvider($this->app))->boot();
    }

    public function test_source_and_outbox_on_different_connections_are_rejected(): void
    {
        $model = new FixtureEstablishment(['id' => 1, 'owner_email' => 'owner@example.test']);
        $model->setConnection('other');
        $this->expectException(\LogicException::class);
        $this->app->make(ProvisioningCoordinator::class)->created($model);
    }

    public function test_platform_change_after_uncertain_post_blocks_without_contacting_new_origin(): void
    {
        $this->create();
        $worker = $this->worker([new Response(503)]);
        $worker->process(1);
        $this->app->make(FixtureCredentials::class)->platformUrl = 'https://different.example.test';
        $this->due();
        $worker->process(1);
        self::assertCount(1, $this->history);
        self::assertSame('bloqueado', $this->store()->get(1)->state);
        self::assertSame('https://api.example.test', $this->store()->get(1)->platform_url);
    }

    public function test_activation_cannot_replace_existing_remote_binding(): void
    {
        $row = $this->create();
        $changed = ProvisioningClientTest::payload('active', $row->external_customer_id);
        $changed['empresa']['id'] = 'other-company';
        $worker = $this->worker([$this->response($row, 'pending_configuration'), new Response(200, [], json_encode(['data' => $changed]))]);
        $worker->process(1);
        $this->app->make(ProvisioningCoordinator::class)->requestActivation(1, new Owner('Owner', 'owner@example.test'));
        $worker->process(1);
        self::assertSame('resultado_incerto', $this->store()->get(1)->state);
        self::assertSame('00042', $this->store()->get(1)->remote_empresa_id);
        self::assertSame('9007199254740993001', $this->store()->get(1)->remote_account_id);
    }

    public function test_malformed_success_retains_uncertainty_and_duplicate_completed_job_is_noop(): void
    {
        $row = $this->create();
        $worker = $this->worker([new Response(201, [], '{"data":{}}'), $this->response($row)]);
        $worker->process(1);
        self::assertSame('resultado_incerto', $this->store()->get(1)->state);
        self::assertNull($this->store()->get(1)->remote_empresa_id);
        $this->due();
        $worker->process(1);
        $worker->process(1);
        self::assertCount(2, $this->history);
        self::assertSame('concluido', $this->store()->get(1)->state);
    }

    public function test_retry_budget_stops_without_replacing_snapshot_or_key(): void
    {
        $row = $this->create();
        $this->app->instance(ProvisioningSettings::class, new ProvisioningSettings([...$this->config, 'max_attempts' => 1]));
        $worker = $this->worker([new Response(500)]);
        $worker->process(1);
        $frozen = $this->store()->get(1)->snapshot;
        $this->due();
        $worker->process(1);
        self::assertSame('bloqueado', $this->store()->get(1)->state);
        self::assertSame('retry_exhausted', $this->store()->get(1)->last_error_code);
        self::assertSame($row->idempotency_key, $this->store()->get(1)->idempotency_key);
        self::assertSame($frozen, $this->store()->get(1)->snapshot);
        self::assertCount(1, $this->history);
    }

    public function test_local_throttle_does_not_consume_remote_attempt_budget(): void
    {
        $row = $this->create();
        FixtureEstablishment::create(['owner_email' => 'second@example.test']);
        $this->app->instance(ProvisioningSettings::class, new ProvisioningSettings([...$this->config, 'requests_per_minute' => 1]));
        $worker = $this->worker([$this->response($row)]);
        $worker->process(1);
        $worker->process(2);
        self::assertSame(0, $this->store()->get(2)->attempts);
        self::assertSame('local_rate_limit', $this->store()->get(2)->last_error_code);
        self::assertCount(1, $this->history);
    }

    public function test_disabled_provider_does_not_observe_models_or_backfill_existing_data(): void
    {
        $this->app['events']->forget('eloquent.created: '.FixtureEstablishment::class);
        $this->app['config']->set('notaagil-provisioning.enabled', false);
        $provider = new NotaAgilServiceProvider($this->app);
        $provider->register();
        $provider->boot();
        FixtureEstablishment::create(['owner_email' => 'owner@example.test']);
        self::assertSame(0, $this->app['db']->table('notaagil_provisionings')->count());
        $this->bus->assertNothingDispatched();
    }

    public function test_reconciliation_command_queues_persisted_intents_only_and_honors_disabled_flag(): void
    {
        $this->create();
        $command = new \NotaAgil\Integration\Laravel\Commands\ReconcileProvisionings();
        $command->setLaravel($this->app);
        $output = new \Symfony\Component\Console\Output\BufferedOutput();
        self::assertSame(0, $command->run(new \Symfony\Component\Console\Input\ArrayInput(['--limit' => '10']), $output));
        $this->bus->assertDispatchedTimes(ProcessProvisioning::class, 2);
        self::assertStringContainsString('Queued 1 persisted intents.', $output->fetch());
        $this->app['config']->set('notaagil-provisioning.enabled', false);
        self::assertSame(1, $command->run(new \Symfony\Component\Console\Input\ArrayInput([]), $output));
        $this->bus->assertDispatchedTimes(ProcessProvisioning::class, 2);
    }

    public function test_source_keys_differing_only_in_case_are_distinct_with_ci_columns(): void
    {
        $this->makeRawIdentityColumnsCaseInsensitive();
        $upper = $this->store()->record('client:A');
        // Prove that the raw column fixture really does compare without case.
        self::assertSame($upper->id, $this->app['db']->table('notaagil_provisionings')->where('source_key', 'client:a')->value('id'));
        $lower = $this->store()->record('client:a');
        self::assertNotSame($upper->id, $lower->id);
        self::assertNotSame($upper->external_customer_id, $lower->external_customer_id);
        self::assertNotSame($upper->idempotency_key, $lower->idempotency_key);
        self::assertSame('client:A', $this->store()->record('client:A')->source_key);
        self::assertSame($upper->id, $this->store()->record('client:A')->id);
        self::assertSame($lower->id, $this->store()->record('client:a')->id);
    }

    public function test_partner_case_isolation_and_source_transfer_guard_survive_ci_columns(): void
    {
        $this->makeRawIdentityColumnsCaseInsensitive();
        $upper = $this->scopedStore(['partner_scope' => 'Partner:A']);
        $lower = $this->scopedStore(['partner_scope' => 'partner:a']);
        $a = $upper->record('client:1');
        $b = $lower->record('client:2');
        self::assertSame([$a->id], $upper->dueIds());
        self::assertSame([$b->id], $lower->dueIds());
        self::assertNull($lower->get((int) $a->id));
        self::assertNull($lower->claim((int) $a->id));
        self::assertNull($upper->get((int) $b->id));
        $this->expectException(\RuntimeException::class);
        $lower->record('client:1'); // Same installation/source cannot silently change partner.
    }

    public function test_installation_namespace_case_isolation_survives_ci_columns(): void
    {
        $this->makeRawIdentityColumnsCaseInsensitive();
        $upper = $this->scopedStore(['installation_namespace' => 'Install:A']);
        $lower = $this->scopedStore(['installation_namespace' => 'install:a']);
        $a = $upper->record('client:1');
        $b = $lower->record('client:1');
        self::assertNotSame($a->id, $b->id);
        self::assertNotSame($a->idempotency_key, $b->idempotency_key);
        self::assertNull($lower->get((int) $a->id));
        self::assertNull($upper->get((int) $b->id));
    }

    public function test_digest_match_with_different_raw_identity_fails_closed(): void
    {
        $row = $this->store()->record('client:A');
        $this->app['db']->table('notaagil_provisionings')->where('id', $row->id)->update(['source_key' => 'client:a']);
        $this->expectException(\LogicException::class);
        $this->expectExceptionMessage('identity integrity failure');
        $this->store()->record('client:A'); // insertOrIgnore must never return an aliased binding.
    }

    public function test_older_draft_schema_is_rejected_without_removing_persisted_identity(): void
    {
        $schema = $this->app['db']->connection()->getSchemaBuilder();
        $schema->drop('notaagil_provisionings'); // Synthetic empty table in this test only.
        $schema->create('notaagil_provisionings', function (Blueprint $table): void {
            $table->integer('id')->primary();
            $table->string('installation_namespace');
            $table->string('partner_scope');
            $table->string('source_key');
            $table->string('external_customer_id');
        });
        $this->app['db']->table('notaagil_provisionings')->insert([
            'id' => 42, 'installation_namespace' => 'synthetic-install', 'partner_scope' => 'synthetic-partner',
            'source_key' => 'client:A', 'external_customer_id' => 'preserve-existing-binding',
        ]);
        try {
            $this->migration()->up();
            self::fail('An older draft requires an explicit identity upgrade.');
        } catch (\LogicException $error) {
            self::assertStringContainsString('Retain existing provisioning history', $error->getMessage());
            self::assertSame('preserve-existing-binding', $this->app['db']->table('notaagil_provisionings')->where('id', 42)->value('external_customer_id'));
        }
    }

    public function test_frozen_snapshot_uses_primary_while_replica_still_has_null_snapshot(): void
    {
        $row = $this->store()->record('client:A');
        $claim = $this->store()->claim((int) $row->id);
        $replica = $this->attachLaggingReplica($claim);
        $snapshot = ProvisioningClientTest::snapshot($row->external_customer_id);
        self::assertSame($snapshot->toArray(), $this->store()->freeze($claim, $snapshot)->toArray());
        self::assertNull($replica->query('select snapshot from notaagil_provisionings')->fetchColumn());
        self::assertNotNull($this->store()->get((int) $row->id)->snapshot);
        self::assertSame($replica, $this->app['db']->connection()->getReadPdo());
    }

    public function test_platform_binding_uses_primary_while_replica_has_stale_url(): void
    {
        $row = $this->store()->record('client:A');
        $claim = $this->store()->claim((int) $row->id);
        $stale = clone $claim;
        $stale->platform_url = 'https://stale.example.test';
        $replica = $this->attachLaggingReplica($stale);
        self::assertTrue($this->store()->bindPlatform($claim, 'https://api.example.test'));
        self::assertSame('https://stale.example.test', $replica->query('select platform_url from notaagil_provisionings')->fetchColumn());
        self::assertSame('https://api.example.test', $this->store()->get((int) $row->id)->platform_url);
    }

    public function test_control_lifecycle_and_reconciliation_use_primary_with_empty_replica(): void
    {
        $replica = $this->attachLaggingReplica();
        $row = $this->store()->record('client:A');
        self::assertSame([$row->id], $this->store()->dueIds());
        $claim = $this->store()->claim((int) $row->id);
        self::assertSame(1, (int) $claim->claim_generation);
        $this->store()->freeze($claim, ProvisioningClientTest::snapshot($row->external_customer_id));
        self::assertTrue($this->store()->bindPlatform($claim, 'https://api.example.test'));
        self::assertTrue($this->store()->beginAttempt($claim));
        $pending = ProvisioningResult::fromArray(ProvisioningClientTest::payload('pending_configuration', $row->external_customer_id), 201);
        self::assertTrue($this->store()->complete($claim, $pending));
        self::assertSame('aguardando_ativacao', $this->store()->get((int) $row->id)->state);
        $activation = $this->store()->prepareActivation((int) $row->id, new ActivationRequest($row->external_customer_id, new Owner('Owner', 'owner@example.test')));
        self::assertSame('activate', $activation->operation);
        self::assertSame([$row->id], $this->store()->dueIds());
        $claim = $this->store()->claim((int) $row->id);
        $this->store()->defer($claim, ProvisioningState::Blocked, 'conflict', 409);
        $this->store()->retryBlocked((int) $row->id);
        self::assertSame('pendente', $this->store()->get((int) $row->id)->state);
        self::assertSame(0, (int) $replica->query('select count(*) from notaagil_provisionings')->fetchColumn());
        for ($i = 0; $i < 30; $i++) {
            self::assertSame(0, $this->store()->rateDelay('https://api.example.test'));
        }
        self::assertSame(60, $this->store()->rateDelay('https://api.example.test'));
        self::assertSame($replica, $this->app['db']->connection()->getReadPdo());
    }
}

// Keep optional fixtures unloadable in a PHP-only installation without Illuminate.
if (class_exists(Application::class)) {
    /** Synthetic adapter only: production mapping/owner policy is deliberately absent. */
    final class FixtureSource implements ProvisioningSource
    {
        public function reference(object $createdModel): ?string
        {
            return $createdModel->first && strlen($createdModel->cnpj) === 14 ? 'establishment:'.$createdModel->id : null;
        }

        public function snapshot(string $sourceKey, string $externalCustomerId): ProvisioningRequest
        {
            $model = FixtureEstablishment::onWriteConnection()->findOrFail((int) substr($sourceKey, strlen('establishment:')));

            return new ProvisioningRequest($externalCustomerId, $model->name, $model->cnpj, 'Synthetic company', new Owner('Explicit owner', $model->owner_email));
        }
    }

    final class FixtureCredentials implements ProvisioningCredentialResolver
    {
        public string $token = 'synthetic-partner-secret';
        public string $platformUrl = 'https://api.example.test';

        public function resolve(string $partnerScope): ProvisioningCredentials
        {
            if ($partnerScope !== 'synthetic-partner') {
                throw new \LogicException('No credential for this partner.');
            }

            return new ProvisioningCredentials($this->platformUrl, $this->token);
        }
    }

    final class FixtureEstablishment extends Model
    {
        protected $table = 'fixture_establishments';
        protected $guarded = [];
        public $timestamps = false;

        protected $attributes = ['first' => true, 'cnpj' => '12ABC34501DE35', 'name' => 'Synthetic account'];
    }

    final class FixtureLogger extends AbstractLogger
    {
        public array $entries = [];

        public function log($level, string|Stringable $message, array $context = []): void
        {
            $this->entries[] = ['level' => $level, 'message' => (string) $message, 'context' => $context];
        }
    }
}
