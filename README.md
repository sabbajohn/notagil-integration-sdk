# NotaAgil Integration SDK

SDKs oficiais para a API pública de integração da NotaAgil.

## Pacotes

- `typescript/`: pacote `@notagil/integration-sdk`
- `php/`: pacote `notagil/integration-sdk`
- `openapi/integration-v1.yaml`: cópia versionada do contrato publicado pelo `fiscal-platform-api`

## Desenvolvimento

Atualize `openapi/integration-v1.yaml` a partir do repositório `fiscal-platform-api` antes de gerar novos tipos.

```sh
cd typescript
npm install
npm run generate:types
npm run build
```

```sh
cd php
composer install
composer test
```

## Release

O repositório está preparado para publicar os dois SDKs a partir de uma tag semver.

1. Atualize a versão em `typescript/package.json`.
2. Rode as validações locais:

```sh
cd typescript
npm ci
npm run build
npm run pack:dry-run
```

```sh
cd php
composer install
composer validate --strict
composer test
```

3. Crie uma release/tag no formato `vX.Y.Z` ou `vX.Y.Z-beta.N`.

O workflow `.github/workflows/release-packages.yml` publica o pacote TypeScript no npm usando `NPM_TOKEN`. Para o PHP, o `composer.json` da raiz permite cadastro direto no Packagist; configure o webhook do Packagist ou os secrets `PACKAGIST_USERNAME` e `PACKAGIST_TOKEN` para acionar a atualização pela Action.
