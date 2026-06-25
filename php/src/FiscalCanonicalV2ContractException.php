<?php

namespace NotaAgil\Integration;

use InvalidArgumentException;

class FiscalCanonicalV2ContractException extends InvalidArgumentException
{
    /**
     * @param  list<string>  $expectedFields
     * @param  list<string>  $invalidFields
     */
    public function __construct(
        public readonly array $expectedFields,
        public readonly array $invalidFields,
    ) {
        parent::__construct('Payload invalido para FiscalCanonicalPayloadV2. Use somente campos publicos em portugues e snake_case.');
    }
}
