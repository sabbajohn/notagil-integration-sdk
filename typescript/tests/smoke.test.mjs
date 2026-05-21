import assert from 'node:assert/strict';
import test from 'node:test';

import { NotagilApiError, NotagilIntegrationClient } from '../dist/index.js';

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

test('webhookSignature matches the documented HMAC contract', async () => {
  const signature = await NotagilIntegrationClient.webhookSignature(
    'whsec_test',
    'delivery-1',
    '2026-01-01T00:00:00Z',
    '{"ok":true}',
  );

  assert.equal(signature, '82c312bd5c5920d8c0654bdb14b369af9e27dd1828c99cb2713396670be52751');
});
