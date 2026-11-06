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

final class UnifiedDocumentLookupTest extends TestCase
{
    public function test_explicit_helpers_separate_metadata_operations_for_both_api_versions(): void
    {
        foreach (['v1', 'v2'] as $version) {
            foreach ([
                'lookupStoredDocument' => ['nota_armazenada', 'metadados_nota'],
                'lookupSefazStatus' => ['situacao_sefaz', 'situacao_protocolo'],
                'lookupNfeDistribution' => ['distribuicao_dfe', 'resumo_nfe'],
            ] as $method => [$purpose, $content]) {
                $history = [];
                $result = ['resultado_consulta' => ['finalidade' => $purpose, 'conteudo' => $content, 'inclui_xml' => false]];
                $client = $this->client($version, [new Response(200, [], json_encode([
                    $version === 'v2' ? 'dados' : 'data' => $result,
                ], JSON_THROW_ON_ERROR))], $history);
                $payload = $version === 'v2'
                    ? ['chave_documento' => str_repeat('1', 44), 'tipo_documento' => 'nfe', 'ambiente_fiscal' => 'producao']
                    : ['document_key' => str_repeat('1', 44), 'document_type' => 'nfe', 'fiscal_environment' => 'producao'];
                $actual = $version === 'v2' ? $client->{$method.'V2'}($payload) : $client->{$method}($payload, '10');
                $this->assertSame($result, $actual);
                $this->assertCount(1, $history);
                $request = $history[0]['request'];
                $this->assertSame('POST', $request->getMethod());
                $this->assertSame('Bearer test-token', $request->getHeaderLine('Authorization'));
                $this->assertSame('/api/'.$version.'/integrations/'.($version === 'v2' ? 'consulta-notas/consultar' : 'company/10/consulta-notas/lookup'), $request->getUri()->getPath());
                $this->assertEquals($payload + ['finalidade' => $purpose], json_decode((string) $request->getBody(), true, 512, JSON_THROW_ON_ERROR));
            }
        }
    }

    public function test_explicit_helpers_reject_ambiguous_flags_before_any_request(): void
    {
        $history = [];
        $client = $this->client('v2', [], $history);
        foreach (['lookupStoredDocument', 'lookupSefazStatus', 'lookupNfeDistribution'] as $method) {
            foreach (['finalidade', 'consulta_remota', 'forcar_consulta_remota', 'remote_lookup', 'force_remote'] as $field) {
                foreach ([null, false, true] as $value) {
                    foreach (['', 'V2'] as $suffix) {
                        try {
                            $client->{$method.$suffix}([$field => $value], ...($suffix === '' ? ['10'] : []));
                            $this->fail('Ambiguous flag must be rejected.');
                        } catch (\InvalidArgumentException $exception) {
                            $this->assertStringContainsString($field, $exception->getMessage());
                        }
                    }
                }
            }
        }
        $this->assertCount(0, $history);
    }

    public function test_remote_helpers_default_to_nfe_and_reject_other_models(): void
    {
        foreach (['', 'V2'] as $suffix) {
            foreach (['lookupSefazStatus', 'lookupNfeDistribution'] as $method) {
                $history = [];
                $client = $this->client('v2', [new Response(200, [], '{"dados":{}}')], $history);
                $field = $suffix === '' ? 'document_type' : 'tipo_documento';
                $arguments = $suffix === '' ? ['10'] : [];
                $client->{$method.$suffix}([], ...$arguments);
                $body = json_decode((string) $history[0]['request']->getBody(), true, 512, JSON_THROW_ON_ERROR);
                $this->assertSame('nfe', $body[$field]);
                try {
                    $client->{$method.$suffix}([$field => 'nfce'], ...$arguments);
                    $this->fail('Only NF-e model 55 is supported by remote helpers.');
                } catch (\InvalidArgumentException $exception) {
                    $this->assertStringContainsString('model 55', $exception->getMessage());
                }
                $this->assertCount(1, $history);
            }
        }
    }

    public function test_stored_xml_preserves_original_bytes_and_forces_local_only(): void
    {
        $xml = "\xEF\xBB\xBF<?xml version=\"1.0\"?>\r\n<nfeProc>\xE7</nfeProc>\r\n";
        foreach (['v1', 'v2'] as $version) {
            $history = [];
            $client = $this->client($version, [new Response(200, [
                'Content-Type' => 'application/xml', 'Content-Disposition' => 'attachment; filename="original.xml"',
            ], $xml)], $history);
            $env = $version === 'v2' ? 'ambiente_fiscal' : 'fiscal_environment';
            $filters = [$env => 'producao', 'somente_armazenado' => false];
            $result = $version === 'v2'
                ? $client->downloadStoredUnifiedDocumentXmlV2('inbound', 'document/1', $filters)
                : $client->downloadStoredUnifiedDocumentXml('inbound', 'document/1', '10', $filters);
            $this->assertSame($xml, $result['content']);
            $this->assertSame('original.xml', $result['filename']);
            $this->assertSame('application/xml', $result['content_type']);
            $this->assertCount(1, $history);
            $request = $history[0]['request'];
            $this->assertSame('GET', $request->getMethod());
            $this->assertStringEndsWith('/inbound/document%2F1/xml', $request->getUri()->getPath());
            parse_str($request->getUri()->getQuery(), $query);
            $this->assertSame([$env => 'producao', 'somente_armazenado' => '1'], $query);
        }
    }

    public function test_existing_methods_keep_legacy_payload_and_download_behavior(): void
    {
        foreach (['v1', 'v2'] as $version) {
            $history = [];
            $client = $this->client($version, [new Response(200, [], '{"data":{}}'), new Response(200, [], '<original/>')], $history);
            $payload = $version === 'v2'
                ? ['chave_documento' => 'legacy-key', 'consulta_remota' => false, 'forcar_consulta_remota' => false]
                : ['document_key' => 'legacy-key', 'remote_lookup' => false, 'force_remote' => false];
            if ($version === 'v2') {
                $client->lookupUnifiedDocumentV2($payload);
                $result = $client->downloadUnifiedDocumentXmlV2('outbound', '1');
            } else {
                $client->lookupUnifiedDocument($payload, '10');
                $result = $client->downloadUnifiedDocumentXml('outbound', '1', '10');
            }
            $this->assertSame($payload, json_decode((string) $history[0]['request']->getBody(), true));
            $this->assertSame('', $history[1]['request']->getUri()->getQuery());
            $this->assertSame('<original/>', $result['content']);
        }
    }

    public function test_errors_do_not_trigger_downloads_retries_or_fallbacks(): void
    {
        foreach ([404, 409, 429, 503] as $status) {
            $history = [];
            $client = $this->client('v2', [new Response($status, ['Content-Type' => 'application/json'], json_encode([
                'codigo' => 'nfe_distribution_test', 'mensagem' => 'Fixture error',
            ], JSON_THROW_ON_ERROR))], $history);
            try {
                if ($status === 429 || $status === 503) {
                    $client->lookupNfeDistributionV2(['chave_documento' => str_repeat('1', 44)]);
                } else {
                    $client->downloadStoredUnifiedDocumentXmlV2('inbound', '1');
                }
                $this->fail('Expected API error.');
            } catch (NotaAgilApiException $exception) {
                $this->assertSame($status, $exception->statusCode);
            }
            $this->assertCount(1, $history);
        }
    }

    private function client(string $version, array $responses, array &$history): NotaAgilClient
    {
        $handler = HandlerStack::create(new MockHandler($responses));
        $handler->push(Middleware::history($history));
        return new NotaAgilClient(
            baseUrl: 'https://api.test/api/'.$version.'/integrations', token: 'test-token', http: new Client(['handler' => $handler]),
        );
    }
}
