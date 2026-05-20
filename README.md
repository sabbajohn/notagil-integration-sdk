# NotaAgil Integration SDK

SDKs oficiais para a API publica de integracao da NotaAgil.

Este repositorio publica dois pacotes a partir do mesmo codigo fonte:

- PHP/Composer: `notagil/integration-sdk`
- TypeScript/npm: `@notagil/integration-sdk`

O contrato OpenAPI versionado fica em `openapi/integration-v1.yaml`.

## Release Atual

`v0.1.0-beta.1` evolui o beta publico do SDK.

Ele cobre autenticacao por bearer token, empresas, configuracao fiscal, certificados, catalogos fiscais, perfis fiscais, referencias de aliquota, regras fiscais, readiness/onboarding XML, preview/emissao por payload legado ou por codigo de operacao com contrato `snapshot`, consulta/cancelamento/correcao de documentos, downloads XML/PDF/snapshot, envio direto, XML direto, entrada NF-e, estoque, agendamentos, produtos, tomadores, webhooks, metricas e billing.

## Instalacao PHP

```sh
composer require notagil/integration-sdk:0.1.0-beta.1
```

```php
use NotaAgil\Integration\NotaAgilClient;

$client = new NotaAgilClient(
    baseUrl: 'https://api.notagil.com.br/api/v1/integrations',
    token: getenv('NOTAGIL_TOKEN'),
);

$companies = $client->companies();
```

O pacote Composer usa o `composer.json` da raiz e carrega as classes de `php/src`.

## Instalacao TypeScript

```sh
npm install @notagil/integration-sdk@0.1.0-beta.1
```

```ts
import { NotagilIntegrationClient } from '@notagil/integration-sdk';

const client = new NotagilIntegrationClient({
  baseUrl: 'https://api.notagil.com.br/api/v1/integrations',
  token: process.env.NOTAGIL_TOKEN!,
});

const documents = await client.listDocuments({ per_page: 20 });
```

O pacote npm e publicado a partir do diretorio `typescript/`.

## Desenvolvimento

Atualize `openapi/integration-v1.yaml` a partir do `fiscal-platform-api` antes de gerar novos tipos.

```sh
cd typescript
npm ci
npm run generate:types
npm run build
npm run pack:dry-run
```

```sh
composer install
composer validate --strict
composer test
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
git tag v0.1.0-beta.1
git push origin v0.1.0-beta.1
```

O workflow `.github/workflows/release-packages.yml` publica o pacote TypeScript no npm usando `NPM_TOKEN`.

Para PHP, cadastre este repositorio no Packagist como `notagil/integration-sdk`. O Packagist deve ler o `composer.json` da raiz; configure o webhook do GitHub ou os secrets `PACKAGIST_USERNAME` e `PACKAGIST_TOKEN` para atualizar o pacote automaticamente.
