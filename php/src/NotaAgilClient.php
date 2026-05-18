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

    public function nfseProviderInfo(array $filters = [], ?string $companyId = null): array
    {
        $path = $companyId === null ? '/nfse/provider-info' : "/companies/{$companyId}/nfse/provider-info";

        return $this->request('GET', $this->withQuery($path, $filters));
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

        return $this->request('GET', $this->withQuery($path, $filters), unwrapData: false);
    }

    public function waitDocument(string $externalId, ?string $companyId = null, int $timeoutSeconds = 120, int $intervalMilliseconds = 2000): array
    {
        $started = microtime(true);
        $terminalFiscal = ['authorized', 'rejected', 'cancelled', 'corrected'];
        $terminalOperational = ['completed', 'failed'];

        do {
            $document = $this->document($externalId, $companyId);
            if (
                in_array((string) ($document['fiscal_status'] ?? ''), $terminalFiscal, true)
                || in_array((string) ($document['operational_status'] ?? ''), $terminalOperational, true)
            ) {
                return $document;
            }

            usleep($intervalMilliseconds * 1000);
        } while ((microtime(true) - $started) < $timeoutSeconds);

        return $document;
    }

    public function downloadDocumentXml(string $externalId, ?string $companyId = null): array
    {
        return $this->download($this->documentArtifactPath($externalId, 'xml', $companyId));
    }

    public function downloadDocumentPdf(string $externalId, ?string $companyId = null): array
    {
        return $this->download($this->documentArtifactPath($externalId, 'pdf', $companyId));
    }

    public function documentSnapshot(string $externalId, ?string $companyId = null): array
    {
        return $this->request('GET', $this->documentArtifactPath($externalId, 'snapshot', $companyId));
    }

    public function queryDocument(string $externalId, ?string $companyId = null, bool $forceRemote = false): array
    {
        return $this->request('POST', $this->withQuery($this->documentArtifactPath($externalId, 'query', $companyId), [
            'force_remote' => $forceRemote ? 1 : null,
        ]));
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

    public function product(string|int $companyId, string|int $productId): array
    {
        return $this->request('GET', "/companies/{$companyId}/products/{$productId}");
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

    public function taker(string|int $companyId, string|int $takerId): array
    {
        return $this->request('GET', "/companies/{$companyId}/takers/{$takerId}");
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

    public function deleteWebhook(string|int $webhookId): array
    {
        return $this->request('DELETE', "/webhooks/{$webhookId}");
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

    public function certificates(?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/certificates', $companyId));
    }

    public function createCertificate(array $payload, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/certificates', $companyId), ['json' => $payload]);
    }

    public function updateCertificate(string|int $certificateId, array $payload, ?string $companyId = null): array
    {
        return $this->request('PATCH', $this->companyPath('/certificates/'.$certificateId, $companyId), ['json' => $payload]);
    }

    public function validateCertificate(string|int $certificateId, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/certificates/'.$certificateId.'/validate', $companyId));
    }

    public function readiness(?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/readiness', $companyId));
    }

    public function onboardingImports(?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/onboarding/imports', $companyId));
    }

    public function createOnboardingImport(array $payload, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/onboarding/imports', $companyId), ['json' => $payload]);
    }

    public function onboardingImport(string|int $importId, ?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/onboarding/imports/'.$importId, $companyId));
    }

    public function reviewOnboardingImport(string|int $importId, array $payload, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/onboarding/imports/'.$importId.'/review', $companyId), ['json' => $payload]);
    }

    public function promoteOnboardingImport(string|int $importId, array $payload = [], ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/onboarding/imports/'.$importId.'/promote', $companyId), ['json' => $payload]);
    }

    public function fiscalOptions(?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/fiscal/options', $companyId));
    }

    public function cfops(?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/fiscal/cfops', $companyId));
    }

    public function municipalities(array $filters = [], ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/utils/municipalities', $companyId), $filters), unwrapData: false);
    }

    public function ncms(array $filters, ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/utils/ncms', $companyId), $filters), unwrapData: false);
    }

    public function taxCatalogs(array $filters = [], ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-catalogs', $companyId), $filters));
    }

    public function taxSituations(string|int $catalog, array $filters = [], ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-catalogs/'.$catalog.'/situations', $companyId), $filters));
    }

    public function taxClassifications(string|int $situation, array $filters = [], ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-situations/'.$situation.'/classifications', $companyId), $filters));
    }

    public function taxConsequenceTemplate(string|int $situation, array $filters, ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-situations/'.$situation.'/consequence-template', $companyId), $filters));
    }

    public function operationProfiles(string|int $companyId): array
    {
        return $this->request('GET', "/companies/{$companyId}/fiscal/operation-profiles");
    }

    public function createOperationProfile(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/companies/{$companyId}/fiscal/operation-profiles", ['json' => $payload]);
    }

    public function updateOperationProfile(string|int $companyId, string|int $profileId, array $payload): array
    {
        return $this->request('PUT', "/companies/{$companyId}/fiscal/operation-profiles/{$profileId}", ['json' => $payload]);
    }

    public function deleteOperationProfile(string|int $companyId, string|int $profileId): array
    {
        return $this->request('DELETE', "/companies/{$companyId}/fiscal/operation-profiles/{$profileId}");
    }

    public function rateReferences(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery("/companies/{$companyId}/fiscal/rate-references", $filters));
    }

    public function createRateReference(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/companies/{$companyId}/fiscal/rate-references", ['json' => $payload]);
    }

    public function updateRateReference(string|int $companyId, string|int $rateReferenceId, array $payload): array
    {
        return $this->request('PUT', "/companies/{$companyId}/fiscal/rate-references/{$rateReferenceId}", ['json' => $payload]);
    }

    public function deleteRateReference(string|int $companyId, string|int $rateReferenceId): array
    {
        return $this->request('DELETE', "/companies/{$companyId}/fiscal/rate-references/{$rateReferenceId}");
    }

    public function taxRuleSets(string|int $companyId): array
    {
        return $this->request('GET', "/companies/{$companyId}/fiscal/tax-rule-sets");
    }

    public function createTaxRuleSet(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/companies/{$companyId}/fiscal/tax-rule-sets", ['json' => $payload]);
    }

    public function updateTaxRuleSet(string|int $companyId, string|int $taxRuleSetId, array $payload): array
    {
        return $this->request('PUT', "/companies/{$companyId}/fiscal/tax-rule-sets/{$taxRuleSetId}", ['json' => $payload]);
    }

    public function deleteTaxRuleSet(string|int $companyId, string|int $taxRuleSetId): array
    {
        return $this->request('DELETE', "/companies/{$companyId}/fiscal/tax-rule-sets/{$taxRuleSetId}");
    }

    public function unifiedDocuments(array $filters = [], ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/consulta-notas', $companyId), $filters));
    }

    public function lookupUnifiedDocument(array $payload, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/consulta-notas/lookup', $companyId), ['json' => $payload]);
    }

    public function downloadUnifiedDocumentXml(string $source, string|int $documentId, ?string $companyId = null): array
    {
        return $this->download($this->companyPath('/consulta-notas/'.$source.'/'.$documentId.'/xml', $companyId));
    }

    public function downloadUnifiedDocumentPdf(string $source, string|int $documentId, ?string $companyId = null): array
    {
        return $this->download($this->companyPath('/consulta-notas/'.$source.'/'.$documentId.'/pdf', $companyId));
    }

    public function syncInboundNfe(array $payload = [], ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/sync', $companyId), ['json' => $payload], unwrapData: false);
    }

    public function inboundNfe(array $filters = [], ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/inbound/nfe', $companyId), $filters), unwrapData: false);
    }

    public function manifestInboundNfe(string|int $documentId, array $payload, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/manifest', $companyId), ['json' => $payload], unwrapData: false);
    }

    public function downloadInboundNfeXml(string|int $documentId, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/download-xml', $companyId), unwrapData: false);
    }

    public function updateInboundNfeEntryBookkeeping(string|int $documentId, array $payload, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/entry-bookkeeping', $companyId), ['json' => $payload], unwrapData: false);
    }

    public function confirmInboundNfeEntryBookkeeping(string|int $documentId, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/entry-bookkeeping/confirm', $companyId), unwrapData: false);
    }

    public function stockMovements(array $filters = [], ?string $companyId = null): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/stock/movements', $companyId), $filters));
    }

    public function stockBalance(?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/stock/balance', $companyId));
    }

    public function schedules(?string $companyId = null): array
    {
        return $this->request('GET', $this->companyPath('/schedules', $companyId));
    }

    public function createSchedule(array $payload, ?string $companyId = null): array
    {
        return $this->request('POST', $this->companyPath('/schedules', $companyId), ['json' => $payload]);
    }

    public function updateSchedule(string|int $scheduleId, array $payload, ?string $companyId = null): array
    {
        return $this->request('PUT', $this->companyPath('/schedules/'.$scheduleId, $companyId), ['json' => $payload]);
    }

    public function deleteSchedule(string|int $scheduleId, ?string $companyId = null): array
    {
        return $this->request('DELETE', $this->companyPath('/schedules/'.$scheduleId, $companyId));
    }

    public static function webhookSignature(string $secret, string $deliveryId, string $timestamp, string $body): string
    {
        return hash_hmac('sha256', "{$deliveryId}.{$timestamp}.{$body}", $secret);
    }

    private function companyPath(string $path, ?string $companyId = null): string
    {
        return $companyId === null ? $path : "/companies/{$companyId}{$path}";
    }

    private function documentArtifactPath(string $externalId, string $artifact, ?string $companyId = null): string
    {
        return $this->companyPath('/documents/'.rawurlencode($externalId).'/'.$artifact, $companyId);
    }

    private function download(string $path): array
    {
        try {
            $response = $this->http->request('GET', $this->baseUrl.$path, [
                'headers' => [
                    'Accept' => '*/*',
                    'Authorization' => 'Bearer '.$this->token,
                ],
            ]);
        } catch (RequestException $exception) {
            $response = $exception->getResponse();
            $payload = $response ? $this->decode((string) $response->getBody()) : ['message' => $exception->getMessage()];
            throw new NotaAgilApiException($response?->getStatusCode() ?? 0, $payload);
        }

        return [
            'content' => (string) $response->getBody(),
            'content_type' => $response->getHeaderLine('Content-Type') ?: null,
            'filename' => $this->filenameFromDisposition($response->getHeaderLine('Content-Disposition')),
        ];
    }

    private function filenameFromDisposition(string $disposition): ?string
    {
        if ($disposition === '') {
            return null;
        }

        return preg_match('/filename="?([^";]+)"?/i', $disposition, $matches) === 1 ? $matches[1] : null;
    }

    private function withQuery(string $path, array $filters): string
    {
        $query = http_build_query(array_filter($filters, static fn ($value): bool => $value !== null && $value !== ''));

        return $query === '' ? $path : $path . '?' . $query;
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
