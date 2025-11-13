-- =====================================================
-- SCRIPT COMPLETO DE CRIAÇÃO DAS TABELAS DO SISTEMA
-- Sistema Financeiro VANDE - Gerenciador Empresarial
-- =====================================================

-- =====================================================
-- TABELA 1: TAREFAS
-- =====================================================
CREATE TABLE IF NOT EXISTS tarefas (
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

-- Índices para tarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_data_vencimento ON tarefas(data_vencimento);

-- =====================================================
-- TABELA 2: CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
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

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- =====================================================
-- TABELA 3: LEADS
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
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

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads(origem);
CREATE INDEX IF NOT EXISTS idx_leads_historico ON leads USING GIN(historico_interacoes);

-- =====================================================
-- TABELA 4: PROCESSOS
-- =====================================================
CREATE TABLE IF NOT EXISTS processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_processo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  tipo_acao_area TEXT,
  tipo_acao TEXT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('em_andamento', 'concluido', 'arquivado')),
  status_detalhado TEXT,
  status_categoria TEXT,
  data_inicial DATE NOT NULL,
  data_conclusao DATE,
  responsavel TEXT,
  valor_causa DECIMAL(10,2),
  resultado_causa TEXT CHECK (resultado_causa IN ('ganha', 'perdida', 'acordo', 'parcial', 'indeferida', 'anulada', 'extinta')),
  andamento_atual TEXT,
  observacoes TEXT,
  proximos_passos TEXT,
  historico_andamentos JSONB DEFAULT '[]',
  comarca TEXT,
  tribunal TEXT,
  fase_processual TEXT,
  -- Cronologia do Processo
  data_distribuicao DATE,
  data_citacao DATE,
  data_contestacao DATE,
  data_audiencia_conciliacao DATE,
  data_audiencia_instrucao DATE,
  data_sentenca DATE,
  data_publicacao_sentenca DATE,
  data_recurso DATE,
  data_transito_julgado DATE,
  data_arquivamento DATE,
  data_cumprimento_sentenca DATE,
  data_acordo DATE,
  data_pagamento_liquidacao DATE,
  data_limite_prazo DATE,
  cronologia JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para processos
CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_cliente_id ON processos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_processos_numero_processo ON processos(numero_processo);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_historico ON processos USING GIN(historico_andamentos);

-- =====================================================
-- TABELA 5: ORÇAMENTOS E RECIBOS
-- =====================================================
CREATE TABLE IF NOT EXISTS orcamentos_recibos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('orcamento', 'recibo')),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  processo_id UUID REFERENCES processos(id) ON DELETE SET NULL,
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

-- Índices para orçamentos_recibos
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_user_id ON orcamentos_recibos(user_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_cliente_id ON orcamentos_recibos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_processo_id ON orcamentos_recibos(processo_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_numero ON orcamentos_recibos(numero);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_tipo ON orcamentos_recibos(tipo);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_status ON orcamentos_recibos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_itens ON orcamentos_recibos USING GIN(itens);

-- =====================================================
-- TABELA 6: IMÓVEIS
-- =====================================================
CREATE TABLE IF NOT EXISTS imoveis (
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
  -- Campos para aluguel
  inquilino_id UUID REFERENCES clientes(id),
  valor_aluguel DECIMAL(10,2),
  data_inicio_aluguel DATE,
  data_fim_aluguel DATE,
  conta_agua TEXT CHECK (conta_agua IN ('inquilino', 'proprietario')),
  conta_energia TEXT CHECK (conta_energia IN ('inquilino', 'proprietario')),
  tornar_receita BOOLEAN DEFAULT false,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para imoveis
CREATE INDEX IF NOT EXISTS idx_imoveis_user_id ON imoveis(user_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_matricula ON imoveis(matricula);

-- =====================================================
-- TABELA: CONTRATOS DE LOCAÇÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS contratos_locacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES imoveis(id) ON DELETE CASCADE NOT NULL,
  locatario_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  valor_aluguel DECIMAL(10,2) NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  deposito_caucao DECIMAL(10,2),
  reajuste_indice TEXT,
  dia_vencimento INTEGER NOT NULL DEFAULT 5,
  conta_agua TEXT NOT NULL CHECK (conta_agua IN ('inquilino', 'proprietario')),
  conta_energia TEXT NOT NULL CHECK (conta_energia IN ('inquilino', 'proprietario')),
  tornar_receita BOOLEAN DEFAULT false,
  gerar_previsao BOOLEAN DEFAULT false,
  observacoes TEXT,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'encerrado', 'suspenso')) DEFAULT 'ativo',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para contratos_locacao
CREATE INDEX IF NOT EXISTS idx_contratos_locacao_user_id ON contratos_locacao(user_id);
CREATE INDEX IF NOT EXISTS idx_contratos_locacao_imovel_id ON contratos_locacao(imovel_id);
CREATE INDEX IF NOT EXISTS idx_contratos_locacao_locatario_id ON contratos_locacao(locatario_id);
CREATE INDEX IF NOT EXISTS idx_contratos_locacao_status ON contratos_locacao(status);

-- RLS e Triggers
ALTER TABLE contratos_locacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for contratos_locacao" ON contratos_locacao FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_contratos_locacao_updated_at BEFORE UPDATE ON contratos_locacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TABELA 7: TRANSAÇÕES (ENTRADA/SAÍDA)
-- =====================================================
CREATE TABLE IF NOT EXISTS transacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  area TEXT,
  observacoes TEXT,
  status TEXT CHECK (status IN ('realizado', 'previsto')) DEFAULT 'realizado',
  contrato_locacao_id UUID REFERENCES contratos_locacao(id) ON DELETE SET NULL,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para transacoes
CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_area ON transacoes(area);
CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_contrato_locacao_id ON transacoes(contrato_locacao_id);

-- =====================================================
-- TABELA 8: GADO
-- =====================================================
CREATE TABLE IF NOT EXISTS gado (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identificacao TEXT NOT NULL UNIQUE,
  brinco TEXT,
  lote TEXT,
  categoria TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'vendido', 'abatido', 'morto')),
  data_nascimento DATE,
  raca TEXT,
  origem TEXT CHECK (origem IN ('cria', 'compra')),
  idade_meses INTEGER,
  peso_atual DECIMAL(10,2),
  localizacao TEXT,
  observacoes TEXT,
  historico_peso JSONB DEFAULT '[]',
  historico_saude JSONB DEFAULT '[]',
  eventos JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para gado
CREATE INDEX IF NOT EXISTS idx_gado_user_id ON gado(user_id);
CREATE INDEX IF NOT EXISTS idx_gado_identificacao ON gado(identificacao);
CREATE INDEX IF NOT EXISTS idx_gado_status ON gado(status);
CREATE INDEX IF NOT EXISTS idx_gado_categoria ON gado(categoria);
CREATE INDEX IF NOT EXISTS idx_gado_historico_peso ON gado USING GIN(historico_peso);
CREATE INDEX IF NOT EXISTS idx_gado_historico_saude ON gado USING GIN(historico_saude);
CREATE INDEX IF NOT EXISTS idx_gado_eventos ON gado USING GIN(eventos);

-- =====================================================
-- TABELA 9: CAMINHÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS caminhoes (
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

-- Índices para caminhoes
CREATE INDEX IF NOT EXISTS idx_caminhoes_user_id ON caminhoes(user_id);
CREATE INDEX IF NOT EXISTS idx_caminhoes_placa ON caminhoes(placa);
CREATE INDEX IF NOT EXISTS idx_caminhoes_status ON caminhoes(status);

-- =====================================================
-- TABELA 10: MOTORISTAS
-- =====================================================
CREATE TABLE IF NOT EXISTS motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnh TEXT NOT NULL UNIQUE,
  validade_cnh DATE NOT NULL,
  telefone TEXT NOT NULL,
  caminhao_id UUID REFERENCES caminhoes(id) ON DELETE SET NULL,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para motoristas
CREATE INDEX IF NOT EXISTS idx_motoristas_user_id ON motoristas(user_id);
CREATE INDEX IF NOT EXISTS idx_motoristas_cnh ON motoristas(cnh);
CREATE INDEX IF NOT EXISTS idx_motoristas_caminhao_id ON motoristas(caminhao_id);
CREATE INDEX IF NOT EXISTS idx_motoristas_validade_cnh ON motoristas(validade_cnh);

-- =====================================================
-- TABELA 11: FRETES
-- =====================================================
CREATE TABLE IF NOT EXISTS fretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente TEXT NOT NULL,
  caminhao_id UUID REFERENCES caminhoes(id) ON DELETE SET NULL,
  motorista_id UUID REFERENCES motoristas(id) ON DELETE SET NULL,
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

-- Índices para fretes
CREATE INDEX IF NOT EXISTS idx_fretes_user_id ON fretes(user_id);
CREATE INDEX IF NOT EXISTS idx_fretes_data ON fretes(data);
CREATE INDEX IF NOT EXISTS idx_fretes_cliente ON fretes(cliente);
CREATE INDEX IF NOT EXISTS idx_fretes_caminhao_id ON fretes(caminhao_id);
CREATE INDEX IF NOT EXISTS idx_fretes_motorista_id ON fretes(motorista_id);

-- =====================================================
-- TABELA 12: FINANCIAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS financiamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banco TEXT NOT NULL,
  valor_total DECIMAL(10,2) NOT NULL,
  taxa_juros DECIMAL(5,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('financiamento', 'emprestimo')),
  sistema_amortizacao TEXT CHECK (sistema_amortizacao IN ('SAC', 'PRICE')) DEFAULT 'PRICE',
  numero_parcelas INTEGER NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  iof DECIMAL(10,2) DEFAULT 0,
  seguro DECIMAL(10,2) DEFAULT 0,
  cet DECIMAL(5,2),
  data_inicio DATE NOT NULL,
  data_termino DATE,
  status TEXT CHECK (status IN ('ativo', 'quitado', 'cancelado')) DEFAULT 'ativo',
  documento_url TEXT,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para financiamentos
CREATE INDEX IF NOT EXISTS idx_financiamentos_user_id ON financiamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_financiamentos_tipo ON financiamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_financiamentos_banco ON financiamentos(banco);
CREATE INDEX IF NOT EXISTS idx_financiamentos_data_inicio ON financiamentos(data_inicio);

-- =====================================================
-- TABELA 13: INVESTIMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS investimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  instituicao TEXT NOT NULL,
  valor_aplicado DECIMAL(10,2) NOT NULL,
  rentabilidade DECIMAL(5,2) NOT NULL,
  prazo_dias INTEGER,
  data_aplicacao DATE NOT NULL,
  data_vencimento DATE,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'resgatado', 'vencido')) DEFAULT 'ativo',
  vincular_fluxo_caixa BOOLEAN DEFAULT false,
  observacoes TEXT,
  historico_rendimento JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para investimentos
CREATE INDEX IF NOT EXISTS idx_investimentos_user_id ON investimentos(user_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_tipo ON investimentos(tipo);
CREATE INDEX IF NOT EXISTS idx_investimentos_instituicao ON investimentos(instituicao);
CREATE INDEX IF NOT EXISTS idx_investimentos_data_aplicacao ON investimentos(data_aplicacao);
CREATE INDEX IF NOT EXISTS idx_investimentos_data_vencimento ON investimentos(data_vencimento);

-- =====================================================
-- TABELA 14: ANOTAÇÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS anotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  data DATE DEFAULT CURRENT_DATE,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para anotacoes
CREATE INDEX IF NOT EXISTS idx_anotacoes_user_id ON anotacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_categoria ON anotacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_anotacoes_data ON anotacoes(data);

-- =====================================================
-- FUNÇÕES PARA ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at em todas as tabelas
CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON tarefas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processos_updated_at BEFORE UPDATE ON processos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orcamentos_recibos_updated_at BEFORE UPDATE ON orcamentos_recibos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_imoveis_updated_at BEFORE UPDATE ON imoveis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gado_updated_at BEFORE UPDATE ON gado FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_caminhoes_updated_at BEFORE UPDATE ON caminhoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_motoristas_updated_at BEFORE UPDATE ON motoristas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fretes_updated_at BEFORE UPDATE ON fretes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financiamentos_updated_at BEFORE UPDATE ON financiamentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investimentos_updated_at BEFORE UPDATE ON investimentos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_anotacoes_updated_at BEFORE UPDATE ON anotacoes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_followups_updated_at BEFORE UPDATE ON followups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

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
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos_locacao ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS (PERMITIR ACESSO PÚBLICO PARA DESENVOLVIMENTO)
-- IMPORTANTE: Em produção, alterar para políticas baseadas em auth.uid()
-- =====================================================

-- Políticas para TAREFAS
CREATE POLICY "Enable all for tarefas" ON tarefas FOR ALL USING (true) WITH CHECK (true);

-- Políticas para CLIENTES
CREATE POLICY "Enable all for clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para LEADS
CREATE POLICY "Enable all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- TABELA: FOLLOW-UPS DE CLIENTES
-- =====================================================
CREATE TABLE IF NOT EXISTS followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE NOT NULL,
  mensagem TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  data_hora TIMESTAMP DEFAULT NOW(),
  lembrete_data DATE,
  lembrete_texto TEXT,
  transformar_tarefa BOOLEAN DEFAULT false,
  tarefa_id UUID REFERENCES tarefas(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'concluido', 'aguardando_cliente')) DEFAULT 'pendente',
  anexos JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para followups
CREATE INDEX IF NOT EXISTS idx_followups_user_id ON followups(user_id);
CREATE INDEX IF NOT EXISTS idx_followups_cliente_id ON followups(cliente_id);
CREATE INDEX IF NOT EXISTS idx_followups_tarefa_id ON followups(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_data_hora ON followups(data_hora);
CREATE INDEX IF NOT EXISTS idx_followups_lembrete_data ON followups(lembrete_data);

-- Políticas para PROCESSOS
CREATE POLICY "Enable all for processos" ON processos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para FOLLOW-UPS
CREATE POLICY "Enable all for followups" ON followups FOR ALL USING (true) WITH CHECK (true);

-- Políticas para ORÇAMENTOS E RECIBOS
CREATE POLICY "Enable all for orcamentos_recibos" ON orcamentos_recibos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para IMÓVEIS
CREATE POLICY "Enable all for imoveis" ON imoveis FOR ALL USING (true) WITH CHECK (true);

-- Políticas para TRANSAÇÕES
CREATE POLICY "Enable all for transacoes" ON transacoes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para GADO
CREATE POLICY "Enable all for gado" ON gado FOR ALL USING (true) WITH CHECK (true);

-- Políticas para CAMINHÕES
CREATE POLICY "Enable all for caminhoes" ON caminhoes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para MOTORISTAS
CREATE POLICY "Enable all for motoristas" ON motoristas FOR ALL USING (true) WITH CHECK (true);

-- Políticas para FRETES
CREATE POLICY "Enable all for fretes" ON fretes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para FINANCIAMENTOS
CREATE POLICY "Enable all for financiamentos" ON financiamentos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para INVESTIMENTOS
CREATE POLICY "Enable all for investimentos" ON investimentos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para ANOTAÇÕES
CREATE POLICY "Enable all for anotacoes" ON anotacoes FOR ALL USING (true) WITH CHECK (true);

-- Políticas para CONTRATOS DE LOCAÇÃO
CREATE POLICY "Enable all for contratos_locacao" ON contratos_locacao FOR ALL USING (true) WITH CHECK (true);

