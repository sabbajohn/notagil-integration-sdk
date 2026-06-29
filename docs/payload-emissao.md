# Estrutura do Payload de Emissao

Este documento descreve contratos de payload para preview e emissao de documentos fiscais pela API de integracao NotaAgil.

Para novos terceiros, o contrato recomendado e `FiscalCanonicalPayloadV2`, exposto pelas rotas `/api/v2/integrations`. O contrato direto de NFSe Nacional abaixo representa o payload interno aceito pelo `fiscal-core` e deve ser usado apenas em fluxos v1/controlados que exijam esse formato.

A superficie preferencial e baseada no codigo da operacao fiscal:

- `POST /api/v1/integrations/company/{company_id}/documents/{operation_code}/preview`
- `POST /api/v1/integrations/company/{company_id}/documents/{operation_code}`

`operation_code` corresponde ao campo `code` do perfil fiscal de operacao da empresa. A operacao precisa existir para a empresa, estar ativa, ser do tipo `operation` e estar vigente na data de referencia.

## Fluxo Recomendado

1. Envie o payload no formato `snapshot` de entrada.
2. Use `/preview` para validar a resolucao fiscal sem persistir documento.
3. Use a rota de emissao sem `/preview` para criar o documento e disparar o processamento fiscal.
4. Consulte o documento por `external_id` ate o status final.

Preview nao exige `Idempotency-Key`. Emissao exige `Idempotency-Key`.

## NFSe Nacional Direta

Quando o cliente monta o payload fiscal completo e usa a superficie direta:

- `POST /api/v1/integrations/company/{company_id}/direct/documents`

para `document_type = nfse` no ambiente nacional, padronize `payload` no contrato canonico PT-BR abaixo. Nao misture aliases municipais ou campos legados como `codigo_servico_municipal`, `codigo_atividade`, `tomador.cpf_cnpj` ou blocos fora desta arvore.

```json
{
  "external_id": "nfse-direct-2026-0001",
  "document_type": "nfse",
  "fiscal_environment": "homologacao",
  "payload": {
    "id": "nfse-direct-2026-0001",
    "tpAmb": 2,
    "dhEmi": "2026-05-26T10:00:00-03:00",
    "verAplic": "sdk-0.4.1",
    "serie": "1",
    "nDPS": "1001",
    "dCompet": "2026-05-26",
    "tpEmit": 1,
    "cLocEmi": "3550308",
    "prestador": {
      "cnpj": "12345678000199",
      "inscricaoMunicipal": "123456",
      "razaoSocial": "Empresa Exemplo LTDA",
      "opSimpNac": "1",
      "regEspTrib": "0",
      "codigoMunicipio": "3550308"
    },
    "tomador": {
      "documento": "12345678909",
      "razaoSocial": "Cliente Exemplo",
      "email": "cliente@example.com",
      "telefone": "11999999999",
      "endereco": {
        "logradouro": "Rua Exemplo",
        "numero": "100",
        "complemento": "Sala 1",
        "bairro": "Centro",
        "cep": "01001000",
        "codigoMunicipio": "3550308",
        "uf": "SP",
        "municipio": "Sao Paulo"
      }
    },
    "servico": {
      "cLocPrestacao": "3550308",
      "cTribNac": "0107",
      "cTribMun": "0107",
      "cNBS": "010701000",
      "descricao": "Servico de exemplo"
    },
    "valor_servicos": 100,
    "tributacao": {
      "municipal": {
        "tribISSQN": "1",
        "tpRetISSQN": "1",
        "pAliq": 2,
        "enviarPAliq": true
      },
      "federal": {
        "piscofins": {
          "CST": "01",
          "vBCPisCofins": 100,
          "pAliqPis": 1.65,
          "pAliqCofins": 7.6,
          "vPis": 1.65,
          "vCofins": 7.6,
          "tpRetPisCofins": "3"
        },
        "vRetIRRF": 0,
        "vRetCSLL": 0
      }
    }
  }
}
```

Para NFSe Nacional, nao envie `prestador.omitirIM`. Informe `prestador.inscricaoMunicipal` quando existir inscricao municipal. O campo `servico.cNBS` deve conter 9 digitos sem pontos.

Campos aceitos no payload canonico:

- `id`
- `tpAmb`
- `dhEmi`
- `verAplic`
- `serie`
- `nDPS`
- `dCompet`
- `tpEmit`
- `cLocEmi`
- `prestador.cnpj`
- `prestador.inscricaoMunicipal`
- `prestador.enviarIM`
- `prestador.razaoSocial`
- `prestador.opSimpNac`
- `prestador.regApTribSN`
- `prestador.regEspTrib`
- `prestador.codigoMunicipio`
- `tomador.documento`
- `tomador.razaoSocial`
- `tomador.email`
- `tomador.telefone`
- `tomador.endereco.logradouro`
- `tomador.endereco.numero`
- `tomador.endereco.complemento`
- `tomador.endereco.bairro`
- `tomador.endereco.cep`
- `tomador.endereco.codigoMunicipio`
- `tomador.endereco.uf`
- `tomador.endereco.municipio`
- `servico.cLocPrestacao`
- `servico.cTribNac`
- `servico.cTribMun`
- `servico.cNBS`
- `servico.descricao`
- `servico.tribISSQN`
- `servico.tpRetISSQN`
- `servico.aliquota`
- `servico.enviarPAliq`
- `valor_servicos`
- `tributacao.municipal.tribISSQN`
- `tributacao.municipal.tpRetISSQN`
- `tributacao.municipal.pAliq`
- `tributacao.federal.piscofins.CST`
- `tributacao.federal.piscofins.vBCPisCofins`
- `tributacao.federal.vRetCP`
- `tributacao.federal.vRetIRRF`
- `tributacao.federal.vRetCSLL`

## Envelope Principal

```json
{
  "external_id": "erp-0001",
  "document_type": "nfe",
  "municipio": "Sao Paulo",
  "metadata": {},
  "snapshot": {
    "fiscal_environment": "homologacao",
    "document_direction": "saida",
    "reference_date": "2026-05-20",
    "document_data": {},
    "counterparty": {},
    "document_references": [],
    "items": []
  }
}
```

Campos do envelope:

| Campo | Obrigatorio | Descricao |
| --- | --- | --- |
| `external_id` | Sim na emissao, opcional no preview | Identificador idempotente do documento no sistema cliente. |
| `document_type` | Sim | Tipo do documento: `nfe`, `nfce` ou `nfse`. |
| `municipio` | Opcional | Municipio usado em resolucoes municipais, principalmente NFSe. |
| `metadata` | Opcional | Dados livres do cliente. Nao participa da regra fiscal. |
| `snapshot` | Sim | Dados fiscais de entrada no formato base do snapshot. |

## Snapshot de Entrada

O `snapshot` enviado pelo cliente e uma estrutura de entrada. Ele nao deve conter campos calculados pelo motor fiscal.

Use `snapshot.counterparty` para destinatario, tomador, consumidor ou contraparte. As chaves legadas `snapshot.customer` e `snapshot.complementary` nao fazem parte do contrato por `operation_code`.

```json
{
  "fiscal_environment": "homologacao",
  "document_direction": "saida",
  "reference_date": "2026-05-20",
  "document_data": {
    "serie": "1",
    "numero": "000001",
    "data_emissao": "2026-05-20T10:00:00-03:00",
    "natureza_operacao": "Venda de mercadoria"
  },
  "counterparty": {
    "nome": "Cliente Exemplo",
    "documento": "12345678909",
    "person_type": "pf",
    "uf": "SP",
    "codigo_ibge": "3550308",
    "indicador_ie": "9",
    "final_consumer": true
  },
  "document_references": [],
  "items": [
    {
      "product_id": 31,
      "sku": "SKU-001",
      "description": "Produto exemplo",
      "ncm": "21069090",
      "origin_code": "0",
      "tax_classification_code": "000001",
      "quantity": 1,
      "unit_price": 100,
      "gross_amount": 100
    }
  ]
}
```

Campos do `snapshot`:

| Campo | Obrigatorio | Descricao |
| --- | --- | --- |
| `fiscal_environment` | Recomendado | Ambiente fiscal: `homologacao` ou `producao`. |
| `document_direction` | Recomendado | Direcao do documento, geralmente `saida` ou `entrada`. |
| `direction` | Opcional | Alias aceito para `document_direction`. |
| `reference_date` | Recomendado | Data base para vigencia de perfis e regras, em `YYYY-MM-DD`. |
| `document_data` | Opcional | Dados gerais do documento fiscal. |
| `counterparty` | Opcional | Destinatario, tomador, consumidor ou contraparte. |
| `document_references` | Opcional | Referencias a documentos fiscais anteriores. |
| `items` | Sim | Itens de produto ou servico. |

## Campos Proibidos no Snapshot de Entrada

Nas rotas por `operation_code`, nao envie `snapshot.operation_profile_id`. A operacao ja e definida pela URL.

Tambem nao envie campos gerados pelo motor fiscal, pelo snapshot persistido ou aliases legados:

- `customer`
- `complementary`
- `context_hash`
- `signature_hash`
- `profiles_json`
- `rules_applied_json`
- `operation_context`
- `blocking_issues`
- `totals`
- `tax_totals`
- `items[*].codigo`
- `items[*].nome`
- `items[*].descricao`
- `items[*].quantidade`
- `items[*].valor_unitario`
- `items[*].valorUnitario`
- `items[*].valor_total`
- `items[*].valorTotal`
- `items[*].cfop`
- `items[*].taxes`
- `items[*].tax_calculations`

Esses campos sao resolvidos pela NotaAgil durante o preview ou a emissao.

## `document_data`

`document_data` concentra dados gerais do documento. Campos comuns:

| Campo | Uso |
| --- | --- |
| `serie` | Serie fiscal do documento. |
| `numero` | Numero do documento, quando controlado pelo cliente. |
| `data_emissao` | Data/hora de emissao em ISO 8601. |
| `natureza_operacao` | Natureza da operacao fiscal. |
| `valor_total` | Valor total informado pelo cliente, quando aplicavel. |
| `origin_uf` | UF de origem da operacao. |
| `destination_uf` | UF de destino da operacao. |
| `referenced_documents` | Alternativa aceita para referencias fiscais quando o cliente ja envia dentro de `document_data`. |

`document_references` e `document_data.referenced_documents` sao aceitos. Prefira `document_references` no novo contrato.

## `counterparty`

`counterparty` descreve a contraparte do documento. Campos comuns:

| Campo | Uso |
| --- | --- |
| `nome` | Nome ou razao social. |
| `documento` | CPF, CNPJ ou identificador estrangeiro. |
| `person_type` | Tipo de pessoa, por exemplo `pf`, `pj` ou `foreign`. |
| `uf` | UF da contraparte. |
| `codigo_ibge` | Codigo IBGE do municipio. |
| `indicador_ie` ou `ie_indicator` | Indicador de inscricao estadual. |
| `inscricao_estadual` | Inscricao estadual. |
| `inscricao_municipal` | Inscricao municipal. |
| `taxpayer_icms` | Indica contribuinte de ICMS. |
| `taxpayer_iss` | Indica contribuinte de ISS. |
| `final_consumer` | Indica consumidor final. |
| `buyer_identified` | Informativo. A API considera o comprador identificado quando `documento`/CPF/CNPJ esta presente. |
| `public_entity` | Indica orgao ou entidade publica. |
| `country_code` | Codigo do pais quando aplicavel. |

## `items`

Cada item representa um produto ou servico a ser resolvido fiscalmente.

```json
{
  "product_id": 31,
  "sku": "SKU-001",
  "description": "Produto exemplo",
  "ncm": "21069090",
  "origin_code": "0",
  "tax_classification_code": "000001",
  "quantity": 1,
  "unit_price": 100,
  "gross_amount": 100,
  "discount_amount": 0,
  "freight_amount": 0,
  "insurance_amount": 0,
  "other_amount": 0
}
```

Campos comuns de item:

| Campo | Uso |
| --- | --- |
| `product_id` | ID do produto na NotaAgil, quando ja cadastrado. |
| `cfop_id` | ID do CFOP, quando o cliente precisa sugerir um CFOP especifico. |
| `sku` | Codigo do item no sistema cliente. |
| `description` ou `descricao` | Descricao do item. |
| `ncm` | NCM para produtos. |
| `origin_code` | Origem da mercadoria. |
| `tax_classification_code` | Classificacao tributaria. |
| `quantity` | Quantidade. |
| `unit_price` | Valor unitario. |
| `gross_amount` | Valor bruto do item. |
| `discount_amount` | Desconto do item. |
| `freight_amount` | Frete do item. |
| `insurance_amount` | Seguro do item. |
| `other_amount` | Outras despesas acessorias. |

Campos comuns para servicos:

| Campo | Uso |
| --- | --- |
| `codigo_servico_municipal` | Codigo municipal do servico. |
| `codigo_tributacao_nacional` | Codigo nacional de tributacao do servico. |
| `codigo_nbs` | Codigo NBS. |
| `codigo_cnae` ou `codigoCnae` | CNAE associado ao servico. |
| `codigo_atividade` | Codigo de atividade do municipio ou provedor. |
| `manual_overrides` | Sobrescritas pontuais de codigos fiscais do item. |

## `document_references`

Use `document_references` para informar documentos relacionados, devolucoes, complementos, remessas ou referencias item a item.

```json
{
  "reference_type": "return",
  "source_document_id": 1001,
  "source_document_type": "nfe",
  "source_access_key": "35260500000000000199550010000000011000000010",
  "source_number": "000001",
  "source_series": "1",
  "source_cfop": "5102",
  "target_cfop": "1202",
  "source_item_number": 1,
  "target_line_number": 1,
  "quantity_referenced": 1,
  "value_referenced": 100,
  "metadata": {}
}
```

Campos comuns de referencia:

| Campo | Uso |
| --- | --- |
| `reference_type` | Tipo da referencia, como devolucao, complemento ou remessa. |
| `source_document_id` | ID interno do documento de origem, quando conhecido. |
| `source_document_type` | Tipo do documento de origem. |
| `source_access_key` | Chave de acesso do documento referenciado. |
| `source_number` | Numero do documento referenciado. |
| `source_series` | Serie do documento referenciado. |
| `source_cfop` | CFOP original. |
| `target_cfop` | CFOP esperado no documento atual. |
| `source_item_number` | Numero do item no documento de origem. |
| `target_line_number` | Numero da linha correspondente no documento atual. |
| `quantity_referenced` | Quantidade referenciada. |
| `value_referenced` | Valor referenciado. |
| `metadata` | Dados auxiliares da referencia. |

## Exemplo Completo: Preview por Operacao

```bash
curl -X POST "https://api_notagil.sabbasistemas.com.br/api/v1/integrations/company/10/documents/VENDA_BALCAO/preview" \
  -H "Authorization: Bearer $NOTAGIL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "erp-preview-0001",
    "document_type": "nfce",
    "metadata": {
      "origin": "pdv"
    },
    "snapshot": {
      "fiscal_environment": "homologacao",
      "document_direction": "saida",
      "reference_date": "2026-05-20",
      "document_data": {
        "serie": "1",
        "numero": "000001",
        "data_emissao": "2026-05-20T10:00:00-03:00",
        "natureza_operacao": "Venda de mercadoria"
      },
      "counterparty": {
        "buyer_identified": false,
        "final_consumer": true,
        "uf": "SP",
        "indicador_ie": "9"
      },
      "items": [
        {
          "product_id": 31,
          "sku": "SKU-BALCAO-001",
          "description": "Produto exemplo",
          "ncm": "21069090",
          "origin_code": "0",
          "quantity": 1,
          "unit_price": 100,
          "gross_amount": 100
        }
      ]
    }
  }'
```

## Exemplo Completo: Emissao por Operacao

```bash
curl -X POST "https://api_notagil.sabbasistemas.com.br/api/v1/integrations/company/10/documents/VENDA_BALCAO" \
  -H "Authorization: Bearer $NOTAGIL_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: erp-0001" \
  -d '{
    "external_id": "erp-0001",
    "document_type": "nfce",
    "snapshot": {
      "fiscal_environment": "homologacao",
      "document_direction": "saida",
      "reference_date": "2026-05-20",
      "document_data": {
        "serie": "1",
        "numero": "000001",
        "data_emissao": "2026-05-20T10:00:00-03:00",
        "natureza_operacao": "Venda de mercadoria"
      },
      "counterparty": {
        "buyer_identified": false,
        "final_consumer": true,
        "uf": "SP"
      },
      "items": [
        {
          "product_id": 31,
          "sku": "SKU-BALCAO-001",
          "description": "Produto exemplo",
          "ncm": "21069090",
          "quantity": 1,
          "unit_price": 100,
          "gross_amount": 100
        }
      ]
    }
  }'
```

## Envio Direto

As rotas diretas continuam separadas:

- `POST /api/v1/integrations/company/{company_id}/direct/documents`

Essas rotas recebem um payload fiscal completo e bypassam a resolucao fiscal da NotaAgil. Use apenas quando o cliente ja monta integralmente o formato fiscal exigido para transmissao.

```json
{
  "external_id": "erp-direct-0001",
  "document_type": "nfe",
  "fiscal_environment": "homologacao",
  "payload": {
    "identificacao": {
      "serie": "1",
      "nNF": "9001",
      "natOp": "Venda direta"
    },
    "emitente": {
      "cnpj": "12345678000199",
      "uf": "SP"
    },
    "itens": [
      {
        "descricao": "Produto fiscal completo",
        "quantidade": 1,
        "valorUnitario": 100
      }
    ]
  }
}
```

## Metodos do SDK

TypeScript:

```ts
await client.previewCompanyDocumentByOperation(10, 'VENDA_BALCAO', payload);
await client.createCompanyDocumentByOperation(10, 'VENDA_BALCAO', payload, 'idem-erp-0001');
```

PHP:

```php
$client->previewDocumentByOperation(10, 'VENDA_BALCAO', $payload);
$client->createDocumentByOperation(
    companyId: 10,
    operationCode: 'VENDA_BALCAO',
    payload: $payload,
    idempotencyKey: 'idem-erp-0001',
);
```
