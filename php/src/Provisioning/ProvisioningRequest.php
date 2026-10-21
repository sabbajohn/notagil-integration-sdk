<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

use InvalidArgumentException;

final readonly class ProvisioningRequest
{
    public string $externalCustomerId;
    public string $accountName;
    public string $cnpj;
    public string $legalName;
    public ?string $tradeName;

    public function __construct(
        string $externalCustomerId,
        string $accountName,
        string $cnpj,
        string $legalName,
        public Owner $owner,
        ?string $tradeName = null,
    ) {
        $this->externalCustomerId = Contract::text($externalCustomerId, 120, 'external_customer_id');
        $this->accountName = Contract::text($accountName, 120, 'account.name');
        $this->cnpj = strtoupper((string) preg_replace('/[.\/\s-]/u', '', $cnpj));
        if (! preg_match('/\A[A-Z0-9]{12}[0-9]{2}\z/', $this->cnpj)) {
            throw new InvalidArgumentException('Invalid provisioning field: empresa.cnpj');
        }
        $this->legalName = Contract::text($legalName, 255, 'empresa.razao_social');
        $this->tradeName = $tradeName === null ? null : Contract::text($tradeName, 255, 'empresa.nome_fantasia');
    }

    public function toArray(): array
    {
        $company = ['cnpj' => $this->cnpj, 'razao_social' => $this->legalName];
        if ($this->tradeName !== null) {
            $company['nome_fantasia'] = $this->tradeName;
        }

        return [
            'external_customer_id' => $this->externalCustomerId,
            'account' => ['name' => $this->accountName],
            'empresa' => $company,
            'owner' => $this->owner->toArray(),
        ];
    }

    /** Restore an encrypted snapshot previously produced by toArray(). */
    public static function fromArray(array $value): self
    {
        return new self(
            $value['external_customer_id'],
            $value['account']['name'],
            $value['empresa']['cnpj'],
            $value['empresa']['razao_social'],
            new Owner($value['owner']['name'], $value['owner']['email']),
            $value['empresa']['nome_fantasia'] ?? null,
        );
    }
}
