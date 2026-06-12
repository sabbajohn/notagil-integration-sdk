<?php

namespace NotaAgil\Integration;

use InvalidArgumentException;

final class NfseNacionalContractException extends InvalidArgumentException
{
    /**
     * @param list<string> $expectedFields
     * @param list<string> $invalidFields
     */
    public function __construct(
        public readonly array $expectedFields,
        public readonly array $invalidFields,
    ) {
        parent::__construct(NfseNacionalCanonicalContract::INVALID_MESSAGE);
    }
}
