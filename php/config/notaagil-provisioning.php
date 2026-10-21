<?php

return [
    // Explicit adoption only. Installing or migrating never provisions accounts.
    'enabled' => false,
    'installation_namespace' => null, // Stable across deploys; unique per installation.
    'partner_scope' => null, // Stable partner reference, never credential/hash/version.
    'connection' => null, // Must be the same connection as the source model.
    'source' => null, // Class implementing ProvisioningSource; no default owner/mapping.
    'credential_resolver' => null, // Class implementing ProvisioningCredentialResolver.
    'models' => [], // Explicit source model classes to observe on eloquent.created.
    'queue_connection' => 'database', // A configured asynchronous connection, never sync.
    'queue' => 'notaagil-provisioning',
    'lease_seconds' => 120,
    'max_attempts' => 8,
    'requests_per_minute' => 30,
];
