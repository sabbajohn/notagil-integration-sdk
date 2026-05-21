export type DocumentType = 'nfe' | 'nfce' | 'nfse';
export type ResolutionStatus = 'resolved' | 'review' | 'blocked';
export type FiscalEnvironment = 'homologacao' | 'producao';
export type NfsePolicyField =
  | 'service.municipal_code'
  | 'service.national_tax_code'
  | 'service.nbs'
  | 'service.cnae_code'
  | 'service.activity_code'
  | 'prestador.op_simp_nac';

export interface NfseFieldSchema {
  label?: string;
  control?: string;
  payload_paths?: string[];
  options?: Array<{ value: string; label: string }>;
  [key: string]: unknown;
}

export interface NfseFormPolicy {
  provider_key: string | null;
  layout_family: string | null;
  municipio_ibge: string | null;
  municipio_nome: string | null;
  policy_source: string;
  required_fields: NfsePolicyField[];
  visible_fields: NfsePolicyField[];
  default_values?: Partial<Record<NfsePolicyField, string>>;
  field_schema?: Partial<Record<NfsePolicyField, NfseFieldSchema>>;
  labels: Partial<Record<NfsePolicyField, string>>;
  hints: Partial<Record<NfsePolicyField, string>>;
}

export interface NfseProviderInfo {
  provider_key: string | null;
  municipio: string | null;
  resolution_source: string | null;
  provider_metadata: Record<string, unknown>;
  form_policy: NfseFormPolicy;
  warnings?: string[];
}

export interface OperationDocumentSnapshotItem extends Record<string, unknown> {
  product_id?: string | number | null;
  cfop_id?: string | number | null;
  sku?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  gross_amount?: number;
  codigo_servico_municipal?: string;
  codigo_cnae?: string;
  codigoCnae?: string;
  codigo_atividade?: string;
  manual_overrides?: {
    codigo_tributacao_nacional?: string;
    codigo_tributacao_municipal?: string;
    codigo_nbs?: string;
    codigo_cnae?: string;
    codigo_atividade?: string;
    [key: string]: unknown;
  };
}

export interface OperationDocumentSnapshot {
  document_direction?: string;
  direction?: string;
  fiscal_environment?: FiscalEnvironment;
  reference_date?: string;
  document_data?: Record<string, unknown>;
  counterparty?: Record<string, unknown>;
  document_references?: Array<Record<string, unknown>>;
  items: OperationDocumentSnapshotItem[];
  [key: string]: unknown;
}

export interface OperationDocumentPreviewRequest {
  external_id?: string;
  document_type: DocumentType;
  municipio?: string | null;
  snapshot: OperationDocumentSnapshot;
  metadata?: Record<string, unknown>;
}

export interface OperationDocumentSubmitRequest extends OperationDocumentPreviewRequest {
  external_id: string;
}

export interface DirectDocumentSubmitRequest {
  external_id: string;
  document_type: DocumentType;
  municipio?: string | null;
  fiscal_environment?: FiscalEnvironment;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DirectXmlSubmitRequest {
  external_id: string;
  document_type: 'nfe' | 'nfce';
  municipio?: string | null;
  fiscal_environment?: FiscalEnvironment;
  xml?: string;
  xml_base64?: string;
  already_signed?: boolean;
  id_lote?: string;
  ind_sinc?: 0 | 1;
  metadata?: Record<string, unknown>;
}

export interface PreviewResult {
  resolution_status: ResolutionStatus | string | null;
  emission_allowed: boolean | null;
  payload?: Record<string, unknown>;
  resolved_profiles?: Record<string, unknown>;
  snapshot_preview?: Record<string, unknown>;
  tax_resolution?: Record<string, unknown>;
  blocking_issues?: Array<Record<string, unknown> | string>;
  warnings?: Array<Record<string, unknown> | string>;
}

export interface DocumentAccepted {
  id: string | number;
  external_id?: string | null;
  operational_status?: string | null;
  fiscal_status?: string | null;
  fiscal_snapshot_id?: string | number | null;
  resolution_status?: ResolutionStatus | string | null;
  idempotent_replay: boolean;
  direct_transmission?: boolean;
  direct_transmission_mode?: string | null;
}

export interface DocumentStatus {
  id: string | number;
  external_id: string | null;
  type?: DocumentType | string | null;
  document_type?: DocumentType | string | null;
  operational_status: string | null;
  fiscal_status: string | null;
  document_key?: string | null;
  protocol?: string | null;
  last_error?: string | null;
  snapshot?: Record<string, unknown> | null;
  applied_rates?: Array<Record<string, unknown>>;
  events?: Array<Record<string, unknown>>;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: unknown;
}

export interface DocumentListFilters {
  external_id?: string;
  document_type?: DocumentType;
  operational_status?: string;
  fiscal_status?: string;
  created_from?: string;
  created_to?: string;
  per_page?: number;
}

export interface PaginatedDocumentList {
  data: DocumentStatus[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DocumentSnapshotResult {
  external_id?: string | null;
  document_id: string | number;
  snapshot?: Record<string, unknown> | null;
}

export interface DocumentQueryResult {
  document: Record<string, unknown>;
  remote?: Record<string, unknown> | null;
}

export interface CompanyConfigurationPayload {
  [key: string]: unknown;
}

export interface IntegrationCompany {
  id: string | number;
  [key: string]: unknown;
}

export interface ProductPayload {
  [key: string]: unknown;
}

export interface TakerPayload {
  [key: string]: unknown;
}

export interface WebhookPayload {
  [key: string]: unknown;
}

export interface FiscalOperationProfilePayload {
  id?: string | number;
  [key: string]: unknown;
}

export interface FiscalEmitterProfilePayload {
  id?: string | number;
  [key: string]: unknown;
}

export interface FiscalProfileAssignmentPayload {
  id?: string | number;
  [key: string]: unknown;
}

export interface FiscalRateReferenceFilters {
  tax_type?: string;
  tax_situation_code?: string;
  tax_classification_code?: string;
  municipality_ibge?: string;
  uf?: string;
  [key: string]: string | number | boolean | null | undefined;
}

export interface FiscalRateReferencePayload {
  id?: string | number;
  [key: string]: unknown;
}

export interface TaxRuleSetPayload {
  id?: string | number;
  [key: string]: unknown;
}

export interface DeleteResult {
  deleted: boolean;
}

export interface DownloadResult {
  content: ArrayBuffer;
  contentType: string | null;
  filename: string | null;
}

export interface WaitDocumentOptions {
  companyId: string | number;
  intervalMs?: number;
  timeoutMs?: number;
  terminalFiscalStatuses?: string[];
  terminalOperationalStatuses?: string[];
}

export interface NotagilClientOptions {
  baseUrl: string;
  token: string;
  fetch?: typeof fetch;
}

export class NotagilApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body !== null && 'message' in body ? String((body as { message?: unknown }).message) : `NotaAgil API error ${status}`);
    this.name = 'NotagilApiError';
    this.status = status;
    this.body = body;
  }
}

export class NotagilIntegrationClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly fetcher: typeof fetch;

  constructor(options: NotagilClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.token = options.token;
    this.fetcher = options.fetch ?? fetch;
  }

  listCompanies(): Promise<IntegrationCompany[]> {
    return this.request<IntegrationCompany[]>('/companies', {
      method: 'GET',
    });
  }

  getCompany(companyId: string | number): Promise<IntegrationCompany> {
    return this.request<IntegrationCompany>(`/companies/${encodeURIComponent(String(companyId))}`, {
      method: 'GET',
    });
  }

  previewCompanyDocumentByOperation(
    companyId: string | number,
    operationCode: string,
    payload: OperationDocumentPreviewRequest,
  ): Promise<PreviewResult> {
    return this.request<PreviewResult>(
      `/companies/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(operationCode)}/preview`,
      {
        method: 'POST',
        body: payload,
      },
    );
  }

  createCompanyDocumentByOperation(
    companyId: string | number,
    operationCode: string,
    payload: OperationDocumentSubmitRequest,
    idempotencyKey: string,
  ): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>(
      `/companies/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(operationCode)}`,
      {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: payload,
      },
    );
  }

  createCompanyDirectDocument(companyId: string | number, payload: DirectDocumentSubmitRequest, idempotencyKey: string): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>(`/companies/${encodeURIComponent(String(companyId))}/direct/documents`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  transmitCompanyDirectXml(companyId: string | number, payload: DirectXmlSubmitRequest, idempotencyKey: string): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>(`/companies/${encodeURIComponent(String(companyId))}/direct/documents/xml`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  getCompanyDocument(companyId: string | number, externalId: string): Promise<DocumentStatus> {
    return this.request<DocumentStatus>(`/companies/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(externalId)}`, {
      method: 'GET',
    });
  }

  listCompanyDocuments(companyId: string | number, filters: DocumentListFilters = {}): Promise<PaginatedDocumentList> {
    return this.request<PaginatedDocumentList>(
      this.withQuery(`/companies/${encodeURIComponent(String(companyId))}/documents`, filters),
      {
        method: 'GET',
        unwrapData: false,
      },
    );
  }

  async waitDocument(externalId: string, options: WaitDocumentOptions): Promise<DocumentStatus> {
    const intervalMs = options.intervalMs ?? 2000;
    const timeoutMs = options.timeoutMs ?? 120000;
    const fiscalTerminals = new Set(options.terminalFiscalStatuses ?? ['authorized', 'rejected', 'cancelled', 'corrected']);
    const operationalTerminals = new Set(options.terminalOperationalStatuses ?? ['completed', 'failed']);
    const started = Date.now();

    while (true) {
      const document = await this.getCompanyDocument(options.companyId, externalId);

      if (fiscalTerminals.has(String(document.fiscal_status)) || operationalTerminals.has(String(document.operational_status))) {
        return document;
      }

      if (Date.now() - started >= timeoutMs) {
        return document;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  downloadDocumentXml(externalId: string, companyId: string | number): Promise<DownloadResult> {
    return this.download(this.documentArtifactPath(externalId, 'xml', companyId));
  }

  downloadDocumentPdf(externalId: string, companyId: string | number): Promise<DownloadResult> {
    return this.download(this.documentArtifactPath(externalId, 'pdf', companyId));
  }

  getDocumentSnapshot(externalId: string, companyId: string | number): Promise<DocumentSnapshotResult> {
    return this.request<DocumentSnapshotResult>(this.documentArtifactPath(externalId, 'snapshot', companyId), {
      method: 'GET',
    });
  }

  queryDocument(externalId: string, companyId: string | number, forceRemote = false): Promise<DocumentQueryResult> {
    return this.request<DocumentQueryResult>(this.withQuery(this.documentArtifactPath(externalId, 'query', companyId), { force_remote: forceRemote ? 1 : undefined }), {
      method: 'POST',
    });
  }

  getCompanyConfiguration(companyId: string | number): Promise<CompanyConfigurationPayload> {
    return this.request<CompanyConfigurationPayload>(`/companies/${encodeURIComponent(String(companyId))}/configuration`, {
      method: 'GET',
    });
  }

  updateCompanyConfiguration(companyId: string | number, payload: CompanyConfigurationPayload): Promise<CompanyConfigurationPayload> {
    return this.request<CompanyConfigurationPayload>(`/companies/${encodeURIComponent(String(companyId))}/configuration`, {
      method: 'PUT',
      body: payload,
    });
  }

  getCompanyNfseProviderInfo(
    companyId: string | number,
    params: { municipio?: string | null; fiscal_environment?: FiscalEnvironment } = {},
  ): Promise<NfseProviderInfo> {
    const query = new URLSearchParams();
    if (params.municipio) {
      query.set('municipio', params.municipio);
    }
    if (params.fiscal_environment) {
      query.set('fiscal_environment', params.fiscal_environment);
    }

    const suffix = query.size > 0 ? `?${query.toString()}` : '';

    return this.request<NfseProviderInfo>(`/companies/${encodeURIComponent(String(companyId))}/nfse/provider-info${suffix}`, {
      method: 'GET',
    });
  }

  cancelCompanyDocument(companyId: string | number, externalId: string, reason: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/companies/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(externalId)}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  }

  correctCompanyDocument(companyId: string | number, externalId: string, correcao: string, sequencia?: number): Promise<DocumentStatus> {
    return this.request<DocumentStatus>(`/companies/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(externalId)}/correct`, {
      method: 'POST',
      body: {
        correcao,
        ...(sequencia === undefined ? {} : { sequencia }),
      },
    });
  }

  listProducts(companyId: string | number): Promise<ProductPayload[]> {
    return this.request<ProductPayload[]>(`/companies/${encodeURIComponent(String(companyId))}/products`, {
      method: 'GET',
    });
  }

  getProduct(companyId: string | number, productId: string | number): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/companies/${encodeURIComponent(String(companyId))}/products/${encodeURIComponent(String(productId))}`, {
      method: 'GET',
    });
  }

  createProduct(companyId: string | number, payload: ProductPayload): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/companies/${encodeURIComponent(String(companyId))}/products`, {
      method: 'POST',
      body: payload,
    });
  }

  updateProduct(companyId: string | number, productId: string | number, payload: ProductPayload): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/companies/${encodeURIComponent(String(companyId))}/products/${encodeURIComponent(String(productId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteProduct(companyId: string | number, productId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/companies/${encodeURIComponent(String(companyId))}/products/${encodeURIComponent(String(productId))}`, {
      method: 'DELETE',
    });
  }

  listTakers(companyId: string | number): Promise<TakerPayload[]> {
    return this.request<TakerPayload[]>(`/companies/${encodeURIComponent(String(companyId))}/takers`, {
      method: 'GET',
    });
  }

  getTaker(companyId: string | number, takerId: string | number): Promise<TakerPayload> {
    return this.request<TakerPayload>(`/companies/${encodeURIComponent(String(companyId))}/takers/${encodeURIComponent(String(takerId))}`, {
      method: 'GET',
    });
  }

  createTaker(companyId: string | number, payload: TakerPayload): Promise<TakerPayload> {
    return this.request<TakerPayload>(`/companies/${encodeURIComponent(String(companyId))}/takers`, {
      method: 'POST',
      body: payload,
    });
  }

  updateTaker(companyId: string | number, takerId: string | number, payload: TakerPayload): Promise<TakerPayload> {
    return this.request<TakerPayload>(`/companies/${encodeURIComponent(String(companyId))}/takers/${encodeURIComponent(String(takerId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteTaker(companyId: string | number, takerId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/companies/${encodeURIComponent(String(companyId))}/takers/${encodeURIComponent(String(takerId))}`, {
      method: 'DELETE',
    });
  }

  listWebhooks(): Promise<WebhookPayload[]> {
    return this.request<WebhookPayload[]>('/webhooks', {
      method: 'GET',
    });
  }

  createWebhook(payload: WebhookPayload): Promise<WebhookPayload> {
    return this.request<WebhookPayload>('/webhooks', {
      method: 'POST',
      body: payload,
    });
  }

  updateWebhook(webhookId: string | number, payload: WebhookPayload): Promise<WebhookPayload> {
    return this.request<WebhookPayload>(`/webhooks/${encodeURIComponent(String(webhookId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteWebhook(webhookId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/webhooks/${encodeURIComponent(String(webhookId))}`, {
      method: 'DELETE',
    });
  }

  rotateWebhookSecret(webhookId: string | number): Promise<WebhookPayload> {
    return this.request<WebhookPayload>(`/webhooks/${encodeURIComponent(String(webhookId))}/rotate-secret`, {
      method: 'POST',
    });
  }

  testWebhook(webhookId: string | number): Promise<WebhookPayload> {
    return this.request<WebhookPayload>(`/webhooks/${encodeURIComponent(String(webhookId))}/test`, {
      method: 'POST',
    });
  }

  listWebhookDeliveries(webhookId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/webhooks/${encodeURIComponent(String(webhookId))}/deliveries`, {
      method: 'GET',
      unwrapData: false,
    });
  }

  getMetrics(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/metrics', {
      method: 'GET',
    });
  }

  getBilling(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/billing', {
      method: 'GET',
    });
  }

  listCertificates(companyId: string | number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.companyPath('/certificates', companyId), { method: 'GET' });
  }

  createCertificate(payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/certificates', companyId), { method: 'POST', body: payload });
  }

  updateCertificate(certificateId: string | number, payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/certificates/${encodeURIComponent(String(certificateId))}`, companyId), { method: 'PATCH', body: payload });
  }

  validateCertificate(certificateId: string | number, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/certificates/${encodeURIComponent(String(certificateId))}/validate`, companyId), { method: 'POST' });
  }

  getReadiness(companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/readiness', companyId), { method: 'GET' });
  }

  listOnboardingImports(companyId: string | number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.companyPath('/onboarding/imports', companyId), { method: 'GET' });
  }

  createOnboardingImport(payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/onboarding/imports', companyId), { method: 'POST', body: payload });
  }

  getOnboardingImport(importId: string | number, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/onboarding/imports/${encodeURIComponent(String(importId))}`, companyId), { method: 'GET' });
  }

  reviewOnboardingImport(importId: string | number, payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/onboarding/imports/${encodeURIComponent(String(importId))}/review`, companyId), { method: 'POST', body: payload });
  }

  promoteOnboardingImport(companyId: string | number, importId: string | number, payload: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/onboarding/imports/${encodeURIComponent(String(importId))}/promote`, companyId), { method: 'POST', body: payload });
  }

  listFiscalOptions(companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/fiscal/options', companyId), { method: 'GET' });
  }

  listCfops(companyId: string | number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.companyPath('/fiscal/cfops', companyId), { method: 'GET' });
  }

  searchMunicipalities(companyId: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery(this.companyPath('/fiscal/utils/municipalities', companyId), params), { method: 'GET', unwrapData: false });
  }

  searchNcms(params: Record<string, string | number | boolean | null | undefined>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery(this.companyPath('/fiscal/utils/ncms', companyId), params), { method: 'GET', unwrapData: false });
  }

  listTaxCatalogs(companyId: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery(this.companyPath('/fiscal/tax-catalogs', companyId), params), { method: 'GET' });
  }

  listTaxSituations(companyId: string | number, catalog: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery(this.companyPath(`/fiscal/tax-catalogs/${encodeURIComponent(String(catalog))}/situations`, companyId), params), { method: 'GET' });
  }

  listTaxClassifications(companyId: string | number, situation: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery(this.companyPath(`/fiscal/tax-situations/${encodeURIComponent(String(situation))}/classifications`, companyId), params), { method: 'GET' });
  }

  getTaxConsequenceTemplate(situation: string | number, params: Record<string, string | number | boolean | null | undefined>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery(this.companyPath(`/fiscal/tax-situations/${encodeURIComponent(String(situation))}/consequence-template`, companyId), params), { method: 'GET' });
  }

  listEmitterProfiles(companyId: string | number): Promise<FiscalEmitterProfilePayload[]> {
    return this.request<FiscalEmitterProfilePayload[]>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles`, {
      method: 'GET',
    });
  }

  createEmitterProfile(companyId: string | number, payload: FiscalEmitterProfilePayload): Promise<FiscalEmitterProfilePayload> {
    return this.request<FiscalEmitterProfilePayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles`, {
      method: 'POST',
      body: payload,
    });
  }

  updateEmitterProfile(companyId: string | number, profileId: string | number, payload: FiscalEmitterProfilePayload): Promise<FiscalEmitterProfilePayload> {
    return this.request<FiscalEmitterProfilePayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteEmitterProfile(companyId: string | number, profileId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'DELETE',
    });
  }

  listOperationProfiles(companyId: string | number): Promise<FiscalOperationProfilePayload[]> {
    return this.request<FiscalOperationProfilePayload[]>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles`, {
      method: 'GET',
    });
  }

  createOperationProfile(companyId: string | number, payload: FiscalOperationProfilePayload): Promise<FiscalOperationProfilePayload> {
    return this.request<FiscalOperationProfilePayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles`, {
      method: 'POST',
      body: payload,
    });
  }

  updateOperationProfile(companyId: string | number, profileId: string | number, payload: FiscalOperationProfilePayload): Promise<FiscalOperationProfilePayload> {
    return this.request<FiscalOperationProfilePayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteOperationProfile(companyId: string | number, profileId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'DELETE',
    });
  }

  listProfileAssignments(companyId: string | number): Promise<FiscalProfileAssignmentPayload[]> {
    return this.request<FiscalProfileAssignmentPayload[]>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments`, {
      method: 'GET',
    });
  }

  createProfileAssignment(companyId: string | number, payload: FiscalProfileAssignmentPayload): Promise<FiscalProfileAssignmentPayload> {
    return this.request<FiscalProfileAssignmentPayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments`, {
      method: 'POST',
      body: payload,
    });
  }

  updateProfileAssignment(companyId: string | number, assignmentId: string | number, payload: FiscalProfileAssignmentPayload): Promise<FiscalProfileAssignmentPayload> {
    return this.request<FiscalProfileAssignmentPayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments/${encodeURIComponent(String(assignmentId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteProfileAssignment(companyId: string | number, assignmentId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments/${encodeURIComponent(String(assignmentId))}`, {
      method: 'DELETE',
    });
  }

  listRateReferences(companyId: string | number, filters: FiscalRateReferenceFilters = {}): Promise<FiscalRateReferencePayload[]> {
    return this.request<FiscalRateReferencePayload[]>(
      this.withQuery(`/companies/${encodeURIComponent(String(companyId))}/fiscal/rate-references`, filters),
      { method: 'GET' },
    );
  }

  createRateReference(companyId: string | number, payload: FiscalRateReferencePayload): Promise<FiscalRateReferencePayload> {
    return this.request<FiscalRateReferencePayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/rate-references`, {
      method: 'POST',
      body: payload,
    });
  }

  updateRateReference(companyId: string | number, rateReferenceId: string | number, payload: FiscalRateReferencePayload): Promise<FiscalRateReferencePayload> {
    return this.request<FiscalRateReferencePayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/rate-references/${encodeURIComponent(String(rateReferenceId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteRateReference(companyId: string | number, rateReferenceId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/rate-references/${encodeURIComponent(String(rateReferenceId))}`, {
      method: 'DELETE',
    });
  }

  listTaxRuleSets(companyId: string | number): Promise<TaxRuleSetPayload[]> {
    return this.request<TaxRuleSetPayload[]>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets`, {
      method: 'GET',
    });
  }

  createTaxRuleSet(companyId: string | number, payload: TaxRuleSetPayload): Promise<TaxRuleSetPayload> {
    return this.request<TaxRuleSetPayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets`, {
      method: 'POST',
      body: payload,
    });
  }

  updateTaxRuleSet(companyId: string | number, taxRuleSetId: string | number, payload: TaxRuleSetPayload): Promise<TaxRuleSetPayload> {
    return this.request<TaxRuleSetPayload>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets/${encodeURIComponent(String(taxRuleSetId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteTaxRuleSet(companyId: string | number, taxRuleSetId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/companies/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets/${encodeURIComponent(String(taxRuleSetId))}`, {
      method: 'DELETE',
    });
  }

  listUnifiedDocuments(companyId: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery(this.companyPath('/consulta-notas', companyId), params), { method: 'GET' });
  }

  lookupUnifiedDocument(payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/consulta-notas/lookup', companyId), { method: 'POST', body: payload });
  }

  downloadUnifiedDocumentXml(source: 'inbound' | 'outbound', documentId: string | number, companyId: string | number): Promise<DownloadResult> {
    return this.download(this.companyPath(`/consulta-notas/${source}/${encodeURIComponent(String(documentId))}/xml`, companyId));
  }

  downloadUnifiedDocumentPdf(source: 'inbound' | 'outbound', documentId: string | number, companyId: string | number): Promise<DownloadResult> {
    return this.download(this.companyPath(`/consulta-notas/${source}/${encodeURIComponent(String(documentId))}/pdf`, companyId));
  }

  syncInboundNfe(companyId: string | number, payload: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/inbound/nfe/sync', companyId), { method: 'POST', body: payload, unwrapData: false });
  }

  listInboundNfe(companyId: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery(this.companyPath('/inbound/nfe', companyId), params), { method: 'GET', unwrapData: false });
  }

  manifestInboundNfe(documentId: string | number, payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/inbound/nfe/${encodeURIComponent(String(documentId))}/manifest`, companyId), { method: 'POST', body: payload, unwrapData: false });
  }

  manifestCompanyInboundNfe(companyId: string | number, documentId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.manifestInboundNfe(documentId, payload, companyId);
  }

  downloadInboundNfeXml(documentId: string | number, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/inbound/nfe/${encodeURIComponent(String(documentId))}/download-xml`, companyId), { method: 'POST', unwrapData: false });
  }

  downloadCompanyInboundNfeXml(companyId: string | number, documentId: string | number): Promise<Record<string, unknown>> {
    return this.downloadInboundNfeXml(documentId, companyId);
  }

  updateInboundNfeEntryBookkeeping(documentId: string | number, payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/inbound/nfe/${encodeURIComponent(String(documentId))}/entry-bookkeeping`, companyId), { method: 'POST', body: payload, unwrapData: false });
  }

  updateCompanyInboundNfeEntryBookkeeping(companyId: string | number, documentId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.updateInboundNfeEntryBookkeeping(documentId, payload, companyId);
  }

  confirmInboundNfeEntryBookkeeping(documentId: string | number, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/inbound/nfe/${encodeURIComponent(String(documentId))}/entry-bookkeeping/confirm`, companyId), { method: 'POST', unwrapData: false });
  }

  confirmCompanyInboundNfeEntryBookkeeping(companyId: string | number, documentId: string | number): Promise<Record<string, unknown>> {
    return this.confirmInboundNfeEntryBookkeeping(documentId, companyId);
  }

  listStockMovements(companyId: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery(this.companyPath('/stock/movements', companyId), params), { method: 'GET' });
  }

  getStockBalance(companyId: string | number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.companyPath('/stock/balance', companyId), { method: 'GET' });
  }

  listSchedules(companyId: string | number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.companyPath('/schedules', companyId), { method: 'GET' });
  }

  createSchedule(payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/schedules', companyId), { method: 'POST', body: payload });
  }

  updateSchedule(scheduleId: string | number, payload: Record<string, unknown>, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath(`/schedules/${encodeURIComponent(String(scheduleId))}`, companyId), { method: 'PUT', body: payload });
  }

  deleteSchedule(scheduleId: string | number, companyId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(this.companyPath(`/schedules/${encodeURIComponent(String(scheduleId))}`, companyId), { method: 'DELETE' });
  }

  static async webhookSignature(secret: string, deliveryId: string, timestamp: string, body: string): Promise<string> {
    const payload = `${deliveryId}.${timestamp}.${body}`;
    const cryptoApi = await this.cryptoApi();
    const key = await cryptoApi.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const signature = await cryptoApi.subtle.sign('HMAC', key, new TextEncoder().encode(payload));

    return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  private withQuery(path: string, params: object): string {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      query.set(key, String(value));
    }

    return query.size > 0 ? `${path}?${query.toString()}` : path;
  }

  private companyPath(path: string, companyId: string | number): string {
    return `/companies/${encodeURIComponent(String(companyId))}${path}`;
  }

  private documentArtifactPath(externalId: string, artifact: 'xml' | 'pdf' | 'snapshot' | 'query', companyId: string | number): string {
    return this.companyPath(`/documents/${encodeURIComponent(externalId)}/${artifact}`, companyId);
  }

  private async download(path: string): Promise<DownloadResult> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: {
        Accept: '*/*',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      const parsed = this.parseResponseBody(text);
      throw new NotagilApiError(response.status, parsed);
    }

    return {
      content: await response.arrayBuffer(),
      contentType: response.headers.get('content-type'),
      filename: this.filenameFromDisposition(response.headers.get('content-disposition')),
    };
  }

  private filenameFromDisposition(disposition: string | null): string | null {
    if (!disposition) {
      return null;
    }
    const match = /filename="?([^";]+)"?/i.exec(disposition);

    return match?.[1] ?? null;
  }

  private async request<T>(path: string, options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    unwrapData?: boolean;
  }): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, {
      method: options.method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    const text = await response.text();
    const parsed = this.parseResponseBody(text);

    if (!response.ok) {
      throw new NotagilApiError(response.status, parsed);
    }

    if (options.unwrapData === false) {
      return parsed as T;
    }

    return (parsed && typeof parsed === 'object' && 'data' in parsed ? (parsed as { data: T }).data : parsed) as T;
  }

  private parseResponseBody(text: string): unknown {
    if (text === '') {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  private static async cryptoApi(): Promise<Crypto> {
    if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.subtle !== 'undefined') {
      return globalThis.crypto;
    }

    throw new Error('Web Crypto API is unavailable in this runtime.');
  }
}
