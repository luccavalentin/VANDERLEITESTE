-- =====================================================
-- SCRIPT SUPER SIMPLES: HABILITAR ACESSO PÚBLICO
-- Copie e cole TUDO no Supabase SQL Editor e execute
-- =====================================================

-- 1. HABILITAR RLS
ALTER TABLE IF EXISTS tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS processos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orcamentos_recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gado ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS caminhoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fretes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS financiamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS investimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS anotacoes ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS ANTIGAS (se existirem)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos', 'imoveis', 'transacoes', 'gado', 'caminhoes', 'motoristas', 'fretes', 'financiamentos', 'investimentos', 'anotacoes')) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "public_select" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "public_insert" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "public_update" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "public_delete" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON %I', r.tablename);
        EXECUTE format('DROP POLICY IF EXISTS "Enable all for ' || r.tablename || '" ON %I', r.tablename);
    END LOOP;
END $$;

-- 3. CRIAR POLÍTICAS DE ACESSO PÚBLICO TOTAL
CREATE POLICY "public_select" ON tarefas FOR SELECT USING (true);
CREATE POLICY "public_insert" ON tarefas FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON tarefas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON tarefas FOR DELETE USING (true);

CREATE POLICY "public_select" ON clientes FOR SELECT USING (true);
CREATE POLICY "public_insert" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON clientes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON clientes FOR DELETE USING (true);

CREATE POLICY "public_select" ON leads FOR SELECT USING (true);
CREATE POLICY "public_insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON leads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON leads FOR DELETE USING (true);

CREATE POLICY "public_select" ON processos FOR SELECT USING (true);
CREATE POLICY "public_insert" ON processos FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON processos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON processos FOR DELETE USING (true);

CREATE POLICY "public_select" ON orcamentos_recibos FOR SELECT USING (true);
CREATE POLICY "public_insert" ON orcamentos_recibos FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON orcamentos_recibos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON orcamentos_recibos FOR DELETE USING (true);

CREATE POLICY "public_select" ON imoveis FOR SELECT USING (true);
CREATE POLICY "public_insert" ON imoveis FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON imoveis FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON imoveis FOR DELETE USING (true);

CREATE POLICY "public_select" ON transacoes FOR SELECT USING (true);
CREATE POLICY "public_insert" ON transacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON transacoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON transacoes FOR DELETE USING (true);

CREATE POLICY "public_select" ON gado FOR SELECT USING (true);
CREATE POLICY "public_insert" ON gado FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON gado FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON gado FOR DELETE USING (true);

CREATE POLICY "public_select" ON caminhoes FOR SELECT USING (true);
CREATE POLICY "public_insert" ON caminhoes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON caminhoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON caminhoes FOR DELETE USING (true);

CREATE POLICY "public_select" ON motoristas FOR SELECT USING (true);
CREATE POLICY "public_insert" ON motoristas FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON motoristas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON motoristas FOR DELETE USING (true);

CREATE POLICY "public_select" ON fretes FOR SELECT USING (true);
CREATE POLICY "public_insert" ON fretes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON fretes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON fretes FOR DELETE USING (true);

CREATE POLICY "public_select" ON financiamentos FOR SELECT USING (true);
CREATE POLICY "public_insert" ON financiamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON financiamentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON financiamentos FOR DELETE USING (true);

CREATE POLICY "public_select" ON investimentos FOR SELECT USING (true);
CREATE POLICY "public_insert" ON investimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON investimentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON investimentos FOR DELETE USING (true);

CREATE POLICY "public_select" ON anotacoes FOR SELECT USING (true);
CREATE POLICY "public_insert" ON anotacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON anotacoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON anotacoes FOR DELETE USING (true);

-- 4. VERIFICAR SE FUNCIONOU
SELECT 
  tablename,
  COUNT(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos', 'imoveis', 'transacoes', 'gado', 'caminhoes', 'motoristas', 'fretes', 'financiamentos', 'investimentos', 'anotacoes')
GROUP BY tablename
ORDER BY tablename;

-- Mensagem de sucesso
SELECT '✅ Políticas RLS criadas com sucesso! Total: 56 políticas (14 tabelas × 4 operações)' as resultado;

