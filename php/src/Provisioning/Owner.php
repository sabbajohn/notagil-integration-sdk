<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

use InvalidArgumentException;

/** Supplied explicitly by the consumer; the SDK never chooses an owner. */
final readonly class Owner
{
    public string $name;
    public string $email;

    public function __construct(string $name, string $email)
    {
        $this->name = Contract::text($name, 120, 'owner.name');
        $this->email = strtolower(Contract::text($email, 255, 'owner.email'));
        if (! filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('Invalid provisioning field: owner.email');
        }
    }

    public function toArray(): array
    {
        return ['name' => $this->name, 'email' => $this->email];
    }
}
