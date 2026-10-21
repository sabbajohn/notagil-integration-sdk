<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    public function up(): void
    {
        $schema = Schema::connection(config('notaagil-provisioning.connection'));
        if (! $schema->hasTable('notaagil_provisionings')) {
            $schema->create('notaagil_provisionings', function (Blueprint $table): void {
                $table->bigIncrements('id');
                $table->string('installation_namespace', 120);
                $table->string('partner_scope', 120);
                $table->string('source_key', 120);
                // Canonical lowercase SHA-256 keys avoid locale/case collation semantics.
                // Raw identity bytes are also checked in PHP before returning a binding.
                $table->char('scope_hash', 64);
                $table->char('identity_hash', 64)->unique('notaagil_prov_identity_unique');
                $table->char('source_hash', 64)->unique('notaagil_prov_owner_unique');
                $table->string('external_customer_id', 120);
                $table->string('idempotency_key', 120);
                $table->string('platform_url', 1024)->nullable(); // Immutable after first attempt.
                $table->text('snapshot')->nullable(); // Encrypted, no credential.
                $table->char('snapshot_hash', 64)->nullable();
                $table->text('activation_snapshot')->nullable(); // Encrypted, immutable.
                $table->text('remote_result')->nullable(); // Encrypted allowlisted result.
                $table->string('remote_account_id', 120)->nullable();
                $table->string('remote_empresa_id', 120)->nullable();
                $table->string('state', 32)->default('pendente');
                $table->string('operation', 16)->default('provision');
                $table->unsignedInteger('attempts')->default(0);
                $table->unsignedBigInteger('claim_generation')->default(0);
                $table->dateTime('claim_until')->nullable();
                $table->dateTime('next_retry_at')->nullable();
                $table->unsignedSmallInteger('last_http_status')->nullable();
                $table->string('last_error_code', 48)->nullable();
                $table->timestamps();
                // Source hash omits the partner: changing partner must require review.
                $table->unique(['scope_hash', 'external_customer_id'], 'notaagil_prov_external_unique');
                $table->unique(['scope_hash', 'idempotency_key'], 'notaagil_prov_key_unique');
                $table->index('scope_hash', 'notaagil_prov_scope_index');
                $table->index(['state', 'next_retry_at'], 'notaagil_prov_due_index');
            });
        } elseif (! $schema->hasColumns('notaagil_provisionings', ['scope_hash', 'identity_hash', 'source_hash'])) {
            // This draft has not been released. Never reinterpret/drop an older draft's
            // persisted bindings. An existing incompatible schema needs explicit review.
            throw new LogicException('Retain existing provisioning history; the older draft schema requires an explicit identity upgrade.');
        }
        if (! $schema->hasTable('notaagil_provisioning_limits')) {
            $schema->create('notaagil_provisioning_limits', function (Blueprint $table): void {
                $table->char('scope_hash', 64)->primary();
                $table->timestamp('window_started_at');
                $table->unsignedInteger('hits')->default(0);
            });
        }
    }

    public function down(): void
    {
        // Intentionally retain idempotency history and remote bindings on rollback.
        // Never drop/recreate these tables to roll back application code.
    }
};
