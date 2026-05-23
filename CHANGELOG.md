# Changelog

Todas as mudancas relevantes deste projeto serao documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) e as versoes seguem [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-05-23

### Changed
- Contrato de emissao por `operation_code` padronizado em `snapshot.counterparty` e `snapshot.document_data`.
- Tipos TypeScript marcam `snapshot.customer`, `snapshot.complementary`, `snapshot.totals`, `snapshot.tax_totals` e aliases legados de item como proibidos.
- Documentacao deixa claro que `buyer_identified` e informativo e que a identificacao fiscal depende de documento/CPF/CNPJ presente.

## [0.1.0-beta.5] - 2026-05-21

### Added
- Smoke tests do SDK TypeScript executados sobre o build publicado em `dist/`.

### Changed
- Tratamento de erro do SDK TypeScript endurecido para respostas nao-JSON, preservando `NotagilApiError` com `body.raw`.
- Helper de assinatura de webhook TypeScript agora falha com mensagem explicita quando a Web Crypto API nao estiver disponivel.

## [0.1.0-beta.4] - 2026-05-21

### Added
- Metodos PHP e TypeScript para perfis fiscais de emissor e atribuicoes de perfil por empresa.
- Aliases company-first para manifestacao, download XML e escrituracao da superficie de entrada NF-e.

### Changed
- Contrato OpenAPI sincronizado com a versao atual publicada pela API publica de integracao.
- Tipos TypeScript regenerados a partir do contrato novo, incluindo responses tipados para documentos, certificados, takers e NF-e de entrada.

### Notes
- Breaking beta: os aliases sem `companyId` e os fluxos de emissao por `payload` legado foram removidos. Use sempre metodos company-scoped e o envelope `snapshot`.

## [0.1.0-beta.3] - 2026-05-20

### Added
- Documentacao da estrutura padronizada do payload de emissao fiscal por `operation_code` e `snapshot`.

### Changed
- OpenAPI de integracao revisado para a superficie de emissao por `operation_code`.

## [0.1.0-beta.2] - 2026-05-20

### Added
- Metodos PHP e TypeScript para preview e emissao de documentos por `operation_code` usando o envelope `snapshot`.
- Schemas OpenAPI para `OperationDocumentRequest` e rotas `/documents/{operation_code}` com e sem empresa explicita.

## [0.1.0-beta.1] - 2026-05-18

### Added
- Clientes PHP e TypeScript para gerenciar perfis de operacao, referencias de aliquota e conjuntos de regras fiscais por empresa.
- Metodos TypeScript para empresas, documentos company-scoped, produtos, tomadores, webhooks, metricas e billing.
- Suporte a requisicoes `DELETE` no cliente TypeScript.
- Contrato OpenAPI e tipos gerados atualizados para a superficie fiscal e operacoes completas de webhooks.

### Changed
- Documentacao de instalacao atualizada para `0.1.0-beta.1`.

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
