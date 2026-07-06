<?php

namespace NotaAgil\Integration\Tests;

use GuzzleHttp\Client;
use GuzzleHttp\Handler\MockHandler;
use GuzzleHttp\HandlerStack;
use GuzzleHttp\Middleware;
use GuzzleHttp\Psr7\Response;
use NotaAgil\Integration\FiscalCanonicalV2Contract;
use NotaAgil\Integration\FiscalCanonicalV2ContractException;
use NotaAgil\Integration\NotaAgilApiException;
use NotaAgil\Integration\NotaAgilClient;
use PHPUnit\Framework\TestCase;

final class NotaAgilClientV2Test extends TestCase
{
    public function test_v2_factory_uses_v2_base_url_and_version(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(200, [], json_encode(['dados' => ['id' => 'empresa-1']], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        $this->assertSame('v2', $client->apiVersion());
        $this->assertSame(['id' => 'empresa-1'], $client->companyV2());
        $this->assertSame(NotaAgilClient::DEFAULT_BASE_URL_V2.'/empresa', (string) $history[0]['request']->getUri());
        $this->assertSame('Bearer test-token', $history[0]['request']->getHeaderLine('Authorization'));
    }

    public function test_public_openapi_url_prefers_current_v2_documentation(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(200, [], json_encode([
                    'data' => [
                        'openapi_url' => 'https://api.example.com/openapi/integration-v1.yaml',
                        'swagger_url' => 'https://api.example.com/docs/v1',
                        'versions' => [
                            'v2' => [
                                'openapi_url' => 'https://api.example.com/openapi/integration-v2.yaml',
                                'swagger_url' => 'https://api.example.com/docs/v2',
                            ],
                        ],
                    ],
                ], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        $this->assertSame('https://api.example.com/openapi/integration-v2.yaml', $client->publicOpenApiUrl());
        $this->assertSame('https://api_notagil.sabbasistemas.com.br/api/public/docs?version=v2', (string) $history[0]['request']->getUri());
    }

    public function test_public_docs_v2_falls_back_by_promoting_legacy_v1_urls(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(200, [], json_encode([
                    'data' => [
                        'openapi_url' => '/api/v1/integrations/openapi.yaml',
                        'swagger_url' => '/api/v1/integrations/docs',
                    ],
                ], JSON_THROW_ON_ERROR)),
                new Response(200, [], json_encode([
                    'data' => [
                        'openapi_url' => '/api/v1/integrations/openapi.yaml',
                        'swagger_url' => '/api/v1/integrations/docs',
                    ],
                ], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        $this->assertSame('/api/v2/integrations/openapi.yaml', $client->publicOpenApiUrl());
        $this->assertSame('/api/v2/integrations/docs', $client->publicSwaggerUrl());
    }

    public function test_v2_document_methods_use_portuguese_companyless_contract(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(200, [], json_encode(['dados' => ['contrato' => 'FiscalCanonicalPayloadV2']], JSON_THROW_ON_ERROR)),
                new Response(202, [], json_encode(['dados' => ['external_id' => 'erp-1', 'tipo_documento' => 'nfce']], JSON_THROW_ON_ERROR)),
                new Response(200, [], json_encode(['dados' => [['external_id' => 'erp-1']], 'metadados' => ['por_pagina' => 5]], JSON_THROW_ON_ERROR)),
                new Response(200, [], json_encode(['dados' => ['external_id' => 'erp-1', 'status_fiscal' => 'autorizado']], JSON_THROW_ON_ERROR)),
                new Response(200, [], json_encode(['dados' => ['status_fiscal' => 'cancelado']], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        $payload = $this->canonicalPayload();

        $this->assertSame(['contrato' => 'FiscalCanonicalPayloadV2'], $client->fiscalContractV2('nfce'));
        $this->assertSame(
            ['external_id' => 'erp-1', 'tipo_documento' => 'nfce'],
            $client->createDirectDocumentV2([
                'external_id' => 'erp-1',
                'tipo_documento' => 'nfce',
                'ambiente_fiscal' => 'homologacao',
                'payload' => $payload,
            ], 'idem-1'),
        );
        $this->assertSame(['dados' => [['external_id' => 'erp-1']], 'metadados' => ['por_pagina' => 5]], $client->documentsV2(['tipo_documento' => 'nfce', 'por_pagina' => 5]));
        $this->assertSame(['external_id' => 'erp-1', 'status_fiscal' => 'autorizado'], $client->documentV2('erp-1'));
        $this->assertSame(['status_fiscal' => 'cancelado'], $client->cancelDocumentV2('erp-1', 'Cancelamento homologacao teste.'));

        $this->assertSame('/api/v2/integrations/contratos/nfce', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v2/integrations/direto/documentos', $history[1]['request']->getUri()->getPath());
        $this->assertSame('idem-1', $history[1]['request']->getHeaderLine('Idempotency-Key'));
        $this->assertStringContainsString('"ambiente_fiscal"', (string) $history[1]['request']->getBody());
        $this->assertSame('/api/v2/integrations/documentos', $history[2]['request']->getUri()->getPath());
        $this->assertSame('tipo_documento=nfce&por_pagina=5', $history[2]['request']->getUri()->getQuery());
        $this->assertSame('/api/v2/integrations/documentos/erp-1', $history[3]['request']->getUri()->getPath());
        $this->assertSame('/api/v2/integrations/documentos/erp-1/cancelar', $history[4]['request']->getUri()->getPath());
    }

    public function test_v2_operation_methods_use_portuguese_retrato_contract(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(200, [], json_encode(['dados' => ['status_resolucao' => 'resolvido', 'emissao_permitida' => true]], JSON_THROW_ON_ERROR)),
                new Response(202, [], json_encode(['dados' => ['external_id' => 'erp-op-1', 'tipo_documento' => 'nfce', 'status_fiscal' => 'pendente']], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        $retrato = [
            'ambiente_fiscal' => 'homologacao',
            'direcao_documento' => 'saida',
            'dados_documento' => [
                'serie' => '1',
                'numero' => '9001',
            ],
            'tomador' => [
                'consumidor_final' => true,
                'comprador_identificado' => false,
                'codigo_ibge' => '3550308',
            ],
            'itens' => [
                [
                    'produto_id' => 31,
                    'codigo' => 'SKU-001',
                    'descricao' => 'Produto fiscal completo',
                    'tipo_item' => 'produto',
                    'quantidade' => 1,
                    'valor_unitario' => 100,
                    'valor_bruto' => 100,
                ],
            ],
        ];

        $preview = $client->previewDocumentByOperationV2('VENDA_BALCAO', [
            'external_id' => 'erp-op-preview-1',
            'tipo_documento' => 'nfce',
            'retrato' => $retrato,
            'metadados' => ['origem' => 'sdk'],
        ]);
        $created = $client->createDocumentByOperationV2('VENDA_BALCAO', [
            'external_id' => 'erp-op-1',
            'tipo_documento' => 'nfce',
            'modo_emissao' => 'fila',
            'retrato' => $retrato,
        ], 'idem-op-1');

        $this->assertSame(['status_resolucao' => 'resolvido', 'emissao_permitida' => true], $preview);
        $this->assertSame(['external_id' => 'erp-op-1', 'tipo_documento' => 'nfce', 'status_fiscal' => 'pendente'], $created);
        $this->assertSame('/api/v2/integrations/operacoes/VENDA_BALCAO/previsualizar', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v2/integrations/operacoes/VENDA_BALCAO/emitir', $history[1]['request']->getUri()->getPath());
        $this->assertSame('idem-op-1', $history[1]['request']->getHeaderLine('Idempotency-Key'));

        $body = (string) $history[0]['request']->getBody();
        $this->assertStringContainsString('"tipo_documento":"nfce"', $body);
        $this->assertStringContainsString('"retrato"', $body);
        $this->assertStringContainsString('"itens"', $body);
        $this->assertStringContainsString('"produto_id":31', $body);
        $this->assertStringNotContainsString('"document_type"', $body);
        $this->assertStringNotContainsString('"snapshot"', $body);
        $this->assertStringNotContainsString('"items"', $body);
        $this->assertStringNotContainsString('"product_id"', $body);
    }

    public function test_v2_product_methods_use_evolved_contract_and_auxiliary_catalog_paths(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(201, [], json_encode(['dados' => ['id' => 31, 'cod_sku' => 'SKU-1', 'fiscal_tags' => ['SUJEITO_ST'], 'fiscal_base' => ['apto_emissao' => true]]], JSON_THROW_ON_ERROR)),
                new Response(200, [], json_encode(['dados' => [['id' => 1, 'codigo_fiscal' => 'UN']]], JSON_THROW_ON_ERROR)),
                new Response(200, [], json_encode(['dados' => ['id' => 1, 'codigo_fiscal' => 'UN']], JSON_THROW_ON_ERROR)),
                new Response(201, [], json_encode(['dados' => ['id' => 1, 'codigo_fiscal' => 'UN']], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        $product = $client->createProductV2([
            'cod_sku' => 'SKU-1',
            'codigo_operacional' => 'ERP-1',
            'descricao' => 'Produto fiscal completo',
            'produto_tipo' => 'NORMAL',
            'tipo_item' => '00',
            'natureza_item' => 'MERCADORIA',
            'origem_mercadoria' => 0,
            'fiscal_tags' => ['SUJEITO_ST'],
        ]);
        $units = $client->listProductCatalogV2('unidades-medida', ['ativo' => true]);
        $unit = $client->getProductCatalogV2('unidades-medida', 1);
        $createdUnit = $client->createProductCatalogV2('unidades-medida', ['codigo_fiscal' => 'UN', 'descricao' => 'Unidade']);

        $this->assertSame(['apto_emissao' => true], $product['fiscal_base']);
        $this->assertSame([['id' => 1, 'codigo_fiscal' => 'UN']], $units);
        $this->assertSame(['id' => 1, 'codigo_fiscal' => 'UN'], $unit);
        $this->assertSame(['id' => 1, 'codigo_fiscal' => 'UN'], $createdUnit);
        $this->assertSame('/api/v2/integrations/produtos', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v2/integrations/produtos/catalogo/unidades-medida', $history[1]['request']->getUri()->getPath());
        $this->assertSame('ativo=1', $history[1]['request']->getUri()->getQuery());
        $this->assertSame('/api/v2/integrations/produtos/catalogo/unidades-medida/1', $history[2]['request']->getUri()->getPath());
        $this->assertSame('/api/v2/integrations/produtos/catalogo/unidades-medida', $history[3]['request']->getUri()->getPath());
        $this->assertStringContainsString('"cod_sku":"SKU-1"', (string) $history[0]['request']->getBody());
        $this->assertStringContainsString('"fiscal_tags"', (string) $history[0]['request']->getBody());
    }

    public function test_v2_ibpt_helpers_use_companyless_portuguese_routes(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(200, [], json_encode(['dados' => ['valores' => ['tributo_total' => 12.34]]], JSON_THROW_ON_ERROR)),
                new Response(200, [], json_encode(['dados' => ['totais' => ['tributo_total' => 45.67]]], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        $item = $client->consultIbptItemV2([
            'uf' => 'SP',
            'ncm' => '84715010',
            'valor' => 100,
            'descricao' => 'Produto',
            'codigo_origem' => '0',
        ]);
        $coupon = $client->consultIbptCouponV2([
            'uf' => 'SP',
            'itens' => [
                ['ncm' => '84715010', 'valor' => 100],
            ],
        ]);

        $this->assertSame(['tributo_total' => 12.34], $item['valores']);
        $this->assertSame(['tributo_total' => 45.67], $coupon['totais']);
        $this->assertSame('/api/v2/integrations/fiscal/utilitarios/ibpt', $history[0]['request']->getUri()->getPath());
        $this->assertSame('/api/v2/integrations/fiscal/utilitarios/ibpt/cupom', $history[1]['request']->getUri()->getPath());
        $this->assertStringContainsString('"valor":100', (string) $history[0]['request']->getBody());
        $this->assertStringContainsString('"itens"', (string) $history[1]['request']->getBody());
    }

    public function test_normalize_document_response_accepts_v2_blocks_and_portuguese_fields(): void
    {
        $normalized = NotaAgilClient::normalizeDocumentResponse([
            'dados' => [
                'id' => 'doc_123',
                'external_id' => 'sale-0001',
                'tipo_documento' => 'nfce',
                'serie' => '1',
                'numero' => '42',
                'status_operacional' => 'concluido',
                'status_fiscal' => 'autorizado',
                'chave_documento' => '12345678901234567890123456789012345678901234',
                'protocolo' => '135260000000001',
                'autorizado_em' => '2026-06-23T10:30:00-03:00',
                'artefatos' => [
                    'xml_disponivel' => true,
                    'pdf_disponivel' => true,
                ],
            ],
        ]);

        $this->assertSame('doc_123', $normalized['id']);
        $this->assertSame('nfce', $normalized['document_type']);
        $this->assertSame('1', $normalized['series']);
        $this->assertSame('42', $normalized['number']);
        $this->assertSame('autorizado', $normalized['fiscal_status']);
        $this->assertSame('concluido', $normalized['operational_status']);
        $this->assertSame('12345678901234567890123456789012345678901234', $normalized['access_key']);
        $this->assertSame('135260000000001', $normalized['protocol']);
        $this->assertTrue($normalized['artifacts']['xml_available']);
    }

    public function test_v2_errors_throw_typed_exception_with_portuguese_error_body(): void
    {
        $history = [];
        $client = NotaAgilClient::v2(
            token: 'test-token',
            http: $this->http([
                new Response(422, [], json_encode([
                    'mensagem' => 'Payload invalido.',
                    'codigo' => 'validation_failed',
                    'erros' => ['ambiente_fiscal' => ['Campo invalido.']],
                ], JSON_THROW_ON_ERROR)),
            ], $history),
        );

        try {
            $client->companyConfigurationV2();
            $this->fail('Expected NotaAgilApiException.');
        } catch (NotaAgilApiException $exception) {
            $this->assertSame(422, $exception->statusCode);
            $this->assertSame(['ambiente_fiscal' => ['Campo invalido.']], $exception->errors);
            $this->assertSame('Payload invalido.', $exception->getMessage());
        }
    }

    public function test_fiscal_canonical_v2_contract_rejects_legacy_aliases(): void
    {
        $payload = $this->canonicalPayload();
        FiscalCanonicalV2Contract::assertCanonical($payload);

        $this->expectException(FiscalCanonicalV2ContractException::class);

        try {
            FiscalCanonicalV2Contract::assertCanonical([
                ...$payload,
                'identificacao' => [
                    ...$payload['identificacao'],
                    'naturezaOperacao' => 'Venda',
                ],
                'itens' => [
                    [
                        'descricao' => 'Produto',
                        'quantidade' => 1,
                        'valorUnitario' => 10,
                    ],
                ],
            ]);
        } catch (FiscalCanonicalV2ContractException $exception) {
            $this->assertSame(['identificacao.naturezaOperacao', 'itens.0.valorUnitario'], $exception->invalidFields);
            $this->assertContains('itens.*.valor_unitario', $exception->expectedFields);

            throw $exception;
        }
    }

    /**
     * @return array<string,mixed>
     */
    private function canonicalPayload(): array
    {
        return [
            'identificacao' => [
                'serie' => '1',
                'numero' => '42',
                'natureza_operacao' => 'Venda',
                'ambiente' => 'homologacao',
            ],
            'emitente' => [
                'cpf_cnpj' => '12345678000199',
                'razao_social' => 'Empresa Exemplo LTDA',
                'endereco' => [
                    'codigo_municipio' => '3550308',
                    'uf' => 'SP',
                ],
            ],
            'tomador' => [
                'cpf_cnpj' => '12345678909',
                'razao_social' => 'Consumidor',
            ],
            'itens' => [
                [
                    'codigo' => 'SKU-1',
                    'descricao' => 'Produto',
                    'quantidade' => 1,
                    'valor_unitario' => 10,
                    'valor_total' => 10,
                ],
            ],
        ];
    }

    /**
     * @param list<Response> $responses
     * @param array<int,array<string,mixed>> $history
     */
    private function http(array $responses, array &$history): Client
    {
        $stack = HandlerStack::create(new MockHandler($responses));
        $stack->push(Middleware::history($history));

        return new Client(['handler' => $stack]);
    }
}
