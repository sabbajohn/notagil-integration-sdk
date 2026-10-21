<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

enum ActivationStatus: string
{
    case Active = 'active';
    case PendingConfiguration = 'pending_configuration';
}
