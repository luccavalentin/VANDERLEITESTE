# 🔧 CONFIGURAR VARIÁVEIS DE AMBIENTE NO VERCEL

## ⚠️ PROBLEMA
O sistema não está conectando ao banco de dados em produção porque as variáveis de ambiente não estão configuradas no Vercel.

## ✅ SOLUÇÃO: Configurar Variáveis no Vercel

### Passo 1: Acessar o Painel do Vercel

1. Acesse https://vercel.com e faça login
2. Selecione seu projeto **VANDERLEITESTE**

### Passo 2: Configurar Variáveis de Ambiente

1. Vá em **Settings** (Configurações)
2. Clique em **Environment Variables** (Variáveis de Ambiente)
3. Adicione as seguintes variáveis:

#### Variável 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://tahanrdxbzaenpxcrsry.supabase.co`
- **Environment**: Selecione **Production**, **Preview** e **Development**

#### Variável 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFhcmR4YnphZW5weGNyc3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTQ4OTcsImV4cCI6MjA3ODU3MDg5N30.VccKkjMG7YoDsmX6gQCicG2Tmlgkn3ieLn4McAG6fCI`
- **Environment**: Selecione **Production**, **Preview** e **Development**

### Passo 3: Fazer Novo Deploy

Após adicionar as variáveis:

1. Vá em **Deployments**
2. Clique nos **3 pontos** (⋯) do último deploy
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para o GitHub (se estiver conectado)

### Passo 4: Verificar

Após o redeploy, acesse sua aplicação e verifique se:
- Os dados estão aparecendo
- Não há erros no console do navegador
- A conexão com o Supabase está funcionando

## 📝 NOTA IMPORTANTE

- As variáveis de ambiente no Vercel são **diferentes** do arquivo `.env.local`
- O arquivo `.env.local` só funciona **localmente** (desenvolvimento)
- Em **produção**, você **DEVE** configurar no painel do Vercel
- Sem essas variáveis, o sistema usa valores placeholder e não conecta ao banco

## 🔍 Como Verificar se Está Funcionando

1. Abra o console do navegador (F12)
2. Procure por mensagens de erro relacionadas ao Supabase
3. Se aparecer "Supabase não configurado", as variáveis não foram carregadas
4. Se aparecer erros de conexão, verifique se as credenciais estão corretas

## ✅ Checklist

- [ ] Variável `VITE_SUPABASE_URL` configurada no Vercel
- [ ] Variável `VITE_SUPABASE_ANON_KEY` configurada no Vercel
- [ ] Variáveis aplicadas para Production, Preview e Development
- [ ] Novo deploy realizado após configurar as variáveis
- [ ] Sistema conectando ao banco de dados em produção

