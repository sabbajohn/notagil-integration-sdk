import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DEFAULT_BASE_URL_V2,
  FiscalCanonicalPayloadV2Error,
  NfseNacionalContractError,
  NotagilApiError,
  NotagilIntegrationClient,
  assertFiscalCanonicalPayloadV2,
  buildDirectNfceDocumentRequestV2,
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
  assert.equal(history[0].input, 'https://api.test/api/v1/integrations/company/10/documents/VENDA_BALCAO');
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
  assert.equal(history[0].input, 'https://api.test/api/v1/integrations/company/10/inbound/nfe/22/manifest');
  assert.equal(history[0].init.method, 'POST');
});

test('v1 IBPT helpers use company-scoped fiscal utility paths', async () => {
  const history = [];
  const client = new NotagilIntegrationClient({
    baseUrl: 'https://api.test/api/v1/integrations',
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      const body = history.length === 1
        ? { data: { valores: { tributo_total: 12.34 } } }
        : { data: { totais: { tributo_total: 45.67 } } };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  assert.deepEqual(await client.consultIbptItem('10', {
    uf: 'SP',
    ncm: '84715010',
    value: 100,
    description: 'Produto',
    origin_code: '0',
  }), { valores: { tributo_total: 12.34 } });
  assert.deepEqual(await client.consultIbptCoupon('10', {
    uf: 'SP',
    items: [{ ncm: '84715010', value: 100 }],
  }), { totais: { tributo_total: 45.67 } });

  assert.equal(history[0].input, 'https://api.test/api/v1/integrations/company/10/fiscal/utils/ibpt');
  assert.equal(history[1].input, 'https://api.test/api/v1/integrations/company/10/fiscal/utils/ibpt/coupon');
  assert.equal(history[0].init.method, 'POST');
  assert.match(history[0].init.body, /"value":100/);
  assert.match(history[1].init.body, /"items"/);
});

test('listCompanies accepts legacy filters on the singular company endpoint', async () => {
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
  assert.equal(history[0].input, 'https://api.test/api/v1/integrations/company');
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

test('v2 factory uses v2 base URL and unwraps dados', async () => {
  const history = [];
  const client = NotagilIntegrationClient.v2({
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      return new Response(JSON.stringify({ dados: { id: 'empresa-1' } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  const company = await client.getCompanyV2();

  assert.equal(client.apiVersion, 'v2');
  assert.deepEqual(company, { id: 'empresa-1' });
  assert.equal(history[0].input, `${DEFAULT_BASE_URL_V2}/empresa`);
  assert.equal(history[0].init.headers.Authorization, 'Bearer test-token');
});

test('v2 public docs prefers versioned openapi and swagger URLs', async () => {
  const history = [];
  const client = NotagilIntegrationClient.v2({
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      return new Response(JSON.stringify({
        data: {
          openapi_url: '/api/v1/integrations/openapi.yaml',
          swagger_url: '/api/v1/integrations/docs',
          versions: {
            v2: {
              openapi_url: '/api/v2/integrations/openapi.yaml',
              swagger_url: '/api/v2/integrations/docs',
            },
          },
        },
      }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  assert.equal(await client.getPublicOpenApiUrl(), '/api/v2/integrations/openapi.yaml');
  assert.equal(await client.getPublicSwaggerUrl(), '/api/v2/integrations/docs');
  assert.equal(history[0].input, 'https://api_notagil.sabbasistemas.com.br/api/public/docs?version=v2');
});

test('v2 public docs promotes legacy v1 URLs when versions block is absent', async () => {
  const client = NotagilIntegrationClient.v2({
    token: 'test-token',
    fetch: async () => new Response(JSON.stringify({
      data: {
        openapi_url: '/api/v1/integrations/openapi.yaml',
        swagger_url: '/api/v1/integrations/docs',
      },
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  });

  assert.equal(await client.getPublicOpenApiUrl(), '/api/v2/integrations/openapi.yaml');
  assert.equal(await client.getPublicSwaggerUrl(), '/api/v2/integrations/docs');
});

test('v2 direct document helpers use Portuguese public contract paths', async () => {
  const history = [];
  const client = NotagilIntegrationClient.v2({
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      const body = history.length === 1
        ? { dados: { contrato: 'FiscalCanonicalPayloadV2' } }
        : { dados: { external_id: 'erp-1', tipo_documento: 'nfce', status_fiscal: 'pendente' } };
      return new Response(JSON.stringify(body), {
        status: history.length === 1 ? 200 : 202,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  const payload = canonicalFiscalPayloadV2();
  const request = buildDirectNfceDocumentRequestV2(payload, {
    external_id: 'erp-1',
    ambiente_fiscal: 'homologacao',
    modo_emissao: 'fila',
  });

  assert.deepEqual(await client.getFiscalContractV2('nfce'), { contrato: 'FiscalCanonicalPayloadV2' });
  assert.deepEqual(await client.createDirectDocumentV2(request, 'idem-1'), {
    external_id: 'erp-1',
    tipo_documento: 'nfce',
    status_fiscal: 'pendente',
  });
  assert.equal(history[0].input, `${DEFAULT_BASE_URL_V2}/contratos/nfce`);
  assert.equal(history[1].input, `${DEFAULT_BASE_URL_V2}/direto/documentos`);
  assert.equal(history[1].init.headers['Idempotency-Key'], 'idem-1');
  assert.match(history[1].init.body, /"ambiente_fiscal"/);
});

test('v2 operation document helpers send Portuguese retrato payload', async () => {
  const history = [];
  const client = NotagilIntegrationClient.v2({
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      const body = history.length === 1
        ? { dados: { status_resolucao: 'resolvido', emissao_permitida: true } }
        : { dados: { external_id: 'erp-op-1', tipo_documento: 'nfce', status_fiscal: 'pendente' } };
      return new Response(JSON.stringify(body), {
        status: history.length === 1 ? 200 : 202,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  const retrato = {
    ambiente_fiscal: 'homologacao',
    direcao_documento: 'saida',
    dados_documento: {
      serie: '1',
      numero: '9001',
    },
    tomador: {
      consumidor_final: true,
      comprador_identificado: false,
      codigo_ibge: '3550308',
    },
    itens: [
      {
        produto_id: 31,
        codigo: 'SKU-001',
        descricao: 'Produto fiscal completo',
        tipo_item: 'produto',
        quantidade: 1,
        valor_unitario: 100,
        valor_bruto: 100,
      },
    ],
  };

  const preview = await client.previewDocumentByOperationV2('VENDA_BALCAO', {
    external_id: 'erp-op-preview-1',
    tipo_documento: 'nfce',
    retrato,
    metadados: { origem: 'sdk' },
  });
  const created = await client.createDocumentByOperationV2('VENDA_BALCAO', {
    external_id: 'erp-op-1',
    tipo_documento: 'nfce',
    modo_emissao: 'fila',
    retrato,
  }, 'idem-op-1');

  assert.deepEqual(preview, { status_resolucao: 'resolvido', emissao_permitida: true });
  assert.deepEqual(created, { external_id: 'erp-op-1', tipo_documento: 'nfce', status_fiscal: 'pendente' });
  assert.equal(history[0].input, `${DEFAULT_BASE_URL_V2}/operacoes/VENDA_BALCAO/previsualizar`);
  assert.equal(history[1].input, `${DEFAULT_BASE_URL_V2}/operacoes/VENDA_BALCAO/emitir`);
  assert.equal(history[1].init.headers['Idempotency-Key'], 'idem-op-1');
  assert.match(history[0].init.body, /"tipo_documento":"nfce"/);
  assert.match(history[0].init.body, /"retrato"/);
  assert.match(history[0].init.body, /"itens"/);
  assert.match(history[0].init.body, /"produto_id":31/);
  assert.doesNotMatch(history[0].init.body, /"document_type"/);
  assert.doesNotMatch(history[0].init.body, /"snapshot"/);
  assert.doesNotMatch(history[0].init.body, /"items"/);
  assert.doesNotMatch(history[0].init.body, /"product_id"/);
});

test('v2 product helpers use the evolved product contract and auxiliary catalog paths', async () => {
  const history = [];
  const client = NotagilIntegrationClient.v2({
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      const body = history.length === 1
        ? { dados: { id: 31, cod_sku: 'SKU-1', fiscal_tags: ['SUJEITO_ST'], fiscal_base: { apto_emissao: true } } }
        : history.length === 2
          ? { dados: [{ id: 1, codigo_fiscal: 'UN' }] }
          : { dados: { id: 1, codigo_fiscal: 'UN' } };
      return new Response(JSON.stringify(body), {
        status: history.length === 4 ? 201 : 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  const product = await client.createProductV2({
    cod_sku: 'SKU-1',
    codigo_operacional: 'ERP-1',
    descricao: 'Produto fiscal completo',
    produto_tipo: 'NORMAL',
    tipo_item: '00',
    natureza_item: 'MERCADORIA',
    origem_mercadoria: 0,
    fiscal_tags: ['SUJEITO_ST'],
  });
  const units = await client.listProductCatalogV2('unidades-medida', { ativo: true });
  const unit = await client.getProductCatalogV2('unidades-medida', 1);
  const createdUnit = await client.createProductCatalogV2('unidades-medida', { codigo_fiscal: 'UN', descricao: 'Unidade' });

  assert.deepEqual(product.fiscal_base, { apto_emissao: true });
  assert.deepEqual(units, [{ id: 1, codigo_fiscal: 'UN' }]);
  assert.deepEqual(unit, { id: 1, codigo_fiscal: 'UN' });
  assert.deepEqual(createdUnit, { id: 1, codigo_fiscal: 'UN' });
  assert.equal(history[0].input, `${DEFAULT_BASE_URL_V2}/produtos`);
  assert.equal(history[1].input, `${DEFAULT_BASE_URL_V2}/produtos/catalogo/unidades-medida?ativo=true`);
  assert.equal(history[2].input, `${DEFAULT_BASE_URL_V2}/produtos/catalogo/unidades-medida/1`);
  assert.equal(history[3].input, `${DEFAULT_BASE_URL_V2}/produtos/catalogo/unidades-medida`);
  assert.match(history[0].init.body, /"cod_sku":"SKU-1"/);
  assert.match(history[0].init.body, /"fiscal_tags"/);
});

test('v2 IBPT helpers use companyless Portuguese utility paths', async () => {
  const history = [];
  const client = NotagilIntegrationClient.v2({
    token: 'test-token',
    fetch: async (input, init) => {
      history.push({ input, init });
      const body = history.length === 1
        ? { dados: { valores: { tributo_total: 12.34 } } }
        : { dados: { totais: { tributo_total: 45.67 } } };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  });

  assert.deepEqual(await client.consultIbptItemV2({
    uf: 'SP',
    ncm: '84715010',
    valor: 100,
    descricao: 'Produto',
    codigo_origem: '0',
  }), { valores: { tributo_total: 12.34 } });
  assert.deepEqual(await client.consultIbptCouponV2({
    uf: 'SP',
    itens: [{ uf: 'SP', ncm: '84715010', valor: 100 }],
  }), { totais: { tributo_total: 45.67 } });

  assert.equal(history[0].input, `${DEFAULT_BASE_URL_V2}/fiscal/utilitarios/ibpt`);
  assert.equal(history[1].input, `${DEFAULT_BASE_URL_V2}/fiscal/utilitarios/ibpt/cupom`);
  assert.equal(history[0].init.method, 'POST');
  assert.match(history[0].init.body, /"valor":100/);
  assert.match(history[1].init.body, /"itens"/);
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

test('normalizeDocumentResponse accepts v2 Portuguese fields', () => {
  const normalized = normalizeDocumentResponse({
    dados: {
      id: 'doc_123',
      external_id: 'sale-0001',
      tipo_documento: 'nfce',
      serie: '1',
      numero: '42',
      status_operacional: 'concluido',
      status_fiscal: 'autorizado',
      chave_documento: '12345678901234567890123456789012345678901234',
      protocolo: '135260000000001',
      autorizado_em: '2026-06-23T10:30:00-03:00',
      artefatos: {
        xml_disponivel: true,
        pdf_disponivel: true,
      },
    },
  });

  assert.equal(normalized.document_type, 'nfce');
  assert.equal(normalized.series, '1');
  assert.equal(normalized.number, '42');
  assert.equal(normalized.operational_status, 'concluido');
  assert.equal(normalized.fiscal_status, 'autorizado');
  assert.equal(normalized.access_key, '12345678901234567890123456789012345678901234');
  assert.equal(normalized.protocol, '135260000000001');
  assert.equal(normalized.artifacts.xml_available, true);
});

test('FiscalCanonicalPayloadV2 validator rejects legacy aliases', () => {
  assertFiscalCanonicalPayloadV2(canonicalFiscalPayloadV2());

  assert.throws(
    () => assertFiscalCanonicalPayloadV2({
      ...canonicalFiscalPayloadV2(),
      identificacao: {
        ...canonicalFiscalPayloadV2().identificacao,
        naturezaOperacao: 'Venda',
      },
      itens: [
        {
          descricao: 'Produto',
          quantidade: 1,
          valorUnitario: 10,
        },
      ],
    }),
    (error) => {
      assert.ok(error instanceof FiscalCanonicalPayloadV2Error);
      assert.deepEqual(error.invalidFields, ['identificacao.naturezaOperacao', 'itens.0.valorUnitario']);
      assert.ok(error.expectedFields.includes('itens.*.valor_unitario'));
      return true;
    },
  );
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

  assert.throws(
    () => {
      assertCanonicalNfseNacionalPayload({
        prestador: {
          cnpj: '12345678000199',
          inscricaoMunicipal: '000000000033061',
          omitirIM: false,
        },
        servico: {
          cTribMun: '0107',
        },
      });
    },
    (error) => {
      assert.ok(error instanceof NfseNacionalContractError);
      assert.deepEqual(error.invalidFields, ['prestador.omitirIM']);
      assert.ok(!error.expectedFields.includes('prestador.omitirIM'));
      return true;
    },
  );
});

test('canonicalizeNfseProviderPolicy keeps only canonical NFSe Nacional policy fields', () => {
  const policy = canonicalizeNfseProviderPolicy({
    required_fields: ['servico.cNBS', 'service.activity_code'],
    visible_fields: ['servico.cTribNac', 'service.cnae_code'],
    field_schema: {
      'servico.cNBS': { label: 'NBS customizado' },
      'service.national_tax_code': { label: 'Codigo nacional legado' },
    },
  });

  assert.deepEqual(policy.required_fields, ['servico.cNBS']);
  assert.deepEqual(policy.visible_fields, ['servico.cTribNac']);
  assert.equal(policy.field_schema['servico.cNBS'].label, 'NBS customizado');
  assert.deepEqual(policy.field_schema['servico.cTribNac'].payload_paths, ['servico.cTribNac']);
  assert.equal(policy.field_schema['service.national_tax_code'], undefined);
  assert.equal(policy.field_schema['servico.codigoCnae'], undefined);
});

function canonicalFiscalPayloadV2() {
  return {
    identificacao: {
      serie: '1',
      numero: '42',
      natureza_operacao: 'Venda',
      ambiente: 'homologacao',
    },
    emitente: {
      cpf_cnpj: '12345678000199',
      razao_social: 'Empresa Exemplo LTDA',
      endereco: {
        codigo_municipio: '3550308',
        uf: 'SP',
      },
    },
    tomador: {
      cpf_cnpj: '12345678909',
      razao_social: 'Consumidor',
    },
    itens: [
      {
        codigo: 'SKU-1',
        descricao: 'Produto',
        quantidade: 1,
        valor_unitario: 10,
        valor_total: 10,
      },
    ],
  };
}
