<?php

namespace NotaAgil\Integration;

final class NfseNacionalCanonicalContract
{
    public const INVALID_MESSAGE = 'Payload invalido para NFSe Nacional. Use somente o contrato canonico PT-BR.';

    /**
     * @var array<string,string>
     */
    private const POLICY_FIELDS = [
        'service.municipal_code' => 'servico.cTribMun',
        'service.national_tax_code' => 'servico.cTribNac',
        'service.nbs' => 'servico.cNBS',
        'service.cnae_code' => 'servico.codigoCnae',
        'service.activity_code' => 'servico.codigo_atividade',
        'service.benefit_code' => 'servico.benefit_code',
        'prestador.op_simp_nac' => 'prestador.opSimpNac',
        'prestador.mei' => 'prestador.mei',
        'servico.cTribMun' => 'servico.cTribMun',
        'servico.cTribNac' => 'servico.cTribNac',
        'servico.cNBS' => 'servico.cNBS',
        'servico.codigoCnae' => 'servico.codigoCnae',
        'servico.codigo_atividade' => 'servico.codigo_atividade',
        'servico.benefit_code' => 'servico.benefit_code',
        'prestador.opSimpNac' => 'prestador.opSimpNac',
        'prestador.mei' => 'prestador.mei',
    ];

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
            'enviarIM' => true,
            'omitirIM' => false,
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
        'valores' => [
            'vReceb' => true,
            'vDescIncond' => true,
            'vDescCond' => true,
            'desconto_incondicionado' => true,
            'desconto_condicionado' => true,
            'deducao_reducao' => [
                'pDR' => true,
                'vDR' => true,
                'percentual' => true,
                'valor' => true,
            ],
        ],
        'tributacao' => [
            'municipal' => [
                'tribISSQN' => true,
                'cPaisResult' => true,
                'tpImunidade' => true,
                'exigSusp' => [
                    'tpSusp' => true,
                    'nProcesso' => true,
                ],
                'BM' => [
                    'nBM' => true,
                    'pRedBCBM' => true,
                    'vRedBCBM' => true,
                ],
                'tpRetISSQN' => true,
                'pAliq' => true,
                'aliquota' => true,
                'enviarPAliq' => true,
            ],
            'federal' => [
                'piscofins' => [
                    'CST' => true,
                    'cst' => true,
                    'vBCPisCofins' => true,
                    'pAliqPis' => true,
                    'pAliqCofins' => true,
                    'vPis' => true,
                    'vCofins' => true,
                    'tpRetPisCofins' => true,
                ],
                'vRetCP' => true,
                'vRetIRRF' => true,
                'vRetCSLL' => true,
            ],
            'total' => [
                'indTotTrib' => true,
                'pTotTribSN' => true,
                'pTotTrib' => [
                    'pTotTribFed' => true,
                    'pTotTribEst' => true,
                    'pTotTribMun' => true,
                ],
                'vTotTrib' => [
                    'vTotTribFed' => true,
                    'vTotTribEst' => true,
                    'vTotTribMun' => true,
                ],
            ],
        ],
        'ibscbs' => [
            'finNFSe' => true,
            'indFinal' => true,
            'cIndOp' => true,
            'tpOper' => true,
            'gRefNFSe' => [
                'refNFSe' => true,
            ],
            'tpEnteGov' => true,
            'indDest' => true,
            'dest' => [
                'documento' => true,
                'razaoSocial' => true,
            ],
            'valores' => [
                'trib' => [
                    'gIBSCBS' => [
                        'CST' => true,
                        'cClassTrib' => true,
                        'cCredPres' => true,
                        'gTribRegular' => [
                            'CSTReg' => true,
                            'cClassTribReg' => true,
                        ],
                        'gDif' => [
                            'pDifUF' => true,
                            'pDifMun' => true,
                            'pDifCBS' => true,
                        ],
                    ],
                ],
            ],
        ],
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
            'prestador.enviarIM',
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
            'valores.vReceb',
            'valores.vDescIncond',
            'valores.vDescCond',
            'valores.deducao_reducao.percentual',
            'valores.deducao_reducao.valor',
            'tributacao.municipal.tribISSQN',
            'tributacao.municipal.cPaisResult',
            'tributacao.municipal.tpImunidade',
            'tributacao.municipal.exigSusp.tpSusp',
            'tributacao.municipal.exigSusp.nProcesso',
            'tributacao.municipal.BM.nBM',
            'tributacao.municipal.BM.pRedBCBM',
            'tributacao.municipal.BM.vRedBCBM',
            'tributacao.municipal.tpRetISSQN',
            'tributacao.municipal.pAliq',
            'tributacao.municipal.enviarPAliq',
            'tributacao.federal.piscofins.CST',
            'tributacao.federal.piscofins.vBCPisCofins',
            'tributacao.federal.piscofins.pAliqPis',
            'tributacao.federal.piscofins.pAliqCofins',
            'tributacao.federal.piscofins.vPis',
            'tributacao.federal.piscofins.vCofins',
            'tributacao.federal.piscofins.tpRetPisCofins',
            'tributacao.federal.vRetCP',
            'tributacao.federal.vRetIRRF',
            'tributacao.federal.vRetCSLL',
            'tributacao.total.indTotTrib',
            'tributacao.total.pTotTribSN',
            'tributacao.total.pTotTrib.pTotTribFed',
            'tributacao.total.pTotTrib.pTotTribEst',
            'tributacao.total.pTotTrib.pTotTribMun',
            'tributacao.total.vTotTrib.vTotTribFed',
            'tributacao.total.vTotTrib.vTotTribEst',
            'tributacao.total.vTotTrib.vTotTribMun',
            'ibscbs.finNFSe',
            'ibscbs.indFinal',
            'ibscbs.cIndOp',
            'ibscbs.tpOper',
            'ibscbs.gRefNFSe.refNFSe',
            'ibscbs.tpEnteGov',
            'ibscbs.indDest',
            'ibscbs.dest.documento',
            'ibscbs.dest.razaoSocial',
            'ibscbs.valores.trib.gIBSCBS.CST',
            'ibscbs.valores.trib.gIBSCBS.cClassTrib',
            'ibscbs.valores.trib.gIBSCBS.cCredPres',
            'ibscbs.valores.trib.gIBSCBS.gTribRegular.CSTReg',
            'ibscbs.valores.trib.gIBSCBS.gTribRegular.cClassTribReg',
            'ibscbs.valores.trib.gIBSCBS.gDif.pDifUF',
            'ibscbs.valores.trib.gIBSCBS.gDif.pDifMun',
            'ibscbs.valores.trib.gIBSCBS.gDif.pDifCBS',
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
        $requiredFields = self::normalizePolicyFields((array) ($policy['required_fields'] ?? []));
        $visibleFields = self::normalizePolicyFields((array) ($policy['visible_fields'] ?? []));
        $schema = self::normalizePolicyMap((array) ($policy['field_schema'] ?? []));
        $activeFields = array_values(array_unique([
            ...$requiredFields,
            ...$visibleFields,
            ...array_keys($schema),
        ]));

        $policy['required_fields'] = $requiredFields;
        $policy['visible_fields'] = $visibleFields;
        $policy['field_schema'] = [];
        foreach ($activeFields as $field) {
            $defaults = self::fieldDefaults($field);
            if ($defaults === null) {
                continue;
            }

            $policy['field_schema'][$field] = self::canonicalFieldEntry(
                (array) ($schema[$field] ?? []),
                $defaults['label'],
                $defaults['control'],
                [$field],
                $defaults['options'] ?? [],
            );
        }

        $allowed = array_flip([
            'servico.cTribMun',
            'servico.cTribNac',
            'servico.cNBS',
            'prestador.opSimpNac',
        ]);
        $policy['required_fields'] = array_values(array_filter(
            $policy['required_fields'],
            static fn (string $field): bool => isset($allowed[$field])
        ));
        $policy['visible_fields'] = array_values(array_filter(
            $policy['visible_fields'],
            static fn (string $field): bool => isset($allowed[$field])
        ));
        $policy['field_schema'] = array_intersect_key($policy['field_schema'], $allowed);

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

            if (!is_array($childSchema)) {
                $invalid[] = $path;
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
     * @param list<mixed> $fields
     * @return list<string>
     */
    private static function normalizePolicyFields(array $fields): array
    {
        $normalized = [];
        foreach ($fields as $field) {
            $canonical = self::canonicalField($field);
            if ($canonical !== null && !in_array($canonical, $normalized, true)) {
                $normalized[] = $canonical;
            }
        }

        return $normalized;
    }

    /**
     * @param array<string,mixed> $map
     * @return array<string,mixed>
     */
    private static function normalizePolicyMap(array $map): array
    {
        $normalized = [];
        foreach ($map as $field => $value) {
            $canonical = self::canonicalField($field);
            if ($canonical !== null) {
                $normalized[$canonical] = $value;
            }
        }

        return $normalized;
    }

    private static function canonicalField(mixed $field): ?string
    {
        if (!is_scalar($field)) {
            return null;
        }

        $normalized = trim((string) $field);
        if ($normalized === '') {
            return null;
        }

        return self::POLICY_FIELDS[$normalized] ?? null;
    }

    /**
     * @return array{label:string,control:string,options?:list<array{value:string,label:string}>}|null
     */
    private static function fieldDefaults(string $field): ?array
    {
        return match ($field) {
            'servico.cTribMun' => ['label' => 'Codigo Servico Municipal', 'control' => 'text'],
            'servico.cTribNac' => ['label' => 'Codigo Tributacao Nacional', 'control' => 'text'],
            'servico.cNBS' => ['label' => 'Codigo NBS', 'control' => 'text'],
            'servico.codigoCnae' => ['label' => 'CNAE do Servico', 'control' => 'text'],
            'servico.codigo_atividade' => ['label' => 'Codigo de Atividade', 'control' => 'text'],
            'servico.benefit_code' => ['label' => 'Codigo Beneficio Municipal', 'control' => 'text'],
            'prestador.opSimpNac' => [
                'label' => 'Simples Nacional',
                'control' => 'select',
                'options' => [
                    ['value' => '1', 'label' => '1 - Nao optante'],
                    ['value' => '2', 'label' => '2 - MEI'],
                    ['value' => '3', 'label' => '3 - ME/EPP'],
                ],
            ],
            'prestador.mei' => [
                'label' => 'Emitente MEI',
                'control' => 'select',
                'options' => [
                    ['value' => 'false', 'label' => 'Nao MEI'],
                    ['value' => 'true', 'label' => 'MEI'],
                ],
            ],
            default => null,
        };
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
