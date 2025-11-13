# GUIA PASSO A PASSO - CRIAÇÃO DAS TABELAS NO SUPABASE

Este guia fornece instruções detalhadas para criar todas as tabelas necessárias no Supabase para o Sistema Financeiro VANDE.

## PRÉ-REQUISITOS

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. Acesso ao SQL Editor do Supabase

## PASSO 1: ACESSAR O SUPABASE

1. Acesse https://supabase.com
2. Faça login na sua conta
3. Selecione seu projeto ou crie um novo projeto
4. Aguarde o projeto ser inicializado

## PASSO 2: ACESSAR O SQL EDITOR

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** para criar uma nova query
3. Você verá um editor SQL vazio

## PASSO 3: COPIAR O SCRIPT SQL

1. Abra o arquivo `SUPABASE_TABELAS.sql` que foi gerado
2. Copie TODO o conteúdo do arquivo (Ctrl+A, Ctrl+C)
3. Cole no editor SQL do Supabase (Ctrl+V)

## PASSO 4: EXECUTAR O SCRIPT

1. Clique no botão **Run** (ou pressione Ctrl+Enter)
2. Aguarde a execução do script (pode levar alguns segundos)
3. Verifique se há erros na aba "Messages" ou "Results"

## PASSO 5: VERIFICAR AS TABELAS CRIADAS

1. No menu lateral esquerdo, clique em **Table Editor**
2. Você deve ver todas as 14 tabelas criadas:
   - tarefas
   - clientes
   - leads
   - processos
   - orcamentos_recibos
   - imoveis
   - transacoes
   - gado
   - caminhoes
   - motoristas
   - fretes
   - financiamentos
   - investimentos
   - anotacoes

## PASSO 6: VERIFICAR AS POLÍTICAS RLS

1. No menu lateral esquerdo, clique em **Authentication** > **Policies**
2. Você deve ver políticas criadas para cada tabela
3. As políticas atuais permitem acesso público (para desenvolvimento)
4. **IMPORTANTE**: Em produção, você deve alterar as políticas para usar `auth.uid()`

## PASSO 7: CONFIGURAR AS CREDENCIAIS DO SUPABASE

1. No menu lateral esquerdo, clique em **Project Settings**
2. Clique em **API**
3. Copie as seguintes informações:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon public key** (ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)
4. Guarde essas informações para usar no seu projeto React

## PASSO 8: ATUALIZAR O CLIENTE SUPABASE NO PROJETO

1. Abra o arquivo `src/integrations/supabase/client.ts`
2. Substitua as credenciais pelas suas credenciais do Supabase:

```typescript
const SUPABASE_URL = "SUA_PROJECT_URL_AQUI";
const SUPABASE_PUBLISHABLE_KEY = "SUA_ANON_KEY_AQUI";
```

## PASSO 9: GERAR OS TIPOS DO SUPABASE (OPCIONAL)

1. No menu lateral esquerdo, clique em **Project Settings** > **API**
2. Role para baixo até encontrar **Generate TypeScript types**
3. Clique em **Generate TypeScript types**
4. Copie o código gerado
5. Cole no arquivo `src/integrations/supabase/types.ts`
6. Isso garantirá que os tipos TypeScript estejam atualizados

## PASSO 10: TESTAR A CONEXÃO

1. Execute o projeto React: `pnpm dev`
2. Acesse http://localhost:8080
3. Tente criar uma tarefa ou cliente
4. Verifique se os dados são salvos no Supabase através do Table Editor

## CRIAÇÃO INDIVIDUAL DE TABELAS (ALTERNATIVA)

Se preferir criar as tabelas uma por uma, siga os passos abaixo para cada tabela:

### TABELA 1: TAREFAS

1. No SQL Editor, execute o seguinte script:

```sql
-- Criar tabela tarefas
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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_tarefas_user_id ON tarefas(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_data_vencimento ON tarefas(data_vencimento);

-- Habilitar RLS
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;

-- Criar política
CREATE POLICY "Enable all for tarefas" ON tarefas FOR ALL USING (true) WITH CHECK (true);
```

2. Clique em **Run** para executar
3. Verifique se a tabela foi criada no Table Editor

### TABELA 2: CLIENTES

1. Execute o script da tabela clientes:

```sql
-- Criar tabela clientes
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

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes(nome);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON clientes(status);

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Criar política
CREATE POLICY "Enable all for clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 3: LEADS

```sql
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

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_origem ON leads(origem);
CREATE INDEX IF NOT EXISTS idx_leads_historico ON leads USING GIN(historico_interacoes);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for leads" ON leads FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 4: PROCESSOS

```sql
CREATE TABLE IF NOT EXISTS processos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_processo TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
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

CREATE INDEX IF NOT EXISTS idx_processos_user_id ON processos(user_id);
CREATE INDEX IF NOT EXISTS idx_processos_cliente_id ON processos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_processos_numero_processo ON processos(numero_processo);
CREATE INDEX IF NOT EXISTS idx_processos_status ON processos(status);
CREATE INDEX IF NOT EXISTS idx_processos_historico ON processos USING GIN(historico_andamentos);

ALTER TABLE processos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for processos" ON processos FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 5: ORÇAMENTOS E RECIBOS

```sql
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

CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_user_id ON orcamentos_recibos(user_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_cliente_id ON orcamentos_recibos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_processo_id ON orcamentos_recibos(processo_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_numero ON orcamentos_recibos(numero);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_tipo ON orcamentos_recibos(tipo);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_status ON orcamentos_recibos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_recibos_itens ON orcamentos_recibos USING GIN(itens);

ALTER TABLE orcamentos_recibos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for orcamentos_recibos" ON orcamentos_recibos FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 6: IMÓVEIS

```sql
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
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_imoveis_user_id ON imoveis(user_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_imoveis_cidade ON imoveis(cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_matricula ON imoveis(matricula);

ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for imoveis" ON imoveis FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 7: TRANSAÇÕES

```sql
CREATE TABLE IF NOT EXISTS transacoes (
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

CREATE INDEX IF NOT EXISTS idx_transacoes_user_id ON transacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_tipo ON transacoes(tipo);
CREATE INDEX IF NOT EXISTS idx_transacoes_categoria ON transacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_area ON transacoes(area);

ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for transacoes" ON transacoes FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 8: GADO

```sql
CREATE TABLE IF NOT EXISTS gado (
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

CREATE INDEX IF NOT EXISTS idx_gado_user_id ON gado(user_id);
CREATE INDEX IF NOT EXISTS idx_gado_identificacao ON gado(identificacao);
CREATE INDEX IF NOT EXISTS idx_gado_status ON gado(status);
CREATE INDEX IF NOT EXISTS idx_gado_categoria ON gado(categoria);
CREATE INDEX IF NOT EXISTS idx_gado_historico_peso ON gado USING GIN(historico_peso);
CREATE INDEX IF NOT EXISTS idx_gado_historico_saude ON gado USING GIN(historico_saude);
CREATE INDEX IF NOT EXISTS idx_gado_eventos ON gado USING GIN(eventos);

ALTER TABLE gado ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for gado" ON gado FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 9: CAMINHÕES

```sql
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

CREATE INDEX IF NOT EXISTS idx_caminhoes_user_id ON caminhoes(user_id);
CREATE INDEX IF NOT EXISTS idx_caminhoes_placa ON caminhoes(placa);
CREATE INDEX IF NOT EXISTS idx_caminhoes_status ON caminhoes(status);

ALTER TABLE caminhoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for caminhoes" ON caminhoes FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 10: MOTORISTAS

```sql
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

CREATE INDEX IF NOT EXISTS idx_motoristas_user_id ON motoristas(user_id);
CREATE INDEX IF NOT EXISTS idx_motoristas_cnh ON motoristas(cnh);
CREATE INDEX IF NOT EXISTS idx_motoristas_caminhao_id ON motoristas(caminhao_id);
CREATE INDEX IF NOT EXISTS idx_motoristas_validade_cnh ON motoristas(validade_cnh);

ALTER TABLE motoristas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for motoristas" ON motoristas FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 11: FRETES

```sql
CREATE TABLE IF NOT EXISTS fretes (
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

CREATE INDEX IF NOT EXISTS idx_fretes_user_id ON fretes(user_id);
CREATE INDEX IF NOT EXISTS idx_fretes_data ON fretes(data);
CREATE INDEX IF NOT EXISTS idx_fretes_cliente ON fretes(cliente);

ALTER TABLE fretes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for fretes" ON fretes FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 12: FINANCIAMENTOS

```sql
CREATE TABLE IF NOT EXISTS financiamentos (
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

CREATE INDEX IF NOT EXISTS idx_financiamentos_user_id ON financiamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_financiamentos_tipo ON financiamentos(tipo);
CREATE INDEX IF NOT EXISTS idx_financiamentos_banco ON financiamentos(banco);
CREATE INDEX IF NOT EXISTS idx_financiamentos_data_inicio ON financiamentos(data_inicio);

ALTER TABLE financiamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for financiamentos" ON financiamentos FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 13: INVESTIMENTOS

```sql
CREATE TABLE IF NOT EXISTS investimentos (
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

CREATE INDEX IF NOT EXISTS idx_investimentos_user_id ON investimentos(user_id);
CREATE INDEX IF NOT EXISTS idx_investimentos_tipo ON investimentos(tipo);
CREATE INDEX IF NOT EXISTS idx_investimentos_instituicao ON investimentos(instituicao);
CREATE INDEX IF NOT EXISTS idx_investimentos_data_aplicacao ON investimentos(data_aplicacao);
CREATE INDEX IF NOT EXISTS idx_investimentos_data_vencimento ON investimentos(data_vencimento);

ALTER TABLE investimentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for investimentos" ON investimentos FOR ALL USING (true) WITH CHECK (true);
```

### TABELA 14: ANOTAÇÕES

```sql
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

CREATE INDEX IF NOT EXISTS idx_anotacoes_user_id ON anotacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_anotacoes_categoria ON anotacoes(categoria);
CREATE INDEX IF NOT EXISTS idx_anotacoes_data ON anotacoes(data);

ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for anotacoes" ON anotacoes FOR ALL USING (true) WITH CHECK (true);
```

## CRIAR FUNÇÃO E TRIGGERS PARA updated_at

Após criar todas as tabelas, execute o script para criar a função e os triggers:

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
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
```

## VERIFICAÇÃO FINAL

Execute este script para verificar se todas as tabelas foram criadas corretamente:

```sql
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN (
        'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
        'imoveis', 'transacoes', 'gado', 'caminhoes', 'motoristas',
        'fretes', 'financiamentos', 'investimentos', 'anotacoes'
    )
ORDER BY table_name;
```

Você deve ver 14 tabelas listadas.

## TROUBLESHOOTING

### Erro: "relation already exists"
- Se uma tabela já existe, você pode usar `DROP TABLE IF EXISTS nome_tabela CASCADE;` antes de criá-la
- **CUIDADO**: Isso apagará todos os dados da tabela!

### Erro: "permission denied"
- Verifique se você tem permissões de administrador no projeto
- Verifique se está executando o script no schema correto (public)

### Erro: "constraint violation"
- Verifique se as foreign keys estão corretas
- Certifique-se de que as tabelas referenciadas foram criadas antes

### Erro: "syntax error"
- Verifique se há vírgulas faltando ou extras
- Verifique se todos os parênteses estão fechados
- Verifique se as aspas estão corretas

## PRÓXIMOS PASSOS

1. Configurar as credenciais do Supabase no projeto React
2. Testar a conexão
3. Criar alguns dados de teste
4. Testar as funcionalidades do sistema
5. Configurar políticas RLS mais restritivas para produção

## POLÍTICAS RLS PARA PRODUÇÃO

Para produção, você deve alterar as políticas RLS para usar `auth.uid()`. Exemplo:

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Enable all for tarefas" ON tarefas;

-- Criar políticas baseadas em user_id
CREATE POLICY "Users can view own tarefas" ON tarefas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tarefas" ON tarefas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tarefas" ON tarefas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tarefas" ON tarefas FOR DELETE USING (auth.uid() = user_id);
```

Repita isso para todas as tabelas.

---

**NOTA**: Este guia assume que você está usando o Supabase. Se estiver usando outro banco de dados PostgreSQL, adapte os comandos conforme necessário.

