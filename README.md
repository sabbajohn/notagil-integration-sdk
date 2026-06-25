# NotaAgil Integration SDK

SDKs oficiais para a API publica de integracao da NotaAgil.

Este repositorio publica dois pacotes a partir do mesmo codigo fonte:

- PHP/Composer: `notagil/integration-sdk`
- TypeScript/npm: `@notagil/integration-sdk`

Os contratos OpenAPI versionados ficam em:

- `openapi/integration-v1.yaml`
- `openapi/integration-v2.yaml`

A estrutura recomendada para preview e emissao fiscal por `operation_code`, alem do payload canonico PT-BR para NFSe Nacional na superficie direta, esta documentada em [docs/payload-emissao.md](docs/payload-emissao.md).

## Release Atual

`v0.4.0` adiciona uma superficie v2 explicita nos SDKs, com rotas companyless, envelope `dados`, contrato `FiscalCanonicalPayloadV2` e helpers de validacao/builders.

Ele preserva a v1 compativel e acrescenta metodos v2 para contratos fiscais, emissao direta, emissao por operacao, consulta/cancelamento/correcao de documentos, configuracao, certificados, catalogos fiscais, produtos, tomadores, webhooks, metricas e billing.

Tambem inclui consulta IBPT de item e cupom em v1/v2, com helpers `consultIbptItem`, `consultIbptCoupon`, `consultIbptItemV2` e `consultIbptCouponV2`.

Na v2, use nomes publicos em portugues e `snake_case`; aliases legados continuam restritos a v1.

## Instalacao PHP

```sh
composer require notagil/integration-sdk:^0.4.0
```

```php
use NotaAgil\Integration\NotaAgilClient;

$client = new NotaAgilClient(
    baseUrl: 'https://api_notagil.sabbasistemas.com.br/api/v1/integrations',
    token: getenv('NOTAGIL_TOKEN'),
);

$companies = $client->companies();

$v2 = NotaAgilClient::v2(token: getenv('NOTAGIL_TOKEN'));
$contract = $v2->fiscalContractV2('nfce');
```

O pacote Composer usa o `composer.json` da raiz e carrega as classes de `php/src`.

## Instalacao TypeScript

```sh
npm install @notagil/integration-sdk@^0.4.0
```

```ts
import { NotagilIntegrationClient } from '@notagil/integration-sdk';

const client = new NotagilIntegrationClient({
  baseUrl: 'https://api_notagil.sabbasistemas.com.br/api/v1/integrations',
  token: process.env.NOTAGIL_TOKEN!,
});

const companies = await client.listCompanies();
const documents = await client.listCompanyDocuments(companies[0].id, { per_page: 20 });
const authorized = await client.waitDocument('pdv-sale-0001', { companyId: companies[0].id });

const v2 = NotagilIntegrationClient.v2({ token: process.env.NOTAGIL_TOKEN! });
const contract = await v2.getFiscalContractV2('nfce');

if (authorized.fiscal_status === 'authorized') {
  const xml = await client.downloadDocumentXml('pdv-sale-0001', companies[0].id);
  const pdf = await client.downloadDocumentPdf('pdv-sale-0001', companies[0].id);

  console.log(authorized.access_key, authorized.protocol, authorized.authorized_at);
  console.log(xml.content); // XML autorizado completo em texto puro.
  console.log(pdf.base64); // PDF/DANFE em base64 sem data URI.
}
```

O pacote npm e publicado a partir do diretorio `typescript/`.

## Consulta IBPT

Na v1, informe a empresa no helper e, se necessario, use aliases legados como `value`, `items`, `description` e `origin_code`:

```php
$ibptItem = $client->consultIbptItem($companyId, [
    'uf' => 'SP',
    'ncm' => '84715010',
    'value' => 100,
]);

$ibptCupom = $client->consultIbptCoupon($companyId, [
    'uf' => 'SP',
    'items' => [
        ['ncm' => '84715010', 'value' => 100],
    ],
]);
```

Na v2, use a empresa vinculada ao token e campos canonicos em portugues:

```ts
const ibptItem = await v2.consultIbptItemV2({
  uf: 'SP',
  ncm: '84715010',
  valor: 100,
});

const ibptCupom = await v2.consultIbptCouponV2({
  uf: 'SP',
  itens: [
    { ncm: '84715010', valor: 100 },
  ],
});
```

## Desenvolvimento

Atualize `openapi/integration-v1.yaml` e `openapi/integration-v2.yaml` a partir do `fiscal-platform-api` antes de gerar novos tipos.

```sh
cd typescript
npm ci
npm run generate:types
npm run build
npm test
npm run pack:dry-run
```

```sh
composer install
composer validate --strict
composer test
```

O comando `composer test` (ou `composer test:sdk`) e o switch de validacao completa:

- `SDK_TEST_SWITCH=on` (padrao): roda testes PHP + TypeScript.
- `SDK_TEST_SWITCH=off`: pula a validacao e encerra com sucesso.
- `SDK_E2E_SWITCH=on`: inclui teste ponta a ponta em homologacao (chamadas reais).
- `SDK_E2E_SWITCH=off` (padrao): nao executa E2E.

Exemplo:

```sh
SDK_TEST_SWITCH=off composer test:sdk
```

E2E em homologacao:

```sh
SDK_E2E_SWITCH=on NOTAGIL_TOKEN=seu_token composer test
```

Detalhes completos de payload, variaveis e fluxo em [docs/e2e-homologacao.md](docs/e2e-homologacao.md).

Se quiser rodar apenas o teste PHP a partir da raiz:

```sh
composer test:php
```

Se quiser rodar apenas E2E:

```sh
composer test:e2e
```

Tambem e possivel trabalhar somente no pacote PHP isolado:

```sh
cd php
composer install
composer test
```

## Publicacao

1. Atualize o changelog.
2. Atualize a versao em `typescript/package.json`.
3. Rode as validacoes locais.
4. Crie a tag semver, por exemplo:

```sh
git tag v0.4.0
git push origin v0.4.0
```

O workflow `.github/workflows/release-packages.yml` publica o pacote TypeScript no npm usando `NPM_TOKEN`.

Para PHP, cadastre este repositorio no Packagist como `notagil/integration-sdk`. O Packagist deve ler o `composer.json` da raiz; configure o webhook do GitHub ou os secrets `PACKAGIST_USERNAME` e `PACKAGIST_TOKEN` para atualizar o pacote automaticamente.
