# Teste E2E em Homologacao

Este fluxo executa uma validacao ponta a ponta com chamadas reais da API de integracao.

Sequencia coberta:

1. `preview` por `operation_code`
2. emissao + autorizacao de um documento para fluxo de correcao
3. consulta remota (`query`) do documento de correcao
4. carta de correcao
5. emissao + autorizacao de um segundo documento para fluxo de cancelamento
6. cancelamento
7. consultas finais

## Requisitos

- Token com escopos de leitura/escrita de documentos, cancelamento e correcao.
- Empresa habilitada para emissao em homologacao.
- Operacao fiscal valida para a empresa (ex.: `VENDA_BALCAO`).

## Arquivo de request

Use `typescript/tests/fixtures/e2e-operation-request.sample.json` como base e ajuste para a sua empresa.

O runner usa:

- `operation_code`
- `document_type`
- `snapshot`
- opcionalmente `municipio` e `metadata`

## Variaveis de ambiente

Obrigatorias:

- `NOTAGIL_TOKEN`

Opcionais (mais usadas):

- `NOTAGIL_BASE_URL` (padrao: `https://api_notagil.sabbasistemas.com.br/api/v1/integrations`)
- `NOTAGIL_E2E_REQUEST_FILE` (padrao: `./tests/fixtures/e2e-operation-request.sample.json` no pacote `typescript`)
- `NOTAGIL_E2E_COMPANY_ID` (se ausente, usa a primeira empresa retornada por `/companies`)
- `NOTAGIL_E2E_OPERATION_CODE` (sobrescreve o arquivo)
- `NOTAGIL_E2E_DOCUMENT_TYPE` (sobrescreve o arquivo)
- `NOTAGIL_E2E_EXTERNAL_ID_PREFIX` (padrao: `sdk-e2e`)
- `NOTAGIL_E2E_IDEMPOTENCY_KEY_CORRECTION` (se ausente, gerada automaticamente)
- `NOTAGIL_E2E_IDEMPOTENCY_KEY_CANCELLATION` (se ausente, gerada automaticamente)
- `NOTAGIL_E2E_TIMEOUT_MS` (padrao: `240000`)
- `NOTAGIL_E2E_INTERVAL_MS` (padrao: `4000`)
- `NOTAGIL_E2E_ENABLE_CORRECTION` (padrao: `true`)
- `NOTAGIL_E2E_ENABLE_CANCELLATION` (padrao: `true`)
- `NOTAGIL_E2E_CORRECTION_TEXT`
- `NOTAGIL_E2E_CANCEL_REASON`

## Comandos

Somente E2E:

```sh
cd typescript
npm run test:e2e
```

Via raiz:

```sh
composer test:e2e
```

No switch completo da raiz (unit + smoke + E2E):

```sh
SDK_E2E_SWITCH=on composer test
```

Se quiser pular tudo:

```sh
SDK_TEST_SWITCH=off composer test
```
