# NotaAgil Integration SDK

SDKs oficiais para integrar sistemas externos com a API publica da NotaAgil.

Este repositorio publica dois pacotes a partir do mesmo codigo fonte:

- PHP/Composer: `notagil/integration-sdk`
- TypeScript/npm: `@notagil/integration-sdk`

Use o SDK para cadastrar e consultar empresas, consultar configuracoes fiscais, montar previews, emitir documentos por operacao, emitir documentos por payload direto, acompanhar processamento, baixar XML/PDF, consultar IBPT, gerenciar produtos/tomadores/webhooks e consumir as rotas v2 da plataforma.

## Versao Atual

Release atual: `v0.4.1`.

Principais pontos:

- Superficie v2 explicita nos SDKs PHP e TypeScript.
- Helpers para contratos fiscais v2 e builders de emissao direta.
- Contrato publico recomendado `FiscalCanonicalPayloadV2` para novos terceiros; o contrato direto de NFSe Nacional fica reservado para fluxos internos/controlados.
- Documentacao de integracao detalhada para fluxos v1/v2.
- NFSe Nacional: `prestador.omitirIM` nao deve ser enviado; informe `prestador.inscricaoMunicipal` quando houver inscricao municipal.
- NFSe Nacional: `servico.cNBS` deve ser enviado com 9 digitos, sem pontos.

## Pacotes

### PHP

```sh
composer require notagil/integration-sdk:^0.4.1
```

O pacote Composer usa o `composer.json` da raiz e carrega as classes de `php/src`.

### TypeScript

```sh
npm install @notagil/integration-sdk@^0.4.1
```

O pacote npm e publicado a partir do diretorio `typescript/`.

## Base URLs

Use as URLs padrao quando estiver integrando contra a API publica da NotaAgil:

```text
v1: https://api_notagil.sabbasistemas.com.br/api/v1/integrations
v2: https://api_notagil.sabbasistemas.com.br/api/v2/integrations
```

A v1 e orientada a empresa (`company/{id}`) e mantem compatibilidade com fluxos existentes.

A v2 e a superficie preferida para novos consumidores: usa campos publicos em portugues, `snake_case`, envelope `dados` nas respostas e rotas que dependem da empresa vinculada ao token quando aplicavel.

## Autenticacao

Todas as chamadas exigem token de integracao:

```http
Authorization: Bearer <NOTAGIL_TOKEN>
```

Emissoes e operacoes mutaveis devem usar chave de idempotencia quando o metodo aceitar:

```http
Idempotency-Key: erp-documento-0001
```

Recomendacao:

- Guarde `NOTAGIL_TOKEN` em variavel de ambiente.
- Gere `external_id` estavel no seu ERP/PDV.
- Use o mesmo valor de `external_id` ou um derivado como `Idempotency-Key`.
- Nunca gere nova chave de idempotencia para uma simples tentativa de retry do mesmo documento.

## Escolhendo v1 ou v2

Use v1 quando:

- A integracao ja usa `company_id` explicitamente.
- O fluxo principal e emissao por `operation_code`.
- Voce precisa manter aliases legados enquanto migra o consumidor.

Use v2 quando:

- A integracao e nova.
- O token ja identifica a empresa/tenant.
- Voce quer contratos publicos em portugues.
- Voce precisa usar rotas companyless, contratos fiscais v2, catalogos fiscais v2 ou emissao direta com `FiscalCanonicalPayloadV2`.

## Inicio Rapido PHP

```php
use NotaAgil\Integration\NotaAgilClient;

$token = getenv('NOTAGIL_TOKEN');

$client = new NotaAgilClient(
    baseUrl: NotaAgilClient::DEFAULT_BASE_URL_V1,
    token: $token,
);

$companies = $client->companies();
$companyId = (string) $companies[0]['id'];

$docs = $client->publicDocs();
echo $docs['openapi_url'] . PHP_EOL;

$v2 = NotaAgilClient::v2(token: $token);
$contract = $v2->fiscalContractV2('nfce');
```

## Inicio Rapido TypeScript

```ts
import { NotagilIntegrationClient } from '@notagil/integration-sdk';

const token = process.env.NOTAGIL_TOKEN!;

const client = NotagilIntegrationClient.v1({ token });
const companies = await client.listCompanies();
const companyId = companies[0].id;

const docs = await client.getPublicDocsSettings();
console.log(docs.openapi_url);

const v2 = NotagilIntegrationClient.v2({ token });
const contract = await v2.getFiscalContractV2('nfce');
console.log(contract.contrato);
```

## Fluxo Recomendado de Emissao

1. Cadastre ou confirme a empresa emissora.
2. Configure certificado, regime tributario, ambiente fiscal e provedores.
3. Consulte prontidao/configuracao antes de emitir.
4. Monte o payload usando `operation_code` ou contrato direto.
5. Rode preview quando estiver usando emissao por operacao.
6. Emita com `external_id` estavel e `Idempotency-Key`.
7. Aguarde o documento usando `waitDocument`/`waitDocumentV2`.
8. Normalize a resposta com `normalizeDocumentResponse`.
9. Baixe XML/PDF quando autorizado.
10. Em caso de rejeicao, use `rejection_reason`, `errors` e `codigo` para exibir a causa ao operador.

## Emissao por Operacao v1

Use esse fluxo quando a NotaAgil resolve as regras fiscais a partir do `operation_code`, configuracao da empresa e snapshot enviado pelo consumidor.

### PHP

```php
$snapshot = [
    'fiscal_environment' => 'homologacao',
    'document_direction' => 'saida',
    'document_data' => [
        'serie' => '1',
        'numero' => '9001',
        'natureza_operacao' => 'Venda de mercadoria',
    ],
    'counterparty' => [
        'buyer_identified' => false,
        'final_consumer' => true,
        'uf' => 'SC',
    ],
    'items' => [
        [
            'product_id' => 31,
            'sku' => 'SKU-001',
            'description' => 'Produto fiscal completo',
            'quantity' => 1,
            'unit_price' => 100,
            'gross_amount' => 100,
        ],
    ],
];

$preview = $client->previewDocumentByOperation($companyId, 'VENDA_BALCAO', [
    'external_id' => 'erp-preview-9001',
    'document_type' => 'nfce',
    'snapshot' => $snapshot,
]);

if (($preview['emission_allowed'] ?? false) !== true) {
    throw new RuntimeException('Resolucao fiscal pendente: ' . ($preview['resolution_status'] ?? 'unknown'));
}

$client->createDocumentByOperation(
    companyId: $companyId,
    operationCode: 'VENDA_BALCAO',
    payload: [
        'external_id' => 'erp-nfce-9001',
        'document_type' => 'nfce',
        'snapshot' => $snapshot,
    ],
    idempotencyKey: 'erp-nfce-9001',
);

$document = NotaAgilClient::normalizeDocumentResponse(
    $client->waitDocument('erp-nfce-9001', $companyId)
);
```

### TypeScript

```ts
const snapshot = {
  fiscal_environment: 'homologacao',
  document_direction: 'saida',
  document_data: {
    serie: '1',
    numero: '9001',
    natureza_operacao: 'Venda de mercadoria',
  },
  counterparty: {
    buyer_identified: false,
    final_consumer: true,
    uf: 'SC',
  },
  items: [
    {
      product_id: 31,
      sku: 'SKU-001',
      description: 'Produto fiscal completo',
      quantity: 1,
      unit_price: 100,
      gross_amount: 100,
    },
  ],
};

const preview = await client.previewCompanyDocumentByOperation(companyId, 'VENDA_BALCAO', {
  external_id: 'erp-preview-9001',
  document_type: 'nfce',
  snapshot,
});

if (!preview.emission_allowed) {
  throw new Error(`Resolucao fiscal pendente: ${preview.resolution_status}`);
}

await client.createCompanyDocumentByOperation(
  companyId,
  {
    external_id: 'erp-nfce-9001',
    document_type: 'nfce',
    snapshot,
  },
  'idem-erp-nfce-9001',
);

const document = await client.waitDocument('erp-nfce-9001', { companyId, timeoutMs: 120_000 });
```

## Emissao Direta v2

Use esse fluxo quando o consumidor ja monta o contrato fiscal publico completo.

### TypeScript

```ts
import {
  NotagilIntegrationClient,
  assertFiscalCanonicalPayloadV2,
  buildDirectNfceDocumentRequestV2,
  normalizeDocumentResponse,
  type FiscalCanonicalPayloadV2,
} from '@notagil/integration-sdk';

const v2 = NotagilIntegrationClient.v2({ token: process.env.NOTAGIL_TOKEN! });

const nfcePayload: FiscalCanonicalPayloadV2 = {
  identificacao: {
    serie: '1',
    numero: '9002',
    natureza_operacao: 'Venda direta',
    ambiente: 'homologacao',
  },
  emitente: {
    cnpj: '12345678000199',
    razao_social: 'Empresa Exemplo LTDA',
  },
  tomador: {
    documento: '12345678909',
    nome: 'Consumidor',
  },
  itens: [
    {
      codigo: 'SKU-001',
      descricao: 'Produto fiscal completo',
      quantidade: 1,
      valor_unitario: 100,
      valor_total: 100,
    },
  ],
};

assertFiscalCanonicalPayloadV2(nfcePayload);

await v2.createDirectDocumentV2(
  buildDirectNfceDocumentRequestV2(nfcePayload, {
    external_id: 'erp-v2-nfce-9002',
    ambiente_fiscal: 'homologacao',
    modo_emissao: 'fila',
  }),
  'idem-erp-v2-nfce-9002',
);

const result = normalizeDocumentResponse(await v2.waitDocumentV2('erp-v2-nfce-9002'));
console.log(result.fiscal_status, result.access_key, result.protocol);
```

### PHP

```php
use NotaAgil\Integration\FiscalCanonicalV2Contract;
use NotaAgil\Integration\NotaAgilClient;

$v2 = NotaAgilClient::v2(token: getenv('NOTAGIL_TOKEN'));

$payload = [
    'identificacao' => [
        'serie' => '1',
        'numero' => '9002',
        'natureza_operacao' => 'Venda direta',
        'ambiente' => 'homologacao',
    ],
    'emitente' => [
        'cnpj' => '12345678000199',
        'razao_social' => 'Empresa Exemplo LTDA',
    ],
    'tomador' => [
        'documento' => '12345678909',
        'nome' => 'Consumidor',
    ],
    'itens' => [
        [
            'codigo' => 'SKU-001',
            'descricao' => 'Produto fiscal completo',
            'quantidade' => 1,
            'valor_unitario' => 100,
            'valor_total' => 100,
        ],
    ],
];

$v2->createDirectDocumentV2(
    FiscalCanonicalV2Contract::nfce($payload, [
        'external_id' => 'erp-v2-nfce-9002',
        'ambiente_fiscal' => 'homologacao',
        'modo_emissao' => 'fila',
    ]),
    'idem-erp-v2-nfce-9002',
);
```

## NFSe Nacional Direta

Para novas integracoes, prefira as rotas v2 com `FiscalCanonicalPayloadV2`. Use o contrato direto de NFSe Nacional apenas quando a plataforma solicitar explicitamente o payload interno do `fiscal-core`.

Regras praticas:

- `serie` deve ser a serie real, por exemplo `"1"`. Nao envie regex ou mascara.
- `servico.cNBS` deve ter 9 digitos sem pontos, por exemplo `"010701000"`.
- `prestador.inscricaoMunicipal` deve ser informado quando existir.
- Nao envie `prestador.omitirIM`.
- Para Joinville, mantenha a inscricao municipal no payload; a API/core trata a diferenca de normalizacao entre homologacao e producao.
- Use `servico.enviarPAliq` ou `tributacao.municipal.enviarPAliq` somente quando a aliquota deve aparecer no XML. Para Simples Nacional sem retencao, a API pode suprimir a aliquota conforme regra fiscal.
- Use `assertCanonicalNfseNacionalPayload` no TypeScript ou `NfseNacionalCanonicalContract::assertCanonical` no PHP antes de enviar.

### TypeScript

```ts
import {
  assertCanonicalNfseNacionalPayload,
  type DirectNfseNacionalSubmitRequest,
} from '@notagil/integration-sdk';

const request: DirectNfseNacionalSubmitRequest = {
  external_id: 'nfse-direct-2026-0001',
  document_type: 'nfse',
  fiscal_environment: 'homologacao',
  payload: {
    id: 'nfse-direct-2026-0001',
    tpAmb: 2,
    dhEmi: '2026-06-28T10:00:00-03:00',
    verAplic: 'sdk-0.4.1',
    serie: '1',
    nDPS: '1001',
    dCompet: '2026-06-28',
    tpEmit: 1,
    cLocEmi: '4209102',
    prestador: {
      cnpj: '12345678000199',
      inscricaoMunicipal: '000000000033061',
      razaoSocial: 'Empresa Exemplo LTDA',
      opSimpNac: '1',
      regEspTrib: '0',
      codigoMunicipio: '4209102',
    },
    tomador: {
      documento: '12345678909',
      razaoSocial: 'Cliente Exemplo',
      email: 'cliente@example.com',
      telefone: '47999999999',
      endereco: {
        logradouro: 'Rua Exemplo',
        numero: '100',
        bairro: 'Centro',
        cep: '89200000',
        codigoMunicipio: '4209102',
        uf: 'SC',
        municipio: 'Joinville',
      },
    },
    servico: {
      cLocPrestacao: '4209102',
      cTribNac: '0107',
      cTribMun: '0107',
      cNBS: '010701000',
      descricao: 'Servico de exemplo',
      tribISSQN: '1',
      tpRetISSQN: '1',
      enviarPAliq: false,
    },
    valor_servicos: 100,
    tributacao: {
      municipal: {
        tribISSQN: '1',
        tpRetISSQN: '1',
        enviarPAliq: false,
      },
      federal: {
        vRetIRRF: 0,
        vRetCSLL: 0,
      },
    },
  },
};

assertCanonicalNfseNacionalPayload(request.payload);
await client.createCompanyDirectDocument(companyId, request, 'idem-nfse-direct-2026-0001');
```

### PHP

```php
use NotaAgil\Integration\NfseNacionalCanonicalContract;

$payload = [
    'id' => 'nfse-direct-2026-0001',
    'tpAmb' => 2,
    'dhEmi' => '2026-06-28T10:00:00-03:00',
    'verAplic' => 'sdk-0.4.1',
    'serie' => '1',
    'nDPS' => '1001',
    'dCompet' => '2026-06-28',
    'tpEmit' => 1,
    'cLocEmi' => '4209102',
    'prestador' => [
        'cnpj' => '12345678000199',
        'inscricaoMunicipal' => '000000000033061',
        'razaoSocial' => 'Empresa Exemplo LTDA',
        'opSimpNac' => '1',
        'regEspTrib' => '0',
        'codigoMunicipio' => '4209102',
    ],
    'servico' => [
        'cLocPrestacao' => '4209102',
        'cTribNac' => '0107',
        'cTribMun' => '0107',
        'cNBS' => '010701000',
        'descricao' => 'Servico de exemplo',
        'tribISSQN' => '1',
        'tpRetISSQN' => '1',
        'enviarPAliq' => false,
    ],
    'valor_servicos' => 100,
];

NfseNacionalCanonicalContract::assertCanonical($payload);

$client->createDirectDocument($companyId, [
    'external_id' => 'nfse-direct-2026-0001',
    'document_type' => 'nfse',
    'fiscal_environment' => 'homologacao',
    'payload' => $payload,
], 'idem-nfse-direct-2026-0001');
```

## Provider Info e Politicas de Formulario

Use provider info para descobrir quais campos a empresa precisa preencher antes de emitir NFSe.

Campos canonicos esperados na policy de NFSe Nacional:

- `servico.cTribMun`
- `servico.cTribNac`
- `servico.cNBS`
- `prestador.opSimpNac`

O SDK possui normalizadores de policy:

```php
$policy = NfseNacionalCanonicalContract::canonicalizeProviderPolicy($providerInfo['form_policy']);
```

```ts
const policy = canonicalizeNfseProviderPolicy(providerInfo.form_policy);
```

Aliases legados como `service.nbs` e `prestador.op_simp_nac` nao sao mais normalizados. Policies e payloads novos devem usar somente os caminhos canonicos documentados.

## Consulta IBPT

### v1

```php
$item = $client->consultIbptItem($companyId, [
    'uf' => 'SC',
    'ncm' => '84715010',
    'value' => 100,
    'description' => 'Produto fiscal completo',
    'origin_code' => '0',
]);

$cupom = $client->consultIbptCoupon($companyId, [
    'uf' => 'SC',
    'items' => [
        ['ncm' => '84715010', 'value' => 100],
    ],
]);
```

### v2

```ts
const item = await v2.consultIbptItemV2({
  uf: 'SC',
  ncm: '84715010',
  valor: 100,
  descricao: 'Produto fiscal completo',
  codigo_origem: '0',
});

const cupom = await v2.consultIbptCouponV2({
  uf: 'SC',
  itens: [
    { ncm: '84715010', valor: 100 },
  ],
});
```

## Produtos e Catalogos v2

Use produtos v2 quando a NotaAgil deve manter o cadastro fiscal do item.

```ts
const product = await v2.createProductV2({
  cod_sku: 'SKU-001',
  codigo_operacional: 'ERP-001',
  descricao: 'Produto fiscal completo',
  unidade: 'UN',
  valor_padrao: 100,
  produto_tipo: 'NORMAL',
  tipo_item: '00',
  natureza_item: 'MERCADORIA',
  origem_mercadoria: 0,
  ncm: '84715010',
  fiscal_tags: ['SUJEITO_ST'],
});

const unidades = await v2.listProductCatalogV2('unidades-medida', { ativo: true });
```

## Acompanhamento e Downloads

Depois de emitir, normalize a resposta e trate os status:

```ts
const authorized = await client.waitDocument('erp-nfce-9001', {
  companyId,
  timeoutMs: 120_000,
});

const document = normalizeDocumentResponse(authorized);

if (document.fiscal_status === 'authorized') {
  const xml = await client.downloadDocumentXml('erp-nfce-9001', companyId);
  const pdf = await client.downloadDocumentPdf('erp-nfce-9001', companyId);

  console.log(document.access_key, document.protocol, document.authorized_at);
  console.log(xml.content);
  console.log(pdf.base64);
}

if (document.fiscal_status === 'rejected') {
  console.error(document.rejection_reason ?? document.message, document.errors);
}
```

## Webhooks

Configure webhooks para reduzir polling e receber eventos de autorizacao/rejeicao.

Valide a assinatura HMAC usando o segredo configurado:

```php
$expected = NotaAgilClient::webhookSignature(
    getenv('NOTAGIL_WEBHOOK_SECRET'),
    $deliveryId,
    $timestamp,
    $rawBody,
);
```

```ts
const expected = await NotagilIntegrationClient.webhookSignature(
  process.env.NOTAGIL_WEBHOOK_SECRET!,
  deliveryId,
  timestamp,
  rawBody,
);
```

Compare a assinatura usando comparacao segura (`hash_equals` no PHP, comparacao constante equivalente no runtime do consumidor).

## Erros e Rejeicoes

Erros HTTP geram excecoes tipadas:

- PHP: `NotaAgilApiException`
- TypeScript: `NotagilApiError`

Campos importantes:

- `statusCode` / `status_code`
- `payload`
- `errors` / `erros`
- `rejectionReason` / `rejection_reason`
- `codigo`
- `mensagem`

Para rejeicao SEFAZ/DF-e, mostre a mensagem original ao operador e mantenha o `external_id` para nova tentativa somente depois de corrigir o payload.

## Checklist de Producao

- Token de producao configurado fora do codigo fonte.
- Empresa, certificado e ambiente fiscal revisados.
- `external_id` unico por documento.
- `Idempotency-Key` estavel para retries.
- Preview ativado para fluxos por `operation_code`.
- Logs preservam `external_id`, `document_type`, `fiscal_status`, `access_key`, `protocol` e `rejection_reason`.
- Webhook validado por assinatura.
- NFSe Nacional validada localmente pelo helper do SDK antes de enviar.
- Para NFSe Nacional, `cNBS` com 9 digitos e `prestador.omitirIM` ausente.

## Contratos OpenAPI

Os contratos versionados ficam em:

- `openapi/integration-v1.yaml`
- `openapi/integration-v2.yaml`

Os SDKs tambem oferecem metodos para consultar as URLs publicas de documentacao:

```php
$docs = $client->publicDocs();
$openapi = $client->publicOpenApiUrl();
$swagger = $client->publicSwaggerUrl();
```

```ts
const docs = await client.getPublicDocsSettings();
const openapi = await client.getPublicOpenApiUrl();
const swagger = await client.getPublicSwaggerUrl();
```

## Desenvolvimento Local

```sh
composer install
composer validate --strict
composer test
```

```sh
cd typescript
npm ci
npm run build
npm test
npm run pack:dry-run
```

O comando `composer test` na raiz usa `scripts/test-switch.sh`.

Variaveis:

- `SDK_TEST_SWITCH=on`: roda validacoes PHP + TypeScript.
- `SDK_TEST_SWITCH=off`: pula a validacao e encerra com sucesso.
- `SDK_E2E_SWITCH=on`: inclui E2E em homologacao.
- `SDK_E2E_SWITCH=off`: padrao, sem E2E.
- `NOTAGIL_TOKEN`: token usado em E2E.

Detalhes do E2E ficam em [docs/e2e-homologacao.md](docs/e2e-homologacao.md).

## Publicacao

1. Atualize `CHANGELOG.md`.
2. Atualize `typescript/package.json` e `typescript/package-lock.json`.
3. Rode as validacoes locais.
4. Commit na `main`.
5. Crie uma release/tag semver, por exemplo `v0.4.1`.

```sh
git tag v0.4.1
git push origin main v0.4.1
```

O workflow `.github/workflows/release-packages.yml` publica o TypeScript no npm quando uma GitHub Release e publicada. Para PHP, o Packagist usa a tag do repositorio `notagil/integration-sdk`.
