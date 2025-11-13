-- =====================================================
-- SCRIPT PARA VERIFICAR INVERSÃO NO DASHBOARD DE CAIXA
-- Sistema Vanderlei - Verificação de Entradas e Saídas
-- =====================================================

-- =====================================================
-- PASSO 1: VERIFICAR DADOS ATUAIS
-- =====================================================

-- Verificar quantas transações de cada tipo existem
SELECT 
  'VERIFICAÇÃO ATUAL' as status,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total_valor,
  AVG(valor) as valor_medio
FROM transacoes
GROUP BY tipo
ORDER BY tipo;

-- Verificar algumas transações de exemplo
SELECT 
  id,
  tipo,
  descricao,
  categoria,
  valor,
  data,
  created_at
FROM transacoes
ORDER BY created_at DESC
LIMIT 20;

-- Verificar se há inconsistências (valores negativos em entradas ou positivos em saídas)
SELECT 
  'ENTRADAS COM VALORES NEGATIVOS' as tipo_erro,
  COUNT(*) as quantidade
FROM transacoes
WHERE tipo = 'entrada' AND valor < 0;

SELECT 
  'SAÍDAS COM VALORES POSITIVOS (normal)' as tipo_erro,
  COUNT(*) as quantidade
FROM transacoes
WHERE tipo = 'saida' AND valor > 0;

-- =====================================================
-- PASSO 2: ANÁLISE DE PADRÕES
-- =====================================================

-- Verificar categorias mais comuns em cada tipo
SELECT 
  tipo,
  categoria,
  COUNT(*) as quantidade,
  SUM(valor) as total
FROM transacoes
GROUP BY tipo, categoria
ORDER BY tipo, total DESC
LIMIT 20;

-- =====================================================
-- PASSO 3: SE HOUVER INVERSÃO, EXECUTAR CORREÇÃO
-- =====================================================
-- 
-- ATENÇÃO: Descomente apenas se confirmar que há inversão!
-- 
-- UPDATE transacoes
-- SET tipo = CASE 
--   WHEN tipo = 'entrada' THEN 'saida'
--   WHEN tipo = 'saida' THEN 'entrada'
--   ELSE tipo
-- END
-- WHERE tipo IN ('entrada', 'saida');
-- 
-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Execute o PASSO 1 para verificar os dados
-- 2. Analise se os valores fazem sentido:
--    - Entradas devem ter valores positivos (receitas)
--    - Saídas devem ter valores positivos (despesas)
--    - O total de entradas deve ser maior que saídas (geralmente)
-- 3. Compare com o que aparece no frontend
-- 4. Se confirmar inversão, execute o UPDATE do PASSO 3
-- =====================================================

