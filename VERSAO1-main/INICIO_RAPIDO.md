# ⚡ INÍCIO RÁPIDO - INTEGRAÇÃO COM SUPABASE

Este é um guia rápido para integrar o Supabase ao seu projeto em 5 minutos!

## 🚀 PASSO A PASSO RÁPIDO

### 1️⃣ Obter Credenciais do Supabase (2 minutos)

1. Acesse https://supabase.com
2. Faça login e selecione seu projeto
3. Vá em **Project Settings** > **API**
4. **COPIE**:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public key** (ex: `eyJhbGciOiJIUzI1NiIs...`)

### 2️⃣ Configurar o Cliente Supabase (1 minuto)

1. Abra o arquivo `src/integrations/supabase/client.ts`
2. Substitua:
   - `SUA_PROJECT_URL_AQUI` → Cole sua **Project URL**
   - `SUA_ANON_KEY_AQUI` → Cole sua **anon public key**
3. Salve o arquivo

**OU** use o template:

1. Abra o arquivo `TEMPLATE_CLIENT_SUPABASE.ts`
2. Copie o conteúdo
3. Cole em `src/integrations/supabase/client.ts`
4. Substitua as credenciais
5. Salve o arquivo

### 3️⃣ Criar as Tabelas no Supabase (2 minutos)

1. No Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `SUPABASE_TABELAS.sql`
4. **COPIE TODO O CONTEÚDO** (Ctrl+A, Ctrl+C)
5. **COLE** no SQL Editor (Ctrl+V)
6. Clique em **Run** (ou Ctrl+Enter)
7. Aguarde a execução
8. Verifique se as 14 tabelas foram criadas em **Table Editor**

### 4️⃣ Testar a Conexão (30 segundos)

Execute o script de teste:

```bash
npx tsx TESTE_CONEXAO_SUPABASE.ts
```

Ou teste manualmente no navegador:

1. Abra o DevTools (F12)
2. Vá na aba Console
3. Execute:

```javascript
import { supabase } from './src/integrations/supabase/client';
supabase.from('tarefas').select('*').then(({ data, error }) => {
  if (error) console.error('❌ Erro:', error);
  else console.log('✅ Sucesso!', data);
});
```

### 5️⃣ Pronto! 🎉

Agora você pode:
- ✅ Usar o Supabase no seu projeto
- ✅ Criar, ler, atualizar e deletar dados
- ✅ Desenvolver o sistema
- ✅ Me enviar o prompt para começar a trabalhar!

## 📋 CHECKLIST

- [ ] Credenciais do Supabase obtidas
- [ ] Cliente Supabase configurado
- [ ] Tabelas criadas no Supabase (14 tabelas)
- [ ] Conexão testada e funcionando
- [ ] Sem erros no console

## 🔧 ESTRUTURA DE ARQUIVOS

```
projeto/
├── src/
│   └── integrations/
│       └── supabase/
│           ├── client.ts          ← Configure aqui
│           └── types.ts           ← Tipos (gerar depois)
├── SUPABASE_TABELAS.sql          ← Executar no Supabase
├── TESTE_CONEXAO_SUPABASE.ts     ← Testar conexão
├── TEMPLATE_CLIENT_SUPABASE.ts   ← Template do client
└── GUIA_INTEGRACAO_SUPABASE.md   ← Guia completo
```

## ❓ TROUBLESHOOTING RÁPIDO

### Erro: "Failed to fetch"
- ✅ Verifique se as credenciais estão corretas
- ✅ Verifique se o projeto está ativo no Supabase

### Erro: "relation does not exist"
- ✅ Execute o script `SUPABASE_TABELAS.sql` no Supabase
- ✅ Verifique se as tabelas foram criadas no Table Editor

### Erro: "permission denied"
- ✅ Verifique se as políticas RLS estão configuradas
- ✅ Em desenvolvimento, devem permitir acesso público

## 📚 DOCUMENTAÇÃO COMPLETA

Para mais detalhes, consulte:
- **GUIA_INTEGRACAO_SUPABASE.md** - Guia completo passo a passo
- **GUIA_PASSO_A_PASSO_SUPABASE.md** - Guia detalhado de criação de tabelas
- **README_REPLICA.md** - Documentação completa do sistema

## 🎯 PRÓXIMOS PASSOS

1. ✅ Integração com Supabase concluída
2. ✅ Tabelas criadas
3. ✅ Conexão testada
4. ⬜ **Agora você pode me enviar o prompt para começar a desenvolver!**

---

**DICA**: Guarde suas credenciais do Supabase em um local seguro. Nunca commite as credenciais no Git sem usar variáveis de ambiente!

