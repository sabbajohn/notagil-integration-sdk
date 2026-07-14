export type DocumentType = 'nfe' | 'nfce' | 'nfse';
export type ResolutionStatus = 'resolved' | 'review' | 'blocked';
export type FiscalEnvironment = 'homologacao' | 'producao';
export type PublicApiVersion = 'v1' | 'v2';
export const DEFAULT_BASE_URL_V1 = 'https://api_notagil.sabbasistemas.com.br/api/v1/integrations';
export const DEFAULT_BASE_URL_V2 = 'https://api_notagil.sabbasistemas.com.br/api/v2/integrations';
export const NFSE_CANONICAL_POLICY_FIELDS = [
  'servico.cTribMun',
  'servico.cTribNac',
  'servico.cNBS',
  'prestador.opSimpNac',
] as const;
export const NFSE_NACIONAL_POLICY_FIELDS = NFSE_CANONICAL_POLICY_FIELDS;
export type NfsePolicyField = (typeof NFSE_CANONICAL_POLICY_FIELDS)[number];

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
  'prestador.enviarIM',
  'prestador.razaoSocial',
  'prestador.opSimpNac',
  'prestador.regApTribSN',
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
  'valor_servicos',
  'valores.vReceb',
  'valores.vDescIncond',
  'valores.vDescCond',
  'valores.deducao_reducao.percentual',
  'valores.deducao_reducao.valor',
  'tributacao.municipal.tribISSQN',
  'tributacao.municipal.cPaisResult',
  'tributacao.municipal.tpImunidade',
  'tributacao.municipal.exigSusp.tpSusp',
  'tributacao.municipal.exigSusp.nProcesso',
  'tributacao.municipal.BM.nBM',
  'tributacao.municipal.BM.pRedBCBM',
  'tributacao.municipal.BM.vRedBCBM',
  'tributacao.municipal.tpRetISSQN',
  'tributacao.municipal.pAliq',
  'tributacao.municipal.enviarPAliq',
  'tributacao.federal.piscofins.CST',
  'tributacao.federal.piscofins.vBCPisCofins',
  'tributacao.federal.piscofins.pAliqPis',
  'tributacao.federal.piscofins.pAliqCofins',
  'tributacao.federal.piscofins.vPis',
  'tributacao.federal.piscofins.vCofins',
  'tributacao.federal.piscofins.tpRetPisCofins',
  'tributacao.federal.vRetCP',
  'tributacao.federal.vRetIRRF',
  'tributacao.federal.vRetCSLL',
  'tributacao.total.indTotTrib',
  'tributacao.total.pTotTribSN',
  'tributacao.total.pTotTrib.pTotTribFed',
  'tributacao.total.pTotTrib.pTotTribEst',
  'tributacao.total.pTotTrib.pTotTribMun',
  'tributacao.total.vTotTrib.vTotTribFed',
  'tributacao.total.vTotTrib.vTotTribEst',
  'tributacao.total.vTotTrib.vTotTribMun',
  'ibscbs.finNFSe',
  'ibscbs.indFinal',
  'ibscbs.cIndOp',
  'ibscbs.tpOper',
  'ibscbs.gRefNFSe.refNFSe',
  'ibscbs.tpEnteGov',
  'ibscbs.indDest',
  'ibscbs.dest.documento',
  'ibscbs.dest.razaoSocial',
  'ibscbs.valores.trib.gIBSCBS.CST',
  'ibscbs.valores.trib.gIBSCBS.cClassTrib',
  'ibscbs.valores.trib.gIBSCBS.cCredPres',
  'ibscbs.valores.trib.gIBSCBS.gTribRegular.CSTReg',
  'ibscbs.valores.trib.gIBSCBS.gTribRegular.cClassTribReg',
  'ibscbs.valores.trib.gIBSCBS.gDif.pDifUF',
  'ibscbs.valores.trib.gIBSCBS.gDif.pDifMun',
  'ibscbs.valores.trib.gIBSCBS.gDif.pDifCBS',
] as const;

type NfseCanonicalScalar = string | number | boolean | null;
interface CanonicalSchema {
  [key: string]: true | CanonicalSchema;
}

export interface NfsePrestador extends Record<string, unknown> {
  cnpj?: string;
  inscricaoMunicipal?: string;
  enviarIM?: NfseCanonicalScalar;
  razaoSocial?: string;
  opSimpNac?: NfseCanonicalScalar;
  regApTribSN?: NfseCanonicalScalar;
  regEspTrib?: NfseCanonicalScalar;
  codigoMunicipio?: string;
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
  valores?: Record<string, unknown>;
  tributacao?: Record<string, unknown>;
  ibscbs?: Record<string, unknown>;
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
    enviarIM: true,
    razaoSocial: true,
    opSimpNac: true,
    regApTribSN: true,
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
  },
  valor_servicos: true,
  valores: {
    vReceb: true,
    vDescIncond: true,
    vDescCond: true,
    deducao_reducao: {
      percentual: true,
      valor: true,
    },
  },
  tributacao: {
    municipal: {
      tribISSQN: true,
      cPaisResult: true,
      tpImunidade: true,
      exigSusp: {
        tpSusp: true,
        nProcesso: true,
      },
      BM: {
        nBM: true,
        pRedBCBM: true,
        vRedBCBM: true,
      },
      tpRetISSQN: true,
      pAliq: true,
      enviarPAliq: true,
    },
    federal: {
      piscofins: {
        CST: true,
        vBCPisCofins: true,
        pAliqPis: true,
        pAliqCofins: true,
        vPis: true,
        vCofins: true,
        tpRetPisCofins: true,
      },
      vRetCP: true,
      vRetIRRF: true,
      vRetCSLL: true,
    },
    total: {
      indTotTrib: true,
      pTotTribSN: true,
      pTotTrib: {
        pTotTribFed: true,
        pTotTribEst: true,
        pTotTribMun: true,
      },
      vTotTrib: {
        vTotTribFed: true,
        vTotTribEst: true,
        vTotTribMun: true,
      },
    },
  },
  ibscbs: {
    finNFSe: true,
    indFinal: true,
    cIndOp: true,
    tpOper: true,
    gRefNFSe: {
      refNFSe: true,
    },
    tpEnteGov: true,
    indDest: true,
    dest: {
      documento: true,
      razaoSocial: true,
    },
    valores: {
      trib: {
        gIBSCBS: {
          CST: true,
          cClassTrib: true,
          cCredPres: true,
          gTribRegular: {
            CSTReg: true,
            cClassTribReg: true,
          },
          gDif: {
            pDifUF: true,
            pDifMun: true,
            pDifCBS: true,
          },
        },
      },
    },
  },
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
  const labels = normalizePolicyFieldMap(policy.labels, activeFields) as Partial<Record<NfsePolicyField, string>>;
  const hints = normalizePolicyFieldMap(policy.hints, activeFields) as Partial<Record<NfsePolicyField, string>>;
  const fieldSchema = activeFields.reduce<Partial<Record<NfsePolicyField, NfseFieldSchema>>>((acc, field) => {
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
  emission_mode?: 'queued' | 'sync' | 'synchronous';
  synchronous?: boolean;
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
  emission_mode?: 'queued' | 'sync' | 'synchronous';
  synchronous?: boolean;
  xml?: string;
  xml_base64?: string;
  already_signed?: boolean;
  id_lote?: string;
  ind_sinc?: 0 | 1;
  metadata?: Record<string, unknown>;
}

export interface IdentificacaoFiscalV2 extends Record<string, unknown> {
  serie?: string;
  numero?: string;
  natureza_operacao?: string;
  data_emissao?: string;
  data_competencia?: string;
  ambiente?: FiscalEnvironment;
  municipio_ocorrencia_codigo?: string;
  presenca?: number;
  intermediador?: number;
}

export interface EnderecoFiscalV2 extends Record<string, unknown> {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  codigo_municipio?: string;
  codigo_ibge?: string;
}

export interface ParteFiscalV2 extends Record<string, unknown> {
  cpf_cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  tipo_pessoa?: 'fisica' | 'juridica' | 'estrangeiro' | string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  crt?: string;
  email?: string;
  telefone?: string;
  endereco?: EnderecoFiscalV2;
}

export interface TributoFiscalV2 extends Record<string, unknown> {
  cst?: string;
  csosn?: string;
  aliquota?: number;
  base_calculo?: number;
  valor?: number;
}

export interface ImpostosFiscalV2 extends Record<string, unknown> {
  icms?: TributoFiscalV2;
  iss?: TributoFiscalV2;
  pis?: TributoFiscalV2;
  cofins?: TributoFiscalV2;
  ibs?: TributoFiscalV2;
  cbs?: TributoFiscalV2;
}

export interface ItemFiscalV2 extends Record<string, unknown> {
  codigo?: string;
  descricao: string;
  quantidade: number;
  valor_unitario: number;
  valor_total?: number;
  unidade?: string;
  ncm?: string;
  cfop?: string;
  impostos?: ImpostosFiscalV2;
}

export interface ServicoFiscalV2 extends Record<string, unknown> {
  codigo_servico_nacional?: string;
  codigo_servico_municipal?: string;
  codigo_nbs?: string;
  codigo_municipio_prestacao?: string;
  municipio_prestacao_codigo?: string;
  descricao?: string;
}

export interface ValoresNfseFiscalV2 extends Record<string, unknown> {
  valor_recebido?: number;
  desconto_incondicionado?: number;
  desconto_condicionado?: number;
  deducao_reducao?: {
    percentual?: number;
    valor?: number;
    [key: string]: unknown;
  };
}

export interface TributacaoNfseFiscalV2 extends Record<string, unknown> {
  municipal?: {
    tributacao_iss?: string;
    pais_resultado?: string;
    tipo_imunidade?: string;
    exigibilidade_suspensa?: {
      tipo_suspensao?: string;
      numero_processo?: string;
      [key: string]: unknown;
    };
    beneficio_municipal?: {
      numero_beneficio?: string;
      percentual_reducao_bc?: number;
      valor_reducao_bc?: number;
      [key: string]: unknown;
    };
    tipo_retencao_iss?: '1' | '2' | '3' | string;
    aliquota_iss?: number;
    enviar_aliquota_iss?: boolean;
    [key: string]: unknown;
  };
  federal?: {
    pis_cofins?: {
      cst?: string;
      base_calculo?: number;
      aliquota_pis?: number;
      aliquota_cofins?: number;
      valor_pis?: number;
      valor_cofins?: number;
      tipo_retencao?: '1' | '2' | '3' | string;
      [key: string]: unknown;
    };
    valor_retido_cp?: number;
    valor_retido_irrf?: number;
    valor_retido_csll?: number;
    [key: string]: unknown;
  };
  total?: {
    indicador_sem_total?: '0' | string;
    percentual_simples_nacional?: number;
    percentuais?: {
      federal?: number;
      estadual?: number;
      municipal?: number;
      [key: string]: unknown;
    };
    valores?: {
      federal?: number;
      estadual?: number;
      municipal?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface IbsCbsNfseFiscalV2 extends Record<string, unknown> {
  finalidade_nfse?: string;
  indicador_final?: string;
  codigo_indicador_operacao?: string;
  tipo_operacao?: string;
  referencias_nfse?: string[];
  tipo_ente_governamental?: string;
  indicador_destinatario?: string;
  destinatario?: {
    cpf_cnpj?: string;
    razao_social?: string;
    [key: string]: unknown;
  };
  tributos?: {
    cst?: string;
    codigo_classificacao?: string;
    codigo_credito_presumido?: string;
    tributacao_regular?: {
      cst?: string;
      codigo_classificacao?: string;
      [key: string]: unknown;
    };
    diferimento?: {
      percentual_uf?: number;
      percentual_municipal?: number;
      percentual_cbs?: number;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface PagamentoFiscalV2 extends Record<string, unknown> {
  meios?: Array<{
    meio?: string;
    valor?: number;
    [key: string]: unknown;
  }>;
}

export interface TransporteFiscalV2 extends Record<string, unknown> {
  modalidade_frete?: string;
}

export interface ReferenciaFiscalV2 extends Record<string, unknown> {
  chave?: string;
  tipo?: string;
}

export interface TotaisFiscalV2 extends Record<string, unknown> {
  valor_produtos?: number;
  valor_servicos?: number;
  valor_descontos?: number;
  valor_documento?: number;
}

export interface ObservacoesFiscalV2 extends Record<string, unknown> {
  contribuinte?: string;
  fisco?: string;
  texto?: string;
}

export interface FiscalCanonicalPayloadV2 extends Record<string, unknown> {
  identificacao: IdentificacaoFiscalV2;
  emitente: ParteFiscalV2;
  tomador: ParteFiscalV2;
  itens: ItemFiscalV2[];
  servico?: ServicoFiscalV2;
  pagamento?: PagamentoFiscalV2;
  transporte?: TransporteFiscalV2;
  referencias?: ReferenciaFiscalV2[];
  totais?: TotaisFiscalV2;
  impostos?: ImpostosFiscalV2;
  valores_nfse?: ValoresNfseFiscalV2;
  tributacao?: TributacaoNfseFiscalV2;
  ibs_cbs?: IbsCbsNfseFiscalV2;
  observacoes?: ObservacoesFiscalV2;
  extensoes?: Record<string, unknown>;
}

export interface FiscalContractInfo {
  contrato?: string;
  versao?: string;
  tipo_documento?: DocumentType | string;
  provedor?: string | null;
  familia_layout?: string | null;
  raizes_payload?: string[];
  campos_obrigatorios?: string[];
  campos_visiveis?: string[];
  campos_enum?: Record<string, string[]>;
  regras_condicionais?: Array<Record<string, unknown>>;
  valores_padrao?: Record<string, unknown>;
  extensoes_suportadas?: string[];
  rotulos?: Record<string, string>;
  dicas?: Record<string, string>;
  [key: string]: unknown;
}

export interface DirectDocumentSubmitRequestV2 {
  external_id: string;
  tipo_documento: DocumentType;
  municipio?: string | null;
  ambiente_fiscal?: FiscalEnvironment;
  modo_emissao?: 'fila' | 'sincrono';
  sincrono?: boolean;
  payload: FiscalCanonicalPayloadV2;
  metadados?: Record<string, unknown>;
}

export interface DirectDocumentRequestV2Options {
  external_id: string;
  municipio?: string | null;
  ambiente_fiscal?: FiscalEnvironment;
  modo_emissao?: 'fila' | 'sincrono';
  sincrono?: boolean;
  metadata?: Record<string, unknown>;
}

export interface OperationDocumentRetratoTomadorV2 extends Record<string, unknown> {
  tipo_pessoa?: string;
  indicador_ie?: string | number | null;
  contribuinte_icms?: boolean;
  contribuinte_iss?: boolean;
  consumidor_final?: boolean;
  comprador_identificado?: boolean;
  ente_publico?: boolean;
  codigo_municipio?: string | number | null;
  codigo_ibge?: string | number | null;
  person_type?: never;
  ie_indicator?: never;
  taxpayer_icms?: never;
  taxpayer_iss?: never;
  final_consumer?: never;
  buyer_identified?: never;
  public_entity?: never;
  municipality_ibge?: never;
  state_registration?: never;
  municipal_registration?: never;
}

export interface OperationDocumentRetratoItemV2 extends Record<string, unknown> {
  produto_id?: string | number | null;
  produto_externo_id?: string | number | null;
  codigo?: string;
  descricao?: string;
  tipo_item?: 'produto' | 'servico' | string;
  unidade?: string;
  quantidade?: number;
  valor_unitario?: number;
  valor_bruto?: number;
  valor_desconto?: number;
  valor_frete?: number;
  valor_seguro?: number;
  valor_outras_despesas?: number;
  codigo_servico?: string;
  codigo_servico_municipal?: string;
  codigo_tributacao_nacional?: string;
  codigo_nbs?: string;
  codigo_cnae?: string;
  codigo_atividade?: string;
  codigo_beneficio?: string;
  codigo_indicador_operacao?: string;
  product_id?: never;
  external_product_id?: never;
  source_product_id?: never;
  product_profile_id?: never;
  sku?: never;
  description?: never;
  item_type?: never;
  unit?: never;
  quantity?: never;
  unit_price?: never;
  gross_amount?: never;
  discount_amount?: never;
  freight_amount?: never;
  insurance_amount?: never;
  other_amount?: never;
  origin_code?: never;
  tax_classification_code?: never;
  taxes?: never;
  tax_calculations?: never;
  rate_sources?: never;
  tax_engine_audit?: never;
  formula_alignment?: never;
  tax_formula_payload?: never;
  tax_formula_trace?: never;
}

export interface OperationDocumentSnapshotV2 extends Record<string, unknown> {
  ambiente_fiscal?: FiscalEnvironment;
  data_referencia?: string;
  direcao_documento?: 'entrada' | 'saida' | string;
  dados_documento?: Record<string, unknown>;
  tomador?: OperationDocumentRetratoTomadorV2;
  referencias_documento?: Array<Record<string, unknown>>;
  itens: OperationDocumentRetratoItemV2[];
  fiscal_environment?: never;
  reference_date?: never;
  document_direction?: never;
  direction?: never;
  document_data?: never;
  counterparty?: never;
  customer?: never;
  document_references?: never;
  items?: never;
  operation_profile_id?: never;
  emitter_profile_id?: never;
  taker_profile_id?: never;
  product_profile_id?: never;
  context_hash?: never;
  profile_composition_hash?: never;
  signature_hash?: never;
  profiles_json?: never;
  rules_applied_json?: never;
  overrides_applied_json?: never;
  reference_requirements_json?: never;
  formula_trace_json?: never;
  operation_context?: never;
  blocking_issues?: never;
  review_issues?: never;
  totals?: never;
  tax_totals?: never;
}

export type OperationDocumentRetratoV2 = OperationDocumentSnapshotV2;

export interface OperationDocumentPreviewRequestV2 {
  external_id?: string;
  tipo_documento: DocumentType;
  municipio?: string | null;
  retrato: OperationDocumentRetratoV2;
  metadados?: Record<string, unknown>;
  document_type?: never;
  documentType?: never;
  metadata?: never;
  snapshot?: never;
  emission_mode?: never;
  emissionMode?: never;
  synchronous?: never;
}

export interface OperationDocumentSubmitRequestV2 extends OperationDocumentPreviewRequestV2 {
  external_id: string;
  modo_emissao?: 'fila' | 'sincrono';
  sincrono?: boolean;
}

export interface DocumentStatusV2 extends Record<string, unknown> {
  id?: string | number;
  external_id?: string | null;
  status?: string | null;
  tipo_documento?: DocumentType | string | null;
  serie?: string | null;
  numero?: string | number | null;
  status_operacional?: string | null;
  status_fiscal?: string | null;
  ambiente_fiscal?: FiscalEnvironment | string | null;
  chave_documento?: string | null;
  protocolo?: string | null;
  autorizado_em?: string | null;
  artefatos?: Record<string, unknown> | null;
  mensagem?: string | null;
  motivo_rejeicao?: string | null;
  erros?: unknown;
}

export interface DocumentListFiltersV2 {
  external_id?: string;
  tipo_documento?: DocumentType;
  status_operacional?: string;
  status_fiscal?: string;
  criado_de?: string;
  criado_ate?: string;
  por_pagina?: number;
}

export interface PublicEnvelopeV2<T> {
  dados: T;
  metadados?: Record<string, unknown>;
  codigo?: string;
}

export interface PaginatedDocumentListV2 extends PublicEnvelopeV2<DocumentStatusV2[]> {
  metadados?: {
    pagina_atual?: number;
    ultima_pagina?: number;
    por_pagina?: number;
    total?: number;
    [key: string]: unknown;
  };
}

export type IbptOriginType = 'nacional' | 'importada';

export interface IbptItemRequest extends Record<string, unknown> {
  uf: string;
  ncm: string;
  valor: number | string;
  extarif?: string | number | null;
  descricao?: string | null;
  unidade?: string | null;
  gtin?: string | null;
  codigo_interno?: string | number | null;
  codigo_origem?: string | number | null;
  tipo_mercadoria?: IbptOriginType | string | null;
  importado?: boolean | null;
}

export type IbptCouponItemRequest = Omit<IbptItemRequest, 'uf'> & {
  uf?: string;
};

export interface IbptCouponRequest extends Record<string, unknown> {
  uf: string;
  itens: IbptCouponItemRequest[];
}

export interface IbptTaxRates extends Record<string, unknown> {
  nacional?: number | null;
  importada?: number | null;
  estadual?: number | null;
  municipal?: number | null;
  federal_utilizada?: number | null;
}

export interface IbptTaxValues extends Record<string, unknown> {
  tributo_nacional?: number | null;
  tributo_importado?: number | null;
  tributo_federal?: number | null;
  tributo_estadual?: number | null;
  tributo_municipal?: number | null;
  tributo_total?: number | null;
}

export interface IbptTableInfo extends Record<string, unknown> {
  vigencia_inicio?: string | null;
  vigencia_fim?: string | null;
  chave?: string | null;
  versao?: string | null;
  fonte?: string | null;
}

export interface IbptCacheInfo extends Record<string, unknown> {
  status?: string | null;
  chave?: string | null;
  expira_em?: string | null;
}

export interface IbptItemResult extends Record<string, unknown> {
  aliquotas?: IbptTaxRates;
  valores?: IbptTaxValues;
  tabela?: IbptTableInfo;
  cache?: IbptCacheInfo;
}

export interface IbptCouponResult extends Record<string, unknown> {
  itens?: IbptItemResult[];
  totais?: IbptTaxValues & Record<string, unknown>;
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
  emission_date?: string | null;
  data_emissao?: string | null;
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
  direct_transmission_synchronous?: boolean;
  sefaz_response?: Record<string, unknown> | null;
  xml?: string | null;
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
  emission_date?: string | null;
  data_emissao?: string | null;
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
  emission_from?: string;
  emission_to?: string;
  page?: number;
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
  versions?: Partial<Record<PublicApiVersion, {
    openapi_url?: string;
    swagger_url?: string;
    [key: string]: unknown;
  }>>;
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

export type ProductCatalogResource =
  | 'unidades-medida'
  | 'conversoes-unidade'
  | 'classificacoes-mercadologicas'
  | 'produtos-mestre'
  | 'familias'
  | 'categorias-pdv'
  | 'codigos-barras'
  | 'apresentacoes'
  | 'precos'
  | 'fornecedores'
  | 'produto-fornecedores'
  | 'locais-estoque'
  | 'enderecos-estoque'
  | 'lotes'
  | 'saldos-estoque'
  | (string & {});

export interface ProductFiscalBase {
  item_type?: 'PRODUCT' | 'SERVICE' | string;
  doc_scope_preferencial?: string | null;
  tipo_item?: string | null;
  natureza_item?: string | null;
  fiscal_tags?: string[];
  ncm?: string | null;
  ncm_descricao?: string | null;
  cest?: string | null;
  origem_mercadoria?: number | string | null;
  servico_codigo?: string | null;
  codigo_nbs?: string | null;
  cod_classe_tributo?: string | null;
  unidade_medida_id?: string | number | null;
  unidade?: string | null;
  unidade_codigo_fiscal?: string | null;
  apto_emissao?: boolean;
  pendencias?: string[];
  [key: string]: unknown;
}

export interface ProductPayload {
  id?: string | number;
  empresa_id?: string | number;
  tipo?: 'produto' | 'servico' | string;
  cod_sku?: string | null;
  codigo_interno?: string | null;
  sku?: string | null;
  codigo_operacional?: string | null;
  codigo_operacional_manual?: boolean | null;
  descricao?: string;
  name?: string | null;
  descricao_curta?: string | null;
  produto_tipo?: 'NORMAL' | 'SERVICO' | string | null;
  situacao?: 'ATIVO' | 'INATIVO' | string | null;
  liberado?: 'sim' | 'nao' | string | null;
  marca?: string | null;
  unidade?: string | null;
  unidade_medida_id?: string | number | null;
  gtin?: string | null;
  valor_padrao?: number | string | null;
  price?: number | string | null;
  ativo?: boolean | null;
  tipo_item?: string | null;
  natureza_item?: string | null;
  ncm?: string | null;
  ncm_descricao?: string | null;
  cest?: string | null;
  origem_mercadoria?: number | string | null;
  origin_code?: string | null;
  codigo_servico_municipal?: string | null;
  servico_codigo?: string | null;
  benefit_code?: string | null;
  tax_classification_code?: string | null;
  ibs_cbs_classification_code?: string | null;
  codigo_tributacao_nacional?: string | null;
  codigo_nbs?: string | null;
  cod_classe_tributo?: string | null;
  codigo_cnae?: string | null;
  codigo_atividade?: string | null;
  fiscal_tags?: string[];
  fiscal_base?: ProductFiscalBase | null;
  st_applicable?: boolean | null;
  monophase_applicable?: boolean | null;
  [key: string]: unknown;
}

export interface ProductCatalogPayload {
  id?: string | number;
  empresa_id?: string | number;
  produto_id?: string | number;
  ativo?: boolean;
  [key: string]: unknown;
}

export interface TakerPayload {
  [key: string]: unknown;
}

export interface WebhookPayload {
  [key: string]: unknown;
}

export interface FiscalDocumentWebhookDocument {
  id: string;
  company_id: string;
  external_id?: string | null;
  document_type?: DocumentType | string | null;
  operational_status?: string | null;
  fiscal_status?: string | null;
  document_key?: string | null;
  protocol?: string | null;
  last_error?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  xml?: string;
  [key: string]: unknown;
}

export interface FiscalDocumentWebhookEvent {
  id: string;
  event_type: string;
  occurred_at?: string | null;
  [key: string]: unknown;
}

export interface FiscalDocumentAuthorizedWebhookPayload {
  id: string;
  type: 'fiscal_document.authorized';
  created_at: string;
  data: {
    document: FiscalDocumentWebhookDocument;
    event: FiscalDocumentWebhookEvent;
    [key: string]: unknown;
  };
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

export function normalizeDocumentResponse<T extends Partial<DocumentAccepted & DocumentStatus & DocumentStatusV2>>(document: T | { data?: unknown; dados?: unknown }): T {
  let normalizedInput = document;
  if (isRecord(normalizedInput) && isRecord(normalizedInput.dados)) {
    normalizedInput = normalizedInput.dados as T;
  }
  if (isRecord(normalizedInput) && isRecord(normalizedInput.data)) {
    normalizedInput = normalizedInput.data as T;
  }
  const maybeBlock: Record<string, unknown> = isRecord(normalizedInput) ? normalizedInput : {};
  if (isRecord(maybeBlock.document)) {
    const block = maybeBlock;
    const documentBlock = block.document as Record<string, unknown>;
    const fiscalBlock = isRecord(block.fiscal) ? block.fiscal : {};
    const operationalBlock = isRecord(block.operational) ? block.operational : {};
    normalizedInput = {
      ...documentBlock,
      ...(isRecord(block.fiscal) ? {
        fiscal_status: fiscalBlock.status,
        access_key: fiscalBlock.access_key,
        document_key: fiscalBlock.document_key,
        protocol: fiscalBlock.protocol,
        authorized_at: fiscalBlock.authorized_at,
      } : {}),
      ...(isRecord(block.operational) ? {
        operational_status: operationalBlock.status,
      } : {}),
      ...(isRecord(block.artifacts) ? {
        artifacts: block.artifacts,
      } : {}),
    } as T;
  }

  const doc = normalizedInput as T;
  const legacy = isRecord(doc.legacy_aliases) ? doc.legacy_aliases : {};
  const artefatos = isRecord(doc.artefatos) ? doc.artefatos : {};

  return {
    ...doc,
    document_type: doc.document_type ?? doc.tipo_documento ?? (legacy.type as string | undefined) ?? null,
    series: doc.series ?? doc.serie ?? (legacy.serie as string | undefined) ?? null,
    number: doc.number ?? doc.numero ?? (legacy.numero as string | number | undefined) ?? null,
    access_key: doc.access_key ?? doc.chave_documento ?? (legacy.chave_acesso as string | undefined) ?? doc.document_key ?? null,
    protocol: doc.protocol ?? doc.protocolo ?? (legacy.protocolo as string | undefined) ?? null,
    authorized_at: doc.authorized_at ?? doc.autorizado_em ?? (legacy.autorizado_em as string | undefined) ?? null,
    operational_status: doc.operational_status ?? doc.status_operacional ?? (legacy.status_operacional as string | undefined) ?? null,
    fiscal_status: doc.fiscal_status ?? doc.status_fiscal ?? (legacy.status_fiscal as string | undefined) ?? doc.status ?? null,
    artifacts: doc.artifacts ?? (Object.keys(artefatos).length > 0 ? {
      xml_available: artefatos.xml_disponivel,
      pdf_available: artefatos.pdf_disponivel,
      processing: artefatos.processando,
      xml_status: artefatos.status_xml,
      pdf_status: artefatos.status_pdf,
      xml_url: artefatos.url_xml,
      pdf_url: artefatos.url_pdf,
    } : doc.artifacts),
  };
}

export const FISCAL_CANONICAL_V2_EXPECTED_FIELDS = [
  'identificacao',
  'identificacao.serie',
  'identificacao.numero',
  'identificacao.natureza_operacao',
  'identificacao.data_emissao',
  'identificacao.data_competencia',
  'identificacao.ambiente',
  'identificacao.municipio_ocorrencia_codigo',
  'identificacao.presenca',
  'identificacao.intermediador',
  'emitente',
  'emitente.cpf_cnpj',
  'emitente.razao_social',
  'emitente.nome_fantasia',
  'emitente.tipo_pessoa',
  'emitente.inscricao_estadual',
  'emitente.inscricao_municipal',
  'emitente.crt',
  'emitente.email',
  'emitente.telefone',
  'emitente.endereco',
  'tomador',
  'tomador.cpf_cnpj',
  'tomador.razao_social',
  'tomador.nome_fantasia',
  'tomador.tipo_pessoa',
  'tomador.inscricao_estadual',
  'tomador.inscricao_municipal',
  'tomador.crt',
  'tomador.email',
  'tomador.telefone',
  'tomador.endereco',
  'itens',
  'itens.*.codigo',
  'itens.*.descricao',
  'itens.*.quantidade',
  'itens.*.valor_unitario',
  'itens.*.valor_total',
  'itens.*.unidade',
  'itens.*.ncm',
  'itens.*.cfop',
  'itens.*.impostos',
  'servico',
  'servico.codigo_servico_nacional',
  'servico.codigo_servico_municipal',
  'servico.codigo_nbs',
  'servico.codigo_municipio_prestacao',
  'servico.municipio_prestacao_codigo',
  'servico.descricao',
  'pagamento',
  'pagamento.meios',
  'transporte',
  'transporte.modalidade_frete',
  'referencias',
  'referencias.*.chave',
  'referencias.*.tipo',
  'totais',
  'totais.valor_produtos',
  'totais.valor_servicos',
  'totais.valor_descontos',
  'totais.valor_documento',
  'impostos',
  'impostos.icms',
  'impostos.iss',
  'impostos.pis',
  'impostos.cofins',
  'impostos.ibs',
  'impostos.cbs',
  'valores_nfse',
  'valores_nfse.valor_recebido',
  'valores_nfse.desconto_incondicionado',
  'valores_nfse.desconto_condicionado',
  'valores_nfse.deducao_reducao.percentual',
  'valores_nfse.deducao_reducao.valor',
  'tributacao',
  'tributacao.municipal.tributacao_iss',
  'tributacao.municipal.pais_resultado',
  'tributacao.municipal.tipo_imunidade',
  'tributacao.municipal.exigibilidade_suspensa.tipo_suspensao',
  'tributacao.municipal.exigibilidade_suspensa.numero_processo',
  'tributacao.municipal.beneficio_municipal.numero_beneficio',
  'tributacao.municipal.beneficio_municipal.percentual_reducao_bc',
  'tributacao.municipal.beneficio_municipal.valor_reducao_bc',
  'tributacao.municipal.tipo_retencao_iss',
  'tributacao.municipal.aliquota_iss',
  'tributacao.municipal.enviar_aliquota_iss',
  'tributacao.federal.pis_cofins.cst',
  'tributacao.federal.pis_cofins.base_calculo',
  'tributacao.federal.pis_cofins.aliquota_pis',
  'tributacao.federal.pis_cofins.aliquota_cofins',
  'tributacao.federal.pis_cofins.valor_pis',
  'tributacao.federal.pis_cofins.valor_cofins',
  'tributacao.federal.pis_cofins.tipo_retencao',
  'tributacao.federal.valor_retido_cp',
  'tributacao.federal.valor_retido_irrf',
  'tributacao.federal.valor_retido_csll',
  'tributacao.total.indicador_sem_total',
  'tributacao.total.percentual_simples_nacional',
  'tributacao.total.percentuais.federal',
  'tributacao.total.percentuais.estadual',
  'tributacao.total.percentuais.municipal',
  'tributacao.total.valores.federal',
  'tributacao.total.valores.estadual',
  'tributacao.total.valores.municipal',
  'ibs_cbs',
  'ibs_cbs.finalidade_nfse',
  'ibs_cbs.indicador_final',
  'ibs_cbs.codigo_indicador_operacao',
  'ibs_cbs.tipo_operacao',
  'ibs_cbs.referencias_nfse',
  'ibs_cbs.tipo_ente_governamental',
  'ibs_cbs.indicador_destinatario',
  'ibs_cbs.destinatario.cpf_cnpj',
  'ibs_cbs.destinatario.razao_social',
  'ibs_cbs.tributos.cst',
  'ibs_cbs.tributos.codigo_classificacao',
  'ibs_cbs.tributos.codigo_credito_presumido',
  'ibs_cbs.tributos.tributacao_regular.cst',
  'ibs_cbs.tributos.tributacao_regular.codigo_classificacao',
  'ibs_cbs.tributos.diferimento.percentual_uf',
  'ibs_cbs.tributos.diferimento.percentual_municipal',
  'ibs_cbs.tributos.diferimento.percentual_cbs',
  'observacoes',
  'observacoes.contribuinte',
  'observacoes.fisco',
  'observacoes.texto',
  'extensoes',
] as const;

export class FiscalCanonicalPayloadV2Error extends Error {
  readonly expectedFields: string[];
  readonly invalidFields: string[];

  constructor(expectedFields: readonly string[], invalidFields: string[]) {
    super('Payload invalido para FiscalCanonicalPayloadV2. Use somente campos publicos em portugues e snake_case.');
    this.name = 'FiscalCanonicalPayloadV2Error';
    this.expectedFields = [...expectedFields];
    this.invalidFields = invalidFields;
  }
}

const FISCAL_CANONICAL_V2_PART_SCHEMA: CanonicalSchema = {
  cpf_cnpj: true,
  razao_social: true,
  nome_fantasia: true,
  tipo_pessoa: true,
  inscricao_estadual: true,
  inscricao_municipal: true,
  crt: true,
  email: true,
  telefone: true,
  endereco: {
    logradouro: true,
    numero: true,
    complemento: true,
    bairro: true,
    municipio: true,
    uf: true,
    cep: true,
    codigo_municipio: true,
    codigo_ibge: true,
  },
};

const FISCAL_CANONICAL_V2_TRIBUTO_SCHEMA: CanonicalSchema = {
  cst: true,
  csosn: true,
  aliquota: true,
  base_calculo: true,
  valor: true,
};

const FISCAL_CANONICAL_V2_IMPOSTOS_SCHEMA: CanonicalSchema = {
  icms: FISCAL_CANONICAL_V2_TRIBUTO_SCHEMA,
  iss: FISCAL_CANONICAL_V2_TRIBUTO_SCHEMA,
  pis: FISCAL_CANONICAL_V2_TRIBUTO_SCHEMA,
  cofins: FISCAL_CANONICAL_V2_TRIBUTO_SCHEMA,
  ibs: FISCAL_CANONICAL_V2_TRIBUTO_SCHEMA,
  cbs: FISCAL_CANONICAL_V2_TRIBUTO_SCHEMA,
};

const FISCAL_CANONICAL_V2_SCHEMA: CanonicalSchema = {
  identificacao: {
    serie: true,
    numero: true,
    natureza_operacao: true,
    data_emissao: true,
    data_competencia: true,
    ambiente: true,
    municipio_ocorrencia_codigo: true,
    presenca: true,
    intermediador: true,
  },
  emitente: FISCAL_CANONICAL_V2_PART_SCHEMA,
  tomador: FISCAL_CANONICAL_V2_PART_SCHEMA,
  itens: {
    '*': {
      codigo: true,
      descricao: true,
      quantidade: true,
      valor_unitario: true,
      valor_total: true,
      unidade: true,
      ncm: true,
      cfop: true,
      impostos: FISCAL_CANONICAL_V2_IMPOSTOS_SCHEMA,
    },
  },
  servico: {
    codigo_servico_nacional: true,
    codigo_servico_municipal: true,
    codigo_nbs: true,
    codigo_municipio_prestacao: true,
    municipio_prestacao_codigo: true,
    descricao: true,
  },
  pagamento: {
    meios: {
      '*': {
        meio: true,
        valor: true,
      },
    },
  },
  transporte: {
    modalidade_frete: true,
  },
  referencias: {
    '*': {
      chave: true,
      tipo: true,
    },
  },
  totais: {
    valor_produtos: true,
    valor_servicos: true,
    valor_descontos: true,
    valor_documento: true,
  },
  impostos: FISCAL_CANONICAL_V2_IMPOSTOS_SCHEMA,
  valores_nfse: {
    valor_recebido: true,
    desconto_incondicionado: true,
    desconto_condicionado: true,
    deducao_reducao: {
      percentual: true,
      valor: true,
    },
  },
  tributacao: {
    municipal: {
      tributacao_iss: true,
      pais_resultado: true,
      tipo_imunidade: true,
      exigibilidade_suspensa: {
        tipo_suspensao: true,
        numero_processo: true,
      },
      beneficio_municipal: {
        numero_beneficio: true,
        percentual_reducao_bc: true,
        valor_reducao_bc: true,
      },
      tipo_retencao_iss: true,
      aliquota_iss: true,
      enviar_aliquota_iss: true,
    },
    federal: {
      pis_cofins: {
        cst: true,
        base_calculo: true,
        aliquota_pis: true,
        aliquota_cofins: true,
        valor_pis: true,
        valor_cofins: true,
        tipo_retencao: true,
      },
      valor_retido_cp: true,
      valor_retido_irrf: true,
      valor_retido_csll: true,
    },
    total: {
      indicador_sem_total: true,
      percentual_simples_nacional: true,
      percentuais: {
        federal: true,
        estadual: true,
        municipal: true,
      },
      valores: {
        federal: true,
        estadual: true,
        municipal: true,
      },
    },
  },
  ibs_cbs: {
    finalidade_nfse: true,
    indicador_final: true,
    codigo_indicador_operacao: true,
    tipo_operacao: true,
    referencias_nfse: true,
    tipo_ente_governamental: true,
    indicador_destinatario: true,
    destinatario: {
      cpf_cnpj: true,
      razao_social: true,
    },
    tributos: {
      cst: true,
      codigo_classificacao: true,
      codigo_credito_presumido: true,
      tributacao_regular: {
        cst: true,
        codigo_classificacao: true,
      },
      diferimento: {
        percentual_uf: true,
        percentual_municipal: true,
        percentual_cbs: true,
      },
    },
  },
  observacoes: {
    contribuinte: true,
    fisco: true,
    texto: true,
  },
  extensoes: true,
};

export function assertFiscalCanonicalPayloadV2(payload: Record<string, unknown>): asserts payload is FiscalCanonicalPayloadV2 {
  const invalidFields = [...new Set([
    ...missingFiscalCanonicalV2RequiredFields(payload),
    ...collectInvalidPaths(payload, FISCAL_CANONICAL_V2_SCHEMA),
  ])].sort();
  if (invalidFields.length === 0) {
    return;
  }

  throw new FiscalCanonicalPayloadV2Error(FISCAL_CANONICAL_V2_EXPECTED_FIELDS, invalidFields);
}

export function buildDirectDocumentRequestV2(
  documentType: DocumentType,
  payload: Record<string, unknown>,
  options: DirectDocumentRequestV2Options,
): DirectDocumentSubmitRequestV2 {
  assertFiscalCanonicalPayloadV2(payload);

  return {
    external_id: options.external_id,
    tipo_documento: documentType,
    ...(options.municipio === undefined ? {} : { municipio: options.municipio }),
    ...(options.ambiente_fiscal === undefined ? {} : { ambiente_fiscal: options.ambiente_fiscal }),
    ...(options.modo_emissao === undefined ? {} : { modo_emissao: options.modo_emissao }),
    ...(options.sincrono === undefined ? {} : { sincrono: options.sincrono }),
    payload,
    ...(options.metadata === undefined ? {} : { metadados: options.metadata }),
  };
}

export function buildDirectNfeDocumentRequestV2(payload: Record<string, unknown>, options: DirectDocumentRequestV2Options): DirectDocumentSubmitRequestV2 {
  return buildDirectDocumentRequestV2('nfe', payload, options);
}

export function buildDirectNfceDocumentRequestV2(payload: Record<string, unknown>, options: DirectDocumentRequestV2Options): DirectDocumentSubmitRequestV2 {
  return buildDirectDocumentRequestV2('nfce', payload, options);
}

export function buildDirectNfseDocumentRequestV2(payload: Record<string, unknown>, options: DirectDocumentRequestV2Options): DirectDocumentSubmitRequestV2 {
  return buildDirectDocumentRequestV2('nfse', payload, options);
}

function missingFiscalCanonicalV2RequiredFields(payload: Record<string, unknown>): string[] {
  const missing = ['identificacao', 'emitente', 'tomador', 'itens'].filter((field) => !(field in payload));
  if ('itens' in payload && (!Array.isArray(payload.itens) || payload.itens.length === 0)) {
    missing.push('itens');
  }

  return missing;
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

    if (isRecord(childSchema) && '*' in childSchema) {
      const itemSchema = childSchema['*'];
      if (!Array.isArray(value) || itemSchema === true || !isRecord(itemSchema)) {
        invalid.push(path);
        continue;
      }

      value.forEach((item, index) => {
        const itemPath = `${path}.${index}`;
        if (!isRecord(item)) {
          invalid.push(itemPath);
          return;
        }

        invalid.push(...collectInvalidPaths(item, itemSchema, itemPath));
      });
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
  return (NFSE_CANONICAL_POLICY_FIELDS as readonly string[]).includes(normalized)
    ? normalized as NfsePolicyField
    : null;
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
    case 'prestador.opSimpNac':
      return 'Opcao do Simples Nacional exigida pelo layout nacional.';
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

function defaultBaseUrl(apiVersion: PublicApiVersion): string {
  return apiVersion === 'v2' ? DEFAULT_BASE_URL_V2 : DEFAULT_BASE_URL_V1;
}

function inferApiVersion(baseUrl?: string): PublicApiVersion {
  return typeof baseUrl === 'string' && /\/v2\/integrations\/?$/.test(baseUrl) ? 'v2' : 'v1';
}

function apiErrorMessage(status: number, body: unknown): string {
  if (isRecord(body) && typeof body.message === 'string') {
    return body.message;
  }
  if (isRecord(body) && typeof body.mensagem === 'string') {
    return body.mensagem;
  }

  return `NotaAgil API error ${status}`;
}

export interface NotagilClientOptions {
  baseUrl?: string;
  token: string;
  fetch?: typeof fetch;
  apiVersion?: PublicApiVersion;
}

export class NotagilApiError extends Error {
  readonly status: number;
  readonly statusCode: number;
  readonly body: unknown;
  readonly payload: unknown;
  readonly errors: unknown;
  readonly rejectionReason: unknown;
  readonly rejection_reason: unknown;
  readonly codigo: unknown;

  constructor(status: number, body: unknown) {
    super(apiErrorMessage(status, body));
    this.name = 'NotagilApiError';
    this.status = status;
    this.statusCode = status;
    this.body = body;
    this.payload = body;
    this.errors = isRecord(body) ? body.errors ?? body.erros : undefined;
    this.rejectionReason = isRecord(body) ? body.rejection_reason ?? body.motivo_rejeicao : undefined;
    this.rejection_reason = this.rejectionReason;
    this.codigo = isRecord(body) ? body.codigo : undefined;
  }
}

export class NotagilIntegrationClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly fetcher: typeof fetch;
  public readonly apiVersion: PublicApiVersion;

  constructor(options: NotagilClientOptions) {
    this.apiVersion = options.apiVersion ?? inferApiVersion(options.baseUrl);
    this.baseUrl = (options.baseUrl ?? defaultBaseUrl(this.apiVersion)).replace(/\/+$/, '');
    this.token = options.token;
    this.fetcher = options.fetch ?? fetch;
  }

  static v1(options: Omit<NotagilClientOptions, 'apiVersion'>): NotagilIntegrationClient {
    return new NotagilIntegrationClient({ ...options, baseUrl: options.baseUrl ?? DEFAULT_BASE_URL_V1, apiVersion: 'v1' });
  }

  static v2(options: Omit<NotagilClientOptions, 'apiVersion'>): NotagilIntegrationClient {
    return new NotagilIntegrationClient({ ...options, baseUrl: options.baseUrl ?? DEFAULT_BASE_URL_V2, apiVersion: 'v2' });
  }

  getApiVersion(): PublicApiVersion {
    return this.apiVersion;
  }

  listCompanies(filters: CompanyListFilters = {}): Promise<IntegrationCompany[]> {
    return this.request<IntegrationCompany[]>('/company', {
      method: 'GET',
    });
  }

  getCompany(companyId: string | number): Promise<IntegrationCompany> {
    return this.request<IntegrationCompany>(`/company/${encodeURIComponent(String(companyId))}`, {
      method: 'GET',
    });
  }

  getPublicDocsSettings(): Promise<PublicDocsSettings> {
    return this.requestFromBase<PublicDocsSettings>(this.platformBaseUrl(), this.publicDocsPath(), {
      method: 'GET',
    });
  }

  async getPublicOpenApiUrl(): Promise<string> {
    const docs = await this.getPublicDocsSettings();
    return this.publicDocsUrl(docs, 'openapi_url') ?? docs.openapi_url;
  }

  async getPublicSwaggerUrl(): Promise<string | null> {
    const docs = await this.getPublicDocsSettings();
    const url = this.publicDocsUrl(docs, 'swagger_url') ?? docs.swagger_url;
    return typeof url === 'string' && url.trim() !== '' ? url : null;
  }

  previewCompanyDocumentByOperation(
    companyId: string | number,
    operationCode: string,
    payload: OperationDocumentPreviewRequest,
  ): Promise<PreviewResult> {
    return this.request<PreviewResult>(
      `/company/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(operationCode)}/preview`,
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
      `/company/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(operationCode)}`,
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
    return this.request<DocumentAccepted>(`/company/${encodeURIComponent(String(companyId))}/direct/documents`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  transmitCompanyDirectXml(companyId: string | number, payload: DirectXmlSubmitRequest, idempotencyKey: string): Promise<DocumentAccepted> {
    return this.request<DocumentAccepted>(`/company/${encodeURIComponent(String(companyId))}/direct/documents/xml`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  getFiscalContractV2(documentType: DocumentType): Promise<FiscalContractInfo> {
    return this.request<FiscalContractInfo>(`/contratos/${encodeURIComponent(documentType)}`, {
      method: 'GET',
    });
  }

  createDirectDocumentV2(payload: DirectDocumentSubmitRequestV2, idempotencyKey: string): Promise<DocumentStatusV2> {
    return this.request<DocumentStatusV2>('/direto/documentos', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  transmitDirectXmlV2(payload: Record<string, unknown>, idempotencyKey: string): Promise<DocumentStatusV2> {
    return this.request<DocumentStatusV2>('/direto/documentos/xml', {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  getCompanyV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/empresa', {
      method: 'GET',
    });
  }

  getCompanyConfigurationV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/configuracao', {
      method: 'GET',
    });
  }

  updateCompanyConfigurationV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/configuracao', {
      method: 'PUT',
      body: payload,
    });
  }

  getNfseProviderInfoV2(params: { municipio?: string | null; ambiente_fiscal?: FiscalEnvironment } = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery('/nfse/informacoes-provedor', params), {
      method: 'GET',
    });
  }

  validateNfceCscV2(payload: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/nfce/validar-csc', {
      method: 'POST',
      body: payload,
    });
  }

  previewDocumentByOperationV2(operationCode: string, payload: OperationDocumentPreviewRequestV2): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/operacoes/${encodeURIComponent(operationCode)}/previsualizar`, {
      method: 'POST',
      body: payload,
    });
  }

  createDocumentByOperationV2(operationCode: string, payload: OperationDocumentSubmitRequestV2, idempotencyKey: string): Promise<DocumentStatusV2> {
    return this.request<DocumentStatusV2>(`/operacoes/${encodeURIComponent(operationCode)}/emitir`, {
      method: 'POST',
      headers: {
        'Idempotency-Key': idempotencyKey,
      },
      body: payload,
    });
  }

  listDocumentsV2(filters: DocumentListFiltersV2 = {}): Promise<PaginatedDocumentListV2> {
    return this.request<PaginatedDocumentListV2>(this.withQuery('/documentos', filters), {
      method: 'GET',
      unwrapData: false,
    });
  }

  getDocumentV2(externalId: string): Promise<DocumentStatusV2> {
    return this.request<DocumentStatusV2>(`/documentos/${encodeURIComponent(externalId)}`, {
      method: 'GET',
    });
  }

  async waitDocumentV2(
    externalId: string,
    options: Omit<WaitDocumentOptions, 'companyId'> & { terminalFiscalStatuses?: string[]; terminalOperationalStatuses?: string[] } = {},
  ): Promise<DocumentStatusV2> {
    const intervalMs = options.intervalMs ?? 2000;
    const timeoutMs = options.timeoutMs ?? 120000;
    const fiscalTerminals = new Set(options.terminalFiscalStatuses ?? ['autorizado', 'rejeitado', 'cancelado', 'corrigido', 'authorized', 'rejected', 'cancelled', 'corrected']);
    const operationalTerminals = new Set(options.terminalOperationalStatuses ?? ['concluido', 'falhou', 'completed', 'failed']);
    const started = Date.now();

    while (true) {
      const document = await this.getDocumentV2(externalId);
      if (fiscalTerminals.has(String(document.status_fiscal ?? document.fiscal_status)) || operationalTerminals.has(String(document.status_operacional ?? document.operational_status))) {
        return document;
      }

      if (Date.now() - started >= timeoutMs) {
        return document;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  downloadDocumentXmlV2(externalId: string, params: { ambiente_fiscal?: FiscalEnvironment } = {}): Promise<DownloadResult> {
    return this.download(this.withQuery(`/documentos/${encodeURIComponent(externalId)}/xml`, params), 'text');
  }

  downloadDocumentPdfV2(externalId: string, params: { ambiente_fiscal?: FiscalEnvironment } = {}): Promise<DownloadResult> {
    return this.download(this.withQuery(`/documentos/${encodeURIComponent(externalId)}/pdf`, params), 'base64');
  }

  getDocumentSnapshotV2(externalId: string, params: { ambiente_fiscal?: FiscalEnvironment } = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery(`/documentos/${encodeURIComponent(externalId)}/retrato`, params), {
      method: 'GET',
    });
  }

  queryDocumentV2(externalId: string, payload: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/documentos/${encodeURIComponent(externalId)}/consultar`, {
      method: 'POST',
      body: payload,
    });
  }

  cancelDocumentV2(externalId: string, justificativa: string): Promise<DocumentStatusV2> {
    return this.request<DocumentStatusV2>(`/documentos/${encodeURIComponent(externalId)}/cancelar`, {
      method: 'POST',
      body: { justificativa },
    });
  }

  correctDocumentV2(externalId: string, correcao: string, sequencia?: number): Promise<DocumentStatusV2> {
    return this.request<DocumentStatusV2>(`/documentos/${encodeURIComponent(externalId)}/corrigir`, {
      method: 'POST',
      body: {
        correcao,
        ...(sequencia === undefined ? {} : { sequencia }),
      },
    });
  }

  getCompanyDocument(companyId: string | number, externalId: string): Promise<DocumentStatus> {
    return this.request<DocumentStatus>(`/company/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(externalId)}`, {
      method: 'GET',
    });
  }

  listCompanyDocuments(companyId: string | number, filters: DocumentListFilters = {}): Promise<PaginatedDocumentList> {
    return this.request<PaginatedDocumentList>(
      this.withQuery(`/company/${encodeURIComponent(String(companyId))}/documents`, filters),
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
    return this.request<CompanyConfigurationPayload>(`/company/${encodeURIComponent(String(companyId))}/configuration`, {
      method: 'GET',
    });
  }

  updateCompanyConfiguration(companyId: string | number, payload: CompanyConfigurationPayload): Promise<CompanyConfigurationPayload> {
    return this.request<CompanyConfigurationPayload>(`/company/${encodeURIComponent(String(companyId))}/configuration`, {
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

    return this.request<NfseProviderInfo>(`/company/${encodeURIComponent(String(companyId))}/nfse/provider-info${suffix}`, {
      method: 'GET',
    });
  }

  cancelCompanyDocument(companyId: string | number, externalId: string, reason: string): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/company/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(externalId)}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  }

  correctCompanyDocument(companyId: string | number, externalId: string, correcao: string, sequencia?: number): Promise<DocumentStatus> {
    return this.request<DocumentStatus>(`/company/${encodeURIComponent(String(companyId))}/documents/${encodeURIComponent(externalId)}/correct`, {
      method: 'POST',
      body: {
        correcao,
        ...(sequencia === undefined ? {} : { sequencia }),
      },
    });
  }

  listProducts(companyId: string | number): Promise<ProductPayload[]> {
    return this.request<ProductPayload[]>(`/company/${encodeURIComponent(String(companyId))}/products`, {
      method: 'GET',
    });
  }

  getProduct(companyId: string | number, productId: string | number): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/company/${encodeURIComponent(String(companyId))}/products/${encodeURIComponent(String(productId))}`, {
      method: 'GET',
    });
  }

  createProduct(companyId: string | number, payload: ProductPayload): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/company/${encodeURIComponent(String(companyId))}/products`, {
      method: 'POST',
      body: payload,
    });
  }

  updateProduct(companyId: string | number, productId: string | number, payload: ProductPayload): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/company/${encodeURIComponent(String(companyId))}/products/${encodeURIComponent(String(productId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteProduct(companyId: string | number, productId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/company/${encodeURIComponent(String(companyId))}/products/${encodeURIComponent(String(productId))}`, {
      method: 'DELETE',
    });
  }

  listTakers(companyId: string | number): Promise<TakerPayload[]> {
    return this.request<TakerPayload[]>(`/company/${encodeURIComponent(String(companyId))}/takers`, {
      method: 'GET',
    });
  }

  getTaker(companyId: string | number, takerId: string | number): Promise<TakerPayload> {
    return this.request<TakerPayload>(`/company/${encodeURIComponent(String(companyId))}/takers/${encodeURIComponent(String(takerId))}`, {
      method: 'GET',
    });
  }

  createTaker(companyId: string | number, payload: TakerPayload): Promise<TakerPayload> {
    return this.request<TakerPayload>(`/company/${encodeURIComponent(String(companyId))}/takers`, {
      method: 'POST',
      body: payload,
    });
  }

  updateTaker(companyId: string | number, takerId: string | number, payload: TakerPayload): Promise<TakerPayload> {
    return this.request<TakerPayload>(`/company/${encodeURIComponent(String(companyId))}/takers/${encodeURIComponent(String(takerId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteTaker(companyId: string | number, takerId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/company/${encodeURIComponent(String(companyId))}/takers/${encodeURIComponent(String(takerId))}`, {
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

  getCertificateSource(companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/certificate-source', companyId), { method: 'GET' });
  }

  setCertificateSource(sourceCompanyId: string | number, companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/certificate-source', companyId), {
      method: 'PUT', body: { source_company_id: sourceCompanyId },
    });
  }

  clearCertificateSource(companyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.companyPath('/certificate-source', companyId), { method: 'DELETE' });
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

  consultIbptItem(companyId: string | number, payload: IbptItemRequest | Record<string, unknown>): Promise<IbptItemResult> {
    return this.request<IbptItemResult>(this.companyPath('/fiscal/utils/ibpt', companyId), { method: 'POST', body: payload });
  }

  consultIbptCoupon(companyId: string | number, payload: IbptCouponRequest | Record<string, unknown>): Promise<IbptCouponResult> {
    return this.request<IbptCouponResult>(this.companyPath('/fiscal/utils/ibpt/coupon', companyId), { method: 'POST', body: payload });
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
    return this.request<FiscalEmitterProfilePayload[]>(`/company/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles`, {
      method: 'GET',
    });
  }

  createEmitterProfile(companyId: string | number, payload: FiscalEmitterProfilePayload): Promise<FiscalEmitterProfilePayload> {
    return this.request<FiscalEmitterProfilePayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles`, {
      method: 'POST',
      body: payload,
    });
  }

  updateEmitterProfile(companyId: string | number, profileId: string | number, payload: FiscalEmitterProfilePayload): Promise<FiscalEmitterProfilePayload> {
    return this.request<FiscalEmitterProfilePayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteEmitterProfile(companyId: string | number, profileId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/company/${encodeURIComponent(String(companyId))}/fiscal/emitter-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'DELETE',
    });
  }

  listOperationProfiles(companyId: string | number): Promise<FiscalOperationProfilePayload[]> {
    return this.request<FiscalOperationProfilePayload[]>(`/company/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles`, {
      method: 'GET',
    });
  }

  createOperationProfile(companyId: string | number, payload: FiscalOperationProfilePayload): Promise<FiscalOperationProfilePayload> {
    return this.request<FiscalOperationProfilePayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles`, {
      method: 'POST',
      body: payload,
    });
  }

  updateOperationProfile(companyId: string | number, profileId: string | number, payload: FiscalOperationProfilePayload): Promise<FiscalOperationProfilePayload> {
    return this.request<FiscalOperationProfilePayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteOperationProfile(companyId: string | number, profileId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/company/${encodeURIComponent(String(companyId))}/fiscal/operation-profiles/${encodeURIComponent(String(profileId))}`, {
      method: 'DELETE',
    });
  }

  listProfileAssignments(companyId: string | number): Promise<FiscalProfileAssignmentPayload[]> {
    return this.request<FiscalProfileAssignmentPayload[]>(`/company/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments`, {
      method: 'GET',
    });
  }

  createProfileAssignment(companyId: string | number, payload: FiscalProfileAssignmentPayload): Promise<FiscalProfileAssignmentPayload> {
    return this.request<FiscalProfileAssignmentPayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments`, {
      method: 'POST',
      body: payload,
    });
  }

  updateProfileAssignment(companyId: string | number, assignmentId: string | number, payload: FiscalProfileAssignmentPayload): Promise<FiscalProfileAssignmentPayload> {
    return this.request<FiscalProfileAssignmentPayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments/${encodeURIComponent(String(assignmentId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteProfileAssignment(companyId: string | number, assignmentId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/company/${encodeURIComponent(String(companyId))}/fiscal/profile-assignments/${encodeURIComponent(String(assignmentId))}`, {
      method: 'DELETE',
    });
  }

  listRateReferences(companyId: string | number, filters: FiscalRateReferenceFilters = {}): Promise<FiscalRateReferencePayload[]> {
    return this.request<FiscalRateReferencePayload[]>(
      this.withQuery(`/company/${encodeURIComponent(String(companyId))}/fiscal/rate-references`, filters),
      { method: 'GET' },
    );
  }

  createRateReference(companyId: string | number, payload: FiscalRateReferencePayload): Promise<FiscalRateReferencePayload> {
    return this.request<FiscalRateReferencePayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/rate-references`, {
      method: 'POST',
      body: payload,
    });
  }

  updateRateReference(companyId: string | number, rateReferenceId: string | number, payload: FiscalRateReferencePayload): Promise<FiscalRateReferencePayload> {
    return this.request<FiscalRateReferencePayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/rate-references/${encodeURIComponent(String(rateReferenceId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteRateReference(companyId: string | number, rateReferenceId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/company/${encodeURIComponent(String(companyId))}/fiscal/rate-references/${encodeURIComponent(String(rateReferenceId))}`, {
      method: 'DELETE',
    });
  }

  listTaxRuleSets(companyId: string | number): Promise<TaxRuleSetPayload[]> {
    return this.request<TaxRuleSetPayload[]>(`/company/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets`, {
      method: 'GET',
    });
  }

  createTaxRuleSet(companyId: string | number, payload: TaxRuleSetPayload): Promise<TaxRuleSetPayload> {
    return this.request<TaxRuleSetPayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets`, {
      method: 'POST',
      body: payload,
    });
  }

  updateTaxRuleSet(companyId: string | number, taxRuleSetId: string | number, payload: TaxRuleSetPayload): Promise<TaxRuleSetPayload> {
    return this.request<TaxRuleSetPayload>(`/company/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets/${encodeURIComponent(String(taxRuleSetId))}`, {
      method: 'PUT',
      body: payload,
    });
  }

  deleteTaxRuleSet(companyId: string | number, taxRuleSetId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/company/${encodeURIComponent(String(companyId))}/fiscal/tax-rule-sets/${encodeURIComponent(String(taxRuleSetId))}`, {
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

  listCertificatesV2(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/certificados', { method: 'GET' });
  }

  createCertificateV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/certificados', { method: 'POST', body: payload });
  }

  updateCertificateV2(certificateId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/certificados/${encodeURIComponent(String(certificateId))}`, { method: 'PATCH', body: payload });
  }

  validateCertificateV2(certificateId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/certificados/${encodeURIComponent(String(certificateId))}/validar`, { method: 'POST' });
  }

  getCertificateSourceV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/certificado-origem', { method: 'GET' });
  }

  setCertificateSourceV2(sourceCompanyId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/certificado-origem', {
      method: 'PUT', body: { empresa_origem_id: sourceCompanyId },
    });
  }

  clearCertificateSourceV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/certificado-origem', { method: 'DELETE' });
  }

  getReadinessV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/prontidao', { method: 'GET' });
  }

  listOnboardingImportsV2(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/implantacao/importacoes', { method: 'GET' });
  }

  createOnboardingImportV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/implantacao/importacoes', { method: 'POST', body: payload });
  }

  getOnboardingImportV2(importId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/implantacao/importacoes/${encodeURIComponent(String(importId))}`, { method: 'GET' });
  }

  reviewOnboardingImportV2(importId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/implantacao/importacoes/${encodeURIComponent(String(importId))}/revisar`, { method: 'POST', body: payload });
  }

  promoteOnboardingImportV2(importId: string | number, payload: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/implantacao/importacoes/${encodeURIComponent(String(importId))}/promover`, { method: 'POST', body: payload });
  }

  listFiscalOptionsV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/fiscal/opcoes', { method: 'GET' });
  }

  listCfopsV2(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/fiscal/cfops', { method: 'GET' });
  }

  searchMunicipalitiesV2(params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery('/fiscal/utilitarios/municipios', params), { method: 'GET' });
  }

  searchNcmsV2(params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery('/fiscal/utilitarios/ncms', params), { method: 'GET' });
  }

  consultIbptItemV2(payload: IbptItemRequest): Promise<IbptItemResult> {
    return this.request<IbptItemResult>('/fiscal/utilitarios/ibpt', { method: 'POST', body: payload });
  }

  consultIbptCouponV2(payload: IbptCouponRequest): Promise<IbptCouponResult> {
    return this.request<IbptCouponResult>('/fiscal/utilitarios/ibpt/cupom', { method: 'POST', body: payload });
  }

  listTaxCatalogsV2(params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery('/fiscal/catalogos-tributarios', params), { method: 'GET' });
  }

  listTaxSituationsV2(catalog: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery(`/fiscal/catalogos-tributarios/${encodeURIComponent(String(catalog))}/situacoes`, params), { method: 'GET' });
  }

  listTaxClassificationsV2(situation: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery(`/fiscal/situacoes-tributarias/${encodeURIComponent(String(situation))}/classificacoes`, params), { method: 'GET' });
  }

  getTaxConsequenceTemplateV2(situation: string | number, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery(`/fiscal/situacoes-tributarias/${encodeURIComponent(String(situation))}/modelo-consequencia`, params), { method: 'GET' });
  }

  listUnifiedDocumentsV2(params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery('/consulta-notas', params), { method: 'GET' });
  }

  lookupUnifiedDocumentV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/consulta-notas/consultar', { method: 'POST', body: payload });
  }

  downloadUnifiedDocumentXmlV2(source: 'inbound' | 'outbound' | string, documentId: string | number): Promise<DownloadResult> {
    return this.download(`/consulta-notas/${encodeURIComponent(source)}/${encodeURIComponent(String(documentId))}/xml`, 'text');
  }

  downloadUnifiedDocumentPdfV2(source: 'inbound' | 'outbound' | string, documentId: string | number): Promise<DownloadResult> {
    return this.download(`/consulta-notas/${encodeURIComponent(source)}/${encodeURIComponent(String(documentId))}/pdf`, 'base64');
  }

  syncInboundNfeV2(payload: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/nfe/entrada/sincronizar', { method: 'POST', body: payload, unwrapData: false });
  }

  listInboundNfeV2(params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(this.withQuery('/nfe/entrada', params), { method: 'GET', unwrapData: false });
  }

  manifestInboundNfeV2(documentId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/nfe/entrada/${encodeURIComponent(String(documentId))}/manifestar`, { method: 'POST', body: payload, unwrapData: false });
  }

  downloadInboundNfeXmlV2(documentId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/nfe/entrada/${encodeURIComponent(String(documentId))}/baixar-xml`, { method: 'POST', unwrapData: false });
  }

  updateInboundNfeEntryBookkeepingV2(documentId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/nfe/entrada/${encodeURIComponent(String(documentId))}/escrituracao`, { method: 'POST', body: payload, unwrapData: false });
  }

  confirmInboundNfeEntryBookkeepingV2(documentId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/nfe/entrada/${encodeURIComponent(String(documentId))}/escrituracao/confirmar`, { method: 'POST', unwrapData: false });
  }

  listProductsV2(): Promise<ProductPayload[]> {
    return this.request<ProductPayload[]>('/produtos', { method: 'GET' });
  }

  getProductV2(productId: string | number): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/produtos/${encodeURIComponent(String(productId))}`, { method: 'GET' });
  }

  createProductV2(payload: ProductPayload): Promise<ProductPayload> {
    return this.request<ProductPayload>('/produtos', { method: 'POST', body: payload });
  }

  updateProductV2(productId: string | number, payload: ProductPayload): Promise<ProductPayload> {
    return this.request<ProductPayload>(`/produtos/${encodeURIComponent(String(productId))}`, { method: 'PUT', body: payload });
  }

  deleteProductV2(productId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/produtos/${encodeURIComponent(String(productId))}`, { method: 'DELETE' });
  }

  listProductCatalogV2(resource: ProductCatalogResource, params: Record<string, string | number | boolean | null | undefined> = {}): Promise<ProductCatalogPayload[]> {
    return this.request<ProductCatalogPayload[]>(this.withQuery(`/produtos/catalogo/${encodeURIComponent(resource)}`, params), { method: 'GET' });
  }

  getProductCatalogV2(resource: ProductCatalogResource, id: string | number): Promise<ProductCatalogPayload> {
    return this.request<ProductCatalogPayload>(`/produtos/catalogo/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, { method: 'GET' });
  }

  createProductCatalogV2(resource: ProductCatalogResource, payload: ProductCatalogPayload): Promise<ProductCatalogPayload> {
    return this.request<ProductCatalogPayload>(`/produtos/catalogo/${encodeURIComponent(resource)}`, { method: 'POST', body: payload });
  }

  updateProductCatalogV2(resource: ProductCatalogResource, id: string | number, payload: ProductCatalogPayload): Promise<ProductCatalogPayload> {
    return this.request<ProductCatalogPayload>(`/produtos/catalogo/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, { method: 'PUT', body: payload });
  }

  deleteProductCatalogV2(resource: ProductCatalogResource, id: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/produtos/catalogo/${encodeURIComponent(resource)}/${encodeURIComponent(String(id))}`, { method: 'DELETE' });
  }

  listTakersV2(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/tomadores', { method: 'GET' });
  }

  getTakerV2(takerId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/tomadores/${encodeURIComponent(String(takerId))}`, { method: 'GET' });
  }

  createTakerV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/tomadores', { method: 'POST', body: payload });
  }

  updateTakerV2(takerId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/tomadores/${encodeURIComponent(String(takerId))}`, { method: 'PUT', body: payload });
  }

  deleteTakerV2(takerId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/tomadores/${encodeURIComponent(String(takerId))}`, { method: 'DELETE' });
  }

  listOperationProfilesV2(params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery('/fiscal/perfis-operacao', params), { method: 'GET' });
  }

  createOperationProfileV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/fiscal/perfis-operacao', { method: 'POST', body: payload });
  }

  updateOperationProfileV2(profileId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/fiscal/perfis-operacao/${encodeURIComponent(String(profileId))}`, { method: 'PUT', body: payload });
  }

  deleteOperationProfileV2(profileId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/fiscal/perfis-operacao/${encodeURIComponent(String(profileId))}`, { method: 'DELETE' });
  }

  listRateReferencesV2(params: Record<string, string | number | boolean | null | undefined> = {}): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(this.withQuery('/fiscal/referencias-aliquotas', params), { method: 'GET' });
  }

  createRateReferenceV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/fiscal/referencias-aliquotas', { method: 'POST', body: payload });
  }

  updateRateReferenceV2(rateReferenceId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/fiscal/referencias-aliquotas/${encodeURIComponent(String(rateReferenceId))}`, { method: 'PUT', body: payload });
  }

  deleteRateReferenceV2(rateReferenceId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/fiscal/referencias-aliquotas/${encodeURIComponent(String(rateReferenceId))}`, { method: 'DELETE' });
  }

  listTaxRuleSetsV2(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/fiscal/conjuntos-regras-tributarias', { method: 'GET' });
  }

  createTaxRuleSetV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/fiscal/conjuntos-regras-tributarias', { method: 'POST', body: payload });
  }

  updateTaxRuleSetV2(taxRuleSetId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/fiscal/conjuntos-regras-tributarias/${encodeURIComponent(String(taxRuleSetId))}`, { method: 'PUT', body: payload });
  }

  deleteTaxRuleSetV2(taxRuleSetId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/fiscal/conjuntos-regras-tributarias/${encodeURIComponent(String(taxRuleSetId))}`, { method: 'DELETE' });
  }

  listSchedulesV2(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/agendamentos', { method: 'GET' });
  }

  createScheduleV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/agendamentos', { method: 'POST', body: payload });
  }

  updateScheduleV2(scheduleId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/agendamentos/${encodeURIComponent(String(scheduleId))}`, { method: 'PUT', body: payload });
  }

  deleteScheduleV2(scheduleId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/agendamentos/${encodeURIComponent(String(scheduleId))}`, { method: 'DELETE' });
  }

  listWebhooksV2(): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>('/notificacoes-web', { method: 'GET' });
  }

  createWebhookV2(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/notificacoes-web', { method: 'POST', body: payload });
  }

  updateWebhookV2(webhookId: string | number, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/notificacoes-web/${encodeURIComponent(String(webhookId))}`, { method: 'PUT', body: payload });
  }

  deleteWebhookV2(webhookId: string | number): Promise<DeleteResult> {
    return this.request<DeleteResult>(`/notificacoes-web/${encodeURIComponent(String(webhookId))}`, { method: 'DELETE' });
  }

  rotateWebhookSecretV2(webhookId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/notificacoes-web/${encodeURIComponent(String(webhookId))}/rotacionar-segredo`, { method: 'POST' });
  }

  testWebhookV2(webhookId: string | number): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>(`/notificacoes-web/${encodeURIComponent(String(webhookId))}/testar`, { method: 'POST' });
  }

  listWebhookDeliveriesV2(webhookId: string | number): Promise<Record<string, unknown>[]> {
    return this.request<Record<string, unknown>[]>(`/notificacoes-web/${encodeURIComponent(String(webhookId))}/entregas`, { method: 'GET' });
  }

  getMetricsV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/metricas', { method: 'GET' });
  }

  getBillingV2(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/cobranca', { method: 'GET' });
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
    return `/company/${encodeURIComponent(String(companyId))}${path}`;
  }

  private documentArtifactPath(externalId: string, artifact: 'xml' | 'pdf' | 'snapshot' | 'query', companyId: string | number): string {
    return this.companyPath(`/documents/${encodeURIComponent(externalId)}/${artifact}`, companyId);
  }

  private publicDocsPath(): string {
    return this.apiVersion === 'v2' ? '/public/docs?version=v2' : '/public/docs';
  }

  private publicDocsUrl(docs: PublicDocsSettings, field: 'openapi_url' | 'swagger_url'): string | undefined {
    const url = docs.versions?.[this.apiVersion]?.[field] ?? docs[field];
    if (this.apiVersion === 'v2' && typeof url === 'string') {
      return url.replace('/v1/integrations', '/v2/integrations');
    }

    return url;
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

    if (parsed && typeof parsed === 'object' && 'data' in parsed) {
      return (parsed as { data: T }).data;
    }
    if (parsed && typeof parsed === 'object' && 'dados' in parsed) {
      return (parsed as { dados: T }).dados;
    }

    return parsed as T;
  }

  private platformBaseUrl(): string {
    return this.baseUrl.replace(/\/v[12]\/integrations$/, '');
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
