-- Migration: Adicionar campos da planilha na tabela leads
-- Data: 2024-11-XX
-- Descrição: Adiciona campos necessários para gestão completa de leads conforme planilha Excel

-- Adicionar novos campos na tabela leads
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS data_inicio DATE,
ADD COLUMN IF NOT EXISTS data_fim DATE,
ADD COLUMN IF NOT EXISTS valor_contrato DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tarefa TEXT;

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_leads_descricao ON leads(descricao);
CREATE INDEX IF NOT EXISTS idx_leads_data_inicio ON leads(data_inicio);
CREATE INDEX IF NOT EXISTS idx_leads_data_fim ON leads(data_fim);
CREATE INDEX IF NOT EXISTS idx_leads_tarefa ON leads(tarefa);
CREATE INDEX IF NOT EXISTS idx_leads_valor_contrato ON leads(valor_contrato);

-- Comentários nas colunas
COMMENT ON COLUMN leads.descricao IS 'Descrição do lead (campo principal da planilha)';
COMMENT ON COLUMN leads.data_inicio IS 'Data de início do contrato ou negociação';
COMMENT ON COLUMN leads.data_fim IS 'Data de fim do contrato ou negociação';
COMMENT ON COLUMN leads.valor_contrato IS 'Valor do contrato associado ao lead';
COMMENT ON COLUMN leads.tarefa IS 'Tarefa associada ao lead';

-- Atualizar leads existentes: usar nome como descricao se descricao estiver vazia
UPDATE leads SET descricao = nome WHERE descricao IS NULL OR descricao = '';

