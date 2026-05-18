# Changelog

Todas as mudancas relevantes deste projeto serao documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) e as versoes seguem [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0-beta.0] - 2026-05-18

### Added
- Primeiro release publico beta do SDK de integracao NotaAgil.
- Pacote PHP `notagil/integration-sdk` com cliente agnostico de framework baseado em Guzzle.
- Pacote TypeScript `@notagil/integration-sdk` com cliente ESM e tipos para os principais contratos de integracao.
- Suporte a preview, criacao, listagem, consulta, cancelamento e correcao de documentos fiscais.
- Suporte a envio direto de payload fiscal e transmissao direta de XML NFe/NFCe.
- Endpoints auxiliares para empresas, configuracao fiscal, produtos, tomadores, webhooks, metricas e billing.
- Contrato OpenAPI versionado em `openapi/integration-v1.yaml`.
- Fluxo de release para publicar TypeScript no npm e PHP no Packagist a partir de tags semver.

### Notes
- Este release e beta: a API publica v1 deve preservar compatibilidade, mas os SDKs ainda podem receber ajustes ergonomicos antes de `1.0.0`.
