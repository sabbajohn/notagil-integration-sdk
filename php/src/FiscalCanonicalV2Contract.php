<?php

namespace NotaAgil\Integration;

class FiscalCanonicalV2Contract
{
    public const DOCUMENT_TYPES = ['nfe', 'nfce', 'nfse'];

    public const EXPECTED_FIELDS = [
        'identificacao',
        'identificacao.serie',
        'identificacao.numero',
        'identificacao.natureza_operacao',
        'identificacao.data_emissao',
        'identificacao.data_competencia',
        'identificacao.ambiente',
        'identificacao.municipio_ocorrencia_codigo',
        'identificacao.presenca',
        'identificacao.intermediador',
        'emitente',
        'emitente.cpf_cnpj',
        'emitente.razao_social',
        'emitente.nome_fantasia',
        'emitente.tipo_pessoa',
        'emitente.inscricao_estadual',
        'emitente.inscricao_municipal',
        'emitente.crt',
        'emitente.email',
        'emitente.telefone',
        'emitente.endereco',
        'tomador',
        'tomador.cpf_cnpj',
        'tomador.razao_social',
        'tomador.nome_fantasia',
        'tomador.tipo_pessoa',
        'tomador.inscricao_estadual',
        'tomador.inscricao_municipal',
        'tomador.crt',
        'tomador.email',
        'tomador.telefone',
        'tomador.endereco',
        'itens',
        'itens.*.codigo',
        'itens.*.descricao',
        'itens.*.quantidade',
        'itens.*.valor_unitario',
        'itens.*.valor_total',
        'itens.*.unidade',
        'itens.*.ncm',
        'itens.*.cfop',
        'itens.*.impostos',
        'servico',
        'servico.codigo_servico_nacional',
        'servico.codigo_servico_municipal',
        'servico.codigo_nbs',
        'servico.codigo_municipio_prestacao',
        'servico.municipio_prestacao_codigo',
        'servico.descricao',
        'pagamento',
        'pagamento.meios',
        'transporte',
        'transporte.modalidade_frete',
        'referencias',
        'referencias.*.chave',
        'referencias.*.tipo',
        'totais',
        'totais.valor_produtos',
        'totais.valor_servicos',
        'totais.valor_descontos',
        'totais.valor_documento',
        'impostos',
        'impostos.icms',
        'impostos.iss',
        'impostos.pis',
        'impostos.cofins',
        'impostos.ibs',
        'impostos.cbs',
        'valores_nfse',
        'valores_nfse.valor_recebido',
        'valores_nfse.desconto_incondicionado',
        'valores_nfse.desconto_condicionado',
        'valores_nfse.deducao_reducao.percentual',
        'valores_nfse.deducao_reducao.valor',
        'tributacao',
        'tributacao.municipal.tributacao_iss',
        'tributacao.municipal.pais_resultado',
        'tributacao.municipal.tipo_imunidade',
        'tributacao.municipal.exigibilidade_suspensa.tipo_suspensao',
        'tributacao.municipal.exigibilidade_suspensa.numero_processo',
        'tributacao.municipal.beneficio_municipal.numero_beneficio',
        'tributacao.municipal.beneficio_municipal.percentual_reducao_bc',
        'tributacao.municipal.beneficio_municipal.valor_reducao_bc',
        'tributacao.municipal.tipo_retencao_iss',
        'tributacao.municipal.aliquota_iss',
        'tributacao.municipal.enviar_aliquota_iss',
        'tributacao.federal.pis_cofins.cst',
        'tributacao.federal.pis_cofins.base_calculo',
        'tributacao.federal.pis_cofins.aliquota_pis',
        'tributacao.federal.pis_cofins.aliquota_cofins',
        'tributacao.federal.pis_cofins.valor_pis',
        'tributacao.federal.pis_cofins.valor_cofins',
        'tributacao.federal.pis_cofins.tipo_retencao',
        'tributacao.federal.valor_retido_cp',
        'tributacao.federal.valor_retido_irrf',
        'tributacao.federal.valor_retido_csll',
        'tributacao.total.indicador_sem_total',
        'tributacao.total.percentual_simples_nacional',
        'tributacao.total.percentuais.federal',
        'tributacao.total.percentuais.estadual',
        'tributacao.total.percentuais.municipal',
        'tributacao.total.valores.federal',
        'tributacao.total.valores.estadual',
        'tributacao.total.valores.municipal',
        'ibs_cbs',
        'ibs_cbs.finalidade_nfse',
        'ibs_cbs.indicador_final',
        'ibs_cbs.codigo_indicador_operacao',
        'ibs_cbs.tipo_operacao',
        'ibs_cbs.referencias_nfse',
        'ibs_cbs.tipo_ente_governamental',
        'ibs_cbs.indicador_destinatario',
        'ibs_cbs.destinatario.cpf_cnpj',
        'ibs_cbs.destinatario.razao_social',
        'ibs_cbs.tributos.cst',
        'ibs_cbs.tributos.codigo_classificacao',
        'ibs_cbs.tributos.codigo_credito_presumido',
        'ibs_cbs.tributos.tributacao_regular.cst',
        'ibs_cbs.tributos.tributacao_regular.codigo_classificacao',
        'ibs_cbs.tributos.diferimento.percentual_uf',
        'ibs_cbs.tributos.diferimento.percentual_municipal',
        'ibs_cbs.tributos.diferimento.percentual_cbs',
        'observacoes',
        'observacoes.contribuinte',
        'observacoes.fisco',
        'observacoes.texto',
        'extensoes',
    ];

    /**
     * @var array<string,true|array<string,mixed>>
     */
    private const SCHEMA = [
        'identificacao' => [
            'serie' => true,
            'numero' => true,
            'natureza_operacao' => true,
            'data_emissao' => true,
            'data_competencia' => true,
            'ambiente' => true,
            'municipio_ocorrencia_codigo' => true,
            'presenca' => true,
            'intermediador' => true,
        ],
        'emitente' => self::PARTE_SCHEMA,
        'tomador' => self::PARTE_SCHEMA,
        'itens' => [
            '*' => [
                'codigo' => true,
                'descricao' => true,
                'quantidade' => true,
                'valor_unitario' => true,
                'valor_total' => true,
                'unidade' => true,
                'ncm' => true,
                'cfop' => true,
                'impostos' => self::IMPOSTOS_SCHEMA,
            ],
        ],
        'servico' => [
            'codigo_servico_nacional' => true,
            'codigo_servico_municipal' => true,
            'codigo_nbs' => true,
            'codigo_municipio_prestacao' => true,
            'municipio_prestacao_codigo' => true,
            'descricao' => true,
        ],
        'pagamento' => [
            'meios' => [
                '*' => [
                    'meio' => true,
                    'valor' => true,
                ],
            ],
        ],
        'transporte' => [
            'modalidade_frete' => true,
        ],
        'referencias' => [
            '*' => [
                'chave' => true,
                'tipo' => true,
            ],
        ],
        'totais' => [
            'valor_produtos' => true,
            'valor_servicos' => true,
            'valor_descontos' => true,
            'valor_documento' => true,
        ],
        'impostos' => self::IMPOSTOS_SCHEMA,
        'valores_nfse' => [
            'valor_recebido' => true,
            'desconto_incondicionado' => true,
            'desconto_condicionado' => true,
            'deducao_reducao' => [
                'percentual' => true,
                'valor' => true,
            ],
        ],
        'tributacao' => [
            'municipal' => [
                'tributacao_iss' => true,
                'pais_resultado' => true,
                'tipo_imunidade' => true,
                'exigibilidade_suspensa' => [
                    'tipo_suspensao' => true,
                    'numero_processo' => true,
                ],
                'beneficio_municipal' => [
                    'numero_beneficio' => true,
                    'percentual_reducao_bc' => true,
                    'valor_reducao_bc' => true,
                ],
                'tipo_retencao_iss' => true,
                'aliquota_iss' => true,
                'enviar_aliquota_iss' => true,
            ],
            'federal' => [
                'pis_cofins' => [
                    'cst' => true,
                    'base_calculo' => true,
                    'aliquota_pis' => true,
                    'aliquota_cofins' => true,
                    'valor_pis' => true,
                    'valor_cofins' => true,
                    'tipo_retencao' => true,
                ],
                'valor_retido_cp' => true,
                'valor_retido_irrf' => true,
                'valor_retido_csll' => true,
            ],
            'total' => [
                'indicador_sem_total' => true,
                'percentual_simples_nacional' => true,
                'percentuais' => [
                    'federal' => true,
                    'estadual' => true,
                    'municipal' => true,
                ],
                'valores' => [
                    'federal' => true,
                    'estadual' => true,
                    'municipal' => true,
                ],
            ],
        ],
        'ibs_cbs' => [
            'finalidade_nfse' => true,
            'indicador_final' => true,
            'codigo_indicador_operacao' => true,
            'tipo_operacao' => true,
            'referencias_nfse' => true,
            'tipo_ente_governamental' => true,
            'indicador_destinatario' => true,
            'destinatario' => [
                'cpf_cnpj' => true,
                'razao_social' => true,
            ],
            'tributos' => [
                'cst' => true,
                'codigo_classificacao' => true,
                'codigo_credito_presumido' => true,
                'tributacao_regular' => [
                    'cst' => true,
                    'codigo_classificacao' => true,
                ],
                'diferimento' => [
                    'percentual_uf' => true,
                    'percentual_municipal' => true,
                    'percentual_cbs' => true,
                ],
            ],
        ],
        'observacoes' => [
            'contribuinte' => true,
            'fisco' => true,
            'texto' => true,
        ],
        'extensoes' => true,
    ];

    private const PARTE_SCHEMA = [
        'cpf_cnpj' => true,
        'razao_social' => true,
        'nome_fantasia' => true,
        'tipo_pessoa' => true,
        'inscricao_estadual' => true,
        'inscricao_municipal' => true,
        'crt' => true,
        'email' => true,
        'telefone' => true,
        'endereco' => [
            'logradouro' => true,
            'numero' => true,
            'complemento' => true,
            'bairro' => true,
            'municipio' => true,
            'uf' => true,
            'cep' => true,
            'codigo_municipio' => true,
            'codigo_ibge' => true,
        ],
    ];

    private const TRIBUTO_SCHEMA = [
        'cst' => true,
        'csosn' => true,
        'aliquota' => true,
        'base_calculo' => true,
        'valor' => true,
    ];

    private const IMPOSTOS_SCHEMA = [
        'icms' => self::TRIBUTO_SCHEMA,
        'iss' => self::TRIBUTO_SCHEMA,
        'pis' => self::TRIBUTO_SCHEMA,
        'cofins' => self::TRIBUTO_SCHEMA,
        'ibs' => self::TRIBUTO_SCHEMA,
        'cbs' => self::TRIBUTO_SCHEMA,
    ];

    public static function assertCanonical(array $payload): void
    {
        $invalid = array_values(array_unique(array_merge(
            self::missingRequiredFields($payload),
            self::invalidPaths($payload, self::SCHEMA),
        )));
        sort($invalid);

        if ($invalid !== []) {
            throw new FiscalCanonicalV2ContractException(self::EXPECTED_FIELDS, $invalid);
        }
    }

    public static function directDocumentRequest(string $documentType, array $payload, array $options = []): array
    {
        self::assertDocumentType($documentType);
        self::assertCanonical($payload);

        return array_filter([
            'external_id' => $options['external_id'] ?? null,
            'tipo_documento' => $documentType,
            'municipio' => $options['municipio'] ?? null,
            'ambiente_fiscal' => $options['ambiente_fiscal'] ?? null,
            'modo_emissao' => $options['modo_emissao'] ?? null,
            'sincrono' => $options['sincrono'] ?? null,
            'payload' => $payload,
            'metadados' => $options['metadados'] ?? $options['metadata'] ?? null,
        ], static fn (mixed $value): bool => $value !== null);
    }

    public static function nfe(array $payload, array $options = []): array
    {
        return self::directDocumentRequest('nfe', $payload, $options);
    }

    public static function nfce(array $payload, array $options = []): array
    {
        return self::directDocumentRequest('nfce', $payload, $options);
    }

    public static function nfse(array $payload, array $options = []): array
    {
        return self::directDocumentRequest('nfse', $payload, $options);
    }

    private static function assertDocumentType(string $documentType): void
    {
        if (! in_array($documentType, self::DOCUMENT_TYPES, true)) {
            throw new FiscalCanonicalV2ContractException(self::DOCUMENT_TYPES, ['document_type']);
        }
    }

    /**
     * @return list<string>
     */
    private static function missingRequiredFields(array $payload): array
    {
        $missing = [];
        foreach (['identificacao', 'emitente', 'tomador', 'itens'] as $field) {
            if (! array_key_exists($field, $payload)) {
                $missing[] = $field;
            }
        }

        if (array_key_exists('itens', $payload) && (! is_array($payload['itens']) || $payload['itens'] === [])) {
            $missing[] = 'itens';
        }

        return $missing;
    }

    /**
     * @param  array<string,mixed>  $schema
     * @return list<string>
     */
    private static function invalidPaths(array $payload, array $schema, string $prefix = ''): array
    {
        $invalid = [];

        foreach ($payload as $key => $value) {
            $path = $prefix === '' ? (string) $key : $prefix.'.'.$key;
            if (! array_key_exists($key, $schema)) {
                $invalid[] = $path;
                continue;
            }

            $childSchema = $schema[$key];
            if ($childSchema === true) {
                continue;
            }

            if (! is_array($value)) {
                $invalid[] = $path;
                continue;
            }

            if (isset($childSchema['*'])) {
                foreach ($value as $index => $item) {
                    if (! is_array($item)) {
                        $invalid[] = $path.'.'.$index;
                        continue;
                    }

                    $invalid = array_merge($invalid, self::invalidPaths($item, $childSchema['*'], $path.'.'.$index));
                }
                continue;
            }

            $invalid = array_merge($invalid, self::invalidPaths($value, $childSchema, $path));
        }

        return $invalid;
    }
}
