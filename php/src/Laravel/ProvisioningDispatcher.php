<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use Illuminate\Contracts\Bus\Dispatcher;
use NotaAgil\Integration\Laravel\Jobs\ProcessProvisioning;
use Psr\Log\LoggerInterface;
use Throwable;

final class ProvisioningDispatcher
{
    public function __construct(
        private readonly Dispatcher $bus,
        private readonly ProvisioningSettings $settings,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function dispatch(int $id): bool
    {
        try {
            $job = (new ProcessProvisioning($id))
                ->onConnection($this->settings->queueConnection)->onQueue($this->settings->queue);
            $this->bus->dispatch($job);

            return true;
        } catch (Throwable) {
            // Queue outage after commit must not undo onboarding; intent is durable.
            $this->logger->warning('notaagil.provisioning.dispatch_failed', ['provisioning_id' => $id]);

            return false;
        }
    }
}
