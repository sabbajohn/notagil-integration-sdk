<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel\Contracts;

use NotaAgil\Integration\Laravel\ProvisioningCredentials;

interface ProvisioningCredentialResolver
{
    /** Backend only; resolve the explicit stable partner scope. No global fallback. */
    public function resolve(string $partnerScope): ProvisioningCredentials;
}
