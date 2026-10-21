# Provisionamento de contas parceiras — PHP e Laravel

A versão0.5.0 implementa o consumo do contrato NotaÁgil T-0375/PR148 no PHP.
O pacote TypeScript acompanha a versão do monorepositório, sem novos métodos
de provisionamento. A API fiscal não é alterada.

O destino recomendado é este repositório `sabbajohn/notagil-integration-sdk`:
transporte em `php/src/Provisioning`, ponte opcional em `php/src/Laravel`, config
e migrations no pacote. Os dois `composer.json` mantêm PHP + Guzzle como únicos
requisitos de runtime. Laravel 12 é uma sugestão opcional, sem instalar um
framework para quem usa apenas PHP. O provider é descoberto pelo Laravel; fora
dele, nenhuma classe Illuminate precisa ser carregada. Outros majors do Laravel
não estão validados por esta entrega.

## Contrato PHP

`NotaAgilProvisioningClient` usa origem HTTPS explícita (sem `/api`), credencial
parceira separada de `NOTE_ISSUER_TOKEN` e transporte Guzzle injetável. Redirecionar
a chamada está desabilitado. Cada método faz uma tentativa; não há retry nem
sleep escondido no cliente.

- `provision(ProvisioningRequest $snapshot, string $key)` chama
  `POST /api/v2/provisioning/clients`; espera `201`, inclusive replay e cadastro
  com `activation.status=pending_configuration`.
- `activate(ActivationRequest $snapshot, string $originalKey)` chama
  `POST /api/v2/provisioning/clients/activate`; espera `200`, usando external ID e
  chave originais. Não é outro cadastro.
- DTOs recebem responsável explicitamente, preservam IDs remotos como strings
  e mantêm CNPJ alfanumérico. O servidor valida os dígitos verificadores. CPF não
  serve como CNPJ; filiais não são provisionadas automaticamente por este fluxo.
- Parceiro, permissões e ambiente de cobrança não são parâmetros do payload.
- `ProvisioningException` contém código local, HTTP, retryabilidade, indicação
  de resultado incerto e `retryAfterSeconds`. Não retém corpo/headers/request
  remoto nem a exceção Guzzle original. Não serializar clientes/credenciais.
- `408`, falha de transporte, `429` e `5xx` permitem replay. `401`, `403`, `404`,
  `409`, `422` e respostas inesperadas bloqueiam conforme a operação. Sucesso com
  corpo inválido ou identidade diferente é resultado incerto; não vira sucesso.
- Não há GET de consulta ou introspecção de chave nesse contrato. Depois de um
  timeout, repetir o snapshot e a chave originais recupera o resultado persistido.
  Depois da ativação, conciliar com replay da ativação, não com nova criação.

O resultado não contém token fiscal, senha ou token de convite. Conta criada não
significa emissão liberada, e `pending_delivery` não confirma entrega do convite.
O SDK não seleciona uma pessoa, não cria um usuário humano nem envia convite por
conta própria. O endpoint NotaÁgil pode preparar o convite segundo seu contrato;
habilitar chamadas reais exige que o consumidor forneça o responsável autorizado.

## Adoção Laravel explícita

`enabled` é `false` por padrão. A instalação só disponibiliza a migration; boot,
migrate e rollback não chamam a API, não fazem backfill e não criam contas. A
migration usa a conexão configurada da outbox. `down()` preserva os vínculos e a
história de idempotência; `up()` permite reaplicar uma migration preservada.
Não apagar essas tabelas para reverter código.

Antes de habilitar, o consumidor precisa fornecer duas classes:

1. `ProvisioningSource`: `reference($model)` retorna chave local opaca apenas no
   onboarding novo de CNPJ/primeiro estabelecimento aprovado. CPF, filiais,
   cadastros existentes e caminhos fora desse onboarding retornam `null`.
   `snapshot($sourceKey, $externalId)` roda depois do commit, sem sessão ou
   usuário autenticado; revalida o cadastro e fornece dados finais e responsável
   explicitamente autorizado. Deve retornar `ProvisioningRequest` com o external
   ID recebido, sem buscar um cliente remoto por CNPJ/e-mail.
2. `ProvisioningCredentialResolver`: resolve origem HTTPS e credencial parceira
   no backend para o `partner_scope` explícito. Não pode reutilizar token fiscal,
   escolher outro parceiro silenciosamente ou usar credencial global como fallback.

O SDK não inclui um adapter de produção que suponha classes `App`, escolha
administrador por ordem de ID ou invente política de confirmação de e-mail. O
adapter inicial pode depois ser mantido em uma camada específica do pacote, mas
seu mapeamento precisa ser confirmado com o domínio consumidor.

Config publicada por `notaagil-provisioning-config`:

```php
return [
    'enabled' => false, // Habilitar somente após configurar e autorizar a adoção.
    'installation_namespace' => 'instalacao-estavel',
    'partner_scope' => 'referencia-estavel-parceiro',
    'connection' => null,
    'source' => MinhaFonteDeProvisionamento::class,
    'credential_resolver' => MinhasCredenciaisDeParceiro::class,
    'models' => [MeuModeloDeEstabelecimento::class],
    'queue_connection' => 'redis',
    'queue' => 'notaagil-provisioning',
    'lease_seconds' => 120,
    'max_attempts' => 8,
    'requests_per_minute' => 30,
];
```

As classes acima são placeholders de integração, não implementação de políticas
do Blank. Nenhum segredo fica nessa config ou em jobs serializados. Usar canal
seguro/backend já existente para resolver credenciais; este patch não as cria.
O namespace precisa permanecer estável em deploy/restore e ser diferente entre
instalações distintas. A referência de parceiro permanece igual na rotação da
chave; não usar token, hash ou versão da chave como namespace.

O modelo observado e a outbox precisam da mesma conexão de banco. Assim, rollback
do onboarding também remove a intenção. Há um vínculo único por namespace/origem
local; trocar a configuração de parceiro não cria outro vínculo para a mesma
origem. Transferência de carteira exige um fluxo de revisão separado.

Essas identidades são sensíveis à caixa, byte a byte: `client:A` e `client:a`
são origens diferentes, assim como parceiros/namespaces com caixa diferente.
Não aplicar lowercase/casefold ao configurar ou restaurar a instalação. Os
índices/filtros de controle usam SHA-256 em hexadecimal minúsculo canônico:
`scope_hash = SHA256(namespace + NUL + partner)`,
`identity_hash = SHA256(namespace + NUL + partner + NUL + source)` e
`source_hash = SHA256(namespace + NUL + source)`. Os campos de entrada já
proíbem NUL, portanto os componentes têm separação inequívoca. Os índices não
comparam os textos originais sob a collation do banco; isso funciona também
quando MySQL/MariaDB usam uma collation case-insensitive. O hash de origem sem
parceiro mantém a proteção contra troca silenciosa de parceiro. Strings originais,
digests e IDs/chave derivados também são verificados em PHP com comparação exata
antes de retornar/usar um vínculo: inconsistência ou colisão falha de modo fechado.
O algoritmo de external ID e Idempotency-Key do primeiro patch foi preservado.

A migration da versão0.5.0 já cria essas colunas/índices no schema inicial. Se um schema de um rascunho anterior existir sem os digests, `up()`
recusa prosseguir com instrução explícita de revisão de upgrade, preservando
tabelas e histórico; não apaga dados nem regenera identidades. Não usar essa recusa
como motivo para remover vínculos de uma base persistente.

## Execução e recuperação

O observer registra só uma intenção local na transação do consumidor. O despacho
da fila ocorre após o commit externo mais abrangente; falha de fila não apaga a
intenção nem transforma o onboarding em uma operação remota parcialmente refeita.

O worker obtém um claim com lease/generation, resolve os dados finais, cifra e
fixa o snapshot antes da primeira chamada, vincula a URL original, limita tráfego
e incrementa a tentativa antes do HTTP. A transação/lock de banco já terminou
quando o HTTP começa. Claims expirados podem ser retomados; uma geração antiga
não pode gravar resultado sobre uma nova. A segurança contra duplicação remota
continua sendo a combinação original de external ID, snapshot e Idempotency-Key.

Todas as leituras de controle da outbox/limite usam o PDO de escrita (primário),
incluindo consulta após insert, claim, freeze do snapshot, vínculo da plataforma,
conciliação e ativação. Não dependem de `sticky=true` ou do tempo de replicação.
O adapter de origem também deve consultar dados finais no primário (por exemplo,
`Model::onWriteConnection()` ou Query Builder `useWritePdo()`), pois o job pode
executar antes de o cadastro recém-confirmado chegar à réplica. Não se deve
configurar sticky globalmente para mascarar uma leitura de controle incorreta.

A outbox armazena snapshot e resultado allowlisted cifrados pelo Encrypter da
aplicação, hash do snapshot, IDs/status remotos, tentativas e diagnóstico local.
O job transporta só o ID local. Preservar o histórico e as chaves de criptografia
ao restaurar/rotacionar APP_KEY, conforme o processo normal da aplicação. Não
substituir snapshot/chave para contornar um conflito.

Estados e tratamento:

| Estado | Significado e próxima ação |
| --- | --- |
| `pendente` | Intenção pronta ou retry aguardando prazo/limite |
| `processando` | Claim ativo; outro worker não executa enquanto o lease vale |
| `resultado_incerto` | Repetir operação/snapshot/chave originais após o prazo |
| `aguardando_ativacao` | IDs já existem; depende de elegibilidade/configuração |
| `concluido` | Resultado ativo persistido; job duplicado não chama a API |
| `bloqueado` | Erro terminal/local ou tentativas esgotadas; intervenção explícita |

O retry usa backoff exponencial com jitter e respeita o maior prazo entre ele e
`Retry-After` (segundos ou HTTP-date). O limitador em banco é compartilhado por
origem/plataforma + referência de parceiro, sem mudar na rotação, até30/min.
O limite remoto prevalece: instalações diferentes ainda podem compartilhar a
mesma credencial/cota e receber429. Throttle local não consome tentativas HTTP.

`notaagil:provisioning-reconcile --limit=100` enfileira somente intenções
persistidas já vencidas ou claims expirados. Não consulta toda a base de clientes
e não ativa contas pendentes. O comando recusa execução com a integração desligada.
Nenhum agendamento é registrado automaticamente; qualquer periodicidade deve ser
aprovada/configurada em etapa própria. Para início manual, executar o comando
depois que o worker/fila tiverem sido configurados e a adoção autorizada.

Usar conexão de fila assíncrona configurada; `sync`/`null` são recusados pelo
provider. O job tem timeout45s e o HTTP15s; lease deve ser >=60s e o `retry_after`
da fila maior que o timeout do job. Ajustar o worker para a fila configurada.

Após autorizar o tenant e a operação no consumidor, a API interna
`ProvisioningCoordinator::requestActivation($id, Owner $owner)` prepara ativação
durável e dispara pós-commit. O responsável é explícito. A chave e os IDs remotos
não mudam; o snapshot da ativação é fixado. Se ainda faltar elegibilidade, pode
repetir a mesma ativação explicitamente depois de corrigir a causa. A API interna
`retryBlocked($id)` retoma uma intenção bloqueada após correção/revisão, sem
apagar snapshot, chave ou identidade. Essas APIs não implementam autenticação de
uma rota do consumidor; não expô-las diretamente a parâmetros HTTP sem autorização.

Auditoria do pacote registra somente ID local, geração, operação, código local e
HTTP. Não registra cabeçalhos, dados do responsável, resposta remota ou mensagem
bruta de exceção. Configuração/resolver sem credencial bloqueia, sem fallback.

## Blank/Balansys: integração mínima ainda necessária

- Atualizar a constraint exata NotaÁgil0.4.3 para a versão que vier a ser aprovada
  e atualizar seu lock para a versão aprovada da linha0.5.
- Publicar/configurar a ponte e executar as migrations do pacote pelo fluxo normal
  do consumidor. Confirmar migrations/fila/encriptação antes de habilitar.
- Implementar/configurar os dois adapters e o modelo/evento do onboarding novo.
  Os dados do responsável não podem ser inventados pelo SDK.
- Preservar escopos grupo/estabelecimento e o caminho separado de integração da
  plataforma. O serviço atual `FiscalIntegrationSettingsService` e o cliente HTTP
  próprio não passam a usar a outbox só porque o pacote foi atualizado.
- Definir como os IDs provisionados serão apresentados/integrados às configurações
  existentes e como uma credencial fiscal operacional será obtida/vinculada. O
  contrato de provisionamento não retorna essa chave e este patch não a gera.
- Validar política de confirmação do e-mail/convite antes de habilitar criação.
  CPF, filiais, transferências e backfill ficam fora desse recorte.

Nenhum projeto consumidor foi editado para esta entrega. Pulse permanece no
inventário/definição de contrato; `/api/v2/smtp/test` atual envia mensagem e não
deve ser usado como teste de conexão sem envio.

## Validação local

`php/tests/ProvisioningClientTest.php` usa Guzzle MockHandler sem serviço real.
`php/tests/LaravelProvisioningTest.php` usa Application sintética, SQLite em
memória, fila falsa e HTTP simulado. Não inicializa o Kernel, `.env`, banco,
storage ou cache do Blank. Os fixtures de responsável/credencial são sintéticos.
A suíte Laravel é opcional e fica skipped se `laravel/framework` não estiver
instalado; os fixtures também não carregam Illuminate nesse caso.

```sh
cd php
php vendor/bin/phpunit --do-not-cache-result
```

Para validar a ponte, preparar dependências Laravel12 em ambiente isolado e usar
o grupo `laravel-provisioning`. O bootstrap força autoload do checkout atual,
inclusive quando as dependências vieram de uma instalação com classmap antigo.
Não executar testes E2E/homologação deste repositório para testar provisionamento.

Esta entrega cobre fencing/replay com SQLite; ainda precisa de validação de
concorrência real no banco e broker alvo antes de rollout. A arquitetura depende
de locks/índices transacionais do banco e de conservação do namespace/snapshot.
Não foi alegada validação em produção, PostgreSQL/MySQL ou API real.

As regressões de collation usam colunas SQLite `NOCASE` e verificam fontes,
parceiros e namespaces que diferem por caixa. As de replicação usam dois PDOs
SQLite separados, com `sticky=false`, réplica vazia ou com snapshot/URL atrasados.
Isso verifica os invariantes e a seleção real do PDO pelo Laravel; não substitui
uma execução em MySQL/MariaDB ou uma topologia de replicação real.
