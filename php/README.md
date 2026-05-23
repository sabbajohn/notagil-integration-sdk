# NotaAgil PHP Integration SDK

SDK PHP oficial para a API publica de integracao da NotaAgil.

Veja [docs/payload-emissao.md](../docs/payload-emissao.md) para a estrutura padronizada do payload de emissao fiscal por `operation_code` e `snapshot`.

## Instalacao

```bash
composer require notagil/integration-sdk:0.1.1
```

## Uso Basico

```php
use NotaAgil\Integration\NotaAgilClient;

$client = new NotaAgilClient(
    baseUrl: 'https://api.notagil.com.br/api/v1/integrations',
    token: getenv('NOTAGIL_TOKEN'),
);

$companies = $client->companies();

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
if (($authorized['fiscal_status'] ?? null) === 'authorized') {
    $xml = $client->downloadDocumentXml('erp-0002', $companies[0]['id']);
    $pdf = $client->downloadDocumentPdf('erp-0002', $companies[0]['id']);
}
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
```

O pacote e agnostico de framework. Veja `examples/laravel.php` para uma forma simples de registrar o cliente no container Laravel.
