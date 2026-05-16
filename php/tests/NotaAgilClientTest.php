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

    public function test_api_errors_throw_typed_exception(): void
    {
        $history = [];
        $client = $this->client([new Response(403, [], json_encode(['message' => 'Escopo insuficiente.']))], $history);

        $this->expectException(NotaAgilApiException::class);
        $this->expectExceptionMessage('Escopo insuficiente.');

        $client->companies();
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
