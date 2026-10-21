<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

use RuntimeException;

/** No raw body, request, Guzzle previous exception, token, or owner PII. */
final class ProvisioningException extends RuntimeException
{
    public function __construct(
        public readonly int $httpStatus,
        public readonly string $errorCode,
        public readonly bool $retryable,
        public readonly bool $resultMayExist,
        public readonly ?int $retryAfterSeconds = null,
    ) {
        parent::__construct('NotaAgil provisioning: '.$errorCode, $httpStatus);
    }
}
