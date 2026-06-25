<?php

namespace NotaAgil\Integration;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;

class NotaAgilClient
{
    public const DEFAULT_BASE_URL_V1 = 'https://api_notagil.sabbasistemas.com.br/api/v1/integrations';
    public const DEFAULT_BASE_URL_V2 = 'https://api_notagil.sabbasistemas.com.br/api/v2/integrations';

    private ClientInterface $http;
    private string $baseUrl;
    private string $token;
    private string $apiVersion;

    public function __construct(string $baseUrl, string $token, ?ClientInterface $http = null, ?string $apiVersion = null)
    {
        $this->baseUrl = rtrim($baseUrl, '/');
        $this->token = $token;
        $this->http = $http ?? new Client(['timeout' => 30]);
        $this->apiVersion = $apiVersion !== null ? $this->normalizeApiVersion($apiVersion) : $this->inferApiVersion($this->baseUrl);
    }

    public static function v1(string $token, ?string $baseUrl = null, ?ClientInterface $http = null): self
    {
        return new self($baseUrl ?? self::DEFAULT_BASE_URL_V1, $token, $http, 'v1');
    }

    public static function v2(string $token, ?string $baseUrl = null, ?ClientInterface $http = null): self
    {
        return new self($baseUrl ?? self::DEFAULT_BASE_URL_V2, $token, $http, 'v2');
    }

    public function apiVersion(): string
    {
        return $this->apiVersion;
    }

    public function companies(array $filters = []): array
    {
        return $this->request('GET','/company');
    }

    public function publicDocs(): array
    {
        return $this->request('GET', $this->publicDocsPath(), [], true, $this->platformBaseUrl());
    }

    public function publicOpenApiUrl(): ?string
    {
        $docs = $this->publicDocs();
        $url = $this->publicDocsUrl($docs, 'openapi_url');

        return is_string($url) && trim($url) !== '' ? trim($url) : null;
    }

    public function publicSwaggerUrl(): ?string
    {
        $docs = $this->publicDocs();
        $url = $this->publicDocsUrl($docs, 'swagger_url');

        return is_string($url) && trim($url) !== '' ? trim($url) : null;
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

    public function fiscalContractV2(string $documentType): array
    {
        return $this->request('GET', '/contratos/'.rawurlencode($documentType));
    }

    public function createDirectDocumentV2(array $payload, string $idempotencyKey): array
    {
        return $this->request('POST', '/direto/documentos', [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function transmitDirectXmlV2(array $payload, string $idempotencyKey): array
    {
        return $this->request('POST', '/direto/documentos/xml', [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function companyV2(): array
    {
        return $this->request('GET', '/empresa');
    }

    public function companyConfigurationV2(): array
    {
        return $this->request('GET', '/configuracao');
    }

    public function updateCompanyConfigurationV2(array $payload): array
    {
        return $this->request('PUT', '/configuracao', ['json' => $payload]);
    }

    public function nfseProviderInfoV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/nfse/informacoes-provedor', $filters));
    }

    public function validateNfceCscV2(array $payload = []): array
    {
        return $this->request('POST', '/nfce/validar-csc', ['json' => $payload]);
    }

    public function previewDocumentByOperationV2(string $operationCode, array $payload): array
    {
        return $this->request('POST', '/operacoes/'.rawurlencode($operationCode).'/previsualizar', ['json' => $payload]);
    }

    public function createDocumentByOperationV2(string $operationCode, array $payload, string $idempotencyKey): array
    {
        return $this->request('POST', '/operacoes/'.rawurlencode($operationCode).'/emitir', [
            'json' => $payload,
            'headers' => ['Idempotency-Key' => $idempotencyKey],
        ]);
    }

    public function documentsV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/documentos', $filters), unwrapData: false);
    }

    public function documentV2(string $externalId): array
    {
        return $this->request('GET', '/documentos/'.rawurlencode($externalId));
    }

    public function waitDocumentV2(string $externalId, int $timeoutSeconds = 120, int $intervalMilliseconds = 2000): array
    {
        $started = microtime(true);
        $terminalFiscal = ['autorizado', 'rejeitado', 'cancelado', 'corrigido', 'authorized', 'rejected', 'cancelled', 'corrected'];
        $terminalOperational = ['concluido', 'falhou', 'completed', 'failed'];

        do {
            $document = $this->documentV2($externalId);
            if (
                in_array((string) ($document['status_fiscal'] ?? $document['fiscal_status'] ?? ''), $terminalFiscal, true)
                || in_array((string) ($document['status_operacional'] ?? $document['operational_status'] ?? ''), $terminalOperational, true)
            ) {
                return $document;
            }

            usleep($intervalMilliseconds * 1000);
        } while ((microtime(true) - $started) < $timeoutSeconds);

        return $document;
    }

    public function downloadDocumentXmlV2(string $externalId, array $filters = []): array
    {
        return $this->download($this->withQuery('/documentos/'.rawurlencode($externalId).'/xml', $filters));
    }

    public function downloadDocumentPdfV2(string $externalId, array $filters = []): array
    {
        return $this->download($this->withQuery('/documentos/'.rawurlencode($externalId).'/pdf', $filters));
    }

    public function documentSnapshotV2(string $externalId, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/documentos/'.rawurlencode($externalId).'/retrato', $filters));
    }

    public function queryDocumentV2(string $externalId, array $payload = []): array
    {
        return $this->request('POST', '/documentos/'.rawurlencode($externalId).'/consultar', ['json' => $payload]);
    }

    public function cancelDocumentV2(string $externalId, string $justificativa): array
    {
        return $this->request('POST', '/documentos/'.rawurlencode($externalId).'/cancelar', [
            'json' => ['justificativa' => $justificativa],
        ]);
    }

    public function correctDocumentV2(string $externalId, string $correcao, ?int $sequencia = null): array
    {
        return $this->request('POST', '/documentos/'.rawurlencode($externalId).'/corrigir', ['json' => array_filter([
            'correcao' => $correcao,
            'sequencia' => $sequencia,
        ], static fn ($value): bool => $value !== null)]);
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

    public function consultIbptItem(string|int $companyId, array $payload): array
    {
        return $this->request('POST', $this->companyPath('/fiscal/utils/ibpt', $companyId), ['json' => $payload]);
    }

    public function consultIbptCoupon(string|int $companyId, array $payload): array
    {
        return $this->request('POST', $this->companyPath('/fiscal/utils/ibpt/coupon', $companyId), ['json' => $payload]);
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

    public function certificatesV2(): array
    {
        return $this->request('GET', '/certificados');
    }

    public function createCertificateV2(array $payload): array
    {
        return $this->request('POST', '/certificados', ['json' => $payload]);
    }

    public function updateCertificateV2(string|int $certificateId, array $payload): array
    {
        return $this->request('PATCH', '/certificados/'.rawurlencode((string) $certificateId), ['json' => $payload]);
    }

    public function validateCertificateV2(string|int $certificateId): array
    {
        return $this->request('POST', '/certificados/'.rawurlencode((string) $certificateId).'/validar');
    }

    public function readinessV2(): array
    {
        return $this->request('GET', '/prontidao');
    }

    public function onboardingImportsV2(): array
    {
        return $this->request('GET', '/implantacao/importacoes');
    }

    public function createOnboardingImportV2(array $payload): array
    {
        return $this->request('POST', '/implantacao/importacoes', ['json' => $payload]);
    }

    public function onboardingImportV2(string|int $importId): array
    {
        return $this->request('GET', '/implantacao/importacoes/'.rawurlencode((string) $importId));
    }

    public function reviewOnboardingImportV2(string|int $importId, array $payload): array
    {
        return $this->request('POST', '/implantacao/importacoes/'.rawurlencode((string) $importId).'/revisar', ['json' => $payload]);
    }

    public function promoteOnboardingImportV2(string|int $importId, array $payload = []): array
    {
        return $this->request('POST', '/implantacao/importacoes/'.rawurlencode((string) $importId).'/promover', ['json' => $payload]);
    }

    public function fiscalOptionsV2(): array
    {
        return $this->request('GET', '/fiscal/opcoes');
    }

    public function cfopsV2(): array
    {
        return $this->request('GET', '/fiscal/cfops');
    }

    public function municipalitiesV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/utilitarios/municipios', $filters));
    }

    public function ncmsV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/utilitarios/ncms', $filters));
    }

    public function consultIbptItemV2(array $payload): array
    {
        return $this->request('POST', '/fiscal/utilitarios/ibpt', ['json' => $payload]);
    }

    public function consultIbptCouponV2(array $payload): array
    {
        return $this->request('POST', '/fiscal/utilitarios/ibpt/cupom', ['json' => $payload]);
    }

    public function taxCatalogsV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/catalogos-tributarios', $filters));
    }

    public function taxSituationsV2(string|int $catalog, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/catalogos-tributarios/'.rawurlencode((string) $catalog).'/situacoes', $filters));
    }

    public function taxClassificationsV2(string|int $situation, array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/situacoes-tributarias/'.rawurlencode((string) $situation).'/classificacoes', $filters));
    }

    public function taxConsequenceTemplateV2(string|int $situation, array $payload = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/situacoes-tributarias/'.rawurlencode((string) $situation).'/modelo-consequencia', $payload));
    }

    public function unifiedDocumentsV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/consulta-notas', $filters));
    }

    public function lookupUnifiedDocumentV2(array $payload): array
    {
        return $this->request('POST', '/consulta-notas/consultar', ['json' => $payload]);
    }

    public function downloadUnifiedDocumentXmlV2(string $source, string|int $documentId): array
    {
        return $this->download('/consulta-notas/'.rawurlencode($source).'/'.rawurlencode((string) $documentId).'/xml');
    }

    public function downloadUnifiedDocumentPdfV2(string $source, string|int $documentId): array
    {
        return $this->download('/consulta-notas/'.rawurlencode($source).'/'.rawurlencode((string) $documentId).'/pdf');
    }

    public function syncInboundNfeV2(array $payload = []): array
    {
        return $this->request('POST', '/nfe/entrada/sincronizar', ['json' => $payload], unwrapData: false);
    }

    public function inboundNfeV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/nfe/entrada', $filters), unwrapData: false);
    }

    public function manifestInboundNfeV2(string|int $documentId, array $payload): array
    {
        return $this->request('POST', '/nfe/entrada/'.rawurlencode((string) $documentId).'/manifestar', ['json' => $payload], unwrapData: false);
    }

    public function downloadInboundNfeXmlV2(string|int $documentId): array
    {
        return $this->request('POST', '/nfe/entrada/'.rawurlencode((string) $documentId).'/baixar-xml', unwrapData: false);
    }

    public function updateInboundNfeEntryBookkeepingV2(string|int $documentId, array $payload): array
    {
        return $this->request('POST', '/nfe/entrada/'.rawurlencode((string) $documentId).'/escrituracao', ['json' => $payload], unwrapData: false);
    }

    public function confirmInboundNfeEntryBookkeepingV2(string|int $documentId): array
    {
        return $this->request('POST', '/nfe/entrada/'.rawurlencode((string) $documentId).'/escrituracao/confirmar', unwrapData: false);
    }

    public function productsV2(): array
    {
        return $this->request('GET', '/produtos');
    }

    public function productV2(string|int $productId): array
    {
        return $this->request('GET', '/produtos/'.rawurlencode((string) $productId));
    }

    public function createProductV2(array $payload): array
    {
        return $this->request('POST', '/produtos', ['json' => $payload]);
    }

    public function updateProductV2(string|int $productId, array $payload): array
    {
        return $this->request('PUT', '/produtos/'.rawurlencode((string) $productId), ['json' => $payload]);
    }

    public function deleteProductV2(string|int $productId): array
    {
        return $this->request('DELETE', '/produtos/'.rawurlencode((string) $productId));
    }

    public function takersV2(): array
    {
        return $this->request('GET', '/tomadores');
    }

    public function takerV2(string|int $takerId): array
    {
        return $this->request('GET', '/tomadores/'.rawurlencode((string) $takerId));
    }

    public function createTakerV2(array $payload): array
    {
        return $this->request('POST', '/tomadores', ['json' => $payload]);
    }

    public function updateTakerV2(string|int $takerId, array $payload): array
    {
        return $this->request('PUT', '/tomadores/'.rawurlencode((string) $takerId), ['json' => $payload]);
    }

    public function deleteTakerV2(string|int $takerId): array
    {
        return $this->request('DELETE', '/tomadores/'.rawurlencode((string) $takerId));
    }

    public function operationProfilesV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/perfis-operacao', $filters));
    }

    public function createOperationProfileV2(array $payload): array
    {
        return $this->request('POST', '/fiscal/perfis-operacao', ['json' => $payload]);
    }

    public function updateOperationProfileV2(string|int $profileId, array $payload): array
    {
        return $this->request('PUT', '/fiscal/perfis-operacao/'.rawurlencode((string) $profileId), ['json' => $payload]);
    }

    public function deleteOperationProfileV2(string|int $profileId): array
    {
        return $this->request('DELETE', '/fiscal/perfis-operacao/'.rawurlencode((string) $profileId));
    }

    public function rateReferencesV2(array $filters = []): array
    {
        return $this->request('GET', $this->withQuery('/fiscal/referencias-aliquotas', $filters));
    }

    public function createRateReferenceV2(array $payload): array
    {
        return $this->request('POST', '/fiscal/referencias-aliquotas', ['json' => $payload]);
    }

    public function updateRateReferenceV2(string|int $rateReferenceId, array $payload): array
    {
        return $this->request('PUT', '/fiscal/referencias-aliquotas/'.rawurlencode((string) $rateReferenceId), ['json' => $payload]);
    }

    public function deleteRateReferenceV2(string|int $rateReferenceId): array
    {
        return $this->request('DELETE', '/fiscal/referencias-aliquotas/'.rawurlencode((string) $rateReferenceId));
    }

    public function taxRuleSetsV2(): array
    {
        return $this->request('GET', '/fiscal/conjuntos-regras-tributarias');
    }

    public function createTaxRuleSetV2(array $payload): array
    {
        return $this->request('POST', '/fiscal/conjuntos-regras-tributarias', ['json' => $payload]);
    }

    public function updateTaxRuleSetV2(string|int $taxRuleSetId, array $payload): array
    {
        return $this->request('PUT', '/fiscal/conjuntos-regras-tributarias/'.rawurlencode((string) $taxRuleSetId), ['json' => $payload]);
    }

    public function deleteTaxRuleSetV2(string|int $taxRuleSetId): array
    {
        return $this->request('DELETE', '/fiscal/conjuntos-regras-tributarias/'.rawurlencode((string) $taxRuleSetId));
    }

    public function schedulesV2(): array
    {
        return $this->request('GET', '/agendamentos');
    }

    public function createScheduleV2(array $payload): array
    {
        return $this->request('POST', '/agendamentos', ['json' => $payload]);
    }

    public function updateScheduleV2(string|int $scheduleId, array $payload): array
    {
        return $this->request('PUT', '/agendamentos/'.rawurlencode((string) $scheduleId), ['json' => $payload]);
    }

    public function deleteScheduleV2(string|int $scheduleId): array
    {
        return $this->request('DELETE', '/agendamentos/'.rawurlencode((string) $scheduleId));
    }

    public function webhooksV2(): array
    {
        return $this->request('GET', '/notificacoes-web');
    }

    public function createWebhookV2(array $payload): array
    {
        return $this->request('POST', '/notificacoes-web', ['json' => $payload]);
    }

    public function updateWebhookV2(string|int $webhookId, array $payload): array
    {
        return $this->request('PUT', '/notificacoes-web/'.rawurlencode((string) $webhookId), ['json' => $payload]);
    }

    public function deleteWebhookV2(string|int $webhookId): array
    {
        return $this->request('DELETE', '/notificacoes-web/'.rawurlencode((string) $webhookId));
    }

    public function rotateWebhookSecretV2(string|int $webhookId): array
    {
        return $this->request('POST', '/notificacoes-web/'.rawurlencode((string) $webhookId).'/rotacionar-segredo');
    }

    public function testWebhookV2(string|int $webhookId): array
    {
        return $this->request('POST', '/notificacoes-web/'.rawurlencode((string) $webhookId).'/testar');
    }

    public function webhookDeliveriesV2(string|int $webhookId): array
    {
        return $this->request('GET', '/notificacoes-web/'.rawurlencode((string) $webhookId).'/entregas');
    }

    public function metricsV2(): array
    {
        return $this->request('GET', '/metricas');
    }

    public function billingV2(): array
    {
        return $this->request('GET', '/cobranca');
    }

    public static function webhookSignature(string $secret, string $deliveryId, string $timestamp, string $body): string
    {
        return hash_hmac('sha256', "{$deliveryId}.{$timestamp}.{$body}", $secret);
    }

    public static function normalizeDocumentResponse(array $document): array
    {
        if (isset($document['dados']) && is_array($document['dados'])) {
            $document = $document['dados'];
        }
        if (isset($document['data']) && is_array($document['data'])) {
            $document = $document['data'];
        }
        if (isset($document['document']) && is_array($document['document'])) {
            $document = array_merge(
                $document['document'],
                isset($document['fiscal']) && is_array($document['fiscal']) ? [
                    'fiscal_status' => $document['fiscal']['status'] ?? null,
                    'access_key' => $document['fiscal']['access_key'] ?? null,
                    'document_key' => $document['fiscal']['document_key'] ?? null,
                    'protocol' => $document['fiscal']['protocol'] ?? null,
                    'authorized_at' => $document['fiscal']['authorized_at'] ?? null,
                ] : [],
                isset($document['operational']) && is_array($document['operational']) ? [
                    'operational_status' => $document['operational']['status'] ?? null,
                ] : [],
                isset($document['artifacts']) && is_array($document['artifacts']) ? [
                    'artifacts' => $document['artifacts'],
                ] : [],
            );
        }

        $legacy = isset($document['legacy_aliases']) && is_array($document['legacy_aliases'])
            ? $document['legacy_aliases']
            : [];

        $document['document_type'] = $document['document_type'] ?? ($document['tipo_documento'] ?? ($legacy['type'] ?? null));
        $document['series'] = $document['series'] ?? ($document['serie'] ?? ($legacy['serie'] ?? null));
        $document['number'] = $document['number'] ?? ($document['numero'] ?? ($legacy['numero'] ?? null));
        $document['access_key'] = $document['access_key'] ?? ($document['chave_documento'] ?? ($legacy['chave_acesso'] ?? ($document['document_key'] ?? null)));
        $document['protocol'] = $document['protocol'] ?? ($document['protocolo'] ?? ($legacy['protocolo'] ?? null));
        $document['authorized_at'] = $document['authorized_at'] ?? ($document['autorizado_em'] ?? ($legacy['autorizado_em'] ?? null));
        $document['operational_status'] = $document['operational_status'] ?? ($document['status_operacional'] ?? ($legacy['status_operacional'] ?? null));
        $document['fiscal_status'] = $document['fiscal_status'] ?? ($document['status_fiscal'] ?? ($legacy['status_fiscal'] ?? ($document['status'] ?? null)));
        if (! isset($document['artifacts']) && isset($document['artefatos']) && is_array($document['artefatos'])) {
            $document['artifacts'] = [
                'xml_available' => $document['artefatos']['xml_disponivel'] ?? null,
                'pdf_available' => $document['artefatos']['pdf_disponivel'] ?? null,
                'processing' => $document['artefatos']['processando'] ?? null,
                'xml_status' => $document['artefatos']['status_xml'] ?? null,
                'pdf_status' => $document['artefatos']['status_pdf'] ?? null,
                'xml_url' => $document['artefatos']['url_xml'] ?? null,
                'pdf_url' => $document['artefatos']['url_pdf'] ?? null,
            ];
        }

        return $document;
    }

    private function publicDocsPath(): string
    {
        return $this->apiVersion === 'v2' ? '/public/docs?version=v2' : '/public/docs';
    }

    private function versionedPublicDocsUrl(array $docs, string $field): ?string
    {
        $version = $docs['versions'][$this->apiVersion] ?? null;

        return is_array($version) && isset($version[$field]) && is_string($version[$field])
            ? $version[$field]
            : null;
    }

    private function publicDocsUrl(array $docs, string $field): mixed
    {
        $url = $this->versionedPublicDocsUrl($docs, $field) ?? ($docs[$field] ?? null);

        if ($this->apiVersion === 'v2' && is_string($url)) {
            return str_replace('/v1/integrations', '/v2/integrations', $url);
        }

        return $url;
    }

    private function normalizeApiVersion(string $apiVersion): string
    {
        return str_contains(strtolower(trim($apiVersion)), '2') ? 'v2' : 'v1';
    }

    private function inferApiVersion(string $baseUrl): string
    {
        return preg_match('#/v2/integrations$#', $baseUrl) === 1 ? 'v2' : 'v1';
    }

    private function companyPath(string $path, string|int $companyId): string
    {
        return "/company/{$companyId}{$path}";
    }

    private function platformBaseUrl(): string
    {
        return preg_replace('#/v[12]/integrations$#', '', $this->baseUrl) ?: $this->baseUrl;
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

    private function request(string $method, string $path, array $options = [], bool $unwrapData = true, ?string $baseUrl = null): array
    {
        $options['headers'] = array_merge([
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $this->token,
        ], $options['headers'] ?? []);

        try {
            $response = $this->http->request($method, ($baseUrl ?? $this->baseUrl) . $path, $options);
        } catch (RequestException $exception) {
            $response = $exception->getResponse();
            $payload = $response ? $this->decode((string) $response->getBody()) : ['message' => $exception->getMessage()];
            throw $this->apiException($response?->getStatusCode() ?? 0, $payload);
        }

        $payload = $this->decode((string) $response->getBody());

        if ($response->getStatusCode() >= 400) {
            throw $this->apiException($response->getStatusCode(), $payload);
        }

        if ($unwrapData && is_array($payload)) {
            if (array_key_exists('data', $payload)) {
                return (array) $payload['data'];
            }
            if (array_key_exists('dados', $payload)) {
                return (array) $payload['dados'];
            }
        }

        return (array) $payload;
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
        $errors = is_array($payload) ? ($payload['errors'] ?? ($payload['erros'] ?? null)) : null;
        $rejectionReason = is_array($payload) && isset($payload['rejection_reason'])
            ? (string) $payload['rejection_reason']
            : (is_array($payload) && isset($payload['motivo_rejeicao']) ? (string) $payload['motivo_rejeicao'] : null);

        return new NotaAgilApiException($statusCode, $payload, $errors, $rejectionReason);
    }
}
