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
    public function test_create_document_by_operation_sends_idempotency_key_and_bearer_token(): void
    {
        $history = [];
        $client = $this->client([new Response(202, [], json_encode(['data' => ['id' => '1']]))], $history);

        $response = $client->createDocumentByOperation('10', 'VENDA_BALCAO', [
            'external_id' => 'erp-1',
            'document_type' => 'nfce',
            'snapshot' => ['items' => []],
        ], 'idem-1');

        $this->assertSame(['id' => '1'], $response);
        $request = $history[0]['request'];
        $this->assertSame('Bearer test-token', $request->getHeaderLine('Authorization'));
        $this->assertSame('idem-1', $request->getHeaderLine('Idempotency-Key'));
        $this->assertSame('/api/v1/integrations/companies/10/documents/VENDA_BALCAO', $request->getUri()->getPath());
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

        $preview = $client->previewDocumentByOperation('10', 'VENDA_NORMAL', $snapshotRequest);
        $created = $client->createDocumentByOperation('10', 'VENDA_NORMAL', $snapshotRequest, 'idem-operation-1');

        $this->assertSame(['resolution_status' => 'resolved'], $preview);
        $this->assertSame(['id' => '1'], $created);
        $this->assertSame('/api/v1/integrations/companies/10/documents/VENDA_NORMAL/preview', $history[0]['request']->getUri()->getPath());
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
            new Response(200, [], json_encode(['data' => [['id' => 'emitter-1']]])),
            new Response(201, [], json_encode(['data' => ['id' => 'rule-1']])),
            new Response(201, [], json_encode(['data' => ['id' => 'assignment-1']])),
            new Response(200, [], json_encode(['data' => ['deleted' => true]])),
            new Response(200, [], json_encode(['data' => ['deleted' => true]])),
        ], $history);

        $rates = $client->rateReferences('10', ['tax_type' => 'ibs', 'uf' => 'SC']);
        $emitters = $client->emitterProfiles('10');
        $rule = $client->createTaxRuleSet('10', [
            'code' => 'IBS-SC',
            'name' => 'IBS SC',
            'rule_scope_type' => 'product',
            'valid_from' => '2026-01-01',
        ]);
        $assignment = $client->createProfileAssignment('10', [
            'profile_id' => '11',
            'operation_profile_id' => '12',
        ]);
        $deleted = $client->deleteOperationProfile('10', '99');
        $deletedEmitter = $client->deleteEmitterProfile('10', '77');

        $this->assertSame([['id' => 'rate-1']], $rates);
        $this->assertSame([['id' => 'emitter-1']], $emitters);
        $this->assertSame(['id' => 'rule-1'], $rule);
        $this->assertSame(['id' => 'assignment-1'], $assignment);
        $this->assertSame(['deleted' => true], $deleted);
        $this->assertSame(['deleted' => true], $deletedEmitter);
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/rate-references', $history[0]['request']->getUri()->getPath());
        $this->assertSame('tax_type=ibs&uf=SC', $history[0]['request']->getUri()->getQuery());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/emitter-profiles', $history[1]['request']->getUri()->getPath());
        $this->assertSame('POST', $history[2]['request']->getMethod());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/tax-rule-sets', $history[2]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/profile-assignments', $history[3]['request']->getUri()->getPath());
        $this->assertSame('DELETE', $history[4]['request']->getMethod());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/operation-profiles/99', $history[4]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/emitter-profiles/77', $history[5]['request']->getUri()->getPath());
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
        $readiness = $client->readiness('10');
        $cfops = $client->cfops('10');
        $schedule = $client->createSchedule(['tipo' => 'unica', 'proxima_execucao' => '2026-01-01T00:00:00Z'], '10');

        $this->assertSame('<xml />', $download['content']);
        $this->assertSame('nfce.xml', $download['filename']);
        $this->assertSame(['status' => 'blocked'], $readiness);
        $this->assertSame([['id' => 'cfop-1']], $cfops);
        $this->assertSame(['id' => 'schedule-1'], $schedule);
        $this->assertSame('/api/v1/integrations/companies/10/documents/erp-1/xml', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/readiness', $history[1]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/fiscal/cfops', $history[2]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/schedules', $history[3]['request']->getUri()->getPath());
    }

    public function test_inbound_nfe_company_first_aliases_use_expected_paths(): void
    {
        $history = [];
        $client = $this->client([
            new Response(200, [], json_encode(['data' => ['document' => ['id' => 'doc-1']], 'ok' => true, 'error' => null])),
            new Response(200, [], json_encode(['data' => ['xml' => '<nfe />'], 'ok' => true, 'error' => null])),
            new Response(200, [], json_encode(['data' => ['id' => 'doc-1'], 'ok' => true, 'error' => null])),
            new Response(200, [], json_encode(['data' => ['id' => 'doc-1'], 'ok' => true, 'error' => null])),
        ], $history);

        $manifest = $client->manifestCompanyInboundNfe('10', '22', ['event_type' => 'ciencia']);
        $download = $client->downloadCompanyInboundNfeXml('10', '22');
        $updated = $client->updateCompanyInboundNfeEntryBookkeeping('10', '22', ['cfop' => '1102']);
        $confirmed = $client->confirmCompanyInboundNfeEntryBookkeeping('10', '22');

        $this->assertTrue((bool) ($manifest['ok'] ?? false));
        $this->assertTrue((bool) ($download['ok'] ?? false));
        $this->assertTrue((bool) ($updated['ok'] ?? false));
        $this->assertTrue((bool) ($confirmed['ok'] ?? false));
        $this->assertSame('/api/v1/integrations/companies/10/inbound/nfe/22/manifest', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/inbound/nfe/22/download-xml', $history[1]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/inbound/nfe/22/entry-bookkeeping', $history[2]['request']->getUri()->getPath());
        $this->assertSame('/api/v1/integrations/companies/10/inbound/nfe/22/entry-bookkeeping/confirm', $history[3]['request']->getUri()->getPath());
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
