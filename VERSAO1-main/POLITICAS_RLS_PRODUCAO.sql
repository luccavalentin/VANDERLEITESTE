-- =====================================================
-- POLÍTICAS RLS PARA PRODUÇÃO
-- Sistema Financeiro VANDE - Gerenciador Empresarial
-- =====================================================
-- 
-- INSTRUÇÕES:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Este script remove as políticas públicas (desenvolvimento)
-- 3. Cria políticas baseadas em auth.uid() para produção
-- 4. IMPORTANTE: Requer autenticação configurada
-- 
-- ⚠️ ATENÇÃO: Se você não vai usar autenticação por enquanto,
-- pode manter as políticas públicas, mas NÃO é recomendado para produção.
-- =====================================================

-- =====================================================
-- REMOVER POLÍTICAS DE DESENVOLVIMENTO
-- =====================================================

-- Remover políticas antigas (desenvolvimento)
DROP POLICY IF EXISTS "Enable all for tarefas" ON tarefas;
DROP POLICY IF EXISTS "Enable all for clientes" ON clientes;
DROP POLICY IF EXISTS "Enable all for leads" ON leads;
DROP POLICY IF EXISTS "Enable all for processos" ON processos;
DROP POLICY IF EXISTS "Enable all for orcamentos_recibos" ON orcamentos_recibos;
DROP POLICY IF EXISTS "Enable all for imoveis" ON imoveis;
DROP POLICY IF EXISTS "Enable all for transacoes" ON transacoes;
DROP POLICY IF EXISTS "Enable all for gado" ON gado;
DROP POLICY IF EXISTS "Enable all for caminhoes" ON caminhoes;
DROP POLICY IF EXISTS "Enable all for motoristas" ON motoristas;
DROP POLICY IF EXISTS "Enable all for fretes" ON fretes;
DROP POLICY IF EXISTS "Enable all for financiamentos" ON financiamentos;
DROP POLICY IF EXISTS "Enable all for investimentos" ON investimentos;
DROP POLICY IF EXISTS "Enable all for anotacoes" ON anotacoes;

-- =====================================================
-- POLÍTICAS PARA TAREFAS
-- =====================================================

CREATE POLICY "Users can view own tarefas" 
  ON tarefas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tarefas" 
  ON tarefas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tarefas" 
  ON tarefas FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tarefas" 
  ON tarefas FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA CLIENTES
-- =====================================================

CREATE POLICY "Users can view own clientes" 
  ON clientes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clientes" 
  ON clientes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clientes" 
  ON clientes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clientes" 
  ON clientes FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA LEADS
-- =====================================================

CREATE POLICY "Users can view own leads" 
  ON leads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads" 
  ON leads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads" 
  ON leads FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads" 
  ON leads FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA PROCESSOS
-- =====================================================

CREATE POLICY "Users can view own processos" 
  ON processos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processos" 
  ON processos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processos" 
  ON processos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own processos" 
  ON processos FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA ORÇAMENTOS E RECIBOS
-- =====================================================

CREATE POLICY "Users can view own orcamentos_recibos" 
  ON orcamentos_recibos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orcamentos_recibos" 
  ON orcamentos_recibos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orcamentos_recibos" 
  ON orcamentos_recibos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own orcamentos_recibos" 
  ON orcamentos_recibos FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA IMÓVEIS
-- =====================================================

CREATE POLICY "Users can view own imoveis" 
  ON imoveis FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imoveis" 
  ON imoveis FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own imoveis" 
  ON imoveis FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own imoveis" 
  ON imoveis FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA TRANSAÇÕES
-- =====================================================

CREATE POLICY "Users can view own transacoes" 
  ON transacoes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transacoes" 
  ON transacoes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transacoes" 
  ON transacoes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transacoes" 
  ON transacoes FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA GADO
-- =====================================================

CREATE POLICY "Users can view own gado" 
  ON gado FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gado" 
  ON gado FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gado" 
  ON gado FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gado" 
  ON gado FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA CAMINHÕES
-- =====================================================

CREATE POLICY "Users can view own caminhoes" 
  ON caminhoes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own caminhoes" 
  ON caminhoes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own caminhoes" 
  ON caminhoes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own caminhoes" 
  ON caminhoes FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA MOTORISTAS
-- =====================================================

CREATE POLICY "Users can view own motoristas" 
  ON motoristas FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own motoristas" 
  ON motoristas FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own motoristas" 
  ON motoristas FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own motoristas" 
  ON motoristas FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA FRETES
-- =====================================================

CREATE POLICY "Users can view own fretes" 
  ON fretes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fretes" 
  ON fretes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fretes" 
  ON fretes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fretes" 
  ON fretes FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA FINANCIAMENTOS
-- =====================================================

CREATE POLICY "Users can view own financiamentos" 
  ON financiamentos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financiamentos" 
  ON financiamentos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financiamentos" 
  ON financiamentos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financiamentos" 
  ON financiamentos FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA INVESTIMENTOS
-- =====================================================

CREATE POLICY "Users can view own investimentos" 
  ON investimentos FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investimentos" 
  ON investimentos FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investimentos" 
  ON investimentos FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investimentos" 
  ON investimentos FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA ANOTAÇÕES
-- =====================================================

CREATE POLICY "Users can view own anotacoes" 
  ON anotacoes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own anotacoes" 
  ON anotacoes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own anotacoes" 
  ON anotacoes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own anotacoes" 
  ON anotacoes FOR DELETE 
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNÇÃO PARA DEFINIR user_id AUTOMATICAMENTE
-- =====================================================
-- Esta função garante que o user_id seja sempre definido como auth.uid()
-- ao inserir ou atualizar dados

-- Função para definir user_id automaticamente em INSERT
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para todas as tabelas
CREATE TRIGGER set_user_id_tarefas
  BEFORE INSERT ON tarefas
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_clientes
  BEFORE INSERT ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_leads
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_processos
  BEFORE INSERT ON processos
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_orcamentos_recibos
  BEFORE INSERT ON orcamentos_recibos
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_imoveis
  BEFORE INSERT ON imoveis
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_transacoes
  BEFORE INSERT ON transacoes
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_gado
  BEFORE INSERT ON gado
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_caminhoes
  BEFORE INSERT ON caminhoes
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_motoristas
  BEFORE INSERT ON motoristas
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_fretes
  BEFORE INSERT ON fretes
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_financiamentos
  BEFORE INSERT ON financiamentos
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_investimentos
  BEFORE INSERT ON investimentos
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

CREATE TRIGGER set_user_id_anotacoes
  BEFORE INSERT ON anotacoes
  FOR EACH ROW
  EXECUTE FUNCTION set_user_id();

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN (
        'tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos',
        'imoveis', 'transacoes', 'gado', 'caminhoes', 'motoristas',
        'fretes', 'financiamentos', 'investimentos', 'anotacoes'
    )
ORDER BY tablename, policyname;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- 1. Estas políticas requerem autenticação (auth.uid())
-- 2. Se você não vai usar autenticação por enquanto,
--    você pode manter as políticas públicas, mas NÃO é recomendado para produção
-- 3. Para usar estas políticas, você precisa:
--    - Configurar autenticação no Supabase
--    - Fazer login no aplicativo
--    - O user_id será definido automaticamente pelo trigger
-- 
-- 4. Alternativa sem autenticação (NÃO RECOMENDADO PARA PRODUÇÃO):
--    CREATE POLICY "Enable all for tarefas" 
--      ON tarefas FOR ALL 
--      USING (true) WITH CHECK (true);
-- 
-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

