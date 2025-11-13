# 🚀 GUIA DE DEPLOY EM PRODUÇÃO - RESUMO

Este é um resumo rápido do processo de deploy em produção com Supabase.

## 📁 ARQUIVOS CRIADOS

1. **GUIA_DEPLOY_PRODUCAO.md** - Guia completo passo a passo
2. **DEPLOY_RAPIDO.md** - Guia rápido (10 minutos)
3. **POLITICAS_RLS_PRODUCAO.sql** - Script para políticas RLS de produção
4. **CHECKLIST_DEPLOY.md** - Checklist completo
5. **vercel.json** - Configuração para Vercel
6. **netlify.toml** - Configuração para Netlify
7. **.env.example** - Exemplo de variáveis de ambiente
8. **README_DEPLOY.md** - Este arquivo (resumo)

## 🚀 PROCESSO RÁPIDO

### 1. Configurar Variáveis de Ambiente

1. Crie `.env.local`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

2. O código já está configurado para usar variáveis de ambiente!

### 2. Fazer Deploy na Vercel

1. Acesse https://vercel.com
2. Importe seu repositório
3. Configure:
   - Framework: Vite
   - Build: `pnpm build`
   - Output: `dist`
4. Adicione variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Clique em **Deploy**

### 3. Configurar CORS no Supabase

1. No Supabase: **Project Settings** > **API**
2. Adicione a URL do deploy em **CORS**
3. Salve

### 4. Testar

1. Acesse a URL do deploy
2. Teste a conexão
3. Teste CRUD

## 🔒 POLÍTICAS RLS (OPCIONAL)

Se vai usar autenticação:

1. Execute `POLITICAS_RLS_PRODUCAO.sql` no Supabase
2. Configure autenticação no app
3. Teste as políticas

Se NÃO vai usar autenticação:

- Mantenha as políticas públicas (não recomendado para produção)
- Ou configure autenticação antes do deploy

## ✅ CHECKLIST RÁPIDO

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Código testado localmente
- [ ] Build funcionando
- [ ] Git configurado
- [ ] `.env.local` não está no Git

### Durante o Deploy

- [ ] Projeto conectado na plataforma
- [ ] Variáveis de ambiente configuradas
- [ ] Build configurado
- [ ] Deploy executado

### Depois do Deploy

- [ ] Site acessível
- [ ] CORS configurado
- [ ] Conexão funcionando
- [ ] CRUD testado
- [ ] Políticas RLS configuradas (se usar auth)

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte:

- **GUIA_DEPLOY_PRODUCAO.md** - Guia completo passo a passo
- **DEPLOY_RAPIDO.md** - Guia rápido
- **CHECKLIST_DEPLOY.md** - Checklist completo
- **POLITICAS_RLS_PRODUCAO.sql** - Políticas RLS para produção

## 🎯 PLATAFORMAS SUPORTADAS

### Vercel (Recomendado)

- ✅ Fácil de usar
- ✅ Deploy automático
- ✅ SSL/TLS gratuito
- ✅ Domínio personalizado
- ✅ Configuração: `vercel.json`

### Netlify

- ✅ Fácil de usar
- ✅ Deploy automático
- ✅ SSL/TLS gratuito
- ✅ Domínio personalizado
- ✅ Configuração: `netlify.toml`

### Outras Plataformas

- Railway
- Render
- Fly.io
- DigitalOcean App Platform
- AWS Amplify
- Azure Static Web Apps

## 🔑 VARIÁVEIS DE AMBIENTE

### Desenvolvimento

Crie `.env.local`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### Produção

Configure na plataforma de deploy:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 🛡️ SEGURANÇA

### Importante

- ✅ Use variáveis de ambiente
- ✅ Nunca commite credenciais
- ✅ Configure políticas RLS
- ✅ Configure CORS
- ✅ Use SSL/TLS
- ✅ Configure headers de segurança

### Não Fazer

- ❌ Hardcode de credenciais
- ❌ Commit de arquivos `.env`
- ❌ Políticas públicas em produção
- ❌ CORS aberto para todos
- ❌ Credenciais expostas

## 🚨 TROUBLESHOOTING

### Erro: "Failed to fetch"

**Solução**: Configure CORS no Supabase

### Erro: "permission denied"

**Solução**: Configure políticas RLS

### Erro: "Build failed"

**Solução**: Verifique variáveis de ambiente

### Erro: "Environment variables not found"

**Solução**: Configure variáveis na plataforma

## 🎉 PRONTO!

Siga o **DEPLOY_RAPIDO.md** para fazer deploy em 10 minutos!

Ou consulte o **GUIA_DEPLOY_PRODUCAO.md** para um guia completo passo a passo.

---

**DICA**: Use o **CHECKLIST_DEPLOY.md** para garantir que tudo está configurado corretamente!

