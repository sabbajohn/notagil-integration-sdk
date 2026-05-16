<?php

namespace NotaAgil\Integration;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;

class NotaAgilClient
{
    private ClientInterface $http;
    private string $baseUrl;
    private string $token;

    public function __construct(string $baseUrl, string $token, ?ClientInterface $http = null)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->token = $token;
        $this->http = $http ?? new Client(['timeout' => 30]);
    }

    public function companies(): array
    {
        return $this->request('GET', '/companies');
    }

    public function company(string|int $companyId): array
    {
        return $this->request('GET', "/companies/{$companyId}");
    }

    public function companyConfiguration(?string $companyId = null): array
    {
        $path = $companyId === null ? '/configuration/company' : "/companies/{$companyId}/configuration";

        return $this->request('GET', $path);
    }

    public function updateCompanyConfiguration(array $payload, ?string $companyId = null): array
    {
        $path = $companyId === null ? '/configuration/company' : "/companies/{$companyId}/configuration";

        return $this->request('PUT', $path, ['json' => $payload]);
    }

    public function previewDocument(array $payload, ?string $companyId = null): array
    {
        $path = $companyId === null ? '/documents/preview' : "/companies/{$companyId}/documents/preview";

        return $this->request('POST', $path, ['json' => $payload]);
    }

    public function createDocument(?string $companyId, array $payload, string $idempotencyKey): array
    {
        $path = $companyId === null ? '/documents' : "/companies/{$companyId}/documents";

        return $this->request('POST', $path, [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function createDirectDocument(?string $companyId, array $payload, string $idempotencyKey): array
    {
        $path = $companyId === null ? '/direct/documents' : "/companies/{$companyId}/direct/documents";

        return $this->request('POST', $path, [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function transmitDirectXml(?string $companyId, array $payload, string $idempotencyKey): array
    {
        $path = $companyId === null ? '/direct/documents/xml' : "/companies/{$companyId}/direct/documents/xml";

        return $this->request('POST', $path, [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function document(string $externalId, ?string $companyId = null): array
    {
        $path = $companyId === null
            ? '/documents/' . rawurlencode($externalId)
            : "/companies/{$companyId}/documents/" . rawurlencode($externalId);

        return $this->request('GET', $path);
    }

    public function documents(array $filters = [], ?string $companyId = null): array
    {
        $path = $companyId === null ? '/documents' : "/companies/{$companyId}/documents";
        $query = http_build_query(array_filter($filters, static fn ($value): bool => $value !== null && $value !== ''));

        return $this->request('GET', $query === '' ? $path : $path . '?' . $query, unwrapData: false);
    }

    public function cancelDocument(string $externalId, string $reason, ?string $companyId = null): array
    {
        $path = $companyId === null
            ? '/documents/' . rawurlencode($externalId) . '/cancel'
            : "/companies/{$companyId}/documents/" . rawurlencode($externalId) . '/cancel';

        return $this->request('POST', $path, ['json' => ['reason' => $reason]]);
    }

    public function correctDocument(string $externalId, string $correcao, ?int $sequencia = null, ?string $companyId = null): array
    {
        $path = $companyId === null
            ? '/documents/' . rawurlencode($externalId) . '/correct'
            : "/companies/{$companyId}/documents/" . rawurlencode($externalId) . '/correct';

        return $this->request('POST', $path, ['json' => array_filter([
            'correcao' => $correcao,
            'sequencia' => $sequencia,
        ], static fn ($value): bool => $value !== null)]);
    }

    public function products(string|int $companyId): array
    {
        return $this->request('GET', "/companies/{$companyId}/products");
    }

    public function createProduct(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/companies/{$companyId}/products", ['json' => $payload]);
    }

    public function updateProduct(string|int $companyId, string|int $productId, array $payload): array
    {
        return $this->request('PUT', "/companies/{$companyId}/products/{$productId}", ['json' => $payload]);
    }

    public function deleteProduct(string|int $companyId, string|int $productId): array
    {
        return $this->request('DELETE', "/companies/{$companyId}/products/{$productId}");
    }

    public function takers(string|int $companyId): array
    {
        return $this->request('GET', "/companies/{$companyId}/takers");
    }

    public function createTaker(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/companies/{$companyId}/takers", ['json' => $payload]);
    }

    public function updateTaker(string|int $companyId, string|int $takerId, array $payload): array
    {
        return $this->request('PUT', "/companies/{$companyId}/takers/{$takerId}", ['json' => $payload]);
    }

    public function deleteTaker(string|int $companyId, string|int $takerId): array
    {
        return $this->request('DELETE', "/companies/{$companyId}/takers/{$takerId}");
    }

    public function webhooks(): array
    {
        return $this->request('GET', '/webhooks');
    }

    public function createWebhook(array $payload): array
    {
        return $this->request('POST', '/webhooks', ['json' => $payload]);
    }

    public function updateWebhook(string|int $webhookId, array $payload): array
    {
        return $this->request('PUT', "/webhooks/{$webhookId}", ['json' => $payload]);
    }

    public function rotateWebhookSecret(string|int $webhookId): array
    {
        return $this->request('POST', "/webhooks/{$webhookId}/rotate-secret");
    }

    public function testWebhook(string|int $webhookId): array
    {
        return $this->request('POST', "/webhooks/{$webhookId}/test");
    }

    public function webhookDeliveries(string|int $webhookId): array
    {
        return $this->request('GET', "/webhooks/{$webhookId}/deliveries");
    }

    public function metrics(): array
    {
        return $this->request('GET', '/metrics');
    }

    public function billing(): array
    {
        return $this->request('GET', '/billing');
    }

    private function request(string $method, string $path, array $options = [], bool $unwrapData = true): array
    {
        $options['headers'] = array_merge([
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ], $options['headers'] ?? []);

        try {
            $response = $this->http->request($method, $this->baseUrl . $path, $options);
        } catch (RequestException $exception) {
            $response = $exception->getResponse();
            $payload = $response ? $this->decode((string) $response->getBody()) : ['message' => $exception->getMessage()];
            throw new NotaAgilApiException($response?->getStatusCode() ?? 0, $payload);
        }

        $payload = $this->decode((string) $response->getBody());

        if ($response->getStatusCode() >= 400) {
            throw new NotaAgilApiException($response->getStatusCode(), $payload);
        }

        return $unwrapData && is_array($payload) && array_key_exists('data', $payload)
            ? (array) $payload['data']
            : (array) $payload;
    }

    private function decode(string $body): mixed
    {
        if ($body === '') {
            return null;
        }

        $decoded = json_decode($body, true);

        return json_last_error() === JSON_ERROR_NONE ? $decoded : ['raw' => $body];
    }
}
