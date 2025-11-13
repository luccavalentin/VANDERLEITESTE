# 🚀 Guia Completo: Conectar Projeto ao Supabase

## 📋 Pré-requisitos

- Conta no Supabase (gratuita): https://supabase.com
- Node.js instalado
- NPM ou Yarn instalado

---

## 🔧 Passo 1: Criar Projeto no Supabase

1. Acesse https://supabase.com e faça login
2. Clique em **"New Project"**
3. Preencha os dados:
   - **Name**: Nome do seu projeto (ex: `sistema-vanderlei`)
   - **Database Password**: Crie uma senha forte (⚠️ **ANOTE ESSA SENHA!**)
   - **Region**: Escolha a região mais próxima (ex: `South America (São Paulo)`)
   - **Pricing Plan**: Free (para começar)
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos enquanto o projeto é criado

---

## 🔑 Passo 2: Obter Credenciais do Supabase

1. No painel do Supabase, vá em **Settings** (⚙️) → **API**
2. Você verá duas informações importantes:

### **Project URL**

```
https://xxxxxxxxxxxxx.supabase.co
```

Copie essa URL completa.

### **anon public key**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzYyOTE4MDY1LCJleHAiOjIwNzg0OTQwNjV9.xxxxxxxxxxxxx
```

Copie essa chave completa (é muito longa, certifique-se de copiar tudo).

---

## 📝 Passo 3: Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie um arquivo chamado `.env.local`
2. Adicione as seguintes linhas:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

3. **Substitua** os valores:
   - `https://seu-projeto.supabase.co` → Cole sua **Project URL**
   - `sua_chave_anonima_aqui` → Cole sua **anon public key**

**Exemplo:**

```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc2MjkxODA2NSwiZXhwIjoyMDc4NDk0MDY1fQ.xxxxxxxxxxxxx
```

⚠️ **IMPORTANTE**:

- O arquivo `.env.local` já está no `.gitignore`, então não será commitado
- **NUNCA** compartilhe suas chaves publicamente
- A chave `anon` é segura para usar no frontend (ela tem permissões limitadas pelo RLS)

---

## 🗄️ Passo 4: Criar as Tabelas no Banco de Dados

1. No painel do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **"New query"**
3. Abra o arquivo `BANCO_DADOS_COMPLETO.sql` do projeto
4. **Copie TODO o conteúdo** do arquivo
5. Cole no SQL Editor do Supabase
6. Clique em **"Run"** (ou pressione `Ctrl+Enter`)
7. Aguarde alguns segundos até ver a mensagem de sucesso

✅ **Verificação**: Vá em **Table Editor** e verifique se as 16 tabelas foram criadas:

- tarefas
- clientes
- leads
- processos
- orcamentos_recibos
- imoveis
- contratos_locacao
- transacoes
- gado
- caminhoes
- motoristas
- fretes
- financiamentos
- investimentos
- anotacoes
- followups

---

## 🔒 Passo 5: Verificar Políticas RLS (Row Level Security)

As políticas RLS já estão configuradas no script `BANCO_DADOS_COMPLETO.sql`.

Para verificar:

1. Vá em **Authentication** → **Policies**
2. Ou vá em **Table Editor** → Selecione uma tabela → **"RLS"** tab
3. Verifique se as políticas estão ativas

**Nota**: Por padrão, as políticas permitem todas as operações (`FOR ALL USING (true)`).
Para produção, você deve ajustar essas políticas conforme sua necessidade de segurança.

---

## 🧪 Passo 6: Testar a Conexão

1. No terminal, execute:

```bash
npm run dev
```

2. Abra o navegador em `http://localhost:5173`

3. Abra o **Console do Navegador** (F12 → Console)

4. Você deve ver:

   - ✅ Nenhum erro de conexão
   - ✅ O sistema carregando normalmente

5. Teste algumas funcionalidades:
   - Criar uma tarefa
   - Cadastrar um cliente
   - Adicionar uma anotação

---

## 🐛 Solução de Problemas

### ❌ Erro: "Failed to fetch"

- **Causa**: URL ou chave incorretas
- **Solução**: Verifique se copiou corretamente as credenciais no `.env.local`
- **Solução**: Reinicie o servidor de desenvolvimento (`Ctrl+C` e `npm run dev` novamente)

### ❌ Erro: "relation does not exist"

- **Causa**: Tabelas não foram criadas
- **Solução**: Execute novamente o script `BANCO_DADOS_COMPLETO.sql` no SQL Editor

### ❌ Erro: "new row violates row-level security policy"

- **Causa**: Política RLS bloqueando a operação
- **Solução**: Verifique as políticas RLS na tabela. Por padrão, devem estar permitindo tudo.

### ❌ Erro: "Invalid API key"

- **Causa**: Chave anon incorreta ou expirada
- **Solução**: Obtenha uma nova chave em **Settings** → **API** → **anon public**

### ❌ Variáveis de ambiente não carregam

- **Causa**: Arquivo `.env.local` não está na raiz do projeto
- **Solução**: Certifique-se de que o arquivo está em `C:/Users/lucca/Downloads/SISTEMA VANDERLEI DO ZERO/.env.local`
- **Solução**: Reinicie o servidor após criar/editar o `.env.local`

---

## 📚 Recursos Adicionais

- **Documentação Supabase**: https://supabase.com/docs
- **Documentação do Banco**: Veja `DOCUMENTACAO_BANCO_DADOS_COMPLETA.md`
- **Script SQL Completo**: Veja `BANCO_DADOS_COMPLETO.sql`

---

## ✅ Checklist Final

- [ ] Projeto criado no Supabase
- [ ] Credenciais obtidas (URL e anon key)
- [ ] Arquivo `.env.local` criado e configurado
- [ ] Script SQL executado com sucesso
- [ ] 16 tabelas criadas e visíveis no Table Editor
- [ ] Políticas RLS ativas
- [ ] Servidor rodando sem erros
- [ ] Testes básicos funcionando

---

## 🎉 Pronto!

Seu projeto está conectado ao Supabase! Agora você pode:

- ✅ Cadastrar dados
- ✅ Consultar informações
- ✅ Usar todas as funcionalidades do sistema
- ✅ Desenvolver e testar localmente

**Próximos passos:**

- Configurar autenticação de usuários (se necessário)
- Ajustar políticas RLS para produção
- Fazer backup do banco de dados
- Configurar variáveis de ambiente para produção

---

**Dúvidas?** Consulte a documentação do Supabase ou verifique os arquivos de exemplo no projeto.

