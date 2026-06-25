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
        'emitente.documento',
        'emitente.cpf',
        'emitente.cnpj',
        'emitente.nome',
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
        'tomador.documento',
        'tomador.cpf',
        'tomador.cnpj',
        'tomador.nome',
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
        'servico.aliquota_iss',
        'servico.aliquota',
        'servico.iss_retido',
        'servico.tributacao_iss',
        'servico.valor_irrf',
        'servico.valor_ir',
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
            'aliquota_iss' => true,
            'aliquota' => true,
            'iss_retido' => true,
            'tributacao_iss' => true,
            'valor_irrf' => true,
            'valor_ir' => true,
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
        'observacoes' => [
            'contribuinte' => true,
            'fisco' => true,
            'texto' => true,
        ],
        'extensoes' => true,
    ];

    private const PARTE_SCHEMA = [
        'documento' => true,
        'cpf' => true,
        'cnpj' => true,
        'nome' => true,
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
            'document_type' => $documentType,
            'municipio' => $options['municipio'] ?? null,
            'ambiente_fiscal' => $options['ambiente_fiscal'] ?? null,
            'modo_emissao' => $options['modo_emissao'] ?? null,
            'sincrono' => $options['sincrono'] ?? null,
            'payload' => $payload,
            'metadata' => $options['metadata'] ?? null,
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
