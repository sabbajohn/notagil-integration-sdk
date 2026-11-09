# ERP-owned integration credential

ProvisioningRequest optionally accepts integrationTokenHash (64 lowercase SHA-256 hex characters). Generate a cryptographically random bearer secret in the consuming ERP, persist it encrypted before HTTP, and pass only its hash. ProvisioningResult exposes an allowlisted integration confirmation (client_id, token_id, token_sha256, scopes); unknown server fields and any token plaintext are discarded. A request with a verifier cannot succeed without a matching confirmation.

Laravel consumers may configure `notaagil-provisioning.result_consumer` with a ProvisioningResultConsumer implementation. Its consume method performs local database writes only, using the outbox connection. It runs inside the completion transaction, after locking the current unexpired claim generation. Consumer writes and outbox completion commit or roll back together. A superseded/expired worker cannot call the consumer. Exceptions after remote success become resultado_incerto and retry the original frozen payload/idempotency key. No credential is placed in a job or log context.

Existing callers without a verifier or result consumer keep the prior behavior. Install the compatible API first, then publish this SDK commit and update the ERP pin before deployment. Do not silently upgrade old frozen provisioning snapshots or rotate/revive credentials on replay.
