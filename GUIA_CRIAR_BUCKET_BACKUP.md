# 📦 GUIA PASSO A PASSO - CRIAR BUCKET DE BACKUP NO SUPABASE

## 🎯 Objetivo

Criar o bucket `backups-sistema` no Supabase Storage e configurar todas as políticas RLS necessárias para o funcionamento do sistema de backup automático.

---

## 📋 Pré-requisitos

- ✅ Projeto Supabase configurado
- ✅ Acesso ao painel do Supabase: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry
- ✅ Credenciais do Supabase configuradas no sistema
- ✅ Acesso ao SQL Editor do Supabase

---

## 🚀 MÉTODO 1: CRIAR VIA SQL EDITOR (RECOMENDADO)

### Passo 1: Acessar o SQL Editor

1. Acesse: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

### Passo 2: Executar o Script SQL

1. Abra o arquivo `CRIAR_BUCKET_BACKUP_SUPABASE.sql`
2. Copie todo o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione `Ctrl + Enter`)

### Passo 3: Verificar se o Bucket foi Criado

1. No menu lateral, clique em **Storage**
2. Clique em **Buckets**
3. Verifique se o bucket `backups-sistema` aparece na lista

### Passo 4: Verificar as Políticas RLS

1. Clique no bucket `backups-sistema`
2. Clique em **Policies**
3. Verifique se as seguintes políticas foram criadas:
   - ✅ `Allow upload backups` (INSERT)
   - ✅ `Allow download backups` (SELECT)
   - ✅ `Allow update backups` (UPDATE)
   - ✅ `Allow delete backups` (DELETE)

---

## 🚀 MÉTODO 2: CRIAR MANUALMENTE VIA INTERFACE

### Passo 1: Acessar o Storage

1. Acesse: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry
2. No menu lateral, clique em **Storage**
3. Clique em **Buckets**

### Passo 2: Criar o Bucket

1. Clique em **New Bucket**
2. Preencha os seguintes campos:
   - **Name**: `backups-sistema` (exatamente este nome)
   - **Public bucket**: ❌ **Desmarque** esta opção (bucket privado)
   - **File size limit**: `104857600` (100 MB)
   - **Allowed MIME types**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
3. Clique em **Create bucket**

### Passo 3: Configurar Políticas RLS

#### 3.1 Criar Política de Upload (INSERT)

1. Clique no bucket `backups-sistema`
2. Clique em **Policies**
3. Clique em **New Policy**
4. Selecione **For full customization**
5. Configure a política:
   - **Policy name**: `Allow upload backups`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `public`
   - **Policy definition**:
     ```sql
     bucket_id = 'backups-sistema'
     ```
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'backups-sistema'
     ```
6. Clique em **Review** e depois em **Save policy**

#### 3.2 Criar Política de Download (SELECT)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Configure a política:
   - **Policy name**: `Allow download backups`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition**:
     ```sql
     bucket_id = 'backups-sistema'
     ```
4. Clique em **Review** e depois em **Save policy**

#### 3.3 Criar Política de Atualização (UPDATE)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Configure a política:
   - **Policy name**: `Allow update backups`
   - **Allowed operation**: `UPDATE`
   - **Target roles**: `public`
   - **Policy definition**:
     ```sql
     bucket_id = 'backups-sistema'
     ```
   - **WITH CHECK expression**:
     ```sql
     bucket_id = 'backups-sistema'
     ```
4. Clique em **Review** e depois em **Save policy**

#### 3.4 Criar Política de Exclusão (DELETE)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Configure a política:
   - **Policy name**: `Allow delete backups`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `public`
   - **Policy definition**:
     ```sql
     bucket_id = 'backups-sistema'
     ```
4. Clique em **Review** e depois em **Save policy**

---

## ✅ Verificação

### Verificar se o Bucket foi Criado

1. Acesse: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry
2. Vá em **Storage** → **Buckets**
3. Verifique se o bucket `backups-sistema` aparece na lista
4. Verifique se está configurado como **Private** (não público)

### Verificar se as Políticas RLS foram Criadas

1. Clique no bucket `backups-sistema`
2. Clique em **Policies**
3. Verifique se as seguintes políticas aparecem:
   - ✅ `Allow upload backups` (INSERT)
   - ✅ `Allow download backups` (SELECT)
   - ✅ `Allow update backups` (UPDATE)
   - ✅ `Allow delete backups` (DELETE)

### Testar o Sistema

1. Acesse o sistema: http://localhost:5173
2. Vá para a página **"Backup do Sistema"**
3. Clique em **"Gerar Backup Online"**
4. Verifique se o backup foi gerado com sucesso
5. Verifique se o backup aparece no bucket `backups-sistema`

---

## 🐛 Troubleshooting

### Erro: "Bucket de backup não encontrado"

**Solução:**
1. Verifique se o bucket `backups-sistema` foi criado
2. Verifique se o nome do bucket está exatamente `backups-sistema`
3. Execute o script SQL novamente se necessário
4. Verifique se você está no projeto correto do Supabase

### Erro: "Erro ao salvar backup online"

**Solução:**
1. Verifique se as políticas RLS foram criadas corretamente
2. Verifique se o bucket está configurado como privado
3. Verifique se há espaço suficiente no Supabase Storage
4. Verifique as credenciais do Supabase no sistema
5. Verifique se as políticas permitem operações `INSERT` e `UPDATE`

### Erro: "Erro ao baixar backup"

**Solução:**
1. Verifique se existe um backup online
2. Verifique se a política `SELECT` foi criada
3. Verifique se o arquivo não foi deletado
4. Verifique se as políticas RLS permitem download

### Erro: "Permission denied"

**Solução:**
1. Verifique se todas as políticas RLS foram criadas
2. Verifique se as políticas estão ativas
3. Verifique se o bucket está configurado corretamente
4. Execute o script SQL novamente para recriar as políticas

---

## 📊 Configuração do Bucket

### Configurações Necessárias

- **Name**: `backups-sistema` (exatamente este nome)
- **Public**: ❌ **False** (bucket privado)
- **File size limit**: `104857600` (100 MB)
- **Allowed MIME types**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

### Políticas RLS Necessárias

1. **INSERT** - Permitir upload de backups
2. **SELECT** - Permitir download de backups
3. **UPDATE** - Permitir atualização de backups
4. **DELETE** - Permitir exclusão de backups

---

## 🔒 Segurança

### Configurações de Segurança

- ✅ Bucket privado (não público)
- ✅ Políticas RLS configuradas
- ✅ Apenas arquivos Excel permitidos
- ✅ Limite de tamanho de 100 MB por arquivo

### Para Produção

Em produção, você deve ajustar as políticas RLS para usar `auth.uid()` e controlar acesso por usuário:

```sql
-- Exemplo de política para produção
CREATE POLICY "Users can upload own backups"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'backups-sistema'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

---

## 📝 Notas Importantes

- O bucket deve ter o nome exatamente `backups-sistema`
- O bucket deve ser privado (não público)
- Todas as 4 políticas RLS devem ser criadas
- O sistema manterá apenas um backup online por vez
- Quando um novo backup é gerado, o anterior é substituído
- O backup é enviado automaticamente por email para **luccasantana88@gmail.com**

---

## ✅ Checklist

- [ ] Bucket `backups-sistema` criado
- [ ] Bucket configurado como privado
- [ ] Política de INSERT criada
- [ ] Política de SELECT criada
- [ ] Política de UPDATE criada
- [ ] Política de DELETE criada
- [ ] Bucket verificado no painel do Supabase
- [ ] Políticas RLS verificadas
- [ ] Sistema testado (backup gerado com sucesso)

---

## 🎯 Conclusão

Após criar o bucket e configurar as políticas RLS, o sistema de backup automático estará funcionando corretamente. 

**Próximo passo:** Teste o sistema gerando um backup manual na página "Backup do Sistema".

---

**Última atualização:** 2025-01-13
**Status:** ✅ **GUIA COMPLETO**

