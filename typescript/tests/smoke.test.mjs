import assert from 'node:assert/strict';
import test from 'node:test';

import {
  NfseNacionalContractError,
  NotagilApiError,
  NotagilIntegrationClient,
  assertCanonicalNfseNacionalPayload,
  canonicalizeNfseProviderPolicy,
  normalizeDocumentResponse,
} from '../dist/index.js';

test('createCompanyDocumentByOperation sends bearer token, idempotency key and snapshot payload', async () => {
  const history = [];
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      return new Response(JSON.stringify({ data: { id: '1', idempotent_replay: false } }), {
        status: 202,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  const response = await client.createCompanyDocumentByOperation(
    '10',
    'VENDA_BALCAO',
    {
      external_id: 'erp-1',
      document_type: 'nfce',
      snapshot: {
        fiscal_environment: 'homologacao',
        items: [{ description: 'Produto', quantity: 1, unit_price: 10 }],
      },
    },
    'idem-1',
  );

  assert.deepEqual(response, { id: '1', idempotent_replay: false });
  assert.equal(history.length, 1);
  assert.equal(history[0].input, 'https://api.test/api/v1/integrations/companies/10/documents/VENDA_BALCAO');
  assert.equal(history[0].init.method, 'POST');
  assert.equal(history[0].init.headers.Authorization, 'Bearer test-token');
  assert.equal(history[0].init.headers['Idempotency-Key'], 'idem-1');
  assert.match(history[0].init.body, /"snapshot"/);
});

test('manifestCompanyInboundNfe alias uses the company-scoped inbound path', async () => {
  const history = [];
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      return new Response(JSON.stringify({ data: { document: { id: '22' } }, ok: true, error: null }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  const response = await client.manifestCompanyInboundNfe('10', '22', { event_type: 'ciencia' });

  assert.equal(response.ok, true);
  assert.equal(history[0].input, 'https://api.test/api/v1/integrations/companies/10/inbound/nfe/22/manifest');
  assert.equal(history[0].init.method, 'POST');
});

test('listCompanies can filter companies by CNPJ', async () => {
  const history = [];
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      return new Response(JSON.stringify({ data: [{ id: '10' }] }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  const companies = await client.listCompanies({ cnpj: '12345678000199' });

  assert.deepEqual(companies, [{ id: '10' }]);
  assert.equal(history[0].input, 'https://api.test/api/v1/integrations/companies?cnpj=12345678000199');
  assert.equal(history[0].init.method, 'GET');
});

test('public docs settings expose openapi and swagger urls', async () => {
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async () => new Response(JSON.stringify({
      data: {
        enabled: true,
        title: 'Docs',
        intro: 'API publica',
        sandbox_base_url: 'https://sandbox.test/api/v1/integrations',
        production_base_url: 'https://api.test/api/v1/integrations',
        sections: ['quickstart'],
        featured_sdk: 'php',
        changelog: 'v1',
        openapi_url: '/api/v1/integrations/openapi.yaml',
        swagger_url: '/api/v1/integrations/docs',
      },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  });

  const docs = await client.getPublicDocsSettings();
  assert.equal(docs.openapi_url, '/api/v1/integrations/openapi.yaml');
  assert.equal(docs.swagger_url, '/api/v1/integrations/docs');
  assert.equal(await client.getPublicOpenApiUrl(), '/api/v1/integrations/openapi.yaml');
  assert.equal(await client.getPublicSwaggerUrl(), '/api/v1/integrations/docs');
});

test('normalizeDocumentResponse prefers canonical fields and keeps legacy fallback explicit', () => {
  const normalized = normalizeDocumentResponse({
    status: 'authorized',
    legacy_aliases: {
      type: 'nfce',
      serie: '10',
      numero: '101',
      chave_acesso: 'CHAVE-1',
      protocolo: 'PROTO-1',
      autorizado_em: '2026-06-08T10:00:00-03:00',
      status_operacional: 'completed',
      status_fiscal: 'authorized',
    },
  });

  assert.equal(normalized.document_type, 'nfce');
  assert.equal(normalized.series, '10');
  assert.equal(normalized.number, '101');
  assert.equal(normalized.access_key, 'CHAVE-1');
  assert.equal(normalized.protocol, 'PROTO-1');
  assert.equal(normalized.authorized_at, '2026-06-08T10:00:00-03:00');
  assert.equal(normalized.operational_status, 'completed');
  assert.equal(normalized.fiscal_status, 'authorized');
});

test('request errors with non-JSON body still throw NotagilApiError', async () => {
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async () => new Response('<html>bad gateway</html>', {
      status: 502,
      headers: { 'content-type': 'text/html' },
    }),
  });

  await assert.rejects(
    () => client.getMetrics(),
    (error) => {
      assert.ok(error instanceof NotagilApiError);
      assert.equal(error.status, 502);
      assert.deepEqual(error.body, { raw: '<html>bad gateway</html>' });
      return true;
    },
  );
});

test('download errors with non-JSON body still throw NotagilApiError', async () => {
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async () => new Response('upstream timeout', {
      status: 504,
      headers: { 'content-type': 'text/plain' },
    }),
  });

  await assert.rejects(
    () => client.downloadDocumentXml('erp-1', '10'),
    (error) => {
      assert.ok(error instanceof NotagilApiError);
      assert.equal(error.status, 504);
      assert.deepEqual(error.body, { raw: 'upstream timeout' });
      return true;
    },
  );
});

test('document artifact downloads expose XML text and PDF base64 helpers', async () => {
  const responses = [
    new Response('<nfeProc><NFe /></nfeProc>', {
      status: 200,
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'content-disposition': 'attachment; filename="nfce.xml"',
      },
    }),
    new Response('pdf-binary', {
      status: 200,
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': 'attachment; filename="nfce.pdf"',
      },
    }),
  ];
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async () => responses.shift(),
  });

  const xml = await client.downloadDocumentXml('erp-1', '10');
  const pdf = await client.downloadDocumentPdf('erp-1', '10');

  assert.equal(xml.content, '<nfeProc><NFe /></nfeProc>');
  assert.equal(xml.mime_type, 'application/xml; charset=utf-8');
  assert.equal(xml.content_type, 'application/xml; charset=utf-8');
  assert.equal(xml.filename, 'nfce.xml');
  assert.equal(pdf.base64, 'cGRmLWJpbmFyeQ==');
  assert.equal(pdf.content, 'cGRmLWJpbmFyeQ==');
  assert.equal(pdf.mime_type, 'application/pdf');
  assert.equal(pdf.filename, 'nfce.pdf');
});

test('API errors expose statusCode, payload, errors and rejection details', async () => {
  const body = {
    message: 'Documento rejeitado.',
    rejection_reason: 'Duplicidade de NF-e',
    errors: [{ code: '539', message: 'Duplicidade de NF-e' }],
  };
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async () => new Response(JSON.stringify(body), {
      status: 422,
      headers: { 'content-type': 'application/json' },
    }),
  });

  await assert.rejects(
    () => client.getCompanyDocument('10', 'erp-rejected'),
    (error) => {
      assert.ok(error instanceof NotagilApiError);
      assert.equal(error.statusCode, 422);
      assert.deepEqual(error.payload, body);
      assert.deepEqual(error.errors, body.errors);
      assert.equal(error.rejectionReason, 'Duplicidade de NF-e');
      return true;
    },
  );
});

test('webhookSignature matches the documented HMAC contract', async () => {
  const signature = await NotagilIntegrationClient.webhookSignature(
    'whsec_test',
    'delivery-1',
    '2026-01-01T00:00:00Z',
    '{"ok":true}',
  );

  assert.equal(signature, '82c312bd5c5920d8c0654bdb14b369af9e27dd1828c99cb2713396670be52751');
});

test('assertCanonicalNfseNacionalPayload rejects legacy NFSe Nacional fields', () => {
  assert.doesNotThrow(() => {
    assertCanonicalNfseNacionalPayload({
      id: 'nfse-1',
      tpAmb: 2,
      prestador: {
        cnpj: '12345678000199',
        opSimpNac: '1',
      },
      tomador: {
        documento: '12345678909',
        endereco: {
          logradouro: 'Rua Exemplo',
        },
      },
      servico: {
        cTribMun: '0107',
        descricao: 'Servico de teste',
      },
      valor_servicos: 100,
    });
  });

  assert.throws(
    () => {
      assertCanonicalNfseNacionalPayload({
        prestador: {
          cnpj: '12345678000199',
          codigo_atividade: '123',
        },
        servico: {
          codigo_servico_municipal: '0107',
        },
      });
    },
    (error) => {
      assert.ok(error instanceof NfseNacionalContractError);
      assert.deepEqual(error.invalidFields, ['prestador.codigo_atividade', 'servico.codigo_servico_municipal']);
      assert.ok(error.expectedFields.includes('servico.cTribMun'));
      return true;
    },
  );
});

test('canonicalizeNfseProviderPolicy keeps only canonical NFSe Nacional policy fields', () => {
  const policy = canonicalizeNfseProviderPolicy({
    required_fields: ['service.nbs', 'service.activity_code'],
    visible_fields: ['service.national_tax_code', 'service.cnae_code'],
    field_schema: {
      'service.nbs': { label: 'NBS customizado' },
    },
  });

  assert.deepEqual(policy.required_fields, ['servico.cNBS', 'servico.codigo_atividade']);
  assert.deepEqual(policy.visible_fields, ['servico.cTribNac', 'servico.codigoCnae']);
  assert.equal(policy.field_schema['servico.cNBS'].label, 'NBS customizado');
  assert.deepEqual(policy.field_schema['servico.cTribNac'].payload_paths, ['servico.cTribNac']);
  assert.equal(policy.field_schema['servico.codigoCnae'].control, 'text');
});
