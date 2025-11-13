-- =====================================================
-- SCRIPT PARA CORRIGIR INVERSÃO DE ENTRADA E SAÍDA
-- Sistema Vanderlei - Transações
-- =====================================================
-- 
-- ATENÇÃO: Este script INVERTE todos os tipos de transação!
-- Execute apenas se tiver certeza de que há inversão.
-- 
-- =====================================================
-- PASSO 1: VERIFICAR DADOS ANTES DA CORREÇÃO
-- =====================================================

-- Verificar quantas transações de cada tipo existem ANTES
SELECT 
  'ANTES DA CORREÇÃO' as status,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total_valor
FROM transacoes
GROUP BY tipo
ORDER BY tipo;

-- Verificar algumas transações de exemplo ANTES
SELECT 
  'ANTES' as status,
  id,
  tipo,
  descricao,
  categoria,
  valor,
  data
FROM transacoes
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- PASSO 2: INVERTER OS TIPOS
-- =====================================================
-- 
-- Este comando vai INVERTER todos os tipos:
-- - 'entrada' vira 'saida'
-- - 'saida' vira 'entrada'
-- 
-- Execute apenas se tiver certeza de que há inversão!

UPDATE transacoes
SET tipo = CASE 
  WHEN tipo = 'entrada' THEN 'saida'
  WHEN tipo = 'saida' THEN 'entrada'
  ELSE tipo
END
WHERE tipo IN ('entrada', 'saida');

-- =====================================================
-- PASSO 3: VERIFICAR DADOS APÓS A CORREÇÃO
-- =====================================================

-- Verificar quantas transações de cada tipo existem DEPOIS
SELECT 
  'DEPOIS DA CORREÇÃO' as status,
  tipo,
  COUNT(*) as quantidade,
  SUM(valor) as total_valor
FROM transacoes
GROUP BY tipo
ORDER BY tipo;

-- Verificar algumas transações de exemplo DEPOIS
SELECT 
  'DEPOIS' as status,
  id,
  tipo,
  descricao,
  categoria,
  valor,
  data
FROM transacoes
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- =====================================================
-- 1. Execute primeiro o PASSO 1 para verificar os dados atuais
-- 2. Analise se realmente há inversão (compare com o esperado)
-- 3. Se confirmar inversão, execute o UPDATE do PASSO 2
-- 4. Execute o PASSO 3 para confirmar que a correção funcionou
-- 5. Verifique no frontend se os dados estão corretos agora
-- =====================================================

