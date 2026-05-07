# NotaAgil Integration SDK

TypeScript beta SDK for the public integration API documented in `backend/laravel-api/docs/openapi/integration-v1.yaml`.

```ts
import { NotagilIntegrationClient } from '@notagil/integration-sdk';

const client = new NotagilIntegrationClient({
  baseUrl: 'https://api.notagil.local/api/v1/integrations',
  token: process.env.NOTAGIL_TOKEN!,
});

const preview = await client.previewDocument({
  document_type: 'nfce',
  payload: {
    type: 'nfce',
    fiscal_environment: 'homologacao',
    operation_profile_id: 11,
    consumer_final_pf: true,
    items: [
      {
        product_profile_id: 31,
        sku: 'SKU-BALCAO-001',
        description: 'Refeicao por quilo',
        quantity: 1,
        unit_price: 42.9,
        gross_amount: 42.9,
      },
    ],
  },
});

if (!preview.emission_allowed) {
  throw new Error(`Resolucao fiscal pendente: ${preview.resolution_status}`);
}

await client.createDocument(
  {
    external_id: 'pdv-2026-0001',
    document_type: 'nfce',
    payload: {
      type: 'nfce',
      fiscal_environment: 'homologacao',
      operation_profile_id: 11,
      consumer_final_pf: true,
      items: [
        {
          product_profile_id: 31,
          sku: 'SKU-BALCAO-001',
          description: 'Refeicao por quilo',
          quantity: 1,
          unit_price: 42.9,
          gross_amount: 42.9,
        },
      ],
    },
  },
  'idem-pdv-2026-0001',
);
```

For clients that already assemble the complete fiscal form payload or XML, use the direct surface. This bypasses NotaAgil fiscal rule resolution and requires a token with `documents:direct`.

```ts
await client.createDirectDocument(
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

await client.transmitDirectXml(
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

Generate OpenAPI operation types when `openapi-typescript` is installed:

```bash
npm run generate:types
```
