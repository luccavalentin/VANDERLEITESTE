-- =====================================================
-- SCRIPT PARA VERIFICAR E CORRIGIR INVERSÃO DE TIPOS
-- Sistema Vanderlei - Transações (Entrada/Saída)
-- =====================================================

-- =====================================================
-- PASSO 1: VERIFICAR DADOS ATUAIS
-- =====================================================

-- Verificar quantas transações de cada tipo existem
SELECT 
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total_valor
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

-- =====================================================
-- PASSO 2: VERIFICAR SE HÁ INVERSÃO
-- =====================================================

-- Se você identificar que os tipos estão invertidos,
-- execute o comando abaixo para INVERTER todos os tipos:

-- ATENÇÃO: Este comando vai INVERTER todos os tipos!
-- Execute apenas se tiver certeza de que há inversão.

-- UPDATE transacoes
-- SET tipo = CASE 
--   WHEN tipo = 'entrada' THEN 'saida'
--   WHEN tipo = 'saida' THEN 'entrada'
--   ELSE tipo
-- END;

-- =====================================================
-- PASSO 3: CORRIGIR TIPOS ESPECÍFICOS (SE NECESSÁRIO)
-- =====================================================

-- Se você quiser corrigir apenas transações específicas,
-- use este exemplo (ajuste as condições conforme necessário):

-- Exemplo: Corrigir transações de uma categoria específica
-- UPDATE transacoes
-- SET tipo = 'entrada'
-- WHERE categoria = 'Vendas' AND tipo = 'saida';

-- Exemplo: Corrigir transações de uma data específica
-- UPDATE transacoes
-- SET tipo = 'saida'
-- WHERE data >= '2024-01-01' AND data <= '2024-01-31' AND tipo = 'entrada';

-- =====================================================
-- PASSO 4: VERIFICAR APÓS CORREÇÃO
-- =====================================================

-- Após executar as correções, verifique novamente:
SELECT 
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total_valor
FROM transacoes
GROUP BY tipo
ORDER BY tipo;

-- =====================================================
-- INSTRUÇÕES:
-- =====================================================
-- 1. Execute primeiro o PASSO 1 para verificar os dados
-- 2. Analise se há inversão comparando com o esperado
-- 3. Se houver inversão, descomente e execute o UPDATE do PASSO 2
-- 4. Ou use o PASSO 3 para correções específicas
-- 5. Execute o PASSO 4 para confirmar a correção
-- =====================================================

