<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use NotaAgil\Integration\Laravel\ProvisioningWorker;

final class ProcessProvisioning implements ShouldQueue
{
    use Queueable;

    public int $tries = 1; // Durable outbox, not queue payload, owns retry policy.
    public int $timeout = 45; // Must be below claim lease and queue retry_after.

    public function __construct(public readonly int $provisioningId)
    {
    }

    public function handle(): void
    {
        if (config('notaagil-provisioning.enabled', false)) {
            app(ProvisioningWorker::class)->process($this->provisioningId);
        }
    }
}
