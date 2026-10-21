<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use LogicException;
use NotaAgil\Integration\Laravel\Contracts\ProvisioningSource;
use NotaAgil\Integration\Provisioning\ActivationRequest;
use NotaAgil\Integration\Provisioning\Owner;

final class ProvisioningCoordinator
{
    public function __construct(
        private readonly ProvisioningSource $source,
        private readonly ProvisioningStore $store,
        private readonly ProvisioningDispatcher $dispatcher,
    ) {
    }

    public function created(object $model): void
    {
        $reference = $this->source->reference($model);
        if ($reference === null) {
            return;
        }
        if (! method_exists($model, 'getConnection') || $model->getConnection() !== $this->store->connection()) {
            throw new LogicException('Source model and provisioning outbox must share a database connection.');
        }
        $row = $this->store->record($reference);
        $this->store->connection()->afterCommit(fn () => $this->dispatcher->dispatch((int) $row->id));
    }

    /** Internal command boundary: consumer must authorize tenant/action first. */
    public function requestActivation(int $id, Owner $explicitOwner): void
    {
        $row = $this->store->get($id) ?? throw new LogicException('Provisioning is outside this partner scope.');
        $row = $this->store->prepareActivation($id, new ActivationRequest($row->external_customer_id, $explicitOwner));
        $this->store->connection()->afterCommit(fn () => $this->dispatcher->dispatch((int) $row->id));
    }

    /** Consumer/operator authorization is required before calling this internal API. */
    public function retryBlocked(int $id): void
    {
        $this->store->retryBlocked($id);
        $this->store->connection()->afterCommit(fn () => $this->dispatcher->dispatch($id));
    }
}
