-- =====================================================
-- SCRIPT RÁPIDO: HABILITAR ACESSO PÚBLICO A TODAS AS TABELAS
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- Habilitar RLS em todas as tabelas
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

-- Remover políticas antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON tarefas;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON clientes;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON leads;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON processos;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON orcamentos_recibos;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON imoveis;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON transacoes;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON gado;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON caminhoes;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON motoristas;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON fretes;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON financiamentos;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON investimentos;
DROP POLICY IF EXISTS "Permitir acesso público SELECT" ON anotacoes;

DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON tarefas;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON clientes;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON leads;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON processos;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON orcamentos_recibos;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON imoveis;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON transacoes;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON gado;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON caminhoes;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON motoristas;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON fretes;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON financiamentos;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON investimentos;
DROP POLICY IF EXISTS "Permitir acesso público INSERT" ON anotacoes;

DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON tarefas;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON clientes;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON leads;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON processos;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON orcamentos_recibos;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON imoveis;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON transacoes;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON gado;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON caminhoes;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON motoristas;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON fretes;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON financiamentos;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON investimentos;
DROP POLICY IF EXISTS "Permitir acesso público UPDATE" ON anotacoes;

DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON tarefas;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON clientes;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON leads;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON processos;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON orcamentos_recibos;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON imoveis;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON transacoes;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON gado;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON caminhoes;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON motoristas;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON fretes;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON financiamentos;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON investimentos;
DROP POLICY IF EXISTS "Permitir acesso público DELETE" ON anotacoes;

-- Criar políticas de SELECT (leitura) - ACESSO PÚBLICO
CREATE POLICY "Permitir acesso público SELECT" ON tarefas FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON clientes FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON leads FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON processos FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON orcamentos_recibos FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON imoveis FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON transacoes FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON gado FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON caminhoes FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON motoristas FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON fretes FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON financiamentos FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON investimentos FOR SELECT USING (true);
CREATE POLICY "Permitir acesso público SELECT" ON anotacoes FOR SELECT USING (true);

-- Criar políticas de INSERT (inserção) - ACESSO PÚBLICO
CREATE POLICY "Permitir acesso público INSERT" ON tarefas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON clientes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON processos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON orcamentos_recibos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON imoveis FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON transacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON gado FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON caminhoes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON motoristas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON fretes FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON financiamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON investimentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir acesso público INSERT" ON anotacoes FOR INSERT WITH CHECK (true);

-- Criar políticas de UPDATE (atualização) - ACESSO PÚBLICO
CREATE POLICY "Permitir acesso público UPDATE" ON tarefas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON clientes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON leads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON processos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON orcamentos_recibos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON imoveis FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON transacoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON gado FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON caminhoes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON motoristas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON fretes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON financiamentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON investimentos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Permitir acesso público UPDATE" ON anotacoes FOR UPDATE USING (true) WITH CHECK (true);

-- Criar políticas de DELETE (exclusão) - ACESSO PÚBLICO
CREATE POLICY "Permitir acesso público DELETE" ON tarefas FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON clientes FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON leads FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON processos FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON orcamentos_recibos FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON imoveis FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON transacoes FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON gado FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON caminhoes FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON motoristas FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON fretes FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON financiamentos FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON investimentos FOR DELETE USING (true);
CREATE POLICY "Permitir acesso público DELETE" ON anotacoes FOR DELETE USING (true);

-- Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
    'imoveis', 'transacoes', 'gado', 'caminhoes',
    'motoristas', 'fretes', 'financiamentos', 'investimentos', 'anotacoes'
  )
ORDER BY tablename, cmd;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS criadas com sucesso!';
  RAISE NOTICE '✅ Acesso público habilitado para todas as tabelas';
  RAISE NOTICE '✅ Agora você pode acessar os dados no frontend';
END $$;

