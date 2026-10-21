<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use InvalidArgumentException;
use NotaAgil\Integration\Provisioning\Contract;

final readonly class ProvisioningSettings
{
    public string $namespace;
    public string $partnerScope;
    public ?string $connection;
    public string $queueConnection;
    public string $queue;
    public int $leaseSeconds;
    public int $maxAttempts;
    public int $requestsPerMinute;

    public function __construct(array $config)
    {
        $this->namespace = Contract::key((string) ($config['installation_namespace'] ?? ''));
        $this->partnerScope = Contract::key((string) ($config['partner_scope'] ?? ''));
        $this->connection = $config['connection'] ?? null;
        $this->queueConnection = (string) ($config['queue_connection'] ?? 'database');
        $this->queue = (string) ($config['queue'] ?? 'notaagil-provisioning');
        $this->leaseSeconds = (int) ($config['lease_seconds'] ?? 120);
        $this->maxAttempts = (int) ($config['max_attempts'] ?? 8);
        $this->requestsPerMinute = (int) ($config['requests_per_minute'] ?? 30);
        if ($this->queueConnection === '' || $this->queueConnection === 'sync' || $this->queue === ''
            || $this->leaseSeconds < 60 || $this->leaseSeconds > 3600
            || $this->maxAttempts < 1 || $this->maxAttempts > 100
            || $this->requestsPerMinute < 1 || $this->requestsPerMinute > 30) {
            throw new InvalidArgumentException('Invalid NotaAgil provisioning queue/retry configuration.');
        }
    }
}
