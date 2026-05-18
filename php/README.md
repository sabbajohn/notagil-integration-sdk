# NotaAgil PHP Integration SDK

SDK PHP oficial para a API publica de integracao da NotaAgil.

## Instalacao

```bash
composer require notagil/integration-sdk:0.1.0-beta.1
```

## Uso Basico

```php
use NotaAgil\Integration\NotaAgilClient;

$client = new NotaAgilClient(
    baseUrl: 'https://api.notagil.com.br/api/v1/integrations',
    token: getenv('NOTAGIL_TOKEN'),
);

$companies = $client->companies();

$document = $client->createDocument(
    companyId: $companies[0]['id'],
    payload: [
        'external_id' => 'erp-0001',
        'document_type' => 'nfce',
        'payload' => [
            'type' => 'nfce',
            'operation_profile_id' => 11,
            'items' => [
                ['description' => 'Produto', 'quantity' => 1, 'unit_price' => 10],
            ],
        ],
    ],
    idempotencyKey: 'erp-0001',
);

$authorized = $client->waitDocument('erp-0001');
if (($authorized['fiscal_status'] ?? null) === 'authorized') {
    $xml = $client->downloadDocumentXml('erp-0001');
    $pdf = $client->downloadDocumentPdf('erp-0001');
}
```

## Superficies Disponiveis

- Empresas e configuracao fiscal.
- Perfis de operacao, referencias de aliquota e regras fiscais por empresa.
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
