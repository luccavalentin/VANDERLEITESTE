# 🔧 SOLUÇÃO: DADOS NÃO APARECEM NO FRONTEND

## Sistema Gerenciador Empresarial - Vanderlei

---

## 🎯 PROBLEMA

Os dados foram inseridos no banco de dados, mas **não aparecem no frontend**.

---

## 🔍 POSSÍVEIS CAUSAS

### 1. **Variáveis de ambiente não carregadas (CAUSA MAIS COMUM)**

- **Causa mais comum**: O servidor Vite não está carregando as variáveis de ambiente do arquivo `.env.local`
- **Sintoma**: Console mostra "Supabase não configurado" e erros `net::ERR_NAME_NOT_RESOLVE` para `placeholder.supabase.co`
- **Solução**: **PARAR E REINICIAR O SERVIDOR** após criar/atualizar o `.env.local`
- **Veja:** `SOLUCAO_CONEXAO_SUPABASE.md` para instruções detalhadas

### 2. **Políticas RLS (Row Level Security) não configuradas**

- **Causa**: As políticas RLS podem não estar criadas ou configuradas corretamente
- **Sintoma**: Os dados existem no banco, mas as queries retornam vazio ou erro de permissão
- **Solução**: Executar o script `VERIFICAR_RLS_POLICIES.sql`

### 3. **Variáveis de ambiente não configuradas**

- **Causa**: As variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` não estão no arquivo `.env.local`
- **Sintoma**: Erro no console do navegador ou dados não carregam
- **Solução**: Verificar o arquivo `.env.local` existe e está correto

### 3. **Cache do React Query**

- **Causa**: O cache pode estar desatualizado
- **Sintoma**: Dados antigos aparecem ou dados não atualizam
- **Solução**: Limpar cache do navegador ou reiniciar o servidor

### 4. **Erros silenciosos**

- **Causa**: Erros podem estar sendo silenciados
- **Sintoma**: Nada aparece, sem erros visíveis
- **Solução**: Verificar o console do navegador (F12)

---

## ✅ SOLUÇÃO PASSO A PASSO

### Passo 1: Verificar Variáveis de Ambiente (MAIS IMPORTANTE - FAÇA PRIMEIRO)

**1.1. Verificar se o arquivo `.env.local` existe:**

```bash
cat .env.local
```

**1.2. Verificar se as variáveis estão corretas:**

```env
VITE_SUPABASE_URL=https://tahanrdxbzaenpxcrsry.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**1.3. PARAR E REINICIAR O SERVIDOR:**

```bash
# Parar o servidor (Ctrl + C)
# Aguarde até que o servidor pare completamente
# Reiniciar o servidor
npm run dev
```

**1.4. Verificar no console do navegador:**

- Abra o console (F12)
- Verifique se não há mais avisos de "Supabase não configurado"
- Verifique se as requisições estão sendo feitas para `tahanrdxbzaenpxcrsry.supabase.co`
- **Se ainda mostrar "Supabase não configurado", o servidor não foi reiniciado corretamente**

**⚠️ IMPORTANTE:** O Vite só carrega variáveis de ambiente na inicialização. Sempre reinicie o servidor após criar/atualizar o `.env.local`.

**Veja:** `SOLUCAO_CONEXAO_SUPABASE.md` para instruções detalhadas.

### Passo 2: Verificar Políticas RLS (SE AS VARIÁVEIS ESTÃO OK)

**1.1. Acessar o Supabase SQL Editor:**

- URL: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry/sql/new

**1.2. Executar o script de verificação:**

- Abra o arquivo: `VERIFICAR_RLS_POLICIES.sql`
- Cole o conteúdo no SQL Editor
- Clique em **"Run"**

**1.3. Verificar resultados:**

- Verifique se as políticas foram criadas
- Verifique se os dados foram encontrados
- Verifique se RLS está habilitado

---

### Passo 2: Verificar Variáveis de Ambiente

**2.1. Verificar arquivo `.env.local`:**

```bash
# Verificar se o arquivo existe
cat .env.local
```

**2.2. Verificar variáveis:**

```env
VITE_SUPABASE_URL=https://tahanrdxbzaenpxcrsry.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2.3. Reiniciar servidor:**

```bash
# Parar o servidor (Ctrl + C)
# Reiniciar o servidor
npm run dev
```

---

### Passo 3: Verificar Console do Navegador

**3.1. Abrir console:**

- Pressione `F12` no navegador
- Vá para a aba **Console**

**3.2. Verificar erros:**

- Procure por erros relacionados ao Supabase
- Procure por erros de rede (Network)
- Procure por erros de autenticação

**3.3. Verificar requisições:**

- Vá para a aba **Network**
- Filtre por **"supabase"**
- Verifique se as requisições estão sendo feitas
- Verifique se as respostas contêm dados

---

### Passo 4: Testar Conexão

**4.1. Acessar página de teste:**

- URL: http://localhost:5173/teste-conexao
- Clique em **"Executar Testes"**

**4.2. Verificar resultados:**

- Verifique se todas as tabelas estão acessíveis
- Verifique se há erros específicos
- Verifique mensagens de erro

---

### Passo 5: Limpar Cache

**5.1. Limpar cache do navegador:**

- Pressione `Ctrl + Shift + R` (Windows/Linux)
- Pressione `Cmd + Shift + R` (Mac)
- Ou limpe o cache manualmente

**5.2. Reiniciar servidor:**

```bash
# Parar o servidor (Ctrl + C)
# Reiniciar o servidor
npm run dev
```

---

## 🔍 DIAGNÓSTICO DETALHADO

### Verificar se os dados existem no banco

**1. Acessar Supabase Dashboard:**

- URL: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry/editor

**2. Verificar cada tabela:**

- Selecione cada tabela (ex: `clientes`, `tarefas`, etc.)
- Verifique se os dados estão lá
- Verifique se há 5 registros em cada tabela

**3. Executar query de teste:**

```sql
-- Testar SELECT em cada tabela
SELECT COUNT(*) FROM clientes;
SELECT COUNT(*) FROM tarefas;
SELECT COUNT(*) FROM leads;
-- etc...
```

---

### Verificar políticas RLS

**1. Executar query de verificação:**

```sql
-- Verificar políticas RLS
SELECT
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**2. Verificar se RLS está habilitado:**

```sql
-- Verificar se RLS está habilitado
SELECT
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

### Verificar variáveis de ambiente

**1. Verificar no código:**

```typescript
// src/integrations/supabase/client.ts
console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "Key:",
  import.meta.env.VITE_SUPABASE_ANON_KEY ? "Configurada" : "Não configurada"
);
```

**2. Verificar no console do navegador:**

- Abra o console (F12)
- Verifique se as variáveis estão sendo carregadas
- Verifique se há avisos sobre variáveis não configuradas

---

## 🚀 SOLUÇÃO RÁPIDA

### Executar script de correção:

**1. Acessar Supabase SQL Editor:**

- URL: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry/sql/new

**2. Executar script:**

- Abra o arquivo: `VERIFICAR_RLS_POLICIES.sql`
- Cole o conteúdo no SQL Editor
- Clique em **"Run"**

**3. Verificar resultados:**

- Verifique se as políticas foram criadas
- Verifique se os dados foram encontrados

**4. Reiniciar servidor:**

```bash
npm run dev
```

**5. Testar no frontend:**

- Acesse: http://localhost:5173
- Navegue pelas páginas
- Verifique se os dados aparecem

---

## ⚠️ TROUBLESHOOTING

### Problema: "permission denied for table"

**Causa:** Políticas RLS não estão configuradas ou estão bloqueando acesso

**Solução:**

1. Executar o script `VERIFICAR_RLS_POLICIES.sql`
2. Verificar se as políticas foram criadas
3. Verificar se RLS está habilitado

---

### Problema: "Failed to fetch"

**Causa:** Problema de conexão com o Supabase

**Solução:**

1. Verificar variáveis de ambiente
2. Verificar se o servidor está rodando
3. Verificar se há erros no console

---

### Problema: Dados existem, mas não aparecem

**Causa:** Cache do React Query ou políticas RLS

**Solução:**

1. Executar o script `VERIFICAR_RLS_POLICIES.sql`
2. Limpar cache do navegador
3. Reiniciar servidor

---

### Problema: Erro 401 (Unauthorized)

**Causa:** Chave API inválida ou expirada

**Solução:**

1. Verificar se a chave API está correta
2. Verificar se a chave não expirou
3. Gerar nova chave se necessário

---

## ✅ CHECKLIST

Antes de desistir, verifique:

- [ ] Script `VERIFICAR_RLS_POLICIES.sql` foi executado
- [ ] Políticas RLS foram criadas para todas as tabelas
- [ ] RLS está habilitado em todas as tabelas
- [ ] Dados foram inseridos no banco (verificar no Table Editor)
- [ ] Variáveis de ambiente estão configuradas (`.env.local`)
- [ ] Servidor está rodando (`npm run dev`)
- [ ] Navegador está aberto em `http://localhost:5173`
- [ ] Console do navegador não mostra erros
- [ ] Requisições estão sendo feitas (aba Network)
- [ ] Cache do navegador foi limpo

---

## 📝 RESUMO

**Problema mais comum:** Políticas RLS não configuradas

**Solução mais rápida:**

1. Executar o script `VERIFICAR_RLS_POLICIES.sql` no Supabase
2. Reiniciar o servidor
3. Limpar cache do navegador
4. Testar no frontend

---

**Criado em:** 2025-01-12  
**Versão:** 1.0.0  
**Sistema:** Gerenciador Empresarial - Vanderlei
