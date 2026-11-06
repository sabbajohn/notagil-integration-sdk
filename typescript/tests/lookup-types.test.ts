import { NotagilIntegrationClient } from '../src/index.js';
import type { UnifiedDocumentLookupResult } from '../src/index.js';

// Compile-only contract checks. No client or network request is created at runtime.
function checkLookupTypes(client: NotagilIntegrationClient): void {
  const input = { chave_documento: 'fixture-key', ambiente_fiscal: 'producao' as const };
  const metadata: Promise<UnifiedDocumentLookupResult> = client.lookupStoredDocumentV2(input);
  void metadata.then((result) => {
    const includesXml: false = result.resultado_consulta.inclui_xml;
    void includesXml;
  });
  void client.lookupSefazStatusV2(input);
  void client.lookupNfeDistributionV2(input);
  void client.lookupStoredDocumentV2({ ...input, tipo_documento: 'nfce' });
  void client.lookupStoredDocument({ document_key: 'fixture-key' }, 'company');
  void client.lookupSefazStatus({ document_key: 'fixture-key' }, 'company');
  void client.lookupNfeDistribution({ document_key: 'fixture-key' }, 'company');
  void client.downloadStoredUnifiedDocumentXmlV2('outbound', 'id').then((result) => {
    const bytes: ArrayBuffer = result.content;
    void bytes;
  });
  void client.downloadStoredUnifiedDocumentXml('outbound', 'id', 'company').then((result) => {
    const bytes: ArrayBuffer = result.content;
    void bytes;
  });
  // Existing methods retain legacy flags and optional stored-only query support.
  void client.lookupUnifiedDocumentV2({ chave_documento: 'fixture-key', consulta_remota: false });
  void client.downloadUnifiedDocumentXmlV2('outbound', 'id', { somente_armazenado: true });
  // @ts-expect-error Explicit lookup helpers cannot combine purpose and legacy flags.
  void client.lookupStoredDocumentV2({ ...input, consulta_remota: false });
  // @ts-expect-error Helper names select the purpose.
  void client.lookupStoredDocumentV2({ ...input, finalidade: 'nota_armazenada' });
  // @ts-expect-error NF-e status lookup is model 55 only.
  void client.lookupSefazStatusV2({ ...input, tipo_documento: 'nfce' });
  // @ts-expect-error Distribution is NF-e only.
  void client.lookupNfeDistributionV2({ ...input, tipo_documento: 'nfse' });
  // @ts-expect-error Legacy explicit lookup helpers also exclude remote flags.
  void client.lookupStoredDocument({ document_key: 'fixture-key', remote_lookup: false }, 'company');
  // @ts-expect-error Stored XML helpers cannot enable remote retrieval.
  void client.downloadStoredUnifiedDocumentXmlV2('outbound', 'id', { somente_armazenado: false });
}
void checkLookupTypes;
