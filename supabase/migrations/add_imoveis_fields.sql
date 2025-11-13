-- Migration: Adicionar campos da planilha na tabela imoveis
-- Data: 2024-11-XX
-- Descrição: Adiciona campos necessários para gestão completa de imóveis conforme planilha Excel

-- Adicionar novos campos na tabela imoveis
ALTER TABLE imoveis
ADD COLUMN IF NOT EXISTS vigencia_inicio DATE,
ADD COLUMN IF NOT EXISTS vigencia_fim DATE,
ADD COLUMN IF NOT EXISTS reajuste_locacao_percentual DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS reajuste_locacao_valor_inicial DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS reajuste_locacao_valor_final DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS inscricao_municipal TEXT,
ADD COLUMN IF NOT EXISTS valor_venal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS documentacao_status TEXT CHECK (documentacao_status IN ('ok', 'pendente')),
ADD COLUMN IF NOT EXISTS contas_aberto_inquilino DECIMAL(10,2) DEFAULT 0;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_imoveis_vigencia_inicio ON imoveis(vigencia_inicio);
CREATE INDEX IF NOT EXISTS idx_imoveis_vigencia_fim ON imoveis(vigencia_fim);
CREATE INDEX IF NOT EXISTS idx_imoveis_documentacao_status ON imoveis(documentacao_status);
CREATE INDEX IF NOT EXISTS idx_imoveis_inscricao_municipal ON imoveis(inscricao_municipal);

-- Comentários nas colunas
COMMENT ON COLUMN imoveis.vigencia_inicio IS 'Data de início da vigência do contrato';
COMMENT ON COLUMN imoveis.vigencia_fim IS 'Data de fim da vigência do contrato';
COMMENT ON COLUMN imoveis.reajuste_locacao_percentual IS 'Percentual de reajuste de locação';
COMMENT ON COLUMN imoveis.reajuste_locacao_valor_inicial IS 'Valor inicial do reajuste de locação';
COMMENT ON COLUMN imoveis.reajuste_locacao_valor_final IS 'Valor final do reajuste de locação';
COMMENT ON COLUMN imoveis.inscricao_municipal IS 'Inscrição municipal do imóvel';
COMMENT ON COLUMN imoveis.valor_venal IS 'Valor venal do imóvel';
COMMENT ON COLUMN imoveis.documentacao_status IS 'Status da documentação: ok ou pendente';
COMMENT ON COLUMN imoveis.contas_aberto_inquilino IS 'Valor de contas em aberto do inquilino';

