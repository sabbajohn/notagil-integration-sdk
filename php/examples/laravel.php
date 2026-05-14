<?php

use NotaAgil\Integration\NotaAgilClient;

// AppServiceProvider::register()
$this->app->singleton(NotaAgilClient::class, function () {
    return new NotaAgilClient(
        baseUrl: config('services.notagil.base_url'),
        token: config('services.notagil.token'),
    );
});
