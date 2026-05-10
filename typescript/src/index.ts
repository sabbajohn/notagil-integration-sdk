export type DocumentType = 'nfe' | 'nfce' | 'nfse';
export type ResolutionStatus = 'resolved' | 'review' | 'blocked';

export interface FiscalPayload {
  type: DocumentType;
  fiscal_environment?: 'homologacao' | 'producao';
  operation_profile_id: string | number;
  taker_profile_id?: string | number | null;
  tomador_id?: string | number | null;
  consumer_final_pf?: boolean;
  counterparty?: Record<string, unknown>;
  document_data?: Record<string, unknown>;
  items: Array<Record<string, unknown> & {
    product_id?: string | number | null;
    product_profile_id?: string | number | null;
    cfop_id?: string | number | null;
    sku?: string;
    description?: string;
    quantity: number;
    unit_price: number;
    gross_amount?: number;
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
  fiscal_environment?: 'homologacao' | 'producao';
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DirectXmlSubmitRequest {
  external_id: string;
  document_type: 'nfe' | 'nfce';
  municipio?: string | null;
  fiscal_environment?: 'homologacao' | 'producao';
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
  draft_suggestions?: Array<Record<string, unknown>>;
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

  getDocument(externalId: string): Promise<DocumentStatus> {
    return this.request<DocumentStatus>(`/documents/${encodeURIComponent(externalId)}`, {
      method: 'GET',
    });
  }

  listDocuments(filters: DocumentListFilters = {}): Promise<PaginatedDocumentList> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null || value === '') {
        continue;
      }
      query.set(key, String(value));
    }

    const path = query.size > 0 ? `/documents?${query.toString()}` : '/documents';

    return this.request<PaginatedDocumentList>(path, {
      method: 'GET',
      unwrapData: false,
    });
  }

  getCompanyConfiguration(): Promise<CompanyConfigurationPayload> {
    return this.request<CompanyConfigurationPayload>('/configuration/company', {
      method: 'GET',
    });
  }

  updateCompanyConfiguration(payload: CompanyConfigurationPayload): Promise<CompanyConfigurationPayload> {
    return this.request<CompanyConfigurationPayload>('/configuration/company', {
      method: 'PUT',
      body: payload,
    });
  }

  cancelDocument(externalId: string, reason: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/documents/${encodeURIComponent(externalId)}/cancel`, {
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

  private async request<T>(path: string, options: {
    method: 'GET' | 'POST' | 'PUT';
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
