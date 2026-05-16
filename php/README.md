# NotaAgil PHP Integration SDK

SDK PHP oficial para a API pública da NotaAgil.

```bash
composer require notagil/integration-sdk
```

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
```

O pacote e agnostico de framework. Veja `examples/laravel.php` para uma forma simples de registrar o cliente no container Laravel.
