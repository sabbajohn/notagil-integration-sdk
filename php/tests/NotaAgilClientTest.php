<?php

namespace NotaAgil\Integration\Tests;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use NotaAgil\Integration\NotaAgilApiException;
use NotaAgil\Integration\NotaAgilClient;
use PHPUnit\Framework\TestCase;

class NotaAgilClientTest extends TestCase
{
    public function test_create_document_sends_idempotency_key_and_bearer_token(): void
    {
        $history = [];
        $client = $this->client([new Response(202, [], json_encode(['data' => ['id' => '1']]))], $history);

        $response = $client->createDocument('10', [
            'external_id' => 'erp-1',
            'document_type' => 'nfce',
            'payload' => [],
        ], 'idem-1');

        $this->assertSame(['id' => '1'], $response);
        $request = $history[0]['request'];
        $this->assertSame('Bearer test-token', $request->getHeaderLine('Authorization'));
        $this->assertSame('idem-1', $request->getHeaderLine('Idempotency-Key'));
        $this->assertSame('/api/v1/integrations/companies/10/documents', $request->getUri()->getPath());
    }

    public function test_operation_code_document_methods_use_snapshot_contract_paths(): void
    {
        $history = [];
        $client = $this->client([
            new Response(200, [], json_encode(['data' => ['resolution_status' => 'resolved']])),
            new Response(202, [], json_encode(['data' => ['id' => '1']])),
        ], $history);

        $snapshotRequest = [
            'external_id' => 'erp-1',
            'document_type' => 'nfe',
            'snapshot' => [
                'fiscal_environment' => 'homologacao',
                'document_data' => ['numero' => '1'],
                'items' => [
                    ['description' => 'Produto', 'quantity' => 1, 'unit_price' => 10],
                ],
            ],
        ];

        $preview = $client->previewDocumentByOperation('VENDA_NORMAL', $snapshotRequest);
        $created = $client->createDocumentByOperation('10', 'VENDA_NORMAL', $snapshotRequest, 'idem-operation-1');

        $this->assertSame(['resolution_status' => 'resolved'], $preview);
        $this->assertSame(['id' => '1'], $created);
        $this->assertSame('/api/v1/integrations/documents/VENDA_NORMAL/preview', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/documents/VENDA_NORMAL', $history[1]['request']->getUri()->getPath());
        $this->assertSame('idem-operation-1', $history[1]['request']->getHeaderLine('Idempotency-Key'));
        $this->assertStringContainsString('"snapshot"', (string) $history[1]['request']->getBody());
    }

    public function test_api_errors_throw_typed_exception(): void
    {
        $history = [];
        $client = $this->client([new Response(403, [], json_encode(['message' => 'Escopo insuficiente.']))], $history);

        $this->expectException(NotaAgilApiException::class);
        $this->expectExceptionMessage('Escopo insuficiente.');

        $client->companies();
    }

    public function test_fiscal_management_methods_use_company_scoped_paths(): void
    {
        $history = [];
        $client = $this->client([
            new Response(200, [], json_encode(['data' => [['id' => 'rate-1']]])),
            new Response(201, [], json_encode(['data' => ['id' => 'rule-1']])),
            new Response(200, [], json_encode(['data' => ['deleted' => true]])),
        ], $history);

        $rates = $client->rateReferences('10', ['tax_type' => 'ibs', 'uf' => 'SC']);
        $rule = $client->createTaxRuleSet('10', [
            'code' => 'IBS-SC',
            'name' => 'IBS SC',
            'rule_scope_type' => 'product',
            'valid_from' => '2026-01-01',
        ]);
        $deleted = $client->deleteOperationProfile('10', '99');

        $this->assertSame([['id' => 'rate-1']], $rates);
        $this->assertSame(['id' => 'rule-1'], $rule);
        $this->assertSame(['deleted' => true], $deleted);
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/rate-references', $history[0]['request']->getUri()->getPath());
        $this->assertSame('tax_type=ibs&uf=SC', $history[0]['request']->getUri()->getQuery());
        $this->assertSame('POST', $history[1]['request']->getMethod());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/tax-rule-sets', $history[1]['request']->getUri()->getPath());
        $this->assertSame('DELETE', $history[2]['request']->getMethod());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/operation-profiles/99', $history[2]['request']->getUri()->getPath());
    }

    public function test_document_download_and_operational_helpers_use_public_paths(): void
    {
        $history = [];
        $client = $this->client([
            new Response(200, [
                'Content-Type' => 'application/xml',
                'Content-Disposition' => 'attachment; filename="nfce.xml"',
            ], '<xml />'),
            new Response(200, [], json_encode(['data' => ['status' => 'blocked']])),
            new Response(200, [], json_encode(['data' => [['id' => 'cfop-1']]])),
            new Response(201, [], json_encode(['data' => ['id' => 'schedule-1']])),
        ], $history);

        $download = $client->downloadDocumentXml('erp-1', '10');
        $readiness = $client->readiness();
        $cfops = $client->cfops('10');
        $schedule = $client->createSchedule(['tipo' => 'unica', 'proxima_execucao' => '2026-01-01T00:00:00Z']);

        $this->assertSame('<xml />', $download['content']);
        $this->assertSame('nfce.xml', $download['filename']);
        $this->assertSame(['status' => 'blocked'], $readiness);
        $this->assertSame([['id' => 'cfop-1']], $cfops);
        $this->assertSame(['id' => 'schedule-1'], $schedule);
        $this->assertSame('/api/v1/integrations/companies/10/documents/erp-1/xml', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/readiness', $history[1]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/cfops', $history[2]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/schedules', $history[3]['request']->getUri()->getPath());
    }

    public function test_webhook_signature_helper_matches_hmac_contract(): void
    {
        $this->assertSame(
            hash_hmac('sha256', 'delivery-1.2026-01-01T00:00:00Z.{"ok":true}', 'whsec_test'),
            NotaAgilClient::webhookSignature('whsec_test', 'delivery-1', '2026-01-01T00:00:00Z', '{"ok":true}')
        );
    }

    private function client(array $responses, array &$history): NotaAgilClient
    {
        $mock = new MockHandler($responses);
        $stack = HandlerStack::create($mock);
        $stack->push(Middleware::history($history));

        return new NotaAgilClient(
            'https://api.test/api/v1/integrations',
            'test-token',
            new Client(['handler' => $stack]),
        );
    }
}
