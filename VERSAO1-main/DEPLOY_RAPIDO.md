# ⚡ DEPLOY RÁPIDO - PASSO A PASSO

Este é um guia rápido para fazer deploy do seu projeto em produção em 10 minutos!

## 🚀 DEPLOY NA VERCEL (RECOMENDADO)

### Passo 1: Preparar Variáveis de Ambiente

1. Crie arquivo `.env.local` (não commite!):
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

2. Atualize `src/integrations/supabase/client.ts`:
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
```

### Passo 2: Fazer Deploy na Vercel

1. Acesse https://vercel.com
2. Clique em **Add New Project**
3. Importe seu repositório
4. Configure:
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
5. Adicione variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Clique em **Deploy**

### Passo 3: Configurar CORS no Supabase

1. No Supabase: **Project Settings** > **API**
2. Adicione a URL do deploy em **CORS**
3. Salve

### Passo 4: Testar

1. Acesse a URL do deploy
2. Teste a conexão
3. Teste CRUD

## 🌐 DEPLOY NO NETLIFY

### Passo 1: Preparar (igual Vercel)

Mesmos passos da Vercel.

### Passo 2: Fazer Deploy

1. Acesse https://netlify.com
2. Clique em **Add new site** > **Import an existing project**
3. Selecione seu repositório
4. Configure:
   - Build command: `pnpm build`
   - Publish directory: `dist`
5. Adicione variáveis de ambiente
6. Clique em **Deploy site**

### Passo 3: Configurar CORS

Mesmo passo da Vercel.

## 🔒 POLÍTICAS RLS (OPCIONAL)

Se vai usar autenticação:

1. Execute `POLITICAS_RLS_PRODUCAO.sql` no Supabase
2. Configure autenticação no app
3. Teste as políticas

Se NÃO vai usar autenticação:

- Mantenha as políticas públicas (não recomendado para produção)
- Ou configure autenticação antes do deploy

## ✅ CHECKLIST

- [ ] Variáveis de ambiente configuradas
- [ ] Código atualizado para usar variáveis
- [ ] Deploy feito
- [ ] CORS configurado
- [ ] Testado em produção
- [ ] Políticas RLS configuradas (se usar auth)

## 🎉 PRONTO!

Seu projeto está em produção! 🚀

Para mais detalhes, consulte: `GUIA_DEPLOY_PRODUCAO.md`

