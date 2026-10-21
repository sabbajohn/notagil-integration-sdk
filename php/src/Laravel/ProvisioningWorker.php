<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use LogicException;
use NotaAgil\Integration\Laravel\Contracts\ProvisioningCredentialResolver;
use NotaAgil\Integration\Laravel\Contracts\ProvisioningSource;
use NotaAgil\Integration\Provisioning\ProvisioningException;
use Psr\Log\LoggerInterface;
use Throwable;

final class ProvisioningWorker
{
    public function __construct(
        private readonly ProvisioningStore $store,
        private readonly ProvisioningSource $source,
        private readonly ProvisioningCredentialResolver $credentials,
        private readonly ProvisioningClientFactory $clients,
        private readonly ProvisioningSettings $settings,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function process(int $id): void
    {
        if ($this->store->connection()->transactionLevel() !== 0) {
            throw new LogicException('Provisioning worker must run outside the source transaction.');
        }
        $claim = $this->store->claim($id);
        if ($claim === null) {
            return;
        }
        $attempt = (int) $claim->attempts + 1;
        try {
            try {
                if ($claim->operation === 'activate') {
                    $snapshot = $this->store->activationSnapshot($claim);
                } else {
                    $snapshot = $claim->snapshot === null
                        ? $this->store->freeze($claim, $this->source->snapshot($claim->source_key, $claim->external_customer_id))
                        : $this->store->creationSnapshot($claim);
                    if ($snapshot === null) {
                        return; // Lease was superseded before HTTP.
                    }
                }
                if ($snapshot->externalCustomerId !== $claim->external_customer_id) {
                    throw new LogicException('Invalid provisioning snapshot identity.');
                }
            } catch (Throwable) {
                $this->store->defer($claim, ProvisioningState::Blocked, 'invalid_source_snapshot');
                $this->audit($claim, 'invalid_source_snapshot');

                return;
            }
            try {
                $credential = $this->credentials->resolve($this->settings->partnerScope);
                $client = $this->clients->make($credential);
                if (! $this->store->bindPlatform($claim, $credential->platformUrl)) {
                    return;
                }
            } catch (Throwable) {
                $this->store->defer($claim, ProvisioningState::Blocked, 'credential_unavailable');
                $this->audit($claim, 'credential_unavailable');

                return;
            }
            $delay = $this->store->rateDelay($credential->platformUrl);
            if ($delay > 0) {
                $this->store->defer($claim, ProvisioningState::Pending, 'local_rate_limit', 0, $delay);

                return;
            }
            if (! $this->store->beginAttempt($claim)) {
                return;
            }
            $result = $claim->operation === 'activate'
                ? $client->activate($snapshot, $claim->idempotency_key)
                : $client->provision($snapshot, $claim->idempotency_key);
            if ($this->store->complete($claim, $result)) {
                $this->audit($claim, $result->activationStatus->value, $result->httpStatus);
            }
        } catch (ProvisioningException $error) {
            $state = ! $error->retryable ? ProvisioningState::Blocked
                : ($error->resultMayExist ? ProvisioningState::Uncertain : ProvisioningState::Pending);
            $delay = $error->retryable ? max($error->retryAfterSeconds ?? 0, $this->backoff($attempt)) : null;
            if ($this->store->defer($claim, $state, $error->errorCode, $error->httpStatus, $delay)) {
                $this->audit($claim, $error->errorCode, $error->httpStatus);
            }
        } catch (Throwable) {
            // May include a local persistence failure after the server committed.
            // Preserve original identity/snapshot and use replay, never a new POST identity.
            if ($this->store->defer($claim, ProvisioningState::Uncertain, 'local_processing_failure', 0, $this->backoff($attempt))) {
                $this->audit($claim, 'local_processing_failure');
            }
        }
    }

    private function backoff(int $attempt): int
    {
        return min(3600, 5 * (2 ** min(10, max(0, $attempt - 1)))) + random_int(0, 5);
    }

    private function audit(object $claim, string $code, int $status = 0): void
    {
        // Only allowlisted machine codes and local IDs; no exception/body/header dumps.
        $this->logger->info('notaagil.provisioning.result', [
            'provisioning_id' => (int) $claim->id, 'generation' => (int) $claim->claim_generation,
            'operation' => $claim->operation, 'code' => $code, 'http_status' => $status,
        ]);
    }
}
