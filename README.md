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
