<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

use UnexpectedValueException;

/** Allowlisted response: never retains unknown server fields or credentials. */
final readonly class ProvisioningResult
{
    private function __construct(
        public string $externalCustomerId,
        public string $accountId,
        public string $accountName,
        public string $accountStatus,
        public string $empresaId,
        public string $empresaStatus,
        public ActivationStatus $activationStatus,
        public ?string $activationReason,
        public ?string $billingSource,
        public string $billingEnvironment,
        public string $invitationStatus,
        public int $httpStatus,
    ) {
    }

    public static function fromArray(array $data, int $httpStatus): self
    {
        $string = static function (mixed $value): string {
            if (! is_string($value) || trim($value) === '') {
                throw new UnexpectedValueException('Invalid provisioning response.');
            }

            return $value;
        };
        $nullableString = static function (mixed $value) use ($string): ?string {
            return $value === null ? null : $string($value);
        };
        foreach (['activation', 'account', 'empresa', 'invitation'] as $section) {
            if (! isset($data[$section]) || ! is_array($data[$section])) {
                throw new UnexpectedValueException('Invalid provisioning response.');
            }
        }
        foreach (['reason', 'billing_source', 'billing_environment'] as $key) {
            if (! array_key_exists($key, $data['activation'])) {
                throw new UnexpectedValueException('Invalid provisioning response.');
            }
        }
        $activation = ActivationStatus::tryFrom($string($data['activation']['status'] ?? null));
        $accountStatus = $string($data['account']['status'] ?? null);
        $empresaStatus = $string($data['empresa']['status'] ?? null);
        $environment = $string($data['activation']['billing_environment']);
        $invitation = $string($data['invitation']['status'] ?? null);
        if ($activation === null || ! in_array($accountStatus, ['active', 'inactive'], true)
            || ! in_array($empresaStatus, ['active', 'inactive'], true)
            || ! in_array($environment, ['test', 'live'], true)
            || ! in_array($invitation, ['pending_delivery', 'not_sent'], true)) {
            throw new UnexpectedValueException('Invalid provisioning response.');
        }

        return new self(
            $string($data['external_customer_id'] ?? null),
            $string($data['account']['id'] ?? null),
            $string($data['account']['name'] ?? null),
            $accountStatus,
            $string($data['empresa']['id'] ?? null),
            $empresaStatus,
            $activation,
            $nullableString($data['activation']['reason']),
            $nullableString($data['activation']['billing_source']),
            $environment,
            $invitation,
            $httpStatus,
        );
    }

    public function toArray(): array
    {
        return [
            'external_customer_id' => $this->externalCustomerId,
            'account' => ['id' => $this->accountId, 'name' => $this->accountName, 'status' => $this->accountStatus],
            'empresa' => ['id' => $this->empresaId, 'status' => $this->empresaStatus],
            'activation' => [
                'status' => $this->activationStatus->value, 'reason' => $this->activationReason,
                'billing_source' => $this->billingSource, 'billing_environment' => $this->billingEnvironment,
            ],
            'invitation' => ['status' => $this->invitationStatus],
        ];
    }
}
