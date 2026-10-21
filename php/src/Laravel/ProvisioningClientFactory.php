<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use GuzzleHttp\ClientInterface;
use NotaAgil\Integration\Provisioning\NotaAgilProvisioningClient;

final class ProvisioningClientFactory
{
    public function __construct(private readonly ?ClientInterface $http = null)
    {
    }

    public function make(ProvisioningCredentials $credentials): NotaAgilProvisioningClient
    {
        return $credentials->client($this->http);
    }
}
