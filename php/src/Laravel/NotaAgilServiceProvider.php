<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Laravel;

use Illuminate\Support\ServiceProvider;
use LogicException;
use NotaAgil\Integration\Laravel\Commands\ReconcileProvisionings;
use NotaAgil\Integration\Laravel\Contracts\ProvisioningCredentialResolver;
use NotaAgil\Integration\Laravel\Contracts\ProvisioningSource;

/** Optional Laravel 12 bridge. The PHP client has no Illuminate dependency. */
final class NotaAgilServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../../config/notaagil-provisioning.php', 'notaagil-provisioning');
        if (! $this->app['config']->get('notaagil-provisioning.enabled', false)) {
            return;
        }
        $this->app->singleton(ProvisioningSettings::class, fn ($app) => new ProvisioningSettings($app['config']->get('notaagil-provisioning')));
        $this->app->singleton(ProvisioningSource::class, function ($app) {
            $class = $app['config']->get('notaagil-provisioning.source');
            if (! is_string($class) || ! is_subclass_of($class, ProvisioningSource::class)) {
                throw new LogicException('Configure an explicit NotaAgil ProvisioningSource adapter.');
            }

            return $app->make($class);
        });
        $this->app->singleton(ProvisioningCredentialResolver::class, function ($app) {
            $class = $app['config']->get('notaagil-provisioning.credential_resolver');
            if (! is_string($class) || ! is_subclass_of($class, ProvisioningCredentialResolver::class)) {
                throw new LogicException('Configure a separate NotaAgil provisioning credential resolver.');
            }

            return $app->make($class);
        });
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');
        if ($this->app->runningInConsole()) {
            $this->commands([ReconcileProvisionings::class]);
            $this->publishes([__DIR__.'/../../config/notaagil-provisioning.php' => $this->app->configPath('notaagil-provisioning.php')], 'notaagil-provisioning-config');
        }
        if (! $this->app['config']->get('notaagil-provisioning.enabled', false)) {
            return;
        }
        $settings = $this->app->make(ProvisioningSettings::class);
        $driver = $this->app['config']->get('queue.connections.'.$settings->queueConnection.'.driver');
        if (! is_string($driver) || in_array($driver, ['sync', 'null'], true)) {
            throw new LogicException('NotaAgil provisioning requires a configured asynchronous queue.');
        }
        // Fail configuration before observing creation. Never infer models/owners.
        $this->app->make(ProvisioningSource::class);
        $this->app->make(ProvisioningCredentialResolver::class);
        $models = $this->app['config']->get('notaagil-provisioning.models', []);
        if (! is_array($models) || $models === []) {
            throw new LogicException('Configure explicit NotaAgil provisioning source models.');
        }
        foreach ($models as $model) {
            if (! is_string($model) || ! is_subclass_of($model, \Illuminate\Database\Eloquent\Model::class)) {
                throw new LogicException('Provisioning source models must be Eloquent models.');
            }
            $this->app['events']->listen('eloquent.created: '.$model, function ($created): void {
                $this->app->make(ProvisioningCoordinator::class)->created($created);
            });
        }
        // No scheduler, remote calls, backfill, or account activation on boot.
    }
}
