<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

final readonly class ActivationRequest
{
    public string $externalCustomerId;

    public function __construct(string $externalCustomerId, public Owner $owner)
    {
        $this->externalCustomerId = Contract::text($externalCustomerId, 120, 'external_customer_id');
    }

    public function toArray(): array
    {
        return ['external_customer_id' => $this->externalCustomerId, 'owner' => $this->owner->toArray()];
    }

    public static function fromArray(array $value): self
    {
        return new self($value['external_customer_id'], new Owner($value['owner']['name'], $value['owner']['email']));
    }
}
