<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

enum ProvisioningState: string
{
    case Pending = 'pendente';
    case Processing = 'processando';
    case Completed = 'concluido';
    case AwaitingActivation = 'aguardando_ativacao';
    case Uncertain = 'resultado_incerto';
    case Blocked = 'bloqueado';
}
