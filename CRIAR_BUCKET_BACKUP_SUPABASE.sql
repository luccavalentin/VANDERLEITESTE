-- =====================================================
-- SCRIPT PARA CRIAR BUCKET DE BACKUP NO SUPABASE STORAGE
-- Sistema Gerenciador Empresarial - Vanderlei
-- =====================================================
-- 
-- Este script cria o bucket "backups-sistema" e configura
-- todas as políticas RLS necessárias para o funcionamento
-- do sistema de backup automático.
--
-- ORDEM DE EXECUÇÃO:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se o bucket foi criado em Storage → Buckets
-- 3. Teste o sistema gerando um backup manual
-- =====================================================

-- =====================================================
-- PASSO 1: CRIAR O BUCKET "backups-sistema"
-- =====================================================
-- 
-- NOTA: O Supabase Storage usa a tabela storage.buckets
-- para gerenciar buckets. Vamos criar o bucket com as
-- configurações corretas.
-- =====================================================

-- Inserir o bucket na tabela storage.buckets
-- NOTA: Se o bucket já existir, esta operação será ignorada (ON CONFLICT DO NOTHING)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'backups-sistema',
  'backups-sistema',
  false, -- Bucket privado (não público)
  104857600, -- Limite de 100 MB por arquivo
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] -- Apenas arquivos Excel
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- PASSO 2: CRIAR POLÍTICAS RLS PARA O BUCKET
-- =====================================================
-- 
-- As políticas RLS controlam quem pode fazer upload,
-- download, atualizar e deletar arquivos no bucket.
-- Para desenvolvimento, vamos permitir todas as operações.
-- 
-- IMPORTANTE: Em produção, ajuste as políticas para
-- usar auth.uid() e controlar acesso por usuário.
-- =====================================================

-- Política 1: Permitir INSERT (Upload de backups)
-- Remove política existente se houver e cria nova
DROP POLICY IF EXISTS "Allow upload backups" ON storage.objects;
CREATE POLICY "Allow upload backups"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'backups-sistema'
);

-- Política 2: Permitir SELECT (Download de backups)
-- Remove política existente se houver e cria nova
DROP POLICY IF EXISTS "Allow download backups" ON storage.objects;
CREATE POLICY "Allow download backups"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'backups-sistema'
);

-- Política 3: Permitir UPDATE (Atualizar backups existentes)
-- Remove política existente se houver e cria nova
DROP POLICY IF EXISTS "Allow update backups" ON storage.objects;
CREATE POLICY "Allow update backups"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'backups-sistema'
)
WITH CHECK (
  bucket_id = 'backups-sistema'
);

-- Política 4: Permitir DELETE (Deletar backups antigos)
-- Remove política existente se houver e cria nova
DROP POLICY IF EXISTS "Allow delete backups" ON storage.objects;
CREATE POLICY "Allow delete backups"
ON storage.objects
FOR DELETE
TO public
USING (
  bucket_id = 'backups-sistema'
);

-- =====================================================
-- PASSO 3: VERIFICAR SE O BUCKET FOI CRIADO
-- =====================================================
-- 
-- Execute esta query para verificar se o bucket foi
-- criado com sucesso:
-- =====================================================

-- Verificar se o bucket existe
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'backups-sistema';

-- =====================================================
-- PASSO 4: VERIFICAR POLÍTICAS RLS CRIADAS
-- =====================================================
-- 
-- Execute esta query para verificar se as políticas
-- RLS foram criadas com sucesso:
-- =====================================================

-- Verificar políticas RLS do bucket
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%backup%';

-- =====================================================
-- RESUMO FINAL
-- =====================================================
-- 
-- ✅ Bucket "backups-sistema" criado
-- ✅ Política de INSERT (Upload) criada
-- ✅ Política de SELECT (Download) criada
-- ✅ Política de UPDATE (Atualização) criada
-- ✅ Política de DELETE (Exclusão) criada
-- 
-- PRÓXIMOS PASSOS:
-- 1. Verifique se o bucket foi criado em Storage → Buckets
-- 2. Teste o sistema gerando um backup manual
-- 3. Verifique se o backup foi salvo no bucket
-- 4. Teste o download do backup
-- =====================================================

