import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { NotagilApiError, NotagilIntegrationClient } from '../dist/index.js';

const DEFAULT_BASE_URL = 'https://api.notagil.com.br/api/v1/integrations';
const DEFAULT_REQUEST_FILE = './tests/fixtures/e2e-operation-request.sample.json';

function env(name, fallback = undefined) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    return fallback;
  }
  return value;
}

function requiredEnv(name) {
  const value = env(name);
  if (!value) {
    throw new Error(`Variavel obrigatoria ausente: ${name}`);
  }
  return value;
}

function parseBooleanEnv(name, fallback) {
  const value = env(name);
  if (value === undefined) {
    return fallback;
  }

  switch (String(value).trim().toLowerCase()) {
    case '1':
    case 'true':
    case 'yes':
    case 'on':
    case 'enabled':
      return true;
    case '0':
    case 'false':
    case 'no':
    case 'off':
    case 'disabled':
      return false;
    default:
      throw new Error(`Variavel ${name} invalida: '${value}'. Use true/false, on/off ou 1/0.`);
  }
}

function parseIntegerEnv(name, fallback) {
  const raw = env(name);
  if (raw === undefined) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Variavel ${name} invalida: '${raw}'. Informe um inteiro positivo.`);
  }
  return parsed;
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function loadJsonFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(`Arquivo JSON invalido em ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!isObject(parsed)) {
    throw new Error(`Arquivo ${filePath} deve conter um objeto JSON na raiz.`);
  }

  return parsed;
}

function compactTimestamp() {
  return new Date().toISOString().replace(/\D/g, '').slice(0, 14);
}

function isoDate() {
  return new Date().toISOString().slice(0, 10);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function logStep(message) {
  process.stdout.write(`[e2e] ${message}\n`);
}

function buildExternalId(prefix) {
  return `${prefix}-${compactTimestamp()}-${randomUUID().slice(0, 8)}`;
}

async function resolveCompanyId(client, configuredCompanyId) {
  if (configuredCompanyId !== undefined) {
    return configuredCompanyId;
  }

  const companies = await client.listCompanies();
  assert.ok(Array.isArray(companies) && companies.length > 0, 'Nenhuma empresa disponivel para o token informado.');
  const [firstCompany] = companies;
  assert.ok(firstCompany && firstCompany.id !== undefined && firstCompany.id !== null, 'Resposta de empresas sem id valido.');
  return firstCompany.id;
}

function snapshotFromTemplate(template) {
  if (!('snapshot' in template) || !isObject(template.snapshot)) {
    throw new Error('O arquivo de request precisa conter "snapshot" (objeto).');
  }

  const snapshot = { ...template.snapshot };
  snapshot.fiscal_environment = 'homologacao';
  snapshot.reference_date = snapshot.reference_date ?? isoDate();

  if (!Array.isArray(snapshot.items) || snapshot.items.length === 0) {
    throw new Error('snapshot.items deve conter ao menos um item.');
  }

  return snapshot;
}

function snapshotForSequence(baseSnapshot, sequence) {
  const snapshot = deepClone(baseSnapshot);
  if (isObject(snapshot.document_data) && snapshot.document_data.numero !== undefined && snapshot.document_data.numero !== null) {
    const rawNumber = String(snapshot.document_data.numero);
    if (/^\d+$/.test(rawNumber)) {
      const nextValue = (BigInt(rawNumber) + BigInt(sequence)).toString();
      snapshot.document_data.numero = nextValue.padStart(rawNumber.length, '0');
    } else {
      snapshot.document_data.numero = `${rawNumber}-${sequence}`;
    }
  }
  return snapshot;
}

async function waitForFiscalStatus(client, companyId, externalId, targetStatuses, options = {}) {
  const timeoutMs = options.timeoutMs ?? 240_000;
  const intervalMs = options.intervalMs ?? 4_000;
  const failFastStatuses = new Set(options.failFastStatuses ?? []);
  const startedAt = Date.now();
  let lastDocument = null;

  while (Date.now() - startedAt <= timeoutMs) {
    lastDocument = await client.getCompanyDocument(companyId, externalId);
    const fiscalStatus = String(lastDocument.fiscal_status ?? '').toLowerCase();
    const operationalStatus = String(lastDocument.operational_status ?? '').toLowerCase();

    if (targetStatuses.has(fiscalStatus)) {
      return lastDocument;
    }

    if (failFastStatuses.has(fiscalStatus) || failFastStatuses.has(operationalStatus)) {
      throw new Error(
        `Documento entrou em status terminal inesperado. fiscal_status=${fiscalStatus || 'null'} operational_status=${operationalStatus || 'null'}`,
      );
    }

    await sleep(intervalMs);
  }

  const fiscalStatus = String(lastDocument?.fiscal_status ?? '').toLowerCase() || 'null';
  const operationalStatus = String(lastDocument?.operational_status ?? '').toLowerCase() || 'null';
  throw new Error(
    `Timeout aguardando status fiscal ${Array.from(targetStatuses).join(', ')}. Ultimo estado: fiscal_status=${fiscalStatus} operational_status=${operationalStatus}.`,
  );
}

async function run() {
  const token = requiredEnv('NOTAGIL_TOKEN');
  const baseUrl = env('NOTAGIL_BASE_URL', DEFAULT_BASE_URL);
  const requestFilePath = path.resolve(process.cwd(), env('NOTAGIL_E2E_REQUEST_FILE', DEFAULT_REQUEST_FILE));
  const configuredCompanyId = env('NOTAGIL_E2E_COMPANY_ID');
  const intervalMs = parseIntegerEnv('NOTAGIL_E2E_INTERVAL_MS', 4_000);
  const timeoutMs = parseIntegerEnv('NOTAGIL_E2E_TIMEOUT_MS', 240_000);
  const enableCorrection = parseBooleanEnv('NOTAGIL_E2E_ENABLE_CORRECTION', true);
  const enableCancellation = parseBooleanEnv('NOTAGIL_E2E_ENABLE_CANCELLATION', true);

  const requestTemplate = await loadJsonFile(requestFilePath);
  const operationCode = env('NOTAGIL_E2E_OPERATION_CODE', String(requestTemplate.operation_code ?? '')).trim();
  const documentType = env('NOTAGIL_E2E_DOCUMENT_TYPE', String(requestTemplate.document_type ?? 'nfce')).trim().toLowerCase();

  if (!operationCode) {
    throw new Error('Informe NOTAGIL_E2E_OPERATION_CODE ou operation_code no arquivo de request.');
  }

  if (!['nfe', 'nfce', 'nfse'].includes(documentType)) {
    throw new Error(`document_type invalido: '${documentType}'. Use nfe, nfce ou nfse.`);
  }

  const client = new NotagilIntegrationClient({ baseUrl, token });
  const companyId = await resolveCompanyId(client, configuredCompanyId);
  const baseSnapshot = snapshotFromTemplate(requestTemplate);
  const correctionSnapshot = snapshotForSequence(baseSnapshot, 1);
  const cancellationSnapshot = snapshotForSequence(baseSnapshot, 2);

  const externalPrefix = env('NOTAGIL_E2E_EXTERNAL_ID_PREFIX', 'sdk-e2e');
  const baseExternalId = buildExternalId(externalPrefix);
  const correctionExternalId = `${baseExternalId}-corr`;
  const cancellationExternalId = `${baseExternalId}-cancel`;
  const previewExternalId = `${baseExternalId}-preview`;
  const idempotencyKeyCorrection = env('NOTAGIL_E2E_IDEMPOTENCY_KEY_CORRECTION', `idem-${correctionExternalId}`);
  const idempotencyKeyCancellation = env('NOTAGIL_E2E_IDEMPOTENCY_KEY_CANCELLATION', `idem-${cancellationExternalId}`);
  const correctionText = env(
    'NOTAGIL_E2E_CORRECTION_TEXT',
    `Correcao automatica SDK E2E em ${new Date().toISOString()}`,
  );
  const cancelReason = env(
    'NOTAGIL_E2E_CANCEL_REASON',
    `Cancelamento de homologacao automatizado pelo SDK E2E ${new Date().toISOString()}`,
  );

  logStep(`baseUrl=${baseUrl}`);
  logStep(`companyId=${companyId}`);
  logStep(`operationCode=${operationCode}`);
  logStep(`documentType=${documentType}`);
  logStep(`requestFile=${requestFilePath}`);
  logStep(`externalId(base)=${baseExternalId}`);

  logStep('1/9 preview de emissao por operation_code');
  const preview = await client.previewCompanyDocumentByOperation(
    companyId,
    operationCode,
    {
      external_id: previewExternalId,
      document_type: documentType,
      snapshot: correctionSnapshot,
      ...(requestTemplate.municipio === undefined ? {} : { municipio: requestTemplate.municipio }),
      ...(isObject(requestTemplate.metadata) ? { metadata: requestTemplate.metadata } : {}),
    },
  );
  assert.equal(Boolean(preview?.emission_allowed), true, `Preview bloqueado. resolution_status=${String(preview?.resolution_status ?? 'null')}`);

  logStep('2/9 emissao do documento para fluxo de correcao');
  const correctionAccepted = await client.createCompanyDocumentByOperation(
    companyId,
    operationCode,
    {
      external_id: correctionExternalId,
      document_type: documentType,
      snapshot: correctionSnapshot,
      ...(requestTemplate.municipio === undefined ? {} : { municipio: requestTemplate.municipio }),
      ...(isObject(requestTemplate.metadata) ? { metadata: requestTemplate.metadata } : {}),
    },
    idempotencyKeyCorrection,
  );
  assert.ok(correctionAccepted && correctionAccepted.id !== undefined && correctionAccepted.id !== null, 'Emissao de correcao nao retornou id.');

  logStep('3/9 consulta e espera de autorizacao (fluxo de correcao)');
  const authorizedForCorrection = await waitForFiscalStatus(
    client,
    companyId,
    correctionExternalId,
    new Set(['authorized']),
    {
      intervalMs,
      timeoutMs,
      failFastStatuses: ['rejected', 'failed', 'denied'],
    },
  );
  logStep(`documento de correcao autorizado com fiscal_status=${String(authorizedForCorrection.fiscal_status)}`);

  logStep('4/9 consulta remota do documento de correcao (query)');
  const queryCorrection = await client.queryDocument(correctionExternalId, companyId, true);
  assert.ok(isObject(queryCorrection), 'Resposta invalida em queryDocument (correcao).');
  assert.ok(isObject(queryCorrection.document), 'queryDocument (correcao) nao retornou campo document.');

  if (enableCorrection) {
    logStep('5/9 carta de correcao');
    const corrected = await client.correctCompanyDocument(companyId, correctionExternalId, correctionText);
    assert.ok(corrected && corrected.id !== undefined, 'Resposta invalida da carta de correcao.');

    const correctedFinal = await waitForFiscalStatus(
      client,
      companyId,
      correctionExternalId,
      new Set(['corrected']),
      {
        intervalMs,
        timeoutMs,
        failFastStatuses: ['rejected', 'failed', 'cancelled'],
      },
    );
    logStep(`documento corrigido com fiscal_status=${String(correctedFinal.fiscal_status)} external_id=${correctionExternalId}`);
  } else {
    logStep('5/9 carta de correcao desativada por NOTAGIL_E2E_ENABLE_CORRECTION');
  }

  logStep('6/9 emissao do documento para fluxo de cancelamento');
  const cancellationAccepted = await client.createCompanyDocumentByOperation(
    companyId,
    operationCode,
    {
      external_id: cancellationExternalId,
      document_type: documentType,
      snapshot: cancellationSnapshot,
      ...(requestTemplate.municipio === undefined ? {} : { municipio: requestTemplate.municipio }),
      ...(isObject(requestTemplate.metadata) ? { metadata: requestTemplate.metadata } : {}),
    },
    idempotencyKeyCancellation,
  );
  assert.ok(cancellationAccepted && cancellationAccepted.id !== undefined && cancellationAccepted.id !== null, 'Emissao de cancelamento nao retornou id.');

  logStep('7/9 consulta e espera de autorizacao (fluxo de cancelamento)');
  const authorizedForCancellation = await waitForFiscalStatus(
    client,
    companyId,
    cancellationExternalId,
    new Set(['authorized']),
    {
      intervalMs,
      timeoutMs,
      failFastStatuses: ['rejected', 'failed', 'denied'],
    },
  );
  logStep(`documento de cancelamento autorizado com fiscal_status=${String(authorizedForCancellation.fiscal_status)}`);

  if (enableCancellation) {
    logStep('8/9 cancelamento');
    const cancelledResponse = await client.cancelCompanyDocument(companyId, cancellationExternalId, cancelReason);
    assert.ok(isObject(cancelledResponse), 'Resposta invalida do cancelamento.');

    const cancelledFinal = await waitForFiscalStatus(
      client,
      companyId,
      cancellationExternalId,
      new Set(['cancelled']),
      {
        intervalMs,
        timeoutMs,
        failFastStatuses: ['rejected', 'failed', 'denied'],
      },
    );
    logStep(`documento cancelado com fiscal_status=${String(cancelledFinal.fiscal_status)} external_id=${cancellationExternalId}`);
  } else {
    logStep('8/9 cancelamento desativado por NOTAGIL_E2E_ENABLE_CANCELLATION');
  }

  logStep('9/9 consulta final');
  const finalCorrection = await client.getCompanyDocument(companyId, correctionExternalId);
  const finalCancellation = await client.getCompanyDocument(companyId, cancellationExternalId);
  assert.ok(finalCorrection && finalCorrection.id !== undefined, 'Consulta final do fluxo de correcao sem id.');
  assert.ok(finalCancellation && finalCancellation.id !== undefined, 'Consulta final do fluxo de cancelamento sem id.');
  logStep(
    `fluxo E2E concluido. correcao_fiscal_status=${String(finalCorrection.fiscal_status ?? 'null')} cancelamento_fiscal_status=${String(finalCancellation.fiscal_status ?? 'null')}`,
  );
}

run().catch((error) => {
  if (error instanceof NotagilApiError) {
    process.stderr.write(`[e2e] Falha de API. status=${error.status} body=${JSON.stringify(error.body)}\n`);
  } else if (error instanceof Error) {
    process.stderr.write(`[e2e] ${error.message}\n`);
  } else {
    process.stderr.write(`[e2e] ${String(error)}\n`);
  }
  process.exitCode = 1;
});
