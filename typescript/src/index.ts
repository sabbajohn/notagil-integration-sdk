export type DocumentType = 'nfe' | 'nfce' | 'nfse';
export type ResolutionStatus = 'resolved' | 'review' | 'blocked';
export type FiscalEnvironment = 'homologacao' | 'producao';
export const NFSE_CANONICAL_POLICY_FIELDS = [
  'servico.cTribMun',
  'servico.cTribNac',
  'servico.cNBS',
  'servico.codigoCnae',
  'servico.codigo_atividade',
  'servico.benefit_code',
  'prestador.opSimpNac',
  'prestador.mei',
] as const;
export const NFSE_NACIONAL_POLICY_FIELDS = NFSE_CANONICAL_POLICY_FIELDS;
export type NfsePolicyField = (typeof NFSE_CANONICAL_POLICY_FIELDS)[number];

const NFSE_POLICY_FIELD_ALIASES: Record<string, NfsePolicyField> = {
  'service.municipal_code': 'servico.cTribMun',
  'service.national_tax_code': 'servico.cTribNac',
  'service.nbs': 'servico.cNBS',
  'service.cnae_code': 'servico.codigoCnae',
  'service.activity_code': 'servico.codigo_atividade',
  'service.benefit_code': 'servico.benefit_code',
  'prestador.op_simp_nac': 'prestador.opSimpNac',
  'servico.cTribMun': 'servico.cTribMun',
  'servico.cTribNac': 'servico.cTribNac',
  'servico.cNBS': 'servico.cNBS',
  'servico.codigoCnae': 'servico.codigoCnae',
  'servico.codigo_atividade': 'servico.codigo_atividade',
  'servico.benefit_code': 'servico.benefit_code',
  'prestador.opSimpNac': 'prestador.opSimpNac',
  'prestador.mei': 'prestador.mei',
};

export const NFSE_NACIONAL_EXPECTED_FIELDS = [
  'id',
  'tpAmb',
  'dhEmi',
  'verAplic',
  'serie',
  'nDPS',
  'dCompet',
  'tpEmit',
  'cLocEmi',
  'prestador.cnpj',
  'prestador.inscricaoMunicipal',
  'prestador.razaoSocial',
  'prestador.opSimpNac',
  'prestador.regEspTrib',
  'prestador.codigoMunicipio',
  'tomador.documento',
  'tomador.razaoSocial',
  'tomador.email',
  'tomador.telefone',
  'tomador.endereco.logradouro',
  'tomador.endereco.numero',
  'tomador.endereco.complemento',
  'tomador.endereco.bairro',
  'tomador.endereco.cep',
  'tomador.endereco.codigoMunicipio',
  'tomador.endereco.uf',
  'tomador.endereco.municipio',
  'servico.cLocPrestacao',
  'servico.cTribNac',
  'servico.cTribMun',
  'servico.cNBS',
  'servico.descricao',
  'servico.tribISSQN',
  'servico.tpRetISSQN',
  'servico.aliquota',
  'servico.enviarPAliq',
  'servico.valor_irrf',
  'servico.valor_ir',
  'servico.iss_retido',
  'valor_servicos',
] as const;

type NfseCanonicalScalar = string | number | boolean | null;
interface CanonicalSchema {
  [key: string]: true | CanonicalSchema;
}

export interface NfsePrestador extends Record<string, unknown> {
  cnpj?: string;
  inscricaoMunicipal?: string;
  razaoSocial?: string;
  opSimpNac?: NfseCanonicalScalar;
  regEspTrib?: NfseCanonicalScalar;
  codigoMunicipio?: string;
  mei?: NfseCanonicalScalar;
}

export interface NfseEndereco extends Record<string, unknown> {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  codigoMunicipio?: string;
  uf?: string;
  municipio?: string;
}

export interface NfseTomador extends Record<string, unknown> {
  documento?: string;
  razaoSocial?: string;
  email?: string;
  telefone?: string;
  endereco?: NfseEndereco;
}

export interface NfseServico extends Record<string, unknown> {
  cLocPrestacao?: string;
  cTribNac?: string;
  cTribMun?: string;
  cNBS?: string;
  descricao?: string;
  tribISSQN?: NfseCanonicalScalar;
  tpRetISSQN?: NfseCanonicalScalar;
  aliquota?: NfseCanonicalScalar;
  enviarPAliq?: NfseCanonicalScalar;
  valor_irrf?: NfseCanonicalScalar;
  valor_ir?: NfseCanonicalScalar;
  iss_retido?: NfseCanonicalScalar;
  codigoCnae?: string;
  codigo_atividade?: string;
  benefit_code?: string;
}

export interface NfseCanonicalPayload extends Record<string, unknown> {
  id?: string;
  tpAmb?: NfseCanonicalScalar;
  dhEmi?: string;
  verAplic?: string;
  serie?: string;
  nDPS?: NfseCanonicalScalar;
  dCompet?: string;
  tpEmit?: NfseCanonicalScalar;
  cLocEmi?: string;
  prestador?: NfsePrestador;
  tomador?: NfseTomador;
  servico?: NfseServico;
  valor_servicos?: NfseCanonicalScalar;
}

export type NfseNacionalPrestador = NfsePrestador;
export type NfseNacionalEndereco = NfseEndereco;
export type NfseNacionalTomador = NfseTomador;
export type NfseNacionalServico = NfseServico;
export type NfseNacionalCanonicalPayload = NfseCanonicalPayload;

export class NfseNacionalContractError extends Error {
  readonly expectedFields: string[];
  readonly invalidFields: string[];

  constructor(expectedFields: readonly string[], invalidFields: string[]) {
    super('Payload invalido para NFSe Nacional. Use somente o contrato canonico PT-BR.');
    this.name = 'NfseNacionalContractError';
    this.expectedFields = [...expectedFields];
    this.invalidFields = invalidFields;
  }
}

const NFSE_NACIONAL_SCHEMA: CanonicalSchema = {
  id: true,
  tpAmb: true,
  dhEmi: true,
  verAplic: true,
  serie: true,
  nDPS: true,
  dCompet: true,
  tpEmit: true,
  cLocEmi: true,
  prestador: {
    cnpj: true,
    inscricaoMunicipal: true,
    razaoSocial: true,
    opSimpNac: true,
    regEspTrib: true,
    codigoMunicipio: true,
  },
  tomador: {
    documento: true,
    razaoSocial: true,
    email: true,
    telefone: true,
    endereco: {
      logradouro: true,
      numero: true,
      complemento: true,
      bairro: true,
      cep: true,
      codigoMunicipio: true,
      uf: true,
      municipio: true,
    },
  },
  servico: {
    cLocPrestacao: true,
    cTribNac: true,
    cTribMun: true,
    cNBS: true,
    descricao: true,
    tribISSQN: true,
    tpRetISSQN: true,
    aliquota: true,
    enviarPAliq: true,
    valor_irrf: true,
    valor_ir: true,
    iss_retido: true,
  },
  valor_servicos: true,
};

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
  enum_fields?: Partial<Record<NfsePolicyField, string[]>>;
  conditional_rules?: Array<Record<string, unknown>>;
  extensions_supported?: string[];
}

export function assertCanonicalNfseNacionalPayload(payload: Record<string, unknown>): asserts payload is NfseNacionalCanonicalPayload {
  const invalidFields = legacyNfseNacionalFields(payload);
  if (invalidFields.length === 0) {
    return;
  }

  throw new NfseNacionalContractError(NFSE_NACIONAL_EXPECTED_FIELDS, invalidFields);
}

export function canonicalizeNfseProviderPolicy<T extends Record<string, unknown>>(
  policy: T,
): T & Pick<NfseFormPolicy, 'required_fields' | 'visible_fields' | 'field_schema' | 'labels' | 'hints' | 'enum_fields' | 'conditional_rules' | 'extensions_supported'> {
  const schema = normalizePolicyFieldMap(policy.field_schema);
  const requiredFields = normalizePolicyFields(policy.required_fields);
  const visibleFields = normalizePolicyFields(policy.visible_fields);
  const activeFields = Array.from(new Set<NfsePolicyField>([
    ...requiredFields,
    ...visibleFields,
    ...Object.keys(schema).filter((field): field is NfsePolicyField => canonicalPolicyField(field) !== null),
  ]));
  const allFields = [...NFSE_CANONICAL_POLICY_FIELDS];
  const labels = normalizePolicyFieldMap(policy.labels, activeFields) as Partial<Record<NfsePolicyField, string>>;
  const hints = normalizePolicyFieldMap(policy.hints, activeFields) as Partial<Record<NfsePolicyField, string>>;
  const fieldSchema = allFields.reduce<Partial<Record<NfsePolicyField, NfseFieldSchema>>>((acc, field) => {
    const defaults = canonicalFieldDefaults(field);
    if (!defaults) {
      return acc;
    }

    acc[field] = canonicalFieldEntry(
      asRecord(schema[field]),
      defaults.label,
      defaults.control,
      defaults.payloadPaths,
      defaults.options ?? [],
    );

    if (activeFields.includes(field) && !labels[field]) {
      labels[field] = defaults.label;
    }
    if (activeFields.includes(field) && !hints[field]) {
      hints[field] = canonicalFieldHint(field);
    }

    return acc;
  }, {});

  return {
    ...policy,
    required_fields: requiredFields,
    visible_fields: visibleFields,
    default_values: normalizePolicyFieldMap(policy.default_values, activeFields) as Partial<Record<NfsePolicyField, string>>,
    labels,
    hints,
    enum_fields: normalizePolicyEnumFields(policy.enum_fields, activeFields),
    conditional_rules: normalizeConditionalRules(policy.conditional_rules),
    extensions_supported: Array.isArray(policy.extensions_supported) ? policy.extensions_supported.map(String) : [],
    field_schema: fieldSchema,
  };
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
  codigo?: never;
  nome?: never;
  descricao?: never;
  quantidade?: never;
  valor_unitario?: never;
  valorUnitario?: never;
  valor_total?: never;
  valorTotal?: never;
  cfop?: never;
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
  customer?: never;
  complementary?: never;
  totals?: never;
  tax_totals?: never;
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
  payload: NfseCanonicalPayload | Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface DirectNfseCanonicalSubmitRequest extends Omit<DirectDocumentSubmitRequest, 'document_type' | 'payload'> {
  document_type: 'nfse';
  payload: NfseCanonicalPayload;
}

export type DirectNfseNacionalSubmitRequest = DirectNfseCanonicalSubmitRequest;

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

export interface LegacyDocumentAliases {
  legacy_status?: string | null;
  type?: string | null;
  serie?: string | null;
  numero?: number | string | null;
  status_operacional?: string | null;
  status_fiscal?: string | null;
  chave_acesso?: string | null;
  protocolo?: string | null;
  autorizado_em?: string | null;
  [key: string]: unknown;
}

export interface ResponseContractMeta {
  version: string;
  canonical_fields: string[];
  legacy_aliases: string[];
  deprecated_top_level_aliases?: string[];
  compatibility_block?: string | null;
}

export interface IntegrationResponseMeta {
  response_contract?: ResponseContractMeta;
  [key: string]: unknown;
}

export interface DocumentAccepted {
  id: string | number;
  external_id?: string | null;
  status?: string | null;
  operational_status?: string | null;
  status_operacional?: string | null;
  fiscal_status?: string | null;
  status_fiscal?: string | null;
  fiscal_snapshot_id?: string | number | null;
  resolution_status?: ResolutionStatus | string | null;
  idempotent_replay: boolean;
  document_type?: DocumentType | string | null;
  series?: string | null;
  serie?: string | null;
  number?: number | string | null;
  numero?: number | string | null;
  access_key?: string | null;
  chave_acesso?: string | null;
  document_key?: string | null;
  protocol?: string | null;
  protocolo?: string | null;
  authorized_at?: string | null;
  autorizado_em?: string | null;
  legacy_aliases?: LegacyDocumentAliases | null;
  artifacts?: DocumentArtifacts | null;
  message?: string | null;
  rejection_reason?: string | null;
  errors?: Array<Record<string, unknown> | string>;
  direct_transmission?: boolean;
  direct_transmission_mode?: string | null;
}

export interface DocumentArtifacts {
  xml_available?: boolean;
  pdf_available?: boolean;
  xml_status?: 'available' | 'processing' | 'unavailable' | string;
  pdf_status?: 'available' | 'processing' | 'unavailable' | string;
  processing?: boolean;
  xml_mime_type?: string | null;
  pdf_mime_type?: string | null;
  xml_url?: string | null;
  pdf_url?: string | null;
  [key: string]: unknown;
}

export interface DocumentStatus {
  id: string | number;
  external_id: string | null;
  status?: string | null;
  legacy_status?: string | null;
  type?: DocumentType | string | null;
  document_type?: DocumentType | string | null;
  series?: string | null;
  serie?: string | null;
  number?: number | string | null;
  numero?: number | string | null;
  operational_status: string | null;
  status_operacional?: string | null;
  fiscal_status: string | null;
  status_fiscal?: string | null;
  access_key?: string | null;
  chave_acesso?: string | null;
  document_key?: string | null;
  protocol?: string | null;
  protocolo?: string | null;
  authorized_at?: string | null;
  autorizado_em?: string | null;
  legacy_aliases?: LegacyDocumentAliases | null;
  artifacts?: DocumentArtifacts | null;
  message?: string | null;
  rejection_reason?: string | null;
  errors?: Array<Record<string, unknown> | string>;
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
  } & IntegrationResponseMeta;
}

export interface PublicDocsSettings {
  enabled: boolean;
  title: string;
  intro: string;
  sandbox_base_url: string;
  production_base_url: string;
  sections: string[];
  featured_sdk: string;
  changelog: string;
  openapi_url: string;
  swagger_url?: string;
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

export interface CompanyListFilters {
  cnpj?: string;
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
  content: string | ArrayBuffer;
  base64?: string;
  mime_type: string | null;
  contentType: string | null;
  content_type: string | null;
  filename: string | null;
}

export interface WaitDocumentOptions {
  companyId: string | number;
  intervalMs?: number;
  timeoutMs?: number;
  terminalFiscalStatuses?: string[];
  terminalOperationalStatuses?: string[];
}

export function normalizeDocumentResponse<T extends Partial<DocumentAccepted & DocumentStatus>>(document: T): T {
  const legacy = isRecord(document.legacy_aliases) ? document.legacy_aliases : {};

  return {
    ...document,
    document_type: document.document_type ?? (legacy.type as string | undefined) ?? null,
    series: document.series ?? (legacy.serie as string | undefined) ?? null,
    number: document.number ?? (legacy.numero as string | number | undefined) ?? null,
    access_key: document.access_key ?? (legacy.chave_acesso as string | undefined) ?? document.document_key ?? null,
    protocol: document.protocol ?? (legacy.protocolo as string | undefined) ?? null,
    authorized_at: document.authorized_at ?? (legacy.autorizado_em as string | undefined) ?? null,
    operational_status: document.operational_status ?? (legacy.status_operacional as string | undefined) ?? null,
    fiscal_status: document.fiscal_status ?? (legacy.status_fiscal as string | undefined) ?? document.status ?? null,
  };
}

function legacyNfseNacionalFields(payload: Record<string, unknown>): string[] {
  return [...new Set(collectInvalidPaths(payload, NFSE_NACIONAL_SCHEMA))].sort();
}

function collectInvalidPaths(payload: Record<string, unknown>, schema: CanonicalSchema, prefix = ''): string[] {
  const invalid: string[] = [];

  for (const [key, value] of Object.entries(payload)) {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    if (!(key in schema)) {
      invalid.push(path);
      continue;
    }

    const childSchema = schema[key];
    if (childSchema === undefined) {
      invalid.push(path);
      continue;
    }

    if (childSchema === true) {
      continue;
    }

    if (!isRecord(value)) {
      invalid.push(path);
      continue;
    }

    invalid.push(...collectInvalidPaths(value, childSchema, path));
  }

  return invalid;
}

function normalizePolicyFields(value: unknown): NfsePolicyField[] {
  const normalized: NfsePolicyField[] = [];

  for (const field of Array.isArray(value) ? value : []) {
    const canonical = canonicalPolicyField(field);
    if (canonical && !normalized.includes(canonical)) {
      normalized.push(canonical);
    }
  }

  return normalized;
}

function normalizePolicyFieldMap(
  value: unknown,
  activeFields?: NfsePolicyField[],
): Record<string, unknown> {
  const record = asRecord(value);
  const allowedFields = activeFields ? new Set(activeFields) : null;
  const normalized: Record<string, unknown> = {};

  for (const [field, entry] of Object.entries(record)) {
    const canonical = canonicalPolicyField(field);
    if (!canonical) {
      continue;
    }
    if (allowedFields && !allowedFields.has(canonical)) {
      continue;
    }

    normalized[canonical] = entry;
  }

  return normalized;
}

function normalizePolicyEnumFields(
  value: unknown,
  activeFields: NfsePolicyField[],
): Partial<Record<NfsePolicyField, string[]>> {
  const allowedFields = new Set(activeFields);
  const normalized: Partial<Record<NfsePolicyField, string[]>> = {};

  for (const [field, enumValues] of Object.entries(asRecord(value))) {
    const canonical = canonicalPolicyField(field);
    if (!canonical || !allowedFields.has(canonical) || !Array.isArray(enumValues)) {
      continue;
    }

    normalized[canonical] = enumValues.map((item) => String(item));
  }

  return normalized;
}

function normalizeConditionalRules(value: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((rule) => {
    if (!isRecord(rule)) {
      return [];
    }

    const normalized: Record<string, unknown> = { ...rule };
    if (isRecord(rule.when) && 'field' in rule.when) {
      const whenField = canonicalPolicyField(rule.when.field);
      if (whenField) {
        normalized.when = { ...rule.when, field: whenField };
      }
    }

    for (const key of ['require', 'show', 'hide'] as const) {
      if (Array.isArray(rule[key])) {
        normalized[key] = normalizePolicyFields(rule[key]);
      }
    }

    return [normalized];
  });
}

function canonicalPolicyField(field: unknown): NfsePolicyField | null {
  const normalized = typeof field === 'string' ? field.trim() : '';
  return normalized !== '' ? NFSE_POLICY_FIELD_ALIASES[normalized] ?? null : null;
}

function canonicalFieldDefaults(
  field: NfsePolicyField,
): { label: string; control: string; payloadPaths: string[]; options?: Array<{ value: string; label: string }> } | null {
  switch (field) {
    case 'servico.cTribMun':
      return { label: 'Codigo Servico Municipal', control: 'text', payloadPaths: ['servico.cTribMun'] };
    case 'servico.cTribNac':
      return { label: 'Codigo Tributacao Nacional', control: 'text', payloadPaths: ['servico.cTribNac'] };
    case 'servico.cNBS':
      return { label: 'Codigo NBS', control: 'text', payloadPaths: ['servico.cNBS'] };
    case 'servico.codigoCnae':
      return { label: 'CNAE do Servico', control: 'text', payloadPaths: ['servico.codigoCnae'] };
    case 'servico.codigo_atividade':
      return { label: 'Codigo de Atividade', control: 'text', payloadPaths: ['servico.codigo_atividade'] };
    case 'servico.benefit_code':
      return { label: 'Codigo Beneficio Municipal', control: 'text', payloadPaths: ['servico.benefit_code'] };
    case 'prestador.opSimpNac':
      return {
        label: 'Simples Nacional',
        control: 'select',
        payloadPaths: ['prestador.opSimpNac'],
        options: [
          { value: '1', label: '1 - Nao optante' },
          { value: '2', label: '2 - MEI' },
          { value: '3', label: '3 - ME/EPP' },
        ],
      };
    case 'prestador.mei':
      return {
        label: 'Emitente MEI',
        control: 'select',
        payloadPaths: ['prestador.mei'],
        options: [
          { value: 'false', label: 'Nao MEI' },
          { value: 'true', label: 'MEI' },
        ],
      };
    default:
      return null;
  }
}

function canonicalFieldHint(field: NfsePolicyField): string {
  switch (field) {
    case 'servico.cTribMun':
      return 'Codigo municipal do servico aceito pelo provider NFSe.';
    case 'servico.cTribNac':
      return 'Codigo nacional de tributacao do servico.';
    case 'servico.cNBS':
      return 'Nomenclatura Brasileira de Servicos exigida pelo layout nacional.';
    case 'servico.codigoCnae':
      return 'CNAE fiscal do servico; alguns municipios validam esta tag no XML.';
    case 'servico.codigo_atividade':
      return 'Codigo de atividade municipal quando o provider exigir campo separado.';
    case 'servico.benefit_code':
      return 'Codigo oficial do beneficio municipal quando houver beneficio permitido para o servico.';
    case 'prestador.opSimpNac':
      return 'Opcao do Simples Nacional exigida pelo layout nacional.';
    case 'prestador.mei':
      return 'Classificacao explicita do emitente para roteamento municipal ou nacional da NFSe.';
  }
}

function canonicalFieldEntry(
  entry: Record<string, unknown>,
  label: string,
  control: string,
  payloadPaths: string[],
  options: Array<{ value: string; label: string }> = [],
): NfseFieldSchema {
  const normalized: NfseFieldSchema = {
    ...entry,
    label: typeof entry.label === 'string' ? entry.label : label,
    control: typeof entry.control === 'string' ? entry.control : control,
    payload_paths: payloadPaths,
  };

  if (options.length > 0) {
    normalized.options = options;
  }

  return normalized;
}

function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface NotagilClientOptions {
  baseUrl: string;
  token: string;
  fetch?: typeof fetch;
}

export class NotagilApiError extends Error {
  readonly status: number;
  readonly statusCode: number;
  readonly body: unknown;
  readonly payload: unknown;
  readonly errors: unknown;
  readonly rejectionReason: unknown;
  readonly rejection_reason: unknown;

  constructor(status: number, body: unknown) {
    super(typeof body === 'object' && body !== null && 'message' in body ? String((body as { message?: unknown }).message) : `NotaAgil API error ${status}`);
    this.name = 'NotagilApiError';
    this.status = status;
    this.statusCode = status;
    this.body = body;
    this.payload = body;
    this.errors = typeof body === 'object' && body !== null && 'errors' in body ? (body as { errors?: unknown }).errors : undefined;
    this.rejectionReason = typeof body === 'object' && body !== null && 'rejection_reason' in body ? (body as { rejection_reason?: unknown }).rejection_reason : undefined;
    this.rejection_reason = this.rejectionReason;
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

  listCompanies(filters: CompanyListFilters = {}): Promise<IntegrationCompany[]> {
    return this.request<IntegrationCompany[]>(this.withQuery('/companies', filters), {
      method: 'GET',
    });
  }

  getCompany(companyId: string | number): Promise<IntegrationCompany> {
    return this.request<IntegrationCompany>(`/companies/${encodeURIComponent(String(companyId))}`, {
      method: 'GET',
    });
  }

  getPublicDocsSettings(): Promise<PublicDocsSettings> {
    return this.requestFromBase<PublicDocsSettings>(this.platformBaseUrl(), '/public/docs', {
      method: 'GET',
    });
  }

  async getPublicOpenApiUrl(): Promise<string> {
    const docs = await this.getPublicDocsSettings();
    return docs.openapi_url;
  }

  async getPublicSwaggerUrl(): Promise<string | null> {
    const docs = await this.getPublicDocsSettings();
    return typeof docs.swagger_url === 'string' && docs.swagger_url.trim() !== '' ? docs.swagger_url : null;
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
    return this.download(this.documentArtifactPath(externalId, 'xml', companyId), 'text');
  }

  downloadDocumentPdf(externalId: string, companyId: string | number): Promise<DownloadResult> {
    return this.download(this.documentArtifactPath(externalId, 'pdf', companyId), 'base64');
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
    return this.download(this.companyPath(`/consulta-notas/${source}/${encodeURIComponent(String(documentId))}/xml`, companyId), 'text');
  }

  downloadUnifiedDocumentPdf(source: 'inbound' | 'outbound', documentId: string | number, companyId: string | number): Promise<DownloadResult> {
    return this.download(this.companyPath(`/consulta-notas/${source}/${encodeURIComponent(String(documentId))}/pdf`, companyId), 'base64');
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

  private async download(path: string, mode: 'arrayBuffer' | 'text' | 'base64' = 'arrayBuffer'): Promise<DownloadResult> {
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

    const contentType = response.headers.get('content-type');
    const buffer = await response.arrayBuffer();
    const content = mode === 'text'
      ? new TextDecoder().decode(buffer)
      : buffer;
    const base64 = mode === 'base64' ? this.arrayBufferToBase64(buffer) : undefined;

    return {
      content: mode === 'base64' ? (base64 ?? '') : content,
      base64,
      mime_type: contentType,
      contentType,
      content_type: contentType,
      filename: this.filenameFromDisposition(response.headers.get('content-disposition')),
    };
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
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
    return this.requestFromBase<T>(this.baseUrl, path, options);
  }

  private async requestFromBase<T>(baseUrl: string, path: string, options: {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: unknown;
    unwrapData?: boolean;
  }): Promise<T> {
    const response = await this.fetcher(`${baseUrl}${path}`, {
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

  private platformBaseUrl(): string {
    return this.baseUrl.replace(/\/v1\/integrations$/, '');
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
