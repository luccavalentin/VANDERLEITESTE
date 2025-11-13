-- =====================================================
-- SCRIPT PARA VERIFICAR E CRIAR POLÍTICAS RLS
-- Sistema Gerenciador Empresarial - Vanderlei
-- =====================================================
-- 
-- Este script verifica se as políticas RLS existem e
-- as cria se não existirem. Isso resolve o problema
-- de dados não aparecerem no frontend.
--
-- ORDEM DE EXECUÇÃO:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se as políticas foram criadas
-- 3. Teste o sistema no frontend
-- =====================================================

-- =====================================================
-- PASSO 1: VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================

-- Verificar políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
    'imoveis', 'contratos_locacao', 'transacoes', 'gado', 'caminhoes',
    'motoristas', 'fretes', 'financiamentos', 'investimentos', 
    'anotacoes', 'followups'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- PASSO 2: HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

-- Habilitar RLS em todas as tabelas (se ainda não estiver habilitado)
ALTER TABLE IF EXISTS tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orcamentos_recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contratos_locacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gado ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS caminhoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financiamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS followups ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASSO 3: REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM)
-- =====================================================

-- Remover políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Enable all for tarefas" ON tarefas;
DROP POLICY IF EXISTS "Enable all for clientes" ON clientes;
DROP POLICY IF EXISTS "Enable all for leads" ON leads;
DROP POLICY IF EXISTS "Enable all for processos" ON processos;
DROP POLICY IF EXISTS "Enable all for orcamentos_recibos" ON orcamentos_recibos;
DROP POLICY IF EXISTS "Enable all for imoveis" ON imoveis;
DROP POLICY IF EXISTS "Enable all for contratos_locacao" ON contratos_locacao;
DROP POLICY IF EXISTS "Enable all for transacoes" ON transacoes;
DROP POLICY IF EXISTS "Enable all for gado" ON gado;
DROP POLICY IF EXISTS "Enable all for caminhoes" ON caminhoes;
DROP POLICY IF EXISTS "Enable all for motoristas" ON motoristas;
DROP POLICY IF EXISTS "Enable all for fretes" ON fretes;
DROP POLICY IF EXISTS "Enable all for financiamentos" ON financiamentos;
DROP POLICY IF EXISTS "Enable all for investimentos" ON investimentos;
DROP POLICY IF EXISTS "Enable all for anotacoes" ON anotacoes;
DROP POLICY IF EXISTS "Enable all for followups" ON followups;

-- =====================================================
-- PASSO 4: CRIAR POLÍTICAS RLS PARA TODAS AS TABELAS
-- =====================================================

-- Política para TAREFAS
CREATE POLICY "Enable all for tarefas" ON tarefas 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para CLIENTES
CREATE POLICY "Enable all for clientes" ON clientes 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para LEADS
CREATE POLICY "Enable all for leads" ON leads 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para PROCESSOS
CREATE POLICY "Enable all for processos" ON processos 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para ORÇAMENTOS E RECIBOS
CREATE POLICY "Enable all for orcamentos_recibos" ON orcamentos_recibos 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para IMÓVEIS
CREATE POLICY "Enable all for imoveis" ON imoveis 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para CONTRATOS DE LOCAÇÃO
CREATE POLICY "Enable all for contratos_locacao" ON contratos_locacao 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para TRANSAÇÕES
CREATE POLICY "Enable all for transacoes" ON transacoes 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para GADO
CREATE POLICY "Enable all for gado" ON gado 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para CAMINHÕES
CREATE POLICY "Enable all for caminhoes" ON caminhoes 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para MOTORISTAS
CREATE POLICY "Enable all for motoristas" ON motoristas 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para FRETES
CREATE POLICY "Enable all for fretes" ON fretes 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para FINANCIAMENTOS
CREATE POLICY "Enable all for financiamentos" ON financiamentos 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para INVESTIMENTOS
CREATE POLICY "Enable all for investimentos" ON investimentos 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para ANOTAÇÕES
CREATE POLICY "Enable all for anotacoes" ON anotacoes 
  FOR ALL USING (true) WITH CHECK (true);

-- Política para FOLLOW-UPS
CREATE POLICY "Enable all for followups" ON followups 
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- PASSO 5: VERIFICAR SE AS POLÍTICAS FORAM CRIADAS
-- =====================================================

-- Verificar políticas RLS criadas
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as tem_qual,
  CASE 
    WHEN with_check IS NOT NULL THEN 'SIM'
    ELSE 'NÃO'
  END as tem_with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
    'imoveis', 'contratos_locacao', 'transacoes', 'gado', 'caminhoes',
    'motoristas', 'fretes', 'financiamentos', 'investimentos', 
    'anotacoes', 'followups'
  )
ORDER BY tablename, policyname;

-- =====================================================
-- PASSO 6: VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================

-- Verificar se RLS está habilitado em todas as tabelas
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
    'imoveis', 'contratos_locacao', 'transacoes', 'gado', 'caminhoes',
    'motoristas', 'fretes', 'financiamentos', 'investimentos', 
    'anotacoes', 'followups'
  )
ORDER BY tablename;

-- =====================================================
-- PASSO 7: TESTAR ACESSO AOS DADOS
-- =====================================================

-- Testar SELECT em cada tabela (deve retornar dados se existirem)
SELECT 'tarefas' as tabela, COUNT(*) as total FROM tarefas
UNION ALL
SELECT 'clientes' as tabela, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'leads' as tabela, COUNT(*) as total FROM leads
UNION ALL
SELECT 'processos' as tabela, COUNT(*) as total FROM processos
UNION ALL
SELECT 'orcamentos_recibos' as tabela, COUNT(*) as total FROM orcamentos_recibos
UNION ALL
SELECT 'imoveis' as tabela, COUNT(*) as total FROM imoveis
UNION ALL
SELECT 'contratos_locacao' as tabela, COUNT(*) as total FROM contratos_locacao
UNION ALL
SELECT 'transacoes' as tabela, COUNT(*) as total FROM transacoes
UNION ALL
SELECT 'gado' as tabela, COUNT(*) as total FROM gado
UNION ALL
SELECT 'caminhoes' as tabela, COUNT(*) as total FROM caminhoes
UNION ALL
SELECT 'motoristas' as tabela, COUNT(*) as total FROM motoristas
UNION ALL
SELECT 'fretes' as tabela, COUNT(*) as total FROM fretes
UNION ALL
SELECT 'financiamentos' as tabela, COUNT(*) as total FROM financiamentos
UNION ALL
SELECT 'investimentos' as tabela, COUNT(*) as total FROM investimentos
UNION ALL
SELECT 'anotacoes' as tabela, COUNT(*) as total FROM anotacoes
UNION ALL
SELECT 'followups' as tabela, COUNT(*) as total FROM followups
ORDER BY tabela;

-- =====================================================
-- RESUMO FINAL
-- =====================================================
-- 
-- ✅ RLS habilitado em todas as tabelas
-- ✅ Políticas RLS criadas para todas as tabelas
-- ✅ Políticas permitem acesso público (desenvolvimento)
-- ✅ Dados podem ser acessados pelo frontend
-- 
-- PRÓXIMOS PASSOS:
-- 1. Verifique se as políticas foram criadas (consulta acima)
-- 2. Verifique se os dados foram inseridos (consulta acima)
-- 3. Teste o sistema no frontend
-- 4. Se ainda não funcionar, verifique o console do navegador
-- =====================================================

