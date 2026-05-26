<?php

namespace NotaAgil\Integration;

final class NfseNacionalCanonicalContract
{
    public const INVALID_MESSAGE = 'Payload invalido para NFSe Nacional. Use somente o contrato canonico PT-BR.';

    /**
     * @var array<string,mixed>
     */
    private const SCHEMA = [
        'id' => true,
        'tpAmb' => true,
        'dhEmi' => true,
        'verAplic' => true,
        'serie' => true,
        'nDPS' => true,
        'dCompet' => true,
        'tpEmit' => true,
        'cLocEmi' => true,
        'prestador' => [
            'cnpj' => true,
            'inscricaoMunicipal' => true,
            'razaoSocial' => true,
            'opSimpNac' => true,
            'regEspTrib' => true,
            'codigoMunicipio' => true,
        ],
        'tomador' => [
            'documento' => true,
            'razaoSocial' => true,
            'email' => true,
            'telefone' => true,
            'endereco' => [
                'logradouro' => true,
                'numero' => true,
                'complemento' => true,
                'bairro' => true,
                'cep' => true,
                'codigoMunicipio' => true,
                'uf' => true,
                'municipio' => true,
            ],
        ],
        'servico' => [
            'cLocPrestacao' => true,
            'cTribNac' => true,
            'cTribMun' => true,
            'cNBS' => true,
            'descricao' => true,
            'tribISSQN' => true,
            'tpRetISSQN' => true,
            'aliquota' => true,
            'enviarPAliq' => true,
            'valor_irrf' => true,
            'valor_ir' => true,
            'iss_retido' => true,
        ],
        'valor_servicos' => true,
    ];

    /**
     * @var list<string>
     */
    private const POLICY_FIELDS = [
        'service.municipal_code',
        'service.national_tax_code',
        'service.nbs',
        'prestador.op_simp_nac',
    ];

    /**
     * @return list<string>
     */
    public static function expectedFields(): array
    {
        return [
            'id',
            'tpAmb',
            'dhEmi',
            'verAplic',
            'serie',
            'nDPS',
            'dCompet',
            'tpEmit',
            'cLocEmi',
            'prestador.cnpj',
            'prestador.inscricaoMunicipal',
            'prestador.razaoSocial',
            'prestador.opSimpNac',
            'prestador.regEspTrib',
            'prestador.codigoMunicipio',
            'tomador.documento',
            'tomador.razaoSocial',
            'tomador.email',
            'tomador.telefone',
            'tomador.endereco.logradouro',
            'tomador.endereco.numero',
            'tomador.endereco.complemento',
            'tomador.endereco.bairro',
            'tomador.endereco.cep',
            'tomador.endereco.codigoMunicipio',
            'tomador.endereco.uf',
            'tomador.endereco.municipio',
            'servico.cLocPrestacao',
            'servico.cTribNac',
            'servico.cTribMun',
            'servico.cNBS',
            'servico.descricao',
            'servico.tribISSQN',
            'servico.tpRetISSQN',
            'servico.aliquota',
            'servico.enviarPAliq',
            'servico.valor_irrf',
            'servico.valor_ir',
            'servico.iss_retido',
            'valor_servicos',
        ];
    }

    /**
     * @param array<string,mixed> $payload
     */
    public static function assertCanonical(array $payload): void
    {
        $legacyFields = self::legacyFields($payload);
        if ($legacyFields === []) {
            return;
        }

        throw new NfseNacionalContractException(self::expectedFields(), $legacyFields);
    }

    /**
     * @param array<string,mixed> $policy
     * @return array<string,mixed>
     */
    public static function canonicalizeProviderPolicy(array $policy): array
    {
        $allowedFields = array_flip(self::POLICY_FIELDS);

        $policy['required_fields'] = array_values(array_filter(
            array_map('strval', (array) ($policy['required_fields'] ?? [])),
            static fn (string $field): bool => isset($allowedFields[$field])
        ));
        $policy['visible_fields'] = array_values(array_filter(
            array_map('strval', (array) ($policy['visible_fields'] ?? [])),
            static fn (string $field): bool => isset($allowedFields[$field])
        ));

        $schema = (array) ($policy['field_schema'] ?? []);
        $policy['field_schema'] = [
            'service.municipal_code' => self::canonicalFieldEntry(
                $schema['service.municipal_code'] ?? [],
                'Codigo Servico Municipal',
                'text',
                ['servico.cTribMun']
            ),
            'service.national_tax_code' => self::canonicalFieldEntry(
                $schema['service.national_tax_code'] ?? [],
                'Codigo Tributacao Nacional',
                'text',
                ['servico.cTribNac']
            ),
            'service.nbs' => self::canonicalFieldEntry(
                $schema['service.nbs'] ?? [],
                'Codigo NBS',
                'text',
                ['servico.cNBS']
            ),
            'prestador.op_simp_nac' => self::canonicalFieldEntry(
                $schema['prestador.op_simp_nac'] ?? [],
                'Simples Nacional',
                'select',
                ['prestador.opSimpNac'],
                [
                    ['value' => '1', 'label' => '1 - Nao optante'],
                    ['value' => '2', 'label' => '2 - MEI'],
                    ['value' => '3', 'label' => '3 - ME/EPP'],
                ]
            ),
        ];

        return $policy;
    }

    /**
     * @param array<string,mixed> $payload
     * @return list<string>
     */
    private static function legacyFields(array $payload): array
    {
        $paths = self::collectInvalidPaths($payload, self::SCHEMA);
        $paths = array_values(array_unique($paths));
        sort($paths);

        return $paths;
    }

    /**
     * @param array<string,mixed> $payload
     * @param array<string,mixed> $schema
     * @return list<string>
     */
    private static function collectInvalidPaths(array $payload, array $schema, string $prefix = ''): array
    {
        $invalid = [];

        foreach ($payload as $key => $value) {
            $path = $prefix === '' ? (string) $key : $prefix . '.' . $key;
            if (!array_key_exists($key, $schema)) {
                $invalid[] = $path;
                continue;
            }

            $childSchema = $schema[$key];
            if ($childSchema === true) {
                continue;
            }

            if (!is_array($value) || array_is_list($value)) {
                $invalid[] = $path;
                continue;
            }

            $invalid = [...$invalid, ...self::collectInvalidPaths($value, $childSchema, $path)];
        }

        return $invalid;
    }

    /**
     * @param array<string,mixed> $entry
     * @param list<string> $payloadPaths
     * @param list<array{value:string,label:string}> $options
     * @return array<string,mixed>
     */
    private static function canonicalFieldEntry(
        array $entry,
        string $label,
        string $control,
        array $payloadPaths,
        array $options = [],
    ): array {
        $normalized = [
            ...$entry,
            'label' => $entry['label'] ?? $label,
            'control' => $entry['control'] ?? $control,
            'payload_paths' => $payloadPaths,
        ];

        if ($options !== []) {
            $normalized['options'] = $options;
        }

        return $normalized;
    }
}
