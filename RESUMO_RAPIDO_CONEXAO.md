# ⚡ Resumo Rápido: Conectar ao Supabase

## 🎯 Passos Essenciais (5 minutos)

### 1️⃣ Criar Projeto no Supabase

- Acesse: https://supabase.com
- Clique em **"New Project"**
- Preencha nome e senha do banco
- Aguarde 2-3 minutos

### 2️⃣ Obter Credenciais

- Vá em **Settings** → **API**
- Copie a **Project URL**
- Copie a **anon public key**

### 3️⃣ Configurar Variáveis

- Crie arquivo `.env.local` na raiz do projeto
- Cole as credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### 4️⃣ Criar Tabelas

- No Supabase, vá em **SQL Editor**
- Abra o arquivo `BANCO_DADOS_COMPLETO.sql`
- Copie TODO o conteúdo
- Cole e execute no SQL Editor

### 5️⃣ Testar

```bash
npm run dev
```

---

## 📚 Documentação Completa

Veja `GUIA_CONEXAO_SUPABASE.md` para instruções detalhadas e solução de problemas.

---

## ✅ Checklist

- [ ] Projeto criado no Supabase
- [ ] Credenciais copiadas
- [ ] Arquivo `.env.local` criado
- [ ] Script SQL executado
- [ ] 16 tabelas criadas
- [ ] Sistema rodando sem erros

---

**Pronto!** 🎉

