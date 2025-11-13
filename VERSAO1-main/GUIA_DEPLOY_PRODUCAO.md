# 🚀 GUIA DE DEPLOY EM PRODUÇÃO - SUPABASE

Este guia completo vai te ajudar a fazer o deploy do seu projeto em produção com conexão ao Supabase.

## 📋 PRÉ-REQUISITOS

- ✅ Projeto funcionando localmente
- ✅ Supabase configurado e testado
- ✅ Conta na plataforma de deploy (Vercel, Netlify, etc.)
- ✅ Git configurado (repositório GitHub, GitLab, etc.)

## 🔐 PASSO 1: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 1.1 Criar Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto (não commite este arquivo!):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 1.2 Atualizar client.ts para Usar Variáveis de Ambiente

Atualize o arquivo `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Usar variáveis de ambiente
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Validação das variáveis
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Variáveis de ambiente do Supabase não configuradas. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### 1.3 Criar Arquivo .env.example

Crie um arquivo `.env.example` para documentar as variáveis necessárias:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 1.4 Atualizar .gitignore

Certifique-se de que o `.gitignore` inclui:

```gitignore
# Variáveis de ambiente
.env
.env.local
.env*.local

# Dependências
node_modules

# Build
dist
```

## 🛡️ PASSO 2: CONFIGURAR POLÍTICAS RLS PARA PRODUÇÃO

### 2.1 Remover Políticas de Desenvolvimento

No Supabase, vá em **SQL Editor** e execute:

```sql
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
```

### 2.2 Criar Políticas de Produção Baseadas em user_id

Execute este script para criar políticas baseadas em autenticação:

```sql
-- Políticas para TAREFAS
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

-- Políticas para CLIENTES
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

-- Repetir para todas as outras tabelas...
-- (clientes, leads, processos, orcamentos_recibos, imoveis, transacoes, gado, caminhoes, motoristas, fretes, financiamentos, investimentos, anotacoes)
```

### 2.3 Alternativa: Política Pública (Se Não Usar Autenticação)

Se você não vai usar autenticação por enquanto, pode manter as políticas públicas, mas **NÃO RECOMENDADO PARA PRODUÇÃO**:

```sql
-- APENAS PARA TESTE - NÃO USE EM PRODUÇÃO REAL
CREATE POLICY "Enable all for tarefas" 
  ON tarefas FOR ALL 
  USING (true) WITH CHECK (true);
```

**⚠️ IMPORTANTE**: Se não usar autenticação, suas políticas públicas permitirão acesso total aos dados. Use apenas para desenvolvimento/teste.

## 🚀 PASSO 3: DEPLOY NA VERCEL

### 3.1 Preparar o Projeto

1. Certifique-se de que o projeto está no Git
2. Faça commit de todas as alterações
3. Push para o repositório (GitHub, GitLab, etc.)

### 3.2 Conectar Projeto na Vercel

1. Acesse https://vercel.com
2. Faça login (pode usar conta GitHub)
3. Clique em **Add New Project**
4. Importe o repositório do seu projeto
5. Configure o projeto:
   - **Framework Preset**: Vite
   - **Root Directory**: ./ (raiz)
   - **Build Command**: `pnpm build` ou `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install` ou `npm install`

### 3.3 Configurar Variáveis de Ambiente na Vercel

1. Na página de configuração do projeto, role até **Environment Variables**
2. Adicione as seguintes variáveis:
   - `VITE_SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sua-chave-anon-aqui`
3. Selecione os ambientes (Production, Preview, Development)
4. Clique em **Save**

### 3.4 Fazer Deploy

1. Clique em **Deploy**
2. Aguarde o build completar
3. Acesse a URL gerada (ex: `https://seu-projeto.vercel.app`)

### 3.5 Verificar Deploy

1. Acesse a URL do deploy
2. Abra o DevTools (F12)
3. Verifique se há erros no console
4. Teste a conexão com o Supabase
5. Teste criar/ler dados

## 🌐 PASSO 4: DEPLOY NO NETLIFY

### 4.1 Preparar o Projeto

1. Certifique-se de que o projeto está no Git
2. Faça commit de todas as alterações
3. Push para o repositório

### 4.2 Conectar Projeto no Netlify

1. Acesse https://netlify.com
2. Faça login (pode usar conta GitHub)
3. Clique em **Add new site** > **Import an existing project**
4. Selecione seu repositório
5. Configure o build:
   - **Build command**: `pnpm build` ou `npm run build`
   - **Publish directory**: `dist`

### 4.3 Configurar Variáveis de Ambiente no Netlify

1. Na página do projeto, vá em **Site settings** > **Environment variables**
2. Adicione as variáveis:
   - `VITE_SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sua-chave-anon-aqui`
3. Clique em **Save**

### 4.4 Fazer Deploy

1. Netlify fará deploy automaticamente após o push
2. Ou clique em **Trigger deploy** > **Deploy site**
3. Aguarde o build completar
4. Acesse a URL gerada (ex: `https://seu-projeto.netlify.app`)

## 🔧 PASSO 5: CONFIGURAR SUPABASE PARA PRODUÇÃO

### 5.1 Configurar CORS no Supabase

1. No Supabase, vá em **Project Settings** > **API**
2. Role até **CORS Settings**
3. Adicione a URL do seu deploy:
   - `https://seu-projeto.vercel.app`
   - `https://seu-projeto.netlify.app`
   - Ou `*` para permitir todas (não recomendado para produção)

### 5.2 Configurar Domínio Personalizado (Opcional)

1. No Supabase, vá em **Project Settings** > **API**
2. Role até **Custom Domain**
3. Configure seu domínio personalizado
4. Siga as instruções de DNS

### 5.3 Habilitar SSL/TLS

O Supabase já fornece SSL/TLS por padrão. Certifique-se de que está habilitado.

## 🔒 PASSO 6: SEGURANÇA EM PRODUÇÃO

### 6.1 Usar Variáveis de Ambiente

✅ **FAÇA**:
- Use variáveis de ambiente para credenciais
- Nunca commite credenciais no Git
- Use diferentes chaves para desenvolvimento e produção

❌ **NÃO FAÇA**:
- Hardcode de credenciais no código
- Commit de arquivos `.env` no Git
- Compartilhar credenciais publicamente

### 6.2 Configurar Políticas RLS

✅ **FAÇA**:
- Use políticas baseadas em `auth.uid()`
- Limite o acesso apenas aos dados do usuário
- Teste as políticas antes de fazer deploy

❌ **NÃO FAÇA**:
- Deixar políticas públicas em produção
- Permitir acesso total aos dados
- Ignorar segurança

### 6.3 Monitorar Acessos

1. No Supabase, vá em **Logs** > **API Logs**
2. Monitore os acessos
3. Verifique se há acessos não autorizados
4. Configure alertas se necessário

## 🧪 PASSO 7: TESTAR EM PRODUÇÃO

### 7.1 Testar Conexão

1. Acesse a URL do deploy
2. Abra o DevTools (F12)
3. Verifique se há erros no console
4. Teste a conexão com o Supabase

### 7.2 Testar CRUD

1. Teste criar dados
2. Teste ler dados
3. Teste atualizar dados
4. Teste deletar dados
5. Verifique se as políticas RLS estão funcionando

### 7.3 Testar Performance

1. Verifique o tempo de carregamento
2. Teste com diferentes quantidades de dados
3. Verifique se há problemas de performance
4. Otimize se necessário

## 📊 PASSO 8: MONITORAMENTO E MANUTENÇÃO

### 8.1 Configurar Logs

1. No Supabase, configure logs de erro
2. No Vercel/Netlify, configure logs de build
3. Use ferramentas de monitoramento (Sentry, etc.)

### 8.2 Configurar Alertas

1. Configure alertas para erros
2. Configure alertas para performance
3. Configure alertas para segurança

### 8.3 Fazer Backup

1. Configure backup automático no Supabase
2. Faça backup regular do banco de dados
3. Guarde backups em local seguro

## 🔄 PASSO 9: ATUALIZAÇÕES E DEPLOY CONTÍNUO

### 9.1 Configurar CI/CD

1. Configure GitHub Actions (ou similar)
2. Configure deploy automático após push
3. Configure testes automáticos

### 9.2 Atualizar Código

1. Faça alterações no código
2. Faça commit e push
3. Deploy automático será executado
4. Verifique se tudo está funcionando

### 9.3 Rollback (Se Necessário)

1. No Vercel/Netlify, vá em **Deployments**
2. Encontre o deployment anterior
3. Clique em **Promote to Production**
4. Aguarde o rollback

## 📝 CHECKLIST DE DEPLOY

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Políticas RLS configuradas
- [ ] CORS configurado no Supabase
- [ ] Código testado localmente
- [ ] Git configurado e commits feitos
- [ ] `.env` no `.gitignore`

### Durante o Deploy

- [ ] Projeto conectado na plataforma
- [ ] Variáveis de ambiente configuradas
- [ ] Build configurado corretamente
- [ ] Deploy executado com sucesso

### Depois do Deploy

- [ ] Site acessível
- [ ] Conexão com Supabase funcionando
- [ ] CRUD testado
- [ ] Políticas RLS funcionando
- [ ] Sem erros no console
- [ ] Performance aceitável
- [ ] Logs configurados
- [ ] Backup configurado

## 🚨 TROUBLESHOOTING

### Erro: "Failed to fetch"

**Causa**: CORS não configurado ou credenciais incorretas

**Solução**:
1. Verifique se o CORS está configurado no Supabase
2. Verifique se as variáveis de ambiente estão corretas
3. Verifique se a URL do Supabase está correta

### Erro: "permission denied"

**Causa**: Políticas RLS bloqueando acesso

**Solução**:
1. Verifique se as políticas RLS estão configuradas
2. Verifique se está usando autenticação
3. Verifique se o `user_id` está sendo definido corretamente

### Erro: "Build failed"

**Causa**: Erro no build ou variáveis de ambiente faltando

**Solução**:
1. Verifique os logs de build
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Verifique se não há erros no código

### Erro: "Environment variables not found"

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
1. Verifique se as variáveis estão configuradas na plataforma
2. Verifique se os nomes das variáveis estão corretos
3. Verifique se o prefixo `VITE_` está correto

## 🎉 CONCLUSÃO

Agora seu projeto está em produção! Lembre-se de:

- ✅ Monitorar o site regularmente
- ✅ Fazer backup regular do banco de dados
- ✅ Atualizar dependências regularmente
- ✅ Manter as políticas RLS atualizadas
- ✅ Monitorar logs e erros
- ✅ Manter a segurança em dia

**Parabéns! Seu projeto está em produção! 🚀**

---

## 📚 RECURSOS ADICIONAIS

- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Netlify](https://docs.netlify.com)
- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Segurança do Supabase](https://supabase.com/docs/guides/auth/row-level-security)

