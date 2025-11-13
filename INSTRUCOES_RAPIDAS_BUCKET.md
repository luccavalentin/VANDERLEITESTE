# ⚡ INSTRUÇÕES RÁPIDAS - CRIAR BUCKET DE BACKUP

## 🎯 Problema

**Erro:** "Bucket de backup não encontrado. Crie o bucket "backups-sistema" no Supabase Storage."

## ✅ Solução Rápida

### Método 1: Via SQL Editor (Mais Rápido) ⭐ RECOMENDADO

1. **Acesse o SQL Editor do Supabase:**
   - URL: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry/sql/new
   - Ou: Dashboard → SQL Editor → New Query

2. **Cole e execute este script SQL:**

```sql
-- Criar bucket de backup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'backups-sistema',
  'backups-sistema',
  false,
  104857600,
  ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas RLS
DROP POLICY IF EXISTS "Allow upload backups" ON storage.objects;
CREATE POLICY "Allow upload backups"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'backups-sistema');

DROP POLICY IF EXISTS "Allow download backups" ON storage.objects;
CREATE POLICY "Allow download backups"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'backups-sistema');

DROP POLICY IF EXISTS "Allow update backups" ON storage.objects;
CREATE POLICY "Allow update backups"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'backups-sistema')
WITH CHECK (bucket_id = 'backups-sistema');

DROP POLICY IF EXISTS "Allow delete backups" ON storage.objects;
CREATE POLICY "Allow delete backups"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'backups-sistema');
```

3. **Clique em "Run" ou pressione Ctrl + Enter**

4. **Verifique se funcionou:**
   - Vá em Storage → Buckets
   - Verifique se o bucket `backups-sistema` aparece

### Método 2: Via Interface do Supabase

1. **Acesse o Storage:**
   - URL: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry/storage/buckets
   - Ou: Dashboard → Storage → Buckets

2. **Clique em "New Bucket"**

3. **Preencha:**
   - **Name**: `backups-sistema`
   - **Public**: ❌ Desmarque
   - **File size limit**: `104857600` (100 MB)
   - **Allowed MIME types**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

4. **Clique em "Create bucket"**

5. **Configure as Políticas RLS:**
   - Clique no bucket `backups-sistema`
   - Clique em "Policies"
   - Crie 4 políticas (INSERT, SELECT, UPDATE, DELETE)
   - Veja o guia completo: `GUIA_CRIAR_BUCKET_BACKUP.md`

---

## 🔍 Verificação

### Verificar se o Bucket foi Criado

1. Acesse: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry/storage/buckets
2. Verifique se o bucket `backups-sistema` aparece na lista

### Testar o Sistema

1. Acesse o sistema: http://localhost:5173
2. Vá para a página "Backup do Sistema"
3. Clique em "Gerar Backup Online"
4. Verifique se o backup foi gerado com sucesso

---

## 📚 Documentação Completa

- **Guia Completo**: `GUIA_CRIAR_BUCKET_BACKUP.md`
- **Script SQL**: `CRIAR_BUCKET_BACKUP_SUPABASE.sql`
- **Guia de Backup**: `GUIA_CONFIGURACAO_BACKUP.md`

---

## ⚡ Comando Rápido

**Copie e cole no SQL Editor do Supabase:**

```sql
-- Criar bucket e políticas em um único comando
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES ('backups-sistema', 'backups-sistema', false, 104857600, ARRAY['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow upload backups" ON storage.objects;
CREATE POLICY "Allow upload backups" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'backups-sistema');

DROP POLICY IF EXISTS "Allow download backups" ON storage.objects;
CREATE POLICY "Allow download backups" ON storage.objects FOR SELECT TO public USING (bucket_id = 'backups-sistema');

DROP POLICY IF EXISTS "Allow update backups" ON storage.objects;
CREATE POLICY "Allow update backups" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'backups-sistema') WITH CHECK (bucket_id = 'backups-sistema');

DROP POLICY IF EXISTS "Allow delete backups" ON storage.objects;
CREATE POLICY "Allow delete backups" ON storage.objects FOR DELETE TO public USING (bucket_id = 'backups-sistema');
```

---

**Status:** ✅ Script pronto para executar
**Próximo passo:** Execute no SQL Editor do Supabase

