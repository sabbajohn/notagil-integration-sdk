<?php

declare(strict_types=1);

namespace NotaAgil\Integration\Provisioning;

use GuzzleHttp\Client;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Exception\RequestException;
use InvalidArgumentException;
use Psr\Http\Message\ResponseInterface;
use SensitiveParameter;
use Throwable;

/** One HTTP attempt per call. Durable retry/replay belongs to the caller. */
final class NotaAgilProvisioningClient
{
    private readonly string $platformUrl;
    private readonly ClientInterface $http;

    public function __construct(
        string $platformUrl,
        #[SensitiveParameter] private readonly string $provisioningToken,
        ?ClientInterface $http = null,
    ) {
        $parts = parse_url($platformUrl);
        if ($parts === false || ! isset($parts['host']) || ($parts['scheme'] ?? '') !== 'https'
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['query']) || isset($parts['fragment'])
            || preg_match('#/api(?:/|$)#', $parts['path'] ?? '')
            || trim($provisioningToken) === '' || preg_match('/[\r\n]/', $provisioningToken)) {
            throw new InvalidArgumentException('Provide an HTTPS platform origin and a separate provisioning credential.');
        }
        $this->platformUrl = rtrim($platformUrl, '/');
        $this->http = $http ?? new Client();
    }

    public function __debugInfo(): array
    {
        return ['platformUrl' => $this->platformUrl, 'provisioningToken' => '[redacted]'];
    }

    public function __serialize(): array
    {
        throw new \LogicException('Provisioning clients must not be serialized.');
    }

    public function provision(#[SensitiveParameter] ProvisioningRequest $snapshot, string $idempotencyKey): ProvisioningResult
    {
        return $this->send('/clients', $snapshot->toArray(), $idempotencyKey, 201);
    }

    public function activate(#[SensitiveParameter] ActivationRequest $snapshot, string $originalIdempotencyKey): ProvisioningResult
    {
        return $this->send('/clients/activate', $snapshot->toArray(), $originalIdempotencyKey, 200);
    }

    private function send(string $path, #[SensitiveParameter] array $payload, string $key, int $expectedStatus): ProvisioningResult
    {
        Contract::key($key);
        try {
            $response = $this->http->request('POST', $this->platformUrl.'/api/v2/provisioning'.$path, [
                'headers' => [
                    'Accept' => 'application/json', 'Authorization' => 'Bearer '.$this->provisioningToken,
                    'Idempotency-Key' => $key,
                ],
                'json' => $payload, 'http_errors' => false, 'allow_redirects' => false,
                'timeout' => 15, 'connect_timeout' => 5,
            ]);
        } catch (RequestException $error) {
            $response = $error->getResponse();
            if ($response === null) {
                throw new ProvisioningException(0, 'transport_failure', true, true);
            }
        } catch (GuzzleException) {
            throw new ProvisioningException(0, 'transport_failure', true, true);
        }

        $status = $response->getStatusCode();
        if ($status !== $expectedStatus) {
            throw $this->httpError($response);
        }
        try {
            $envelope = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);
            if (! is_array($envelope) || ! isset($envelope['data']) || ! is_array($envelope['data'])) {
                throw new \UnexpectedValueException();
            }
            $result = ProvisioningResult::fromArray($envelope['data'], $status);
            if ($result->externalCustomerId !== $payload['external_customer_id']) {
                throw new \UnexpectedValueException();
            }

            return $result;
        } catch (Throwable) {
            throw new ProvisioningException($status, 'invalid_response', true, true);
        }
    }

    private function httpError(ResponseInterface $response): ProvisioningException
    {
        $status = $response->getStatusCode();
        $code = match ($status) {
            401 => 'invalid_credential', 403 => 'forbidden_scope', 404 => 'not_found',
            408 => 'request_timeout', 409 => 'conflict', 422 => 'validation_failed',
            429 => 'rate_limited', default => $status >= 500 ? 'server_failure' : 'unexpected_status',
        };

        return new ProvisioningException(
            $status,
            $code,
            in_array($status, [408, 429], true) || $status >= 500,
            $status === 408 || $status >= 500 || ($status >= 200 && $status < 300),
            self::retryAfter($response->getHeaderLine('Retry-After')),
        );
    }

    public static function retryAfter(string $header, ?int $now = null): ?int
    {
        $header = trim($header);
        if ($header === '') {
            return null;
        }
        if (ctype_digit($header)) {
            return (int) min((float) $header, 2147483647);
        }
        // HTTP-date only; do not interpret arbitrary relative date strings.
        $date = \DateTimeImmutable::createFromFormat('!D, d M Y H:i:s \G\M\T', $header, new \DateTimeZone('UTC'));
        if ($date === false || $date->format('D, d M Y H:i:s \G\M\T') !== $header) {
            return null;
        }

        return max(0, min(2147483647, $date->getTimestamp() - ($now ?? time())));
    }
}
