<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

use InvalidArgumentException;

/** Small shared validators; the API remains authoritative for CNPJ check digits. */
final class Contract
{
    public static function text(string $value, int $max, string $field): string
    {
        $value = trim($value);
        $length = preg_match_all('/./us', $value);
        if ($length === false || $length < 1 || $length > $max || preg_match('/[\x00-\x1f\x7f]/', $value)) {
            throw new InvalidArgumentException('Invalid provisioning field: '.$field);
        }

        return $value;
    }

    public static function key(string $value): string
    {
        if (! preg_match('/\A[A-Za-z0-9._:-]{1,120}\z/', $value)) {
            throw new InvalidArgumentException('Invalid provisioning idempotency key.');
        }

        return $value;
    }
}
