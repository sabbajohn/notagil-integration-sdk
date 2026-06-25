# NotaAgil PHP Integration SDK

SDK PHP oficial para a API publica de integracao da NotaAgil.

Veja [docs/payload-emissao.md](../docs/payload-emissao.md) para a estrutura padronizada do payload de emissao fiscal por `operation_code` e `snapshot`.

## Instalacao

```bash
composer require notagil/integration-sdk:^0.4.0
```

## Uso Basico

```php
use NotaAgil\Integration\NotaAgilClient;
use NotaAgil\Integration\FiscalCanonicalV2Contract;
use NotaAgil\Integration\NfseNacionalCanonicalContract;

$client = new NotaAgilClient(
    baseUrl: 'https://api_notagil.sabbasistemas.com.br/api/v1/integrations',
    token: getenv('NOTAGIL_TOKEN'),
);

$docs = $client->publicDocs();
echo $docs['openapi_url'] . PHP_EOL;
echo $docs['swagger_url'] . PHP_EOL;

$companies = $client->companies();

$v2 = NotaAgilClient::v2(token: getenv('NOTAGIL_TOKEN'));
$contract = $v2->fiscalContractV2('nfce');

$nfcePayload = [
    'identificacao' => [
        'serie' => '1',
        'numero' => '9001',
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
            'codigo' => 'SKU-1',
            'descricao' => 'Produto fiscal completo',
            'quantidade' => 1,
            'valor_unitario' => 100,
            'valor_total' => 100,
        ],
    ],
];

$v2->createDirectDocumentV2(
    FiscalCanonicalV2Contract::nfce($nfcePayload, [
        'external_id' => 'erp-v2-2026-0001',
        'ambiente_fiscal' => 'homologacao',
        'modo_emissao' => 'fila',
    ]),
    'idem-v2-2026-0001',
);

$documentoV2 = NotaAgilClient::normalizeDocumentResponse($v2->waitDocumentV2('erp-v2-2026-0001'));

$produto = $v2->createProductV2([
    'cod_sku' => 'SKU-1',
    'codigo_operacional' => 'ERP-1',
    'descricao' => 'Produto fiscal completo',
    'unidade' => 'UN',
    'valor_padrao' => 100,
    'produto_tipo' => 'NORMAL',
    'tipo_item' => '00',
    'natureza_item' => 'MERCADORIA',
    'origem_mercadoria' => 0,
    'ncm' => '84715010',
    'fiscal_tags' => ['SUJEITO_ST'],
]);

$unidades = $v2->listProductCatalogV2('unidades-medida', ['ativo' => true]);

$ibptItem = $client->consultIbptItem($companies[0]['id'], [
    'uf' => 'SP',
    'ncm' => '84715010',
    'value' => 100,
    'description' => 'Produto fiscal completo',
    'origin_code' => '0',
]);

$ibptCupom = $client->consultIbptCoupon($companies[0]['id'], [
    'uf' => 'SP',
    'items' => [
        ['ncm' => '84715010', 'value' => 100],
    ],
]);

$ibptItemV2 = $v2->consultIbptItemV2([
    'uf' => 'SP',
    'ncm' => '84715010',
    'valor' => 100,
    'descricao' => 'Produto fiscal completo',
    'codigo_origem' => '0',
]);

$ibptCupomV2 = $v2->consultIbptCouponV2([
    'uf' => 'SP',
    'itens' => [
        ['ncm' => '84715010', 'valor' => 100],
    ],
]);

$snapshot = [
    'fiscal_environment' => 'homologacao',
    'document_direction' => 'saida',
    'document_data' => [
        'serie' => '1',
        'numero' => '0002',
        'natureza_operacao' => 'Venda de mercadoria',
    ],
    'counterparty' => [
        'buyer_identified' => false,
        'final_consumer' => true,
        'uf' => 'SP',
    ],
    'items' => [
        ['product_id' => 31, 'description' => 'Produto', 'quantity' => 1, 'unit_price' => 10],
    ],
];

$preview = $client->previewDocumentByOperation($companies[0]['id'], 'VENDA_BALCAO', [
    'external_id' => 'erp-preview-0002',
    'document_type' => 'nfce',
    'snapshot' => $snapshot,
]);

$documentByOperation = $client->createDocumentByOperation(
    companyId: $companies[0]['id'],
    operationCode: 'VENDA_BALCAO',
    payload: [
        'external_id' => 'erp-0002',
        'document_type' => 'nfce',
        'snapshot' => $snapshot,
    ],
    idempotencyKey: 'erp-0002',
);

$authorized = $client->waitDocument('erp-0002', $companies[0]['id']);
$authorized = NotaAgilClient::normalizeDocumentResponse($authorized);
if (($authorized['fiscal_status'] ?? null) === 'authorized') {
    echo $authorized['access_key'] . PHP_EOL;
    echo $authorized['protocol'] . PHP_EOL;

    $xml = $client->downloadDocumentXml('erp-0002', $companies[0]['id']);
    $pdf = $client->downloadDocumentPdf('erp-0002', $companies[0]['id']);

    // XML autorizado completo em texto puro para DANFC-e/NF-e.
    echo $xml['content'];

    // PDF/DANFE em base64, sem prefixo data URI.
    echo $pdf['base64'];
} elseif (($authorized['fiscal_status'] ?? null) === 'rejected') {
    var_dump($authorized['rejection_reason'] ?? $authorized['message'] ?? null, $authorized['errors'] ?? []);
}
```

Para emissao direta de NFSe no ambiente nacional, padronize `payload` no contrato canonico PT-BR antes de enviar:

```php
$payload = [
    'id' => 'nfse-direct-2026-0001',
    'tpAmb' => 2,
    'dhEmi' => '2026-05-26T10:00:00-03:00',
    'verAplic' => 'sdk-0.4.0',
    'serie' => '1',
    'nDPS' => '1001',
    'dCompet' => '2026-05-26',
    'tpEmit' => 1,
    'cLocEmi' => '3550308',
    'prestador' => [
        'cnpj' => '12345678000199',
        'inscricaoMunicipal' => '123456',
        'razaoSocial' => 'Empresa Exemplo LTDA',
        'opSimpNac' => '1',
        'regEspTrib' => '0',
        'codigoMunicipio' => '3550308',
    ],
    'tomador' => [
        'documento' => '12345678909',
        'razaoSocial' => 'Cliente Exemplo',
        'email' => 'cliente@example.com',
        'telefone' => '11999999999',
        'endereco' => [
            'logradouro' => 'Rua Exemplo',
            'numero' => '100',
            'bairro' => 'Centro',
            'cep' => '01001000',
            'codigoMunicipio' => '3550308',
            'uf' => 'SP',
            'municipio' => 'Sao Paulo',
        ],
    ],
    'servico' => [
        'cLocPrestacao' => '3550308',
        'cTribNac' => '0107',
        'cTribMun' => '0107',
        'cNBS' => '1.0101.00.00',
        'descricao' => 'Servico de exemplo',
        'tribISSQN' => '1',
        'tpRetISSQN' => '1',
        'aliquota' => 0.02,
        'enviarPAliq' => true,
        'valor_irrf' => 0,
        'valor_ir' => 0,
        'iss_retido' => false,
    ],
    'valor_servicos' => 100,
];

NfseNacionalCanonicalContract::assertCanonical($payload);

$client->createDirectDocument($companies[0]['id'], [
    'external_id' => 'nfse-direct-2026-0001',
    'document_type' => 'nfse',
    'fiscal_environment' => 'homologacao',
    'payload' => $payload,
], 'idem-nfse-direct-2026-0001');
```

## Superficies Disponiveis

- Empresas e configuracao fiscal.
- Perfis de emissor, perfis de operacao, atribuicoes de perfil, referencias de aliquota e regras fiscais por empresa.
- Preview fiscal antes da emissao.
- Criacao, listagem, consulta, cancelamento e correcao de documentos.
- Envio direto de payload fiscal completo.
- Transmissao direta de XML NFe/NFCe.
- Certificados, catalogos fiscais, CFOPs, prontidao e importacao XML de onboarding.
- Consulta unificada, entrada NF-e, estoque, agendamentos, produtos, tomadores, webhooks, metricas e billing.

## Webhooks

```php
$expected = NotaAgilClient::webhookSignature(
    getenv('NOTAGIL_WEBHOOK_SECRET'),
    $deliveryId,
    $timestamp,
    $rawBody,
);

$payload = json_decode($rawBody, true, flags: JSON_THROW_ON_ERROR);
if (($payload['type'] ?? null) === 'fiscal_document.authorized') {
    $xml = $payload['data']['document']['xml'] ?? null;
    if (is_string($xml) && $xml !== '') {
        // XML autorizado bruto para disparar a impressao imediata no PDV.
        imprimirNfce($xml);
    }
}
```

O pacote e agnostico de framework. Veja `examples/laravel.php` para uma forma simples de registrar o cliente no container Laravel.
