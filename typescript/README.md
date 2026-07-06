# NotaAgil TypeScript Integration SDK

TypeScript beta SDK for the NotaAgil public integration APIs documented in `../openapi/integration-v1.yaml` and `../openapi/integration-v2.yaml`.

See [docs/payload-emissao.md](https://github.com/sabbajohn/notagil-integration-sdk/blob/main/docs/payload-emissao.md) for the normalized fiscal emission payload based on `operation_code` and `snapshot`.

```bash
npm install @notagil/integration-sdk@^0.4.1
```

```ts
import {
  NotagilIntegrationClient,
  assertFiscalCanonicalPayloadV2,
  buildDirectNfceDocumentRequestV2,
  assertCanonicalNfseNacionalPayload,
  normalizeDocumentResponse,
  type FiscalCanonicalPayloadV2,
  type OperationDocumentRetratoV2,
  type ProductPayload,
  type DirectNfseNacionalSubmitRequest,
  type FiscalDocumentAuthorizedWebhookPayload,
} from '@notagil/integration-sdk';

const client = new NotagilIntegrationClient({
  baseUrl: 'https://api_notagil.sabbasistemas.com.br/api/v1/integrations',
  token: process.env.NOTAGIL_TOKEN!,
});

const companies = await client.listCompanies();
const companyId = companies[0].id;
const docs = await client.getPublicDocsSettings();

console.log(docs.openapi_url, docs.swagger_url);

const v2 = NotagilIntegrationClient.v2({ token: process.env.NOTAGIL_TOKEN! });
const v2Docs = await v2.getPublicOpenApiUrl();
const contract = await v2.getFiscalContractV2('nfce');

console.log(v2Docs, contract.contrato);

const nfcePayload: FiscalCanonicalPayloadV2 = {
  identificacao: {
    serie: '1',
    numero: '9001',
    natureza_operacao: 'Venda direta',
    ambiente: 'homologacao',
  },
  emitente: {
    cpf_cnpj: '12345678000199',
    razao_social: 'Empresa Exemplo LTDA',
  },
  tomador: {
    cpf_cnpj: '12345678909',
    razao_social: 'Consumidor',
  },
  itens: [
    {
      codigo: 'SKU-1',
      descricao: 'Produto fiscal completo',
      quantidade: 1,
      valor_unitario: 100,
      valor_total: 100,
    },
  ],
};

assertFiscalCanonicalPayloadV2(nfcePayload);

await v2.createDirectDocumentV2(
  buildDirectNfceDocumentRequestV2(nfcePayload, {
    external_id: 'erp-v2-2026-0001',
    ambiente_fiscal: 'homologacao',
    modo_emissao: 'fila',
  }),
  'idem-v2-2026-0001',
);

const v2Document = await v2.waitDocumentV2('erp-v2-2026-0001');
const normalizedV2 = normalizeDocumentResponse(v2Document);
console.log(normalizedV2.document_type, normalizedV2.fiscal_status, normalizedV2.access_key);

const operationRetratoV2: OperationDocumentRetratoV2 = {
  ambiente_fiscal: 'homologacao',
  direcao_documento: 'saida',
  dados_documento: {
    serie: '1',
    numero: '9002',
    natureza_operacao: 'Venda de mercadoria',
  },
  tomador: {
    consumidor_final: true,
    comprador_identificado: false,
    uf: 'SP',
  },
  itens: [
    {
      produto_id: 31,
      codigo: 'SKU-BALCAO-001',
      descricao: 'Refeicao por quilo',
      tipo_item: 'produto',
      quantidade: 1,
      valor_unitario: 42.9,
      valor_bruto: 42.9,
    },
  ],
};

await v2.previewDocumentByOperationV2('VENDA_BALCAO', {
  external_id: 'pdv-preview-v2-2026-0001',
  tipo_documento: 'nfce',
  retrato: operationRetratoV2,
  metadados: { origem: 'pdv' },
});

await v2.createDocumentByOperationV2(
  'VENDA_BALCAO',
  {
    external_id: 'pdv-operation-v2-2026-0001',
    tipo_documento: 'nfce',
    modo_emissao: 'fila',
    retrato: operationRetratoV2,
  },
  'idem-pdv-operation-v2-2026-0001',
);

const product: ProductPayload = await v2.createProductV2({
  cod_sku: 'SKU-1',
  codigo_operacional: 'ERP-1',
  descricao: 'Produto fiscal completo',
  unidade: 'UN',
  valor_padrao: 100,
  produto_tipo: 'NORMAL',
  tipo_item: '00',
  natureza_item: 'MERCADORIA',
  origem_mercadoria: 0,
  ncm: '84715010',
  fiscal_tags: ['SUJEITO_ST'],
});

const unidades = await v2.listProductCatalogV2('unidades-medida', { ativo: true });
console.log(product.cod_sku, product.fiscal_base?.apto_emissao, unidades.length);

const ibptItem = await client.consultIbptItem(companyId, {
  uf: 'SP',
  ncm: '84715010',
  value: 100,
  description: 'Produto fiscal completo',
  origin_code: '0',
});

const ibptCupom = await client.consultIbptCoupon(companyId, {
  uf: 'SP',
  items: [
    { ncm: '84715010', value: 100 },
  ],
});

const ibptItemV2 = await v2.consultIbptItemV2({
  uf: 'SP',
  ncm: '84715010',
  valor: 100,
  descricao: 'Produto fiscal completo',
  codigo_origem: '0',
});

const ibptCupomV2 = await v2.consultIbptCouponV2({
  uf: 'SP',
  itens: [
    { ncm: '84715010', valor: 100 },
  ],
});

console.log(ibptItem.valores, ibptCupom.totais, ibptItemV2.valores, ibptCupomV2.totais);

const snapshot = {
  fiscal_environment: 'homologacao',
  document_direction: 'saida',
  document_data: {
    serie: '1',
    numero: '0001',
    natureza_operacao: 'Venda de mercadoria',
  },
  counterparty: {
    buyer_identified: false,
    final_consumer: true,
    uf: 'SP',
  },
  items: [
    {
      product_id: 31,
      sku: 'SKU-BALCAO-001',
      description: 'Refeicao por quilo',
      ncm: '21069090',
      quantity: 1,
      unit_price: 42.9,
      gross_amount: 42.9,
    },
  ],
};

const preview = await client.previewCompanyDocumentByOperation(companyId, 'VENDA_BALCAO', {
  external_id: 'pdv-preview-2026-0001',
  document_type: 'nfce',
  snapshot,
});

if (!preview.emission_allowed) {
  throw new Error(`Resolucao fiscal pendente: ${preview.resolution_status}`);
}

await client.createCompanyDocumentByOperation(
  companyId,
  'VENDA_BALCAO',
  {
    external_id: 'pdv-operation-2026-0001',
    document_type: 'nfce',
    snapshot: {
      ...snapshot,
      document_data: { ...snapshot.document_data, numero: '0002' },
    },
  },
  'idem-pdv-operation-2026-0001',
);

const history = await client.listCompanyDocuments(companyId, {
  document_type: 'nfce',
  fiscal_status: 'authorized',
  per_page: 20,
});

const authorized = await client.waitDocument('pdv-operation-2026-0001', { companyId, timeoutMs: 120_000 });
if (authorized.fiscal_status === 'authorized') {
  console.log(authorized.access_key, authorized.protocol, authorized.authorized_at);

  const xml = await client.downloadDocumentXml('pdv-operation-2026-0001', companyId);
  const pdf = await client.downloadDocumentPdf('pdv-operation-2026-0001', companyId);

  // XML vem como texto puro para renderizar DANFC-e/NF-e.
  console.log(xml.content, xml.mime_type);

  // PDF vem em base64 sem prefixo data URI.
  console.log(pdf.base64, pdf.mime_type);
} else if (authorized.fiscal_status === 'rejected') {
  console.error(authorized.rejection_reason ?? authorized.message, authorized.errors);
}

const canonicalDocument = normalizeDocumentResponse(authorized);
console.log(canonicalDocument.document_type, canonicalDocument.series, canonicalDocument.number);

const companyConfig = await client.getCompanyConfiguration(companyId);

await client.updateCompanyConfiguration(companyId, {
  ...companyConfig,
  telefone: '+55 11 4000-1234',
  nfse: {
    ...(typeof companyConfig.nfse === 'object' && companyConfig.nfse !== null ? companyConfig.nfse as Record<string, unknown> : {}),
    provider_key: 'abrasf-v2-soap',
  },
});
```

Prepare a company without using the NotaAgil frontend:

```ts
const readiness = await client.getReadiness(companyId);
const certificates = await client.listCertificates(companyId);
const cfops = await client.listCfops(companyId);
const catalogs = await client.listTaxCatalogs(companyId);

await client.createOnboardingImport({
  source_type: 'xml',
  flow: 'saida',
  filename: 'historico-nfe.xml',
  xml: process.env.NFE_XML!,
}, companyId);
```

Consume post-emission and inbound operations:

```ts
const unified = await client.listUnifiedDocuments(companyId, { direction: 'saida', per_page: 20 });
const inbound = await client.listInboundNfe(companyId, { status: 'pending' });
const stock = await client.getStockBalance(companyId);

await client.createSchedule({
  tipo: 'unica',
  proxima_execucao: '2026-01-20T09:00:00-03:00',
  nota_base: { document_type: 'nfce' },
}, companyId);
```

Verify webhook signatures:

```ts
const expected = await NotagilIntegrationClient.webhookSignature(
  process.env.NOTAGIL_WEBHOOK_SECRET!,
  deliveryId,
  timestamp,
  rawBody,
);

const payload = JSON.parse(rawBody) as FiscalDocumentAuthorizedWebhookPayload;
if (payload.type === 'fiscal_document.authorized' && payload.data.document.xml) {
  // XML autorizado bruto para disparar a impressao imediata no PDV.
  await printNfce(payload.data.document.xml);
}
```

For clients that already assemble the complete fiscal form payload or XML, use the direct surface. This bypasses NotaAgil fiscal rule resolution and requires a token with `documents:direct`.

```ts
const directNfse: DirectNfseNacionalSubmitRequest = {
  external_id: 'nfse-direct-2026-0001',
  document_type: 'nfse',
  fiscal_environment: 'homologacao',
  payload: {
    id: 'nfse-direct-2026-0001',
    tpAmb: 2,
    dhEmi: '2026-05-26T10:00:00-03:00',
    verAplic: 'sdk-0.4.1',
    serie: '1',
    nDPS: '1001',
    dCompet: '2026-05-26',
    tpEmit: 1,
    cLocEmi: '3550308',
    prestador: {
      cnpj: '12345678000199',
      inscricaoMunicipal: '123456',
      razaoSocial: 'Empresa Exemplo LTDA',
      opSimpNac: '1',
      regEspTrib: '0',
      codigoMunicipio: '3550308',
    },
    tomador: {
      documento: '12345678909',
      razaoSocial: 'Cliente Exemplo',
      email: 'cliente@example.com',
      telefone: '11999999999',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '100',
        bairro: 'Centro',
        cep: '01001000',
        codigoMunicipio: '3550308',
        uf: 'SP',
        municipio: 'Sao Paulo',
      },
    },
    servico: {
      cLocPrestacao: '3550308',
      cTribNac: '0107',
      cTribMun: '0107',
      cNBS: '010701000',
      descricao: 'Servico de exemplo',
    },
    valor_servicos: 100,
    tributacao: {
      municipal: {
        tribISSQN: '1',
        tpRetISSQN: '1',
        pAliq: 2,
        enviarPAliq: true,
      },
      federal: {
        vRetIRRF: 0,
        vRetCSLL: 0,
      },
    },
  },
};

assertCanonicalNfseNacionalPayload(directNfse.payload);
await client.createCompanyDirectDocument(companyId, directNfse, 'idem-direct-nfse-2026-0001');
```

For NFSe Nacional, do not send `prestador.omitirIM`. Send `prestador.inscricaoMunicipal` when the municipal registration exists. `servico.cNBS` must have 9 digits without punctuation.

```ts
await client.createCompanyDirectDocument(
  companyId,
  {
    external_id: 'erp-direct-2026-0001',
    document_type: 'nfe',
    fiscal_environment: 'homologacao',
    payload: {
      identificacao: { serie: '1', nNF: '9001', natOp: 'Venda direta' },
      emitente: { cnpj: '12345678000199', uf: 'SP' },
      itens: [{ descricao: 'Produto fiscal completo', quantidade: 1, valorUnitario: 100 }],
    },
  },
  'idem-direct-2026-0001',
);

await client.transmitCompanyDirectXml(
  companyId,
  {
    external_id: 'erp-direct-xml-2026-0001',
    document_type: 'nfe',
    xml_base64: process.env.NFE_XML_BASE64!,
    already_signed: true,
    ind_sinc: 1,
  },
  'idem-direct-xml-2026-0001',
);
```

For the canonical NFSe Nacional direct payload, see [docs/payload-emissao.md](https://github.com/sabbajohn/notagil-integration-sdk/blob/main/docs/payload-emissao.md#nfse-nacional-direta).

Manage company fiscal configuration through the company-scoped fiscal endpoints:

```ts
const emitterProfiles = await client.listEmitterProfiles(10);
const operationProfiles = await client.listOperationProfiles(10);
const profileAssignments = await client.listProfileAssignments(10);

await client.createRateReference(10, {
  code: 'IBS-SC-2026',
  tax_type: 'ibs',
  jurisdiction_level: 'state',
  uf: 'SC',
  rate: 0.1,
  valid_from: '2026-01-01',
});

await client.createTaxRuleSet(10, {
  code: 'IBS-PADRAO',
  name: 'IBS padrao',
  rule_scope_type: 'product',
  valid_from: '2026-01-01',
  activation: {
    operation: {
      active: true,
      operation_profile_ids: operationProfiles.map((profile) => profile.id),
    },
  },
  results: [],
});
```

Generate OpenAPI operation types when `openapi-typescript` is installed:

```bash
npm run generate:types
```

Build and inspect the package before publishing:

```bash
npm ci
npm test
npm run build
npm run pack:dry-run
```

Run the homologation E2E workflow (real API calls for preview, issue, query, correction and cancellation):

```bash
NOTAGIL_TOKEN=seu_token npm run test:e2e
```

Use `tests/fixtures/e2e-operation-request.sample.json` as a starting point and adjust it for your company setup.
