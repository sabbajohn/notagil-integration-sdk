<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use Illuminate\Contracts\Encryption\Encrypter;
use Illuminate\Database\Connection;
use Illuminate\Database\DatabaseManager;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Carbon;
use LogicException;
use NotaAgil\Integration\Provisioning\ActivationRequest;
use NotaAgil\Integration\Provisioning\ActivationStatus;
use NotaAgil\Integration\Provisioning\Contract;
use NotaAgil\Integration\Provisioning\ProvisioningRequest;
use NotaAgil\Integration\Provisioning\ProvisioningResult;
use RuntimeException;

final class ProvisioningStore
{
    public function __construct(
        private readonly DatabaseManager $database,
        private readonly Encrypter $encrypter,
        private readonly ProvisioningSettings $settings,
    ) {
    }

    public function connection(): Connection
    {
        return $this->database->connection($this->settings->connection);
    }

    /** Control-plane reads always use the primary, even without sticky read/write. */
    private function query(): Builder
    {
        return $this->connection()->table('notaagil_provisionings')
            ->useWritePdo()
            ->where('scope_hash', $this->scopeHash());
    }

    private function scopeHash(): string
    {
        return hash('sha256', $this->settings->namespace."\0".$this->settings->partnerScope);
    }

    private function identityHash(string $sourceKey): string
    {
        // Preserve the original algorithm for external_customer_id/idempotency_key.
        return hash('sha256', $this->settings->namespace."\0".$this->settings->partnerScope."\0".$sourceKey);
    }

    private function sourceHash(string $sourceKey): string
    {
        return hash('sha256', $this->settings->namespace."\0".$sourceKey);
    }

    /** Digest matches are not permission to alias different raw bytes, even on collision/corruption. */
    private function assertIdentity(object $row, ?string $sourceKey = null): void
    {
        $identity = $this->identityHash($row->source_key);
        if ($row->installation_namespace !== $this->settings->namespace
            || $row->partner_scope !== $this->settings->partnerScope
            || ($sourceKey !== null && $row->source_key !== $sourceKey)
            || ! hash_equals($this->scopeHash(), $row->scope_hash)
            || ! hash_equals($identity, $row->identity_hash)
            || ! hash_equals($this->sourceHash($row->source_key), $row->source_hash)
            || $row->external_customer_id !== 'sdk:'.$identity
            || $row->idempotency_key !== 'provision:'.$identity) {
            throw new LogicException('Provisioning identity integrity failure.');
        }
    }

    public function get(int $id): ?object
    {
        $row = $this->query()->where('id', $id)->first();
        if ($row !== null) {
            $this->assertIdentity($row);
        }

        return $row;
    }

    public function record(string $sourceKey): object
    {
        Contract::key($sourceKey);
        $identity = $this->identityHash($sourceKey);
        $now = Carbon::now('UTC');
        $this->connection()->table('notaagil_provisionings')->insertOrIgnore([
            'installation_namespace' => $this->settings->namespace,
            'partner_scope' => $this->settings->partnerScope, 'source_key' => $sourceKey,
            'scope_hash' => $this->scopeHash(), 'identity_hash' => $identity,
            'source_hash' => $this->sourceHash($sourceKey),
            'external_customer_id' => 'sdk:'.$identity, 'idempotency_key' => 'provision:'.$identity,
            'state' => ProvisioningState::Pending->value, 'operation' => 'provision',
            'attempts' => 0, 'claim_generation' => 0, 'created_at' => $now, 'updated_at' => $now,
        ]);

        $row = $this->query()->where('identity_hash', $identity)->first()
            ?? throw new RuntimeException('Cannot persist provisioning intent.');
        $this->assertIdentity($row, $sourceKey);

        return $row;
    }

    public function dueIds(int $limit = 100): array
    {
        $now = Carbon::now('UTC');

        return $this->query()->where(function (Builder $query) use ($now): void {
            $query->whereIn('state', [ProvisioningState::Pending->value, ProvisioningState::Uncertain->value])
                ->orWhere(function (Builder $query) use ($now): void {
                    $query->where('state', ProvisioningState::Processing->value)->where('claim_until', '<=', $now);
                });
        })->where(function (Builder $query) use ($now): void {
            $query->whereNull('next_retry_at')->orWhere('next_retry_at', '<=', $now);
        })->orderBy('id')->limit(max(1, min(1000, $limit)))
            ->get(['id', 'installation_namespace', 'partner_scope', 'source_key', 'scope_hash', 'identity_hash', 'source_hash', 'external_customer_id', 'idempotency_key'])
            ->map(function (object $row): int {
                $this->assertIdentity($row);

                return (int) $row->id;
            })->all();
    }

    public function claim(int $id): ?object
    {
        return $this->connection()->transaction(function () use ($id): ?object {
            $row = $this->query()->where('id', $id)->lockForUpdate()->first();
            if ($row !== null) {
                $this->assertIdentity($row);
            }
            $now = Carbon::now('UTC');
            if ($row === null || ! in_array($row->state, ['pendente', 'resultado_incerto', 'processando'], true)
                || ($row->state === 'processando' && $row->claim_until !== null && $row->claim_until > $now->toDateTimeString())
                || ($row->next_retry_at !== null && $row->next_retry_at > $now->toDateTimeString())) {
                return null;
            }
            if ((int) $row->attempts >= $this->settings->maxAttempts) {
                $this->query()->where('id', $id)->where('claim_generation', $row->claim_generation)->update([
                    'state' => ProvisioningState::Blocked->value, 'last_error_code' => 'retry_exhausted',
                    'claim_until' => null, 'updated_at' => $now,
                ]);

                return null;
            }
            $updated = $this->query()->where('id', $id)->where('claim_generation', $row->claim_generation)->update([
                'state' => ProvisioningState::Processing->value,
                'claim_generation' => (int) $row->claim_generation + 1,
                'claim_until' => $now->copy()->addSeconds($this->settings->leaseSeconds),
                'next_retry_at' => null, 'updated_at' => $now,
            ]);

            return $updated === 1 ? $this->get($id) : null;
        }, 3);
    }

    private function claimed(object $claim): Builder
    {
        $this->assertIdentity($claim);

        return $this->query()->where('id', $claim->id)->where('claim_generation', $claim->claim_generation)
            ->where('state', ProvisioningState::Processing->value);
    }

    public function freeze(object $claim, ProvisioningRequest $snapshot): ?ProvisioningRequest
    {
        if ($snapshot->externalCustomerId !== $claim->external_customer_id) {
            throw new LogicException('Source returned a different provisioning identity.');
        }
        $json = json_encode($snapshot->toArray(), JSON_THROW_ON_ERROR);
        $this->claimed($claim)->whereNull('snapshot')->update([
            'snapshot' => $this->encrypter->encrypt($json, false),
            'snapshot_hash' => hash('sha256', $json), 'updated_at' => Carbon::now('UTC'),
        ]);
        $row = $this->claimed($claim)->first();

        if ($row !== null) {
            $this->assertIdentity($row);
        }

        return $row === null ? null : $this->creationSnapshot($row);
    }

    public function creationSnapshot(object $claim): ProvisioningRequest
    {
        $json = $this->encrypter->decrypt($claim->snapshot, false);
        if (! hash_equals((string) $claim->snapshot_hash, hash('sha256', $json))) {
            throw new LogicException('Provisioning snapshot integrity failure.');
        }

        return ProvisioningRequest::fromArray(json_decode($json, true, 512, JSON_THROW_ON_ERROR));
    }

    public function activationSnapshot(object $claim): ActivationRequest
    {
        return ActivationRequest::fromArray(json_decode($this->encrypter->decrypt($claim->activation_snapshot, false), true, 512, JSON_THROW_ON_ERROR));
    }

    public function beginAttempt(object $claim): bool
    {
        return $this->claimed($claim)->where('claim_until', '>', Carbon::now('UTC'))->increment('attempts') === 1;
    }

    public function bindPlatform(object $claim, string $platformUrl): bool
    {
        $url = rtrim($platformUrl, '/');
        $this->claimed($claim)->whereNull('platform_url')->update(['platform_url' => $url, 'updated_at' => Carbon::now('UTC')]);
        $row = $this->claimed($claim)->first();
        if ($row === null) {
            return false;
        }
        $this->assertIdentity($row);
        if ($row->platform_url !== $url) {
            throw new LogicException('The original provisioning platform cannot be changed during replay.');
        }

        return true;
    }

    public function complete(object $claim, ProvisioningResult $result): bool
    {
        if ($result->externalCustomerId !== $claim->external_customer_id
            || ($claim->remote_account_id !== null && $claim->remote_account_id !== $result->accountId)
            || ($claim->remote_empresa_id !== null && $claim->remote_empresa_id !== $result->empresaId)) {
            throw new LogicException('Provisioning result identity mismatch.');
        }

        return $this->claimed($claim)->update([
            'state' => $result->activationStatus === ActivationStatus::Active ? 'concluido' : 'aguardando_ativacao',
            'remote_account_id' => $result->accountId, 'remote_empresa_id' => $result->empresaId,
            'remote_result' => $this->encrypter->encrypt(json_encode($result->toArray(), JSON_THROW_ON_ERROR), false),
            'last_http_status' => $result->httpStatus, 'last_error_code' => null,
            'claim_until' => null, 'next_retry_at' => null, 'updated_at' => Carbon::now('UTC'),
        ]) === 1;
    }

    public function defer(object $claim, ProvisioningState $state, string $errorCode, int $status = 0, ?int $delay = null): bool
    {
        return $this->claimed($claim)->update([
            'state' => $state->value, 'last_error_code' => $errorCode, 'last_http_status' => $status ?: null,
            'next_retry_at' => $delay === null ? null : Carbon::now('UTC')->addSeconds($delay),
            'claim_until' => null, 'updated_at' => Carbon::now('UTC'),
        ]) === 1;
    }

    /** Persist activation intent only for the already-bound partner and IDs. */
    public function prepareActivation(int $id, ActivationRequest $snapshot): object
    {
        return $this->connection()->transaction(function () use ($id, $snapshot): object {
            $row = $this->query()->where('id', $id)->lockForUpdate()->first();
            if ($row !== null) {
                $this->assertIdentity($row);
            }
            if ($row === null || $snapshot->externalCustomerId !== $row->external_customer_id) {
                throw new LogicException('Activation identity is outside this provisioning scope.');
            }
            $json = json_encode($snapshot->toArray(), JSON_THROW_ON_ERROR);
            if ($row->activation_snapshot !== null) {
                if (! hash_equals($this->encrypter->decrypt($row->activation_snapshot, false), $json)) {
                    throw new LogicException('Activation snapshot cannot be changed.');
                }
                // Identical activation still pending server eligibility may be retried explicitly.
                if ($row->state === 'aguardando_ativacao') {
                    $this->query()->where('id', $id)->update(['state' => 'pendente', 'attempts' => 0, 'next_retry_at' => null, 'updated_at' => Carbon::now('UTC')]);
                }

                return $this->get($id);
            }
            if ($row->state !== 'aguardando_ativacao' || $row->remote_account_id === null || $row->remote_empresa_id === null) {
                throw new LogicException('Only a provisioned pending account can be activated.');
            }
            $this->query()->where('id', $id)->update([
                'operation' => 'activate', 'state' => 'pendente', 'attempts' => 0,
                'activation_snapshot' => $this->encrypter->encrypt($json, false),
                'last_error_code' => null, 'next_retry_at' => null, 'updated_at' => Carbon::now('UTC'),
            ]);

            return $this->get($id);
        }, 3);
    }

    /** Explicit operator recovery after correcting a blocked dependency; identity stays fixed. */
    public function retryBlocked(int $id): void
    {
        // Validate raw identity on the primary before allowing an explicit resume.
        $this->get($id);
        $changed = $this->query()->where('id', $id)->where('state', 'bloqueado')->update([
            'state' => 'pendente', 'attempts' => 0, 'next_retry_at' => null,
            'claim_until' => null, 'updated_at' => Carbon::now('UTC'),
        ]);
        if ($changed !== 1) {
            throw new LogicException('Only a blocked intent in this partner scope can be resumed.');
        }
    }

    /** Conservative shared per-partner limiter, independent of credential rotation. */
    public function rateDelay(string $platformUrl): int
    {
        return $this->connection()->transaction(function () use ($platformUrl): int {
            $hash = hash('sha256', rtrim($platformUrl, '/')."\0".$this->settings->partnerScope);
            $now = Carbon::now('UTC');
            $table = fn () => $this->connection()->table('notaagil_provisioning_limits')->useWritePdo()->where('scope_hash', $hash);
            $this->connection()->table('notaagil_provisioning_limits')->insertOrIgnore(['scope_hash' => $hash, 'window_started_at' => $now, 'hits' => 0]);
            $row = $table()->lockForUpdate()->first();
            $end = Carbon::parse($row->window_started_at, 'UTC')->addSeconds(60);
            if ($end->lessThanOrEqualTo($now)) {
                $table()->update(['window_started_at' => $now, 'hits' => 1]);

                return 0;
            }
            if ((int) $row->hits >= $this->settings->requestsPerMinute) {
                return max(1, (int) ceil($now->diffInSeconds($end)));
            }
            $table()->increment('hits');

            return 0;
        }, 3);
    }
}
