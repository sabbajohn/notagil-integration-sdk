<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use GuzzleHttp\ClientInterface;
use NotaAgil\Integration\Provisioning\NotaAgilProvisioningClient;
use SensitiveParameter;

final readonly class ProvisioningCredentials
{
    public function __construct(public string $platformUrl, #[SensitiveParameter] private string $token)
    {
    }

    public function client(?ClientInterface $http = null): NotaAgilProvisioningClient
    {
        return new NotaAgilProvisioningClient($this->platformUrl, $this->token, $http);
    }

    public function __debugInfo(): array
    {
        return ['platformUrl' => $this->platformUrl, 'token' => '[redacted]'];
    }

    public function __serialize(): array
    {
        throw new \LogicException('Provisioning credentials must not be serialized.');
    }
}
