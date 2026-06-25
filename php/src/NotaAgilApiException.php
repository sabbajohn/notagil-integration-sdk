<?php

namespace NotaAgil\Integration;

use RuntimeException;

class NotaAgilApiException extends RuntimeException
{
    public function __construct(
        public readonly int $statusCode,
        public readonly mixed $payload,
        public readonly mixed $errors = null,
        public readonly ?string $rejectionReason = null,
    ) {
        $message = is_array($payload) && isset($payload['message'])
            ? (string) $payload['message']
            : (is_array($payload) && isset($payload['mensagem'])
                ? (string) $payload['mensagem']
                : 'NotaAgil API error ' . $statusCode);

        parent::__construct($message, $statusCode);
    }
}
