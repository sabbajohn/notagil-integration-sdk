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

export interface FiscalPayload {
  type: DocumentType;
  fiscal_environment?: FiscalEnvironment;
  operation_profile_id: string | number;
  tomador_id?: string | number | null;
  consumer_final_pf?: boolean;
  counterparty?: Record<string, unknown>;
  document_data?: Record<string, unknown>;
  items: Array<Record<string, unknown> & {
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
  }>;
  [key: string]: unknown;
}

export interface DocumentPreviewRequest {
  external_id?: string;
  document_type: DocumentType;
  municipio?: string | null;
  payload: FiscalPayload;
  metadata?: Record<string, unknown>;
}

export interface DocumentSubmitRequest extends DocumentPreviewRequest {
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
  resolution_status: ResolutionStatus;
  emission_allowed: boolean;
  payload?: FiscalPayload;
  resolved_profiles?: Record<string, unknown>;
  snapshot_preview?: Record<string, unknown>;
  tax_resolution?: Record<string, unknown>;
  blocking_issues?: Array<Record<string, unknown>>;
  warnings?: string[];
}

export interface DocumentAccepted {
  id: string | number;
  external_id: string;
  operational_status: string;
  fiscal_status: string;
  fiscal_snapshot_id?: string | number | null;
  resolution_status?: ResolutionStatus | string | null;
  idempotent_replay: boolean;
}

export interface DocumentStatus {
  id: string | number;
  external_id: string;
  type: DocumentType;
  operational_status: string;
  fiscal_status: string;
  document_key?: string | null;
  protocol?: string | null;
  last_error?: string | null;
  snapshot?: Record<string, unknown>;
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

  previewDocument(payload: DocumentPreviewRequest): Promise<PreviewResult> {
    return this.request<PreviewResult>('/documents/preview', {
      method: 'POST',
      body: payload,
    });
  }

  createDocument(payload: DocumentSubmitRequest, idempotencyKey: string): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>('/documents', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  createDirectDocument(payload: DirectDocumentSubmitRequest, idempotencyKey: string): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>('/direct/documents', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  transmitDirectXml(payload: DirectXmlSubmitRequest, idempotencyKey: string): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>('/direct/documents/xml', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  previewCompanyDocument(companyId: string | number, payload: DocumentPreviewRequest): Promise<PreviewResult> {
    return this.request<PreviewResult>(`/companies/${encodeURIComponent(String(companyId))}/documents/preview`, {
      method: 'POST',
      body: payload,
    });
  }

  createCompanyDocument(companyId: string | number, payload: DocumentSubmitRequest, idempotencyKey: string): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>(`/companies/${encodeURIComponent(String(companyId))}/documents`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
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

  getDocument(externalId: string): Promise<DocumentStatus> {
    return this.request<DocumentStatus>(`/documents/${encodeURIComponent(externalId)}`, {
      method: 'GET',
    });
  }

  listDocuments(filters: DocumentListFilters = {}): Promise<PaginatedDocumentList> {
    return this.request<PaginatedDocumentList>(this.withQuery('/documents', filters), {
      method: 'GET',
      unwrapData: false,
    });
  }

  getCompanyConfiguration(companyId?: string | number): Promise<CompanyConfigurationPayload> {
    const path = companyId === undefined
      ? '/configuration/company'
      : `/companies/${encodeURIComponent(String(companyId))}/configuration`;

    return this.request<CompanyConfigurationPayload>(path, {
      method: 'GET',
    });
  }

  updateCompanyConfiguration(payload: CompanyConfigurationPayload, companyId?: string | number): Promise<CompanyConfigurationPayload> {
    const path = companyId === undefined
      ? '/configuration/company'
      : `/companies/${encodeURIComponent(String(companyId))}/configuration`;

    return this.request<CompanyConfigurationPayload>(path, {
      method: 'PUT',
      body: payload,
    });
  }

  getNfseProviderInfo(params: { municipio?: string | null; fiscal_environment?: FiscalEnvironment } = {}): Promise<NfseProviderInfo> {
    const query = new URLSearchParams();
    if (params.municipio) {
      query.set('municipio', params.municipio);
    }
    if (params.fiscal_environment) {
      query.set('fiscal_environment', params.fiscal_environment);
    }

    const path = query.size > 0 ? `/nfse/provider-info?${query.toString()}` : '/nfse/provider-info';

    return this.request<NfseProviderInfo>(path, {
      method: 'GET',
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

  cancelDocument(externalId: string, reason: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/documents/${encodeURIComponent(externalId)}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  }

  cancelCompanyDocument(companyId: string | number, externalId: string, reason: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/companies/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(externalId)}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  }

  correctDocument(externalId: string, correcao: string, sequencia?: number): Promise<DocumentStatus> {
    return this.request<DocumentStatus>(`/documents/${encodeURIComponent(externalId)}/correct`, {
      method: 'POST',
      body: {
        correcao,
        ...(sequencia === undefined ? {} : { sequencia }),
      },
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

  private async request<T>(path: string, options: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
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
    const parsed = text === '' ? null : JSON.parse(text);

    if (!response.ok) {
      throw new NotagilApiError(response.status, parsed);
    }

    if (options.unwrapData === false) {
      return parsed as T;
    }

    return (parsed && typeof parsed === 'object' && 'data' in parsed ? (parsed as { data: T }).data : parsed) as T;
  }
}
