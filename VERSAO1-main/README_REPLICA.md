# 📋 README - REPLICAÇÃO DO SISTEMA FINANCEIRO VANDE

Este documento fornece um resumo completo para replicar o Sistema Financeiro VANDE.

## 📁 ARQUIVOS CRIADOS

1. **PROMPT_REPLICA_SISTEMA.md** - Descrição completa do sistema, funcionalidades, stack tecnológica e estrutura
2. **SUPABASE_TABELAS.sql** - Script SQL completo para criar todas as 14 tabelas no Supabase
3. **GUIA_PASSO_A_PASSO_SUPABASE.md** - Guia detalhado passo a passo para criar as tabelas no Supabase
4. **README_REPLICA.md** - Este arquivo (resumo geral)

## 🚀 INÍCIO RÁPIDO

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma conta ou faça login
3. Crie um novo projeto
4. Aguarde a inicialização (pode levar alguns minutos)

### 2. Criar as Tabelas

1. Acesse o **SQL Editor** no Supabase
2. Abra o arquivo `SUPABASE_TABELAS.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a execução
7. Verifique se as 14 tabelas foram criadas no **Table Editor**

### 3. Configurar as Credenciais

1. No Supabase, vá em **Project Settings** > **API**
2. Copie a **Project URL** e a **anon public key**
3. Abra o arquivo `src/integrations/supabase/client.ts`
4. Substitua as credenciais:

```typescript
const SUPABASE_URL = "SUA_PROJECT_URL_AQUI";
const SUPABASE_PUBLISHABLE_KEY = "SUA_ANON_KEY_AQUI";
```

### 4. Instalar Dependências

```bash
pnpm install
```

### 5. Executar o Projeto

```bash
pnpm dev
```

### 6. Acessar o Sistema

Abra o navegador em: http://localhost:8080

## 📊 TABELAS CRIADAS

O sistema possui 14 tabelas principais:

1. **tarefas** - Gerenciamento de tarefas e compromissos
2. **clientes** - Gerenciamento de clientes (PF e PJ)
3. **leads** - Gerenciamento de leads e prospects
4. **processos** - Gerenciamento de processos jurídicos
5. **orcamentos_recibos** - Gerenciamento de orçamentos e recibos
6. **imoveis** - Gerenciamento de imóveis
7. **transacoes** - Gerenciamento de transações financeiras (entrada/saída)
8. **gado** - Gerenciamento de gado
9. **caminhoes** - Gerenciamento de caminhões
10. **motoristas** - Gerenciamento de motoristas
11. **fretes** - Gerenciamento de fretes
12. **financiamentos** - Gerenciamento de financiamentos e empréstimos
13. **investimentos** - Gerenciamento de investimentos
14. **anotacoes** - Gerenciamento de anotações e notas

## 🔑 CARACTERÍSTICAS PRINCIPAIS

### Funcionalidades

- ✅ Dashboard com resumo financeiro
- ✅ Gestão de tarefas com prioridades e status
- ✅ Gestão de clientes (PF/PJ) com validações
- ✅ Gestão de leads com histórico de interações
- ✅ Gestão de processos jurídicos
- ✅ Orçamentos e recibos com itens
- ✅ Gestão de imóveis
- ✅ Fluxo de caixa (entrada/saída)
- ✅ Dashboard de caixa com gráficos
- ✅ Gestão de gado
- ✅ Transportadora (caminhões, motoristas, fretes)
- ✅ Financiamentos e empréstimos
- ✅ Investimentos
- ✅ Bloco de anotações

### Tecnologias

- **Frontend**: React 18.3.1 + TypeScript
- **Build**: Vite 5.4.19
- **UI**: Shadcn/ui (Radix UI + Tailwind CSS)
- **Backend**: Supabase (PostgreSQL)
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Theme**: next-themes (dark/light mode)

## 📝 ESTRUTURA DO BANCO DE DADOS

Todas as tabelas possuem:
- `id` (UUID, primary key)
- `user_id` (UUID, para multi-usuário)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Relacionamentos

- `processos` → `clientes` (cliente_id)
- `orcamentos_recibos` → `clientes` (cliente_id)
- `orcamentos_recibos` → `processos` (processo_id)
- `motoristas` → `caminhoes` (caminhao_id)

### Índices

Todas as tabelas possuem índices otimizados para:
- `user_id` (para isolamento de dados)
- Campos de busca frequente
- Foreign keys
- Campos JSONB (usando GIN)

### Políticas RLS

- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas atuais permitem acesso público (para desenvolvimento)
- **IMPORTANTE**: Alterar para políticas baseadas em `auth.uid()` em produção

## 🔧 CONFIGURAÇÃO

### Variáveis de Ambiente

O sistema utiliza credenciais do Supabase diretamente no código. Para produção, considere usar variáveis de ambiente:

```env
VITE_SUPABASE_URL=SUA_PROJECT_URL
VITE_SUPABASE_ANON_KEY=SUA_ANON_KEY
```

### Políticas RLS para Produção

Para produção, você deve alterar as políticas RLS. Exemplo:

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Enable all for tarefas" ON tarefas;

-- Criar políticas baseadas em user_id
CREATE POLICY "Users can view own tarefas" ON tarefas 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tarefas" ON tarefas 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tarefas" ON tarefas 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tarefas" ON tarefas 
  FOR DELETE USING (auth.uid() = user_id);
```

## 🧪 TESTANDO O SISTEMA

### 1. Criar uma Tarefa

1. Acesse a página "Gestão de Tarefas"
2. Clique em "Nova Tarefa"
3. Preencha os campos
4. Clique em "Criar"
5. Verifique se a tarefa foi criada

### 2. Criar um Cliente

1. Acesse a página "Clientes"
2. Clique em "Novo Cliente"
3. Preencha os campos (nome, tipo, telefone, CEP, etc.)
4. Clique em "Criar"
5. Verifique se o cliente foi criado

### 3. Criar um Processo

1. Acesse a página "Processos"
2. Clique em "Novo Processo"
3. Preencha os campos (número do processo, tipo, cliente, etc.)
4. Clique em "Criar"
5. Verifique se o processo foi criado

### 4. Verificar no Supabase

1. Acesse o **Table Editor** no Supabase
2. Selecione uma das tabelas criadas
3. Verifique se os dados foram salvos

## 📚 DOCUMENTAÇÃO ADICIONAL

- **PROMPT_REPLICA_SISTEMA.md** - Descrição completa do sistema
- **GUIA_PASSO_A_PASSO_SUPABASE.md** - Guia detalhado para criar as tabelas
- **SUPABASE_TABELAS.sql** - Script SQL completo

## ⚠️ IMPORTANTE

1. **Segurança**: As políticas RLS atuais permitem acesso público. Alterar para produção!
2. **Autenticação**: O sistema está preparado para multi-usuário, mas a autenticação precisa ser implementada
3. **Validações**: O sistema possui validações de CPF/CNPJ, email, CEP, etc.
4. **Backup**: Faça backup regular do banco de dados
5. **Monitoramento**: Configure monitoramento e logs no Supabase

## 🐛 TROUBLESHOOTING

### Erro: "relation already exists"
- Execute `DROP TABLE IF EXISTS nome_tabela CASCADE;` antes de criar a tabela
- **CUIDADO**: Isso apagará todos os dados!

### Erro: "permission denied"
- Verifique se você tem permissões de administrador
- Verifique se está executando no schema correto (public)

### Erro: "constraint violation"
- Verifique se as foreign keys estão corretas
- Certifique-se de que as tabelas referenciadas foram criadas antes

### Erro: "connection refused"
- Verifique se as credenciais do Supabase estão corretas
- Verifique se o projeto está ativo no Supabase
- Verifique se há problemas de rede/firewall

## 📞 SUPORTE

Para dúvidas ou problemas:
1. Consulte a documentação do Supabase: https://supabase.com/docs
2. Consulte a documentação do React: https://react.dev
3. Consulte a documentação do Vite: https://vitejs.dev

## 📄 LICENÇA

Este projeto é de código aberto. Use livremente para seus projetos.

## 🎉 PRÓXIMOS PASSOS

1. ✅ Criar projeto no Supabase
2. ✅ Criar todas as tabelas
3. ✅ Configurar credenciais
4. ✅ Testar o sistema
5. ⬜ Implementar autenticação
6. ⬜ Configurar políticas RLS para produção
7. ⬜ Adicionar mais funcionalidades
8. ⬜ Deploy do sistema

---

**Desenvolvido com ❤️ para gestão empresarial**

