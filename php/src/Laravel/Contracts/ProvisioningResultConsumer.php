<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel\Contracts;

use NotaAgil\Integration\Provisioning\ProvisioningResult;

interface ProvisioningResultConsumer
{
    /** Local database writes only, on the outbox connection and inside its transaction. */
    public function consume(string $sourceKey, ProvisioningResult $result, string $platformUrl): void;
}
