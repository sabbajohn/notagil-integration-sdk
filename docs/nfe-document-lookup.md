# Consultar NF-e e obter o XML

Os SDKs PHP e TypeScript separam quatro operações. Os métodos com sufixo `V2` usam a empresa do token; os equivalentes sem sufixo recebem `companyId`.

| Método V2 | Finalidade | Retorno |
| --- | --- | --- |
| `lookupStoredDocumentV2` | `nota_armazenada` | Metadados já armazenados, sem consulta remota |
| `lookupSefazStatusV2` | `situacao_sefaz` | Situação/protocolo da NF-e modelo 55, sem XML |
| `lookupNfeDistributionV2` | `distribuicao_dfe` | Metadados ou resumo da distribuição nacional NF-e |
| `downloadStoredUnifiedDocumentXmlV2` | GET separado com `somente_armazenado=true` | Bytes originais do XML armazenado, sem recuperação remota |

As três consultas retornam `resultado_consulta` com `finalidade`, `conteudo` (`metadados_nota`, `situacao_protocolo` ou `resumo_nfe`) e `inclui_xml: false`. Mesmo quando `possui_xml=true`, os bytes não estão na resposta da consulta. Distribuição pode armazenar o documento completo, mas seu retorno continua sendo metadados; se houver somente resumo, não há XML completo disponível.

`lookupStoredDocumentV2` aceita os tipos de documento suportados pela consulta local. Os dois helpers remotos são exclusivos de NF-e modelo 55 e usam `tipo_documento: 'nfe'` quando omitido. Uma consulta de situação não comprova que a empresa é participante da nota e não reconstrói o XML a partir do protocolo.

## TypeScript

```ts
const key = process.env.NFE_ACCESS_KEY!;
const input = {
  chave_documento: key,
  tipo_documento: 'nfe' as const,
  ambiente_fiscal: 'producao' as const,
};

// Escolha somente a operação necessária. Estes exemplos são independentes.
const stored = await client.lookupStoredDocumentV2(input);
const status = await client.lookupSefazStatusV2(input);
const distributed = await client.lookupNfeDistributionV2(input);

// Use origem/id de uma nota armazenada, não origem=status_query.
const xml = await client.downloadStoredUnifiedDocumentXmlV2(stored.origem as string, stored.id as string, {
  ambiente_fiscal: 'producao',
});
// xml.content é ArrayBuffer: mantenha os bytes ao gravar/transmitir o original.
```

## PHP

```php
$input = [
    'chave_documento' => getenv('NFE_ACCESS_KEY'),
    'tipo_documento' => 'nfe',
    'ambiente_fiscal' => 'producao',
];

// Escolha somente a operação necessária. Estes exemplos são independentes.
$stored = $client->lookupStoredDocumentV2($input);
$status = $client->lookupSefazStatusV2($input);
$distributed = $client->lookupNfeDistributionV2($input);

$xml = $client->downloadStoredUnifiedDocumentXmlV2($stored['origem'], $stored['id'], [
    'ambiente_fiscal' => 'producao',
]);
// $xml['content'] contém os bytes originais, sem reconstrução do XML.
```

Informe o ambiente explicitamente. Quando omitido, a API usa homologação, inclusive para leitura armazenada. A leitura armazenada nunca muda de ambiente nem tenta SEFAZ/distribuição como alternativa.

## Limites e ausência de XML

- A chave não concede acesso universal. A distribuição nacional exige vínculo autorizado do interessado, janela de disponibilidade de até 90 dias e respeito às quotas por CNPJ/ambiente. Uma chamada explícita de distribuição consulta o serviço e consome quota, mesmo quando já existe uma nota local.
- A distribuição nacional não recupera XML das notas do próprio emitente. Preserve o arquivo original no sistema emissor ou em backup. Consulta de protocolo não substitui esse arquivo.
- Resumo de destinatário e XML completo são diferentes. A disponibilidade do XML depende das regras e eventos aplicáveis; os helpers não enviam manifestação automaticamente.
- Falhas de autorização, certificado, ambiente, disponibilidade ou quota são erros, não sucesso sem XML. Em HTTP 429, respeite `Retry-After`/`detalhes.tentar_apos_segundos`; não repita automaticamente a consulta.
- O download armazenado propaga 404 quando não há original disponível e não tenta outro serviço. Um resumo não deve ser salvo como se fosse a nota completa. O SDK propaga os erros da API sem fallback, retry ou manifestação.

## Compatibilidade e API por empresa

`lookupUnifiedDocumentV2(payload)` e `lookupUnifiedDocument(payload, companyId)` continuam aceitando o contrato anterior. Os helpers novos escolhem `finalidade` e rejeitam a presença de flags legados, mesmo `false` ou `null`, antes de enviar HTTP. Não combine `finalidade` com `consulta_remota`/`forcar_consulta_remota` na v2 ou `remote_lookup`/`force_remote` na API por empresa.

Na API por empresa, use `lookupStoredDocument`, `lookupSefazStatus` e `lookupNfeDistribution` com `document_key`, `document_type` e `fiscal_environment`, seguidos de `companyId`. O download é `downloadStoredUnifiedDocumentXml(source, documentId, companyId, { fiscal_environment: 'producao' })` em TypeScript, ou o array equivalente em PHP.

Os downloads anteriores `downloadUnifiedDocumentXml[V2]` preservam a assinatura existente e o retorno em texto. Aceitam agora um último argumento opcional com `somente_armazenado` e o ambiente correspondente à versão. Prefira o helper `downloadStoredUnifiedDocumentXml[V2]` para preservar bytes e impedir recuperação remota.

Esses helpers exigem uma versão da API que implemente `finalidade` e `somente_armazenado`. Não há fallback para uma API antiga. Os testes do SDK usam somente fixtures e mocks; não comprovam disponibilidade de uma nota real na SEFAZ.
