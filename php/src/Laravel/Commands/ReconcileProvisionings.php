<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel\Commands;

use Illuminate\Console\Command;
use NotaAgil\Integration\Laravel\ProvisioningDispatcher;
use NotaAgil\Integration\Laravel\ProvisioningStore;

final class ReconcileProvisionings extends Command
{
    protected $signature = 'notaagil:provisioning-reconcile {--limit=100}';
    protected $description = 'Queue persisted due provisioning intents; never backfills source accounts.';

    public function handle(): int
    {
        if (! config('notaagil-provisioning.enabled', false)) {
            $this->error('NotaAgil provisioning is disabled.');

            return self::FAILURE;
        }
        $store = $this->laravel->make(ProvisioningStore::class);
        $dispatcher = $this->laravel->make(ProvisioningDispatcher::class);
        $ids = $store->dueIds((int) $this->option('limit'));
        $queued = 0;
        foreach ($ids as $id) {
            $queued += (int) $dispatcher->dispatch($id);
        }
        $this->info('Queued '.$queued.' persisted intents.');

        return $queued === count($ids) ? self::SUCCESS : self::FAILURE;
    }
}
