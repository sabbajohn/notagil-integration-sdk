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

    public function companies(array $filters = []): array
    {
        return $this->request('GET','/company');
    }

    public function company(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}");
    }

    public function companyConfiguration(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/configuration");
    }

    public function updateCompanyConfiguration(string|int $companyId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/configuration", ['json' => $payload]);
    }

    public function nfseProviderInfo(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery("/company/{$companyId}/nfse/provider-info", $filters));
    }

    public function previewDocumentByOperation(string|int $companyId, string $operationCode, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/documents/".rawurlencode($operationCode).'/preview', ['json' => $payload]);
    }

    public function createDocumentByOperation(string|int $companyId, string $operationCode, array $payload, string $idempotencyKey): array
    {
        return $this->request('POST', "/company/{$companyId}/documents/".rawurlencode($operationCode), [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function createDirectDocument(string|int $companyId, array $payload, string $idempotencyKey): array
    {
        return $this->request('POST', "/company/{$companyId}/direct/documents", [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function transmitDirectXml(string|int $companyId, array $payload, string $idempotencyKey): array
    {
        return $this->request('POST', "/company/{$companyId}/direct/documents/xml", [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function document(string $externalId, string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/documents/" . rawurlencode($externalId));
    }

    public function documents(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery("/company/{$companyId}/documents", $filters), unwrapData: false);
    }

    public function waitDocument(string $externalId, string|int $companyId, int $timeoutSeconds = 120, int $intervalMilliseconds = 2000): array
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

    public function downloadDocumentXml(string $externalId, string|int $companyId): array
    {
        return $this->download($this->documentArtifactPath($externalId, 'xml', $companyId));
    }

    public function downloadDocumentPdf(string $externalId, string|int $companyId): array
    {
        return $this->download($this->documentArtifactPath($externalId, 'pdf', $companyId));
    }

    public function documentSnapshot(string $externalId, string|int $companyId): array
    {
        return $this->request('GET', $this->documentArtifactPath($externalId, 'snapshot', $companyId));
    }

    public function queryDocument(string $externalId, string|int $companyId, bool $forceRemote = false): array
    {
        return $this->request('POST', $this->withQuery($this->documentArtifactPath($externalId, 'query', $companyId), [
            'force_remote' => $forceRemote ? 1 : null,
        ]));
    }

    public function cancelDocument(string $externalId, string $reason, string|int $companyId): array
    {
        return $this->request('POST', "/company/{$companyId}/documents/" . rawurlencode($externalId) . '/cancel', ['json' => ['reason' => $reason]]);
    }

    public function correctDocument(string $externalId, string $correcao, ?int $sequencia, string|int $companyId): array
    {
        return $this->request('POST', "/company/{$companyId}/documents/" . rawurlencode($externalId) . '/correct', ['json' => array_filter([
            'correcao' => $correcao,
            'sequencia' => $sequencia,
        ], static fn ($value): bool => $value !== null)]);
    }

    public function products(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/products");
    }

    public function product(string|int $companyId, string|int $productId): array
    {
        return $this->request('GET', "/company/{$companyId}/products/{$productId}");
    }

    public function createProduct(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/products", ['json' => $payload]);
    }

    public function updateProduct(string|int $companyId, string|int $productId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/products/{$productId}", ['json' => $payload]);
    }

    public function deleteProduct(string|int $companyId, string|int $productId): array
    {
        return $this->request('DELETE', "/company/{$companyId}/products/{$productId}");
    }

    public function takers(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/takers");
    }

    public function taker(string|int $companyId, string|int $takerId): array
    {
        return $this->request('GET', "/company/{$companyId}/takers/{$takerId}");
    }

    public function createTaker(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/takers", ['json' => $payload]);
    }

    public function updateTaker(string|int $companyId, string|int $takerId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/takers/{$takerId}", ['json' => $payload]);
    }

    public function deleteTaker(string|int $companyId, string|int $takerId): array
    {
        return $this->request('DELETE', "/company/{$companyId}/takers/{$takerId}");
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

    public function certificates(string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/certificates', $companyId));
    }

    public function createCertificate(array $payload, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/certificates', $companyId), ['json' => $payload]);
    }

    public function updateCertificate(string|int $certificateId, array $payload, string|int $companyId): array
    {
        return $this->request('PATCH', $this->companyPath('/certificates/'.$certificateId, $companyId), ['json' => $payload]);
    }

    public function validateCertificate(string|int $certificateId, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/certificates/'.$certificateId.'/validate', $companyId));
    }

    public function readiness(string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/readiness', $companyId));
    }

    public function onboardingImports(string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/onboarding/imports', $companyId));
    }

    public function createOnboardingImport(array $payload, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/onboarding/imports', $companyId), ['json' => $payload]);
    }

    public function onboardingImport(string|int $importId, string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/onboarding/imports/'.$importId, $companyId));
    }

    public function reviewOnboardingImport(string|int $importId, array $payload, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/onboarding/imports/'.$importId.'/review', $companyId), ['json' => $payload]);
    }

    public function promoteOnboardingImport(string|int $companyId, string|int $importId, array $payload = []): array
    {
        return $this->request('POST', $this->companyPath('/onboarding/imports/'.$importId.'/promote', $companyId), ['json' => $payload]);
    }

    public function fiscalOptions(string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/fiscal/options', $companyId));
    }

    public function cfops(string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/fiscal/cfops', $companyId));
    }

    public function municipalities(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/utils/municipalities', $companyId), $filters), unwrapData: false);
    }

    public function ncms(array $filters, string|int $companyId): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/utils/ncms', $companyId), $filters), unwrapData: false);
    }

    public function taxCatalogs(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-catalogs', $companyId), $filters));
    }

    public function taxSituations(string|int $companyId, string|int $catalog, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-catalogs/'.$catalog.'/situations', $companyId), $filters));
    }

    public function taxClassifications(string|int $companyId, string|int $situation, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-situations/'.$situation.'/classifications', $companyId), $filters));
    }

    public function taxConsequenceTemplate(string|int $situation, array $filters, string|int $companyId): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/fiscal/tax-situations/'.$situation.'/consequence-template', $companyId), $filters));
    }

    public function emitterProfiles(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/fiscal/emitter-profiles");
    }

    public function createEmitterProfile(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/fiscal/emitter-profiles", ['json' => $payload]);
    }

    public function updateEmitterProfile(string|int $companyId, string|int $profileId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/fiscal/emitter-profiles/{$profileId}", ['json' => $payload]);
    }

    public function deleteEmitterProfile(string|int $companyId, string|int $profileId): array
    {
        return $this->request('DELETE', "/company/{$companyId}/fiscal/emitter-profiles/{$profileId}");
    }

    public function operationProfiles(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/fiscal/operation-profiles");
    }

    public function createOperationProfile(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/fiscal/operation-profiles", ['json' => $payload]);
    }

    public function updateOperationProfile(string|int $companyId, string|int $profileId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/fiscal/operation-profiles/{$profileId}", ['json' => $payload]);
    }

    public function deleteOperationProfile(string|int $companyId, string|int $profileId): array
    {
        return $this->request('DELETE', "/company/{$companyId}/fiscal/operation-profiles/{$profileId}");
    }

    public function profileAssignments(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/fiscal/profile-assignments");
    }

    public function createProfileAssignment(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/fiscal/profile-assignments", ['json' => $payload]);
    }

    public function updateProfileAssignment(string|int $companyId, string|int $assignmentId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/fiscal/profile-assignments/{$assignmentId}", ['json' => $payload]);
    }

    public function deleteProfileAssignment(string|int $companyId, string|int $assignmentId): array
    {
        return $this->request('DELETE', "/company/{$companyId}/fiscal/profile-assignments/{$assignmentId}");
    }

    public function rateReferences(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery("/company/{$companyId}/fiscal/rate-references", $filters));
    }

    public function createRateReference(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/fiscal/rate-references", ['json' => $payload]);
    }

    public function updateRateReference(string|int $companyId, string|int $rateReferenceId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/fiscal/rate-references/{$rateReferenceId}", ['json' => $payload]);
    }

    public function deleteRateReference(string|int $companyId, string|int $rateReferenceId): array
    {
        return $this->request('DELETE', "/company/{$companyId}/fiscal/rate-references/{$rateReferenceId}");
    }

    public function taxRuleSets(string|int $companyId): array
    {
        return $this->request('GET', "/company/{$companyId}/fiscal/tax-rule-sets");
    }

    public function createTaxRuleSet(string|int $companyId, array $payload): array
    {
        return $this->request('POST', "/company/{$companyId}/fiscal/tax-rule-sets", ['json' => $payload]);
    }

    public function updateTaxRuleSet(string|int $companyId, string|int $taxRuleSetId, array $payload): array
    {
        return $this->request('PUT', "/company/{$companyId}/fiscal/tax-rule-sets/{$taxRuleSetId}", ['json' => $payload]);
    }

    public function deleteTaxRuleSet(string|int $companyId, string|int $taxRuleSetId): array
    {
        return $this->request('DELETE', "/company/{$companyId}/fiscal/tax-rule-sets/{$taxRuleSetId}");
    }

    public function unifiedDocuments(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/consulta-notas', $companyId), $filters));
    }

    public function lookupUnifiedDocument(array $payload, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/consulta-notas/lookup', $companyId), ['json' => $payload]);
    }

    public function downloadUnifiedDocumentXml(string $source, string|int $documentId, string|int $companyId): array
    {
        return $this->download($this->companyPath('/consulta-notas/'.$source.'/'.$documentId.'/xml', $companyId));
    }

    public function downloadUnifiedDocumentPdf(string $source, string|int $documentId, string|int $companyId): array
    {
        return $this->download($this->companyPath('/consulta-notas/'.$source.'/'.$documentId.'/pdf', $companyId));
    }

    public function syncInboundNfe(string|int $companyId, array $payload = []): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/sync', $companyId), ['json' => $payload], unwrapData: false);
    }

    public function inboundNfe(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/inbound/nfe', $companyId), $filters), unwrapData: false);
    }

    public function manifestInboundNfe(string|int $documentId, array $payload, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/manifest', $companyId), ['json' => $payload], unwrapData: false);
    }

    public function manifestCompanyInboundNfe(string|int $companyId, string|int $documentId, array $payload): array
    {
        return $this->manifestInboundNfe($documentId, $payload, $companyId);
    }

    public function downloadInboundNfeXml(string|int $documentId, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/download-xml', $companyId), unwrapData: false);
    }

    public function downloadCompanyInboundNfeXml(string|int $companyId, string|int $documentId): array
    {
        return $this->downloadInboundNfeXml($documentId, $companyId);
    }

    public function updateInboundNfeEntryBookkeeping(string|int $documentId, array $payload, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/entry-bookkeeping', $companyId), ['json' => $payload], unwrapData: false);
    }

    public function updateCompanyInboundNfeEntryBookkeeping(string|int $companyId, string|int $documentId, array $payload): array
    {
        return $this->updateInboundNfeEntryBookkeeping($documentId, $payload, $companyId);
    }

    public function confirmInboundNfeEntryBookkeeping(string|int $documentId, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/inbound/nfe/'.$documentId.'/entry-bookkeeping/confirm', $companyId), unwrapData: false);
    }

    public function confirmCompanyInboundNfeEntryBookkeeping(string|int $companyId, string|int $documentId): array
    {
        return $this->confirmInboundNfeEntryBookkeeping($documentId, $companyId);
    }

    public function stockMovements(string|int $companyId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery($this->companyPath('/stock/movements', $companyId), $filters));
    }

    public function stockBalance(string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/stock/balance', $companyId));
    }

    public function schedules(string|int $companyId): array
    {
        return $this->request('GET', $this->companyPath('/schedules', $companyId));
    }

    public function createSchedule(array $payload, string|int $companyId): array
    {
        return $this->request('POST', $this->companyPath('/schedules', $companyId), ['json' => $payload]);
    }

    public function updateSchedule(string|int $scheduleId, array $payload, string|int $companyId): array
    {
        return $this->request('PUT', $this->companyPath('/schedules/'.$scheduleId, $companyId), ['json' => $payload]);
    }

    public function deleteSchedule(string|int $scheduleId, string|int $companyId): array
    {
        return $this->request('DELETE', $this->companyPath('/schedules/'.$scheduleId, $companyId));
    }

    public static function webhookSignature(string $secret, string $deliveryId, string $timestamp, string $body): string
    {
        return hash_hmac('sha256', "{$deliveryId}.{$timestamp}.{$body}", $secret);
    }

    private function companyPath(string $path, string|int $companyId): string
    {
        return "/company/{$companyId}{$path}";
    }

    private function documentArtifactPath(string $externalId, string $artifact, string|int $companyId): string
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
            throw $this->apiException($response?->getStatusCode() ?? 0, $payload);
        }

        $content = (string) $response->getBody();
        $contentType = $response->getHeaderLine('Content-Type') ?: null;

        return [
            'content' => $content,
            'base64' => str_contains((string) $contentType, 'application/pdf') ? base64_encode($content) : null,
            'mime_type' => $contentType,
            'content_type' => $contentType,
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
            throw $this->apiException($response?->getStatusCode() ?? 0, $payload);
        }

        $payload = $this->decode((string) $response->getBody());

        if ($response->getStatusCode() >= 400) {
            throw $this->apiException($response->getStatusCode(), $payload);
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

    private function apiException(int $statusCode, mixed $payload): NotaAgilApiException
    {
        $errors = is_array($payload) ? ($payload['errors'] ?? null) : null;
        $rejectionReason = is_array($payload) && isset($payload['rejection_reason'])
            ? (string) $payload['rejection_reason']
            : null;

        return new NotaAgilApiException($statusCode, $payload, $errors, $rejectionReason);
    }
}
