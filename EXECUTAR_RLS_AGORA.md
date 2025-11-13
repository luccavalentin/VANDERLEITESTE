# 🚨 EXECUTAR POLÍTICAS RLS AGORA - SOLUÇÃO RÁPIDA

## ⚠️ PROBLEMA
Os dados estão zerados porque as políticas RLS (Row Level Security) não estão configuradas no Supabase.

## ✅ SOLUÇÃO IMEDIATA (2 MINUTOS)

### Passo 1: Acessar Supabase SQL Editor

1. Acesse: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

### Passo 2: Executar Script RLS

1. Abra o arquivo `VERIFICAR_RLS_POLICIES.sql` no seu projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **Run** (ou pressione `Ctrl + Enter`)
5. Aguarde a execução terminar (pode levar alguns segundos)

### Passo 3: Verificar se Funcionou

1. No Supabase, vá em **Table Editor**
2. Selecione a tabela **clientes**
3. Verifique se consegue ver os dados

### Passo 4: Testar no Sistema

1. **Limpe o cache do navegador:**
   - `Ctrl + Shift + R` (hard refresh)
2. **Recarregue a página** de Clientes
3. **Verifique se os dados aparecem**

## 🔍 O QUE O SCRIPT FAZ

O script `VERIFICAR_RLS_POLICIES.sql`:
- ✅ Habilita RLS em todas as tabelas
- ✅ Cria políticas de leitura pública (SELECT)
- ✅ Cria políticas de escrita pública (INSERT, UPDATE, DELETE)
- ✅ Permite acesso total para desenvolvimento

## ⏱️ TEMPO ESTIMADO

- Executar script: 30 segundos
- Limpar cache: 10 segundos
- **Total: ~1 minuto**

## ✅ CHECKLIST

- [ ] Script RLS executado no Supabase
- [ ] Cache do navegador limpo
- [ ] Página recarregada
- [ ] Dados aparecem na tela

## 📝 NOTA

Este script é seguro e apenas habilita acesso público às tabelas para desenvolvimento. Em produção, você pode ajustar as políticas conforme necessário.

