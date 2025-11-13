# 📊 DOCUMENTAÇÃO COMPLETA PARA PRODUÇÃO - BANCO DE DADOS

## Sistema Gerenciador Empresarial - Vanderlei

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Ordem de Execução](#ordem-de-execução)
4. [Script SQL Completo](#script-sql-completo)
5. [Verificação Pós-Instalação](#verificação-pós-instalação)
6. [Configuração de Segurança](#configuração-de-segurança)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 VISÃO GERAL

Este documento contém os comandos SQL **exatos** necessários para criar todas as tabelas, índices, triggers, funções e políticas RLS do sistema em um banco de dados **PostgreSQL/Supabase** do zero.

### Estrutura do Banco de Dados

- **Total de Tabelas:** 16
- **Total de Índices:** ~80+
- **Total de Triggers:** 16
- **Total de Políticas RLS:** 16
- **Banco de Dados:** PostgreSQL 15+ (Supabase)

### Tabelas do Sistema

1. **tarefas** - Gestão de tarefas e compromissos
2. **clientes** - Cadastro de clientes (PF/PJ)
3. **leads** - Gestão de leads e oportunidades
4. **processos** - Gestão de processos jurídicos
5. **orcamentos_recibos** - Orçamentos e recibos
6. **imoveis** - Gestão de imóveis
7. **contratos_locacao** - Contratos de locação
8. **transacoes** - Transações financeiras (entrada/saída)
9. **gado** - Gestão de rebanho bovino
10. **caminhoes** - Gestão da frota
11. **motoristas** - Gestão de motoristas
12. **fretes** - Gestão de fretes
13. **financiamentos** - Financiamentos e empréstimos
14. **investimentos** - Investimentos financeiros
15. **anotacoes** - Bloco de anotações
16. **followups** - Follow-ups de clientes

---

## 🔧 PRÉ-REQUISITOS

### Antes de começar, certifique-se de ter:

1. ✅ Acesso ao Supabase SQL Editor ou ao PostgreSQL
2. ✅ Permissões de administrador no banco de dados
3. ✅ Conexão estável com a internet
4. ✅ Backup de qualquer banco de dados existente (se houver)

### Configurações Necessárias

- **PostgreSQL:** Versão 15 ou superior
- **Extensões:** `uuid-ossp` (geralmente já habilitado no Supabase)
- **RLS:** Row Level Security deve estar habilitado

---

## 📝 ORDEM DE EXECUÇÃO

Execute os scripts na seguinte ordem:

1. **Função de atualização automática** (`update_updated_at_column`)
2. **Tabelas principais** (sem dependências)
3. **Tabelas com foreign keys** (com dependências)
4. **Índices** (após criação das tabelas)
5. **Triggers** (após criação da função)
6. **RLS e Políticas** (após criação das tabelas)
7. **Campos adicionais** (migrations)

---

## 🚀 SCRIPT SQL COMPLETO

### PASSO 1: Criar Função de Atualização Automática

```sql
-- =====================================================
-- FUNÇÃO: ATUALIZAÇÃO AUTOMÁTICA DE updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### PASSO 2: Criar Tabela TAREFAS

```sql
-- =====================================================
-- TABELA 1: TAREFAS
-- =====================================================
-- Descrição: Gerencia tarefas e compromissos do sistema
-- Campos obrigatórios: titulo, data_vencimento, prioridade, status
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
CREATE INDEX IF NOT EXISTS idx_tarefas_prioridade ON tarefas(prioridade);

-- Trigger para tarefas
CREATE TRIGGER update_tarefas_updated_at 
  BEFORE UPDATE ON tarefas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para tarefas
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for tarefas" ON tarefas 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 3: Criar Tabela CLIENTES

```sql
-- =====================================================
-- TABELA 2: CLIENTES
-- =====================================================
-- Descrição: Cadastro de clientes (Pessoa Física ou Jurídica)
-- Campos obrigatórios: nome, tipo, telefone, cep, endereco, cidade, estado, status
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
CREATE INDEX IF NOT EXISTS idx_clientes_tipo ON clientes(tipo);

-- Trigger para clientes
CREATE TRIGGER update_clientes_updated_at 
  BEFORE UPDATE ON clientes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para clientes
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for clientes" ON clientes 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 4: Criar Tabela LEADS

```sql
-- =====================================================
-- TABELA 3: LEADS
-- =====================================================
-- Descrição: Gestão de leads e oportunidades de negócio
-- Campos obrigatórios: nome, contato, origem, status
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  contato TEXT NOT NULL,
  origem TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('novo', 'contatado', 'interessado', 'convertido', 'perdido')),
  observacoes TEXT,
  historico_interacoes JSONB DEFAULT '[]',
  -- Campos adicionais da planilha
  descricao TEXT,
  data_inicio DATE,
  data_fim DATE,
  valor_contrato DECIMAL(10,2),
  tarefa TEXT,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads(origem);
CREATE INDEX IF NOT EXISTS idx_leads_historico ON leads USING GIN(historico_interacoes);
CREATE INDEX IF NOT EXISTS idx_leads_descricao ON leads(descricao);
CREATE INDEX IF NOT EXISTS idx_leads_data_inicio ON leads(data_inicio);
CREATE INDEX IF NOT EXISTS idx_leads_data_fim ON leads(data_fim);
CREATE INDEX IF NOT EXISTS idx_leads_tarefa ON leads(tarefa);
CREATE INDEX IF NOT EXISTS idx_leads_valor_contrato ON leads(valor_contrato);

-- Trigger para leads
CREATE TRIGGER update_leads_updated_at 
  BEFORE UPDATE ON leads 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for leads" ON leads 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 5: Criar Tabela PROCESSOS

```sql
-- =====================================================
-- TABELA 4: PROCESSOS
-- =====================================================
-- Descrição: Gestão completa de processos jurídicos
-- Campos obrigatórios: numero_processo, tipo, status, data_inicial
-- =====================================================
CREATE TABLE IF NOT EXISTS processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_processo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  tipo_acao_area TEXT,
  tipo_acao TEXT,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('em_andamento', 'concluido', 'arquivado')),
  status_categoria TEXT,
  status_detalhado TEXT,
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
CREATE INDEX IF NOT EXISTS idx_processos_tipo ON processos(tipo);
CREATE INDEX IF NOT EXISTS idx_processos_responsavel ON processos(responsavel);
CREATE INDEX IF NOT EXISTS idx_processos_data_inicial ON processos(data_inicial);
CREATE INDEX IF NOT EXISTS idx_processos_historico ON processos USING GIN(historico_andamentos);

-- Trigger para processos
CREATE TRIGGER update_processos_updated_at 
  BEFORE UPDATE ON processos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para processos
ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for processos" ON processos 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 6: Criar Tabela ORÇAMENTOS E RECIBOS

```sql
-- =====================================================
-- TABELA 5: ORÇAMENTOS E RECIBOS
-- =====================================================
-- Descrição: Gestão de orçamentos e recibos
-- Campos obrigatórios: numero, tipo, itens, valor_total, data_emissao, status
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

-- Índices para orcamentos_recibos
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_user_id ON orcamentos_recibos(user_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_cliente_id ON orcamentos_recibos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_processo_id ON orcamentos_recibos(processo_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_numero ON orcamentos_recibos(numero);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_tipo ON orcamentos_recibos(tipo);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_status ON orcamentos_recibos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_data_emissao ON orcamentos_recibos(data_emissao);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_itens ON orcamentos_recibos USING GIN(itens);

-- Trigger para orcamentos_recibos
CREATE TRIGGER update_orcamentos_recibos_updated_at 
  BEFORE UPDATE ON orcamentos_recibos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para orcamentos_recibos
ALTER TABLE orcamentos_recibos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for orcamentos_recibos" ON orcamentos_recibos 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 7: Criar Tabela IMÓVEIS

```sql
-- =====================================================
-- TABELA 6: IMÓVEIS
-- =====================================================
-- Descrição: Gestão de imóveis próprios
-- Campos obrigatórios: endereco, cep, numero, cidade, estado, valor, status
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
  -- Campos para aluguel (legado - usar contratos_locacao)
  inquilino_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  valor_aluguel DECIMAL(10,2),
  data_inicio_aluguel DATE,
  data_fim_aluguel DATE,
  conta_agua TEXT CHECK (conta_agua IN ('inquilino', 'proprietario')),
  conta_energia TEXT CHECK (conta_energia IN ('inquilino', 'proprietario')),
  tornar_receita BOOLEAN DEFAULT false,
  -- Campos adicionais da planilha
  vigencia_inicio DATE,
  vigencia_fim DATE,
  reajuste_locacao_percentual DECIMAL(5,2),
  reajuste_locacao_valor_inicial DECIMAL(10,2),
  reajuste_locacao_valor_final DECIMAL(10,2),
  inscricao_municipal TEXT,
  valor_venal DECIMAL(10,2),
  documentacao_status TEXT CHECK (documentacao_status IN ('ok', 'pendente')),
  contas_aberto_inquilino DECIMAL(10,2) DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para imoveis
CREATE INDEX IF NOT EXISTS idx_imoveis_user_id ON imoveis(user_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_matricula ON imoveis(matricula);
CREATE INDEX IF NOT EXISTS idx_imoveis_inquilino_id ON imoveis(inquilino_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_vigencia_inicio ON imoveis(vigencia_inicio);
CREATE INDEX IF NOT EXISTS idx_imoveis_vigencia_fim ON imoveis(vigencia_fim);
CREATE INDEX IF NOT EXISTS idx_imoveis_documentacao_status ON imoveis(documentacao_status);
CREATE INDEX IF NOT EXISTS idx_imoveis_inscricao_municipal ON imoveis(inscricao_municipal);

-- Trigger para imoveis
CREATE TRIGGER update_imoveis_updated_at 
  BEFORE UPDATE ON imoveis 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para imoveis
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for imoveis" ON imoveis 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 8: Criar Tabela CONTRATOS DE LOCAÇÃO

```sql
-- =====================================================
-- TABELA 7: CONTRATOS DE LOCAÇÃO
-- =====================================================
-- Descrição: Gestão de contratos de locação de imóveis
-- Campos obrigatórios: imovel_id, locatario_id, valor_aluguel, data_inicio, data_fim, dia_vencimento, conta_agua, conta_energia, status
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
  dia_vencimento INTEGER NOT NULL DEFAULT 5 CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31),
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
CREATE INDEX IF NOT EXISTS idx_contratos_locacao_data_inicio ON contratos_locacao(data_inicio);
CREATE INDEX IF NOT EXISTS idx_contratos_locacao_data_fim ON contratos_locacao(data_fim);

-- Trigger para contratos_locacao
CREATE TRIGGER update_contratos_locacao_updated_at 
  BEFORE UPDATE ON contratos_locacao 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para contratos_locacao
ALTER TABLE contratos_locacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for contratos_locacao" ON contratos_locacao 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 9: Criar Tabela TRANSAÇÕES

```sql
-- =====================================================
-- TABELA 8: TRANSAÇÕES (ENTRADA/SAÍDA)
-- =====================================================
-- Descrição: Registro de todas as transações financeiras
-- Campos obrigatórios: tipo, descricao, categoria, valor, data
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

-- Trigger para transacoes
CREATE TRIGGER update_transacoes_updated_at 
  BEFORE UPDATE ON transacoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para transacoes
ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for transacoes" ON transacoes 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 10: Criar Tabela GADO

```sql
-- =====================================================
-- TABELA 9: GADO
-- =====================================================
-- Descrição: Gestão de rebanho bovino
-- Campos obrigatórios: identificacao, categoria, status
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
CREATE INDEX IF NOT EXISTS idx_gado_lote ON gado(lote);
CREATE INDEX IF NOT EXISTS idx_gado_historico_peso ON gado USING GIN(historico_peso);
CREATE INDEX IF NOT EXISTS idx_gado_historico_saude ON gado USING GIN(historico_saude);
CREATE INDEX IF NOT EXISTS idx_gado_eventos ON gado USING GIN(eventos);

-- Trigger para gado
CREATE TRIGGER update_gado_updated_at 
  BEFORE UPDATE ON gado 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para gado
ALTER TABLE gado ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for gado" ON gado 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 11: Criar Tabela CAMINHÕES

```sql
-- =====================================================
-- TABELA 10: CAMINHÕES
-- =====================================================
-- Descrição: Gestão da frota de caminhões
-- Campos obrigatórios: placa, modelo, status
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

-- Trigger para caminhoes
CREATE TRIGGER update_caminhoes_updated_at 
  BEFORE UPDATE ON caminhoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para caminhoes
ALTER TABLE caminhoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for caminhoes" ON caminhoes 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 12: Criar Tabela MOTORISTAS

```sql
-- =====================================================
-- TABELA 11: MOTORISTAS
-- =====================================================
-- Descrição: Gestão de motoristas
-- Campos obrigatórios: nome, cnh, validade_cnh, telefone
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

-- Trigger para motoristas
CREATE TRIGGER update_motoristas_updated_at 
  BEFORE UPDATE ON motoristas 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para motoristas
ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for motoristas" ON motoristas 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 13: Criar Tabela FRETES

```sql
-- =====================================================
-- TABELA 12: FRETES
-- =====================================================
-- Descrição: Gestão de fretes realizados
-- Campos obrigatórios: cliente, origem, destino, valor_frete, data
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

-- Trigger para fretes
CREATE TRIGGER update_fretes_updated_at 
  BEFORE UPDATE ON fretes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para fretes
ALTER TABLE fretes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for fretes" ON fretes 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 14: Criar Tabela FINANCIAMENTOS

```sql
-- =====================================================
-- TABELA 13: FINANCIAMENTOS
-- =====================================================
-- Descrição: Gestão de financiamentos e empréstimos
-- Campos obrigatórios: banco, tipo, valor_total, taxa_juros, numero_parcelas, valor_parcela, data_inicio
-- =====================================================
CREATE TABLE IF NOT EXISTS financiamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banco TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('financiamento', 'emprestimo')),
  valor_total DECIMAL(10,2) NOT NULL,
  taxa_juros DECIMAL(5,2) NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_financiamentos_status ON financiamentos(status);

-- Trigger para financiamentos
CREATE TRIGGER update_financiamentos_updated_at 
  BEFORE UPDATE ON financiamentos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para financiamentos
ALTER TABLE financiamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for financiamentos" ON financiamentos 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 15: Criar Tabela INVESTIMENTOS

```sql
-- =====================================================
-- TABELA 14: INVESTIMENTOS
-- =====================================================
-- Descrição: Gestão de investimentos financeiros
-- Campos obrigatórios: tipo, instituicao, valor_aplicado, rentabilidade, data_aplicacao, status
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
CREATE INDEX IF NOT EXISTS idx_investimentos_status ON investimentos(status);
CREATE INDEX IF NOT EXISTS idx_investimentos_historico ON investimentos USING GIN(historico_rendimento);

-- Trigger para investimentos
CREATE TRIGGER update_investimentos_updated_at 
  BEFORE UPDATE ON investimentos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para investimentos
ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for investimentos" ON investimentos 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 16: Criar Tabela ANOTAÇÕES

```sql
-- =====================================================
-- TABELA 15: ANOTAÇÕES
-- =====================================================
-- Descrição: Bloco de anotações e lembretes
-- Campos obrigatórios: titulo, categoria, conteudo
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

-- Trigger para anotacoes
CREATE TRIGGER update_anotacoes_updated_at 
  BEFORE UPDATE ON anotacoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para anotacoes
ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anotacoes" ON anotacoes 
  FOR ALL USING (true) WITH CHECK (true);
```

### PASSO 17: Criar Tabela FOLLOW-UPS

```sql
-- =====================================================
-- TABELA 16: FOLLOW-UPS DE CLIENTES
-- =====================================================
-- Descrição: Histórico de relacionamento e follow-ups com clientes
-- Campos obrigatórios: cliente_id, mensagem, responsavel, status
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
CREATE INDEX IF NOT EXISTS idx_followups_responsavel ON followups(responsavel);

-- Trigger para followups
CREATE TRIGGER update_followups_updated_at 
  BEFORE UPDATE ON followups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS para followups
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for followups" ON followups 
  FOR ALL USING (true) WITH CHECK (true);
```

---

## ✅ VERIFICAÇÃO PÓS-INSTALAÇÃO

### Consulta para Verificar Todas as Tabelas

```sql
-- Verificar se todas as tabelas foram criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
    'imoveis', 'contratos_locacao', 'transacoes', 'gado', 'caminhoes',
    'motoristas', 'fretes', 'financiamentos', 'investimentos', 
    'anotacoes', 'followups'
  )
ORDER BY table_name;
```

### Consulta para Verificar Todos os Índices

```sql
-- Verificar índices criados
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
    'imoveis', 'contratos_locacao', 'transacoes', 'gado', 'caminhoes',
    'motoristas', 'fretes', 'financiamentos', 'investimentos', 
    'anotacoes', 'followups'
  )
ORDER BY tablename, indexname;
```

### Consulta para Verificar Todos os Triggers

```sql
-- Verificar triggers criados
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Consulta para Verificar Políticas RLS

```sql
-- Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## 🔒 CONFIGURAÇÃO DE SEGURANÇA

### ⚠️ IMPORTANTE: Políticas RLS em Produção

As políticas RLS atuais permitem acesso total (`USING (true) WITH CHECK (true)`). **Isso é apenas para desenvolvimento!**

Para produção, você deve alterar as políticas para usar autenticação baseada em `auth.uid()`:

```sql
-- Exemplo de política RLS para produção
DROP POLICY IF EXISTS "Enable all for clientes" ON clientes;
CREATE POLICY "Users can view own clientes" ON clientes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clientes" ON clientes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clientes" ON clientes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clientes" ON clientes
  FOR DELETE USING (auth.uid() = user_id);
```

**Repita este processo para todas as tabelas!**

### Habilitar Extensão UUID

```sql
-- Verificar se a extensão está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 🐛 TROUBLESHOOTING

### Erro: "relation already exists"

**Solução:** Use `CREATE TABLE IF NOT EXISTS` (já incluído nos scripts)

### Erro: "function update_updated_at_column() does not exist"

**Solução:** Execute o PASSO 1 primeiro (criar a função)

### Erro: "foreign key constraint fails"

**Solução:** Verifique a ordem de criação das tabelas. Tabelas com foreign keys devem ser criadas após as tabelas referenciadas.

### Erro: "permission denied for schema public"

**Solução:** Verifique se você tem permissões de administrador no banco de dados.

### Erro: "duplicate key value violates unique constraint"

**Solução:** Verifique se já existem dados na tabela e se há conflitos de chaves únicas.

---

## 📊 RESUMO FINAL

### Estatísticas do Banco de Dados

- **Total de Tabelas:** 16
- **Total de Índices:** ~80+
- **Total de Triggers:** 16
- **Total de Políticas RLS:** 16
- **Tabelas com JSONB:** 5 (processos, orcamentos_recibos, gado, investimentos, followups)
- **Tabelas com Foreign Keys:** 8

### Checklist de Instalação

- [ ] Função `update_updated_at_column()` criada
- [ ] Todas as 16 tabelas criadas
- [ ] Todos os índices criados
- [ ] Todos os triggers criados
- [ ] RLS habilitado em todas as tabelas
- [ ] Políticas RLS criadas (desenvolvimento)
- [ ] Verificação pós-instalação executada
- [ ] Políticas RLS de produção configuradas (se aplicável)
- [ ] Backup inicial criado

---

## 📝 NOTAS IMPORTANTES

1. **Backup:** Sempre faça backup antes de executar scripts em produção
2. **Teste:** Teste em ambiente de desenvolvimento antes de produção
3. **Segurança:** Altere as políticas RLS para produção
4. **Monitoramento:** Monitore o desempenho dos índices
5. **Manutenção:** Execute `VACUUM ANALYZE` periodicamente

---

## 🔗 LINKS ÚTEIS

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do PostgreSQL](https://www.postgresql.org/docs/)
- [RLS (Row Level Security)](https://supabase.com/docs/guides/auth/row-level-security)

---

**Última atualização:** 2025-01-12
**Versão do Schema:** 1.0.0
**Autor:** Sistema Gerenciador Empresarial - Vanderlei

