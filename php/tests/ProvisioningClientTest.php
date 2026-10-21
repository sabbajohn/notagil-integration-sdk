<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Tests;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Exception\RequestException;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Request;
use GuzzleHttp\Psr7\Response;
use NotaAgil\Integration\Provisioning\ActivationRequest;
use NotaAgil\Integration\Provisioning\ActivationStatus;
use NotaAgil\Integration\Provisioning\NotaAgilProvisioningClient;
use NotaAgil\Integration\Provisioning\Owner;
use NotaAgil\Integration\Provisioning\ProvisioningException;
use NotaAgil\Integration\Provisioning\ProvisioningRequest;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class ProvisioningClientTest extends TestCase
{
    public static function payload(string $status = 'active', string $externalId = 'fixture-1'): array
    {
        return [
            'external_customer_id' => $externalId,
            'account' => ['id' => '9007199254740993001', 'name' => 'Synthetic account', 'status' => $status === 'active' ? 'active' : 'inactive'],
            'empresa' => ['id' => '00042', 'status' => $status === 'active' ? 'active' : 'inactive'],
            'activation' => [
                'status' => $status, 'reason' => $status === 'active' ? null : 'emitter_capacity_exhausted',
                'billing_source' => $status === 'active' ? 'partner' : null, 'billing_environment' => 'test',
            ],
            'invitation' => ['status' => $status === 'active' ? 'pending_delivery' : 'not_sent'],
        ];
    }

    public static function snapshot(string $externalId = 'fixture-1'): ProvisioningRequest
    {
        return new ProvisioningRequest($externalId, 'Synthetic account', '12.ABC.345/01DE-35', 'Synthetic company', new Owner('Synthetic owner', 'OWNER@example.test'));
    }

    private function client(array $responses, array &$history): NotaAgilProvisioningClient
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($history));

        return new NotaAgilProvisioningClient('https://api.example.test', 'synthetic-partner-secret', new Client(['handler' => $stack]));
    }

    public function test_exact_route_separate_bearer_alphanumeric_cnpj_and_string_ids(): void
    {
        $history = [];
        $client = $this->client([new Response(201, [], json_encode(['data' => self::payload()]))], $history);
        $result = $client->provision(self::snapshot(), 'original-key');
        self::assertSame('9007199254740993001', $result->accountId);
        self::assertSame('00042', $result->empresaId);
        self::assertSame(ActivationStatus::Active, $result->activationStatus);
        $request = $history[0]['request'];
        self::assertSame('/api/v2/provisioning/clients', $request->getUri()->getPath());
        self::assertSame('Bearer synthetic-partner-secret', $request->getHeaderLine('Authorization'));
        self::assertSame('original-key', $request->getHeaderLine('Idempotency-Key'));
        self::assertSame('12ABC34501DE35', json_decode((string) $request->getBody(), true)['empresa']['cnpj']);
        self::assertSame('owner@example.test', json_decode((string) $request->getBody(), true)['owner']['email']);
        self::assertFalse($history[0]['options']['allow_redirects']);
        self::assertStringNotContainsString('synthetic-partner-secret', print_r($client, true));
    }

    public function test_pending_is_a_success_and_replay_sends_identical_snapshot_and_key(): void
    {
        $history = [];
        $response = new Response(201, [], json_encode(['data' => self::payload('pending_configuration')]));
        $client = $this->client([$response, $response], $history);
        $snapshot = self::snapshot();
        $first = $client->provision($snapshot, 'persisted-key');
        $second = $client->provision($snapshot, 'persisted-key');
        self::assertSame(ActivationStatus::PendingConfiguration, $first->activationStatus);
        self::assertSame($first->toArray(), $second->toArray());
        self::assertSame((string) $history[0]['request']->getBody(), (string) $history[1]['request']->getBody());
        self::assertSame('persisted-key', $history[1]['request']->getHeaderLine('Idempotency-Key'));
    }

    public function test_activation_uses_original_key_owner_and_external_id_with_200(): void
    {
        $history = [];
        $client = $this->client([new Response(200, [], json_encode(['data' => self::payload()]))], $history);
        $request = new ActivationRequest('fixture-1', new Owner('Explicit owner', 'explicit@example.test'));
        $result = $client->activate($request, 'original-key');
        self::assertSame(200, $result->httpStatus);
        self::assertSame('/api/v2/provisioning/clients/activate', $history[0]['request']->getUri()->getPath());
        self::assertSame($request->toArray(), json_decode((string) $history[0]['request']->getBody(), true));
        self::assertSame('original-key', $history[0]['request']->getHeaderLine('Idempotency-Key'));
    }

    public static function errors(): array
    {
        return [
            [401, false, false, 'invalid_credential'], [403, false, false, 'forbidden_scope'],
            [404, false, false, 'not_found'], [409, false, false, 'conflict'],
            [422, false, false, 'validation_failed'], [408, true, true, 'request_timeout'],
            [429, true, false, 'rate_limited'], [500, true, true, 'server_failure'],
            [503, true, true, 'server_failure'], [302, false, false, 'unexpected_status'],
        ];
    }

    #[DataProvider('errors')]
    public function test_errors_are_sanitized_and_do_not_retry_in_memory(int $status, bool $retry, bool $uncertain, string $code): void
    {
        $history = [];
        $client = $this->client([new Response($status, ['Retry-After' => '61'], '{"message":"server-secret owner@example.test"}')], $history);
        try {
            $client->provision(self::snapshot(), 'original-key');
            self::fail('Expected a typed failure.');
        } catch (ProvisioningException $error) {
            self::assertSame($status, $error->httpStatus);
            self::assertSame($retry, $error->retryable);
            self::assertSame($uncertain, $error->resultMayExist);
            self::assertSame($code, $error->errorCode);
            self::assertSame(61, $error->retryAfterSeconds);
            self::assertNull($error->getPrevious());
            self::assertStringNotContainsString('server-secret', $error->getMessage());
            self::assertStringNotContainsString('owner@example.test', $error->getMessage());
        }
        self::assertCount(1, $history);
    }

    public function test_connection_failure_can_be_replayed_without_replacing_the_key(): void
    {
        $history = [];
        $client = $this->client([
            new ConnectException('private connection details', new Request('POST', 'https://example.test')),
            new Response(201, [], json_encode(['data' => self::payload()])),
        ], $history);
        try {
            $client->provision(self::snapshot(), 'same-key');
            self::fail('Expected uncertainty.');
        } catch (ProvisioningException $error) {
            self::assertTrue($error->resultMayExist);
            self::assertTrue($error->retryable);
            self::assertSame(0, $error->httpStatus);
        }
        self::assertSame('00042', $client->provision(self::snapshot(), 'same-key')->empresaId);
        self::assertSame('same-key', $history[1]['request']->getHeaderLine('Idempotency-Key'));
    }

    public function test_injected_guzzle_throwing_http_errors_is_also_sanitized(): void
    {
        $history = [];
        $client = $this->client([new RequestException('secret', new Request('POST', 'https://example.test'), new Response(409))], $history);
        $this->expectException(ProvisioningException::class);
        $this->expectExceptionMessage('conflict');
        $client->provision(self::snapshot(), 'same-key');
    }

    public static function invalidBodies(): array
    {
        $numeric = self::payload();
        $numeric['empresa']['id'] = 42;
        $unknown = self::payload();
        $unknown['activation']['status'] = 'unknown';

        return [
            ['<html>private</html>'], ['{}'], ['{"data":null}'],
            [json_encode(['data' => $numeric])], [json_encode(['data' => $unknown])],
            [json_encode(['data' => self::payload('active', 'other-tenant')])],
        ];
    }

    #[DataProvider('invalidBodies')]
    public function test_malformed_success_is_uncertain_not_completed(string $body): void
    {
        $history = [];
        try {
            $this->client([new Response(201, [], $body)], $history)->provision(self::snapshot(), 'same-key');
            self::fail('Expected protocol failure.');
        } catch (ProvisioningException $error) {
            self::assertSame('invalid_response', $error->errorCode);
            self::assertTrue($error->resultMayExist);
        }
    }

    public function test_retry_after_supports_seconds_and_strict_http_dates(): void
    {
        $now = 1700000000;
        self::assertSame(0, NotaAgilProvisioningClient::retryAfter('0', $now));
        self::assertSame(120, NotaAgilProvisioningClient::retryAfter(gmdate('D, d M Y H:i:s \G\M\T', $now + 120), $now));
        self::assertSame(0, NotaAgilProvisioningClient::retryAfter(gmdate('D, d M Y H:i:s \G\M\T', $now - 120), $now));
        self::assertNull(NotaAgilProvisioningClient::retryAfter('tomorrow', $now));
        self::assertNull(NotaAgilProvisioningClient::retryAfter('-10', $now));
    }

    public function test_invalid_key_is_rejected_before_http(): void
    {
        $history = [];
        $this->expectException(\InvalidArgumentException::class);
        $this->client([], $history)->provision(self::snapshot(), 'new key with spaces');
    }

    public function test_cpf_is_not_accepted_as_company_cnpj(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new ProvisioningRequest('fixture', 'Account', '12345678901', 'Company', new Owner('Owner', 'owner@example.test'));
    }

    public function test_issuer_base_url_cannot_be_used_as_platform_origin(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new NotaAgilProvisioningClient('https://example.test/api/v2/integrations', 'fixture');
    }

    public function test_unknown_response_fields_are_not_retained(): void
    {
        $history = [];
        $data = self::payload();
        $data['token'] = 'unexpected-secret';
        $result = $this->client([new Response(201, [], json_encode(['data' => $data]))], $history)->provision(self::snapshot(), 'key');
        self::assertArrayNotHasKey('token', $result->toArray());
        self::assertSame(self::snapshot()->toArray(), ProvisioningRequest::fromArray(self::snapshot()->toArray())->toArray());
    }
}
