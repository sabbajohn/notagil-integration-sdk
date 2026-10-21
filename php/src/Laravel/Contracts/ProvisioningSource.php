<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel\Contracts;

use NotaAgil\Integration\Provisioning\ProvisioningRequest;

interface ProvisioningSource
{
    /**
     * Return an opaque stable local key ONLY for newly created first/matrix
     * establishments in the approved CNPJ onboarding flow. Otherwise null.
     * Do not select an owner or create any remote resource in this method.
     */
    public function reference(object $createdModel): ?string;

    /**
     * Executed after commit without request/session/auth context. Revalidate
     * eligibility and explicitly supply the authorized responsible person's
     * name/email. Use the provided external ID; never invent a different one.
     * Read authoritative source data on the primary (onWriteConnection/useWritePdo),
     * not a possibly lagging replica immediately after onboarding committed.
     */
    public function snapshot(string $sourceKey, string $externalCustomerId): ProvisioningRequest;
}
