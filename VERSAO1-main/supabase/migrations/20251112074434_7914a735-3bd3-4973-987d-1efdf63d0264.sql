-- Criação de todas as tabelas do sistema

-- 1. Tabela de Tarefas
CREATE TABLE tarefas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_vencimento DATE NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('alta', 'media', 'baixa')),
  status TEXT NOT NULL CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
  responsavel TEXT,
  observacoes TEXT,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('pf', 'pj')),
  cpf_cnpj TEXT,
  telefone TEXT NOT NULL,
  email TEXT,
  cep TEXT NOT NULL,
  endereco TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo')),
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  contato TEXT NOT NULL,
  origem TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('novo', 'contatado', 'interessado', 'convertido', 'perdido')),
  observacoes TEXT,
  historico_interacoes JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabela de Processos
CREATE TABLE processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_processo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  status TEXT NOT NULL CHECK (status IN ('em_andamento', 'concluido', 'arquivado')),
  data_inicial DATE NOT NULL,
  responsavel TEXT,
  valor_causa DECIMAL(10,2),
  andamento_atual TEXT,
  observacoes TEXT,
  proximos_passos TEXT,
  historico_andamentos JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabela de Orçamentos e Recibos
CREATE TABLE orcamentos_recibos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('orcamento', 'recibo')),
  cliente_id UUID REFERENCES clientes(id),
  processo_id UUID REFERENCES processos(id),
  itens JSONB NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE,
  observacoes TEXT,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovado', 'recusado', 'convertido')),
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Tabela de Imóveis
CREATE TABLE imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endereco TEXT NOT NULL,
  cep TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  matricula TEXT,
  proprietario TEXT,
  valor DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('disponivel', 'alugado', 'vendido', 'manutencao')),
  documento_pago BOOLEAN DEFAULT false,
  data_pagamento DATE,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Tabela de Transações (Entrada/Saída)
CREATE TABLE transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  area TEXT,
  observacoes TEXT,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Tabela de Gado
CREATE TABLE gado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificacao TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'vendido', 'abatido')),
  idade_meses INTEGER,
  peso_atual DECIMAL(10,2),
  origem TEXT,
  observacoes TEXT,
  historico_peso JSONB DEFAULT '[]',
  historico_saude JSONB DEFAULT '[]',
  eventos JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. Tabela de Caminhões
CREATE TABLE caminhoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placa TEXT NOT NULL UNIQUE,
  modelo TEXT NOT NULL,
  ano INTEGER,
  quilometragem INTEGER,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'manutencao', 'inativo')),
  data_ultima_revisao DATE,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. Tabela de Motoristas
CREATE TABLE motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnh TEXT NOT NULL UNIQUE,
  validade_cnh DATE NOT NULL,
  telefone TEXT NOT NULL,
  caminhao_id UUID REFERENCES caminhoes(id),
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 11. Tabela de Fretes
CREATE TABLE fretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente TEXT NOT NULL,
  origem TEXT NOT NULL,
  destino TEXT NOT NULL,
  valor_frete DECIMAL(10,2) NOT NULL,
  despesas DECIMAL(10,2) DEFAULT 0,
  data DATE NOT NULL,
  observacoes TEXT,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. Tabela de Financiamentos
CREATE TABLE financiamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banco TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  taxa_juros DECIMAL(5,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('financiamento', 'emprestimo')),
  numero_parcelas INTEGER NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  iof DECIMAL(10,2) DEFAULT 0,
  seguro DECIMAL(10,2) DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_termino DATE,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 13. Tabela de Investimentos
CREATE TABLE investimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  valor_aplicado DECIMAL(10,2) NOT NULL,
  rentabilidade DECIMAL(5,2) NOT NULL,
  prazo_dias INTEGER,
  data_aplicacao DATE NOT NULL,
  data_vencimento DATE,
  observacoes TEXT,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 14. Tabela de Anotações
CREATE TABLE anotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data DATE DEFAULT CURRENT_DATE,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos_recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gado ENABLE ROW LEVEL SECURITY;
ALTER TABLE caminhoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE financiamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acesso público para teste)
-- IMPORTANTE: Em produção, implementar políticas baseadas em auth.uid()

CREATE POLICY "Enable all for tarefas" ON tarefas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for processos" ON processos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for orcamentos_recibos" ON orcamentos_recibos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for imoveis" ON imoveis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for transacoes" ON transacoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for gado" ON gado FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for caminhoes" ON caminhoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for motoristas" ON motoristas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for fretes" ON fretes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for financiamentos" ON financiamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for investimentos" ON investimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for anotacoes" ON anotacoes FOR ALL USING (true) WITH CHECK (true);
