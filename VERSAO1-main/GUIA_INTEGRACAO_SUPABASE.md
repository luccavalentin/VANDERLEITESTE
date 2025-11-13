# 🚀 GUIA DE INTEGRAÇÃO COM SUPABASE - DO ZERO

Este guia vai te ajudar a integrar o Supabase ao projeto do zero e configurar tudo corretamente.

## 📋 PRÉ-REQUISITOS

1. ✅ Projeto criado no Supabase (https://supabase.com)
2. ✅ Projeto React/Vite criado localmente
3. ✅ Node.js e pnpm instalados

## 🔑 PASSO 1: OBTER CREDENCIAIS DO SUPABASE

### 1.1 Acessar o Projeto no Supabase

1. Acesse https://supabase.com
2. Faça login na sua conta
3. Selecione o projeto que você acabou de criar
4. Aguarde a inicialização completa (pode levar alguns minutos)

### 1.2 Obter as Credenciais

1. No menu lateral esquerdo, clique em **Project Settings** (ícone de engrenagem)
2. Clique em **API** no menu lateral
3. Você verá duas informações importantes:

   - **Project URL** (ex: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

4. **COPIE ESSAS DUAS INFORMAÇÕES** e guarde em um local seguro

### 1.3 Estrutura das Credenciais

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyOTI5MjkyNSwiZXhwIjoxOTQ0ODQ5MjI1fQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 📦 PASSO 2: INSTALAR DEPENDÊNCIAS DO SUPABASE

### 2.1 Instalar o Cliente Supabase

No terminal, dentro da pasta do projeto, execute:

```bash
pnpm add @supabase/supabase-js
```

### 2.2 Verificar Instalação

Verifique se o pacote foi instalado corretamente:

```bash
pnpm list @supabase/supabase-js
```

## 🔧 PASSO 3: CONFIGURAR O CLIENTE SUPABASE

### 3.1 Criar Arquivo de Configuração

Crie a estrutura de pastas se não existir:

```bash
mkdir -p src/integrations/supabase
```

### 3.2 Criar Arquivo client.ts

Crie o arquivo `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

// SUBSTITUA AQUI PELAS SUAS CREDENCIAIS DO SUPABASE
const SUPABASE_URL = "COLE_SUA_PROJECT_URL_AQUI";
const SUPABASE_ANON_KEY = "COLE_SUA_ANON_KEY_AQUI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

### 3.3 Atualizar com Suas Credenciais

1. Abra o arquivo `src/integrations/supabase/client.ts`
2. Substitua `COLE_SUA_PROJECT_URL_AQUI` pela sua **Project URL**
3. Substitua `COLE_SUA_ANON_KEY_AQUI` pela sua **anon public key**
4. Salve o arquivo

### 3.4 Exemplo de Arquivo Configurado

```typescript
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://abcdefghijklmnop.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyOTI5MjkyNSwiZXhwIjoxOTQ0ODQ5MjI1fQ.abcdefghijklmnopqrstuvwxyz1234567890";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

## 🗄️ PASSO 4: CRIAR AS TABELAS NO SUPABASE

### 4.1 Acessar o SQL Editor

1. No Supabase, no menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** para criar uma nova query
3. Você verá um editor SQL vazio

### 4.2 Executar o Script de Criação

1. Abra o arquivo `SUPABASE_TABELAS.sql` que está no projeto
2. **COPIE TODO O CONTEÚDO** do arquivo (Ctrl+A, Ctrl+C)
3. **COLE** no editor SQL do Supabase (Ctrl+V)
4. Clique em **Run** (ou pressione Ctrl+Enter)
5. Aguarde a execução (pode levar alguns segundos)

### 4.3 Verificar se as Tabelas Foram Criadas

1. No menu lateral esquerdo, clique em **Table Editor**
2. Você deve ver todas as 14 tabelas criadas:
   - tarefas
   - clientes
   - leads
   - processos
   - orcamentos_recibos
   - imoveis
   - transacoes
   - gado
   - caminhoes
   - motoristas
   - fretes
   - financiamentos
   - investimentos
   - anotacoes

### 4.4 Verificar se Houve Erros

1. Na parte inferior do SQL Editor, verifique a aba **Messages**
2. Se houver erros, eles serão exibidos em vermelho
3. Se tudo estiver OK, você verá uma mensagem de sucesso

## 🧪 PASSO 5: TESTAR A CONEXÃO

### 5.1 Criar Arquivo de Teste

Crie um arquivo de teste para verificar a conexão:

```typescript
// src/test-supabase.ts
import { supabase } from "./integrations/supabase/client";

async function testConnection() {
  try {
    // Tentar buscar dados da tabela tarefas
    const { data, error } = await supabase.from("tarefas").select("*").limit(1);

    if (error) {
      console.error("❌ Erro ao conectar com Supabase:", error);
    } else {
      console.log("✅ Conexão com Supabase estabelecida com sucesso!");
      console.log("Dados:", data);
    }
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

testConnection();
```

### 5.2 Executar o Teste

No terminal, execute:

```bash
npx tsx src/test-supabase.ts
```

Ou se preferir, teste diretamente no navegador:

1. Abra o DevTools do navegador (F12)
2. Vá na aba Console
3. Execute:

```javascript
import { supabase } from "./src/integrations/supabase/client";
supabase
  .from("tarefas")
  .select("*")
  .then(({ data, error }) => {
    if (error) console.error("Erro:", error);
    else console.log("Sucesso!", data);
  });
```

## 📝 PASSO 6: GERAR TIPOS DO SUPABASE (OPCIONAL MAS RECOMENDADO)

### 6.1 Gerar os Tipos TypeScript

1. No Supabase, vá em **Project Settings** > **API**
2. Role para baixo até encontrar a seção **Generate TypeScript types**
3. Clique no botão **Generate TypeScript types**
4. Uma janela modal aparecerá com o código TypeScript

### 6.2 Salvar os Tipos

1. **COPIE TODO O CÓDIGO** gerado
2. Crie o arquivo `src/integrations/supabase/types.ts`
3. **COLE** o código no arquivo
4. Salve o arquivo

### 6.3 Atualizar o Client para Usar os Tipos

Atualize o arquivo `src/integrations/supabase/client.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "SUA_PROJECT_URL_AQUI";
const SUPABASE_ANON_KEY = "SUA_ANON_KEY_AQUI";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

## ✅ PASSO 7: VERIFICAR CONFIGURAÇÃO COMPLETA

### 7.1 Checklist de Verificação

Verifique se tudo está configurado corretamente:

- [ ] Credenciais do Supabase configuradas no `client.ts`
- [ ] Tabelas criadas no Supabase (14 tabelas)
- [ ] Políticas RLS configuradas
- [ ] Tipos TypeScript gerados (opcional)
- [ ] Conexão testada e funcionando
- [ ] Sem erros no console

### 7.2 Testar Criando um Dado

Teste criando uma tarefa diretamente no código:

```typescript
import { supabase } from "./integrations/supabase/client";

async function criarTarefaTeste() {
  const { data, error } = await supabase
    .from("tarefas")
    .insert([
      {
        titulo: "Tarefa de Teste",
        descricao: "Testando a conexão com Supabase",
        data_vencimento: new Date().toISOString().split("T")[0],
        prioridade: "media",
        status: "pendente",
      },
    ])
    .select();

  if (error) {
    console.error("❌ Erro ao criar tarefa:", error);
  } else {
    console.log("✅ Tarefa criada com sucesso!", data);
  }
}

criarTarefaTeste();
```

## 🎯 PASSO 8: INTEGRAR COM O PROJETO REACT

### 8.1 Instalar Dependências Necessárias

Certifique-se de que todas as dependências estão instaladas:

```bash
pnpm add @supabase/supabase-js @tanstack/react-query
```

### 8.2 Configurar React Query

No arquivo `src/App.tsx` ou onde você configura o React Query:

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Seu app aqui */}
    </QueryClientProvider>
  );
}
```

### 8.3 Usar o Supabase no Código

Exemplo de como usar o Supabase em um componente:

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function MinhaComponente() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["tarefas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tarefas").select("*");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      {data?.map((tarefa) => (
        <div key={tarefa.id}>{tarefa.titulo}</div>
      ))}
    </div>
  );
}
```

## 🚨 TROUBLESHOOTING

### Erro: "Failed to fetch"

**Causa**: Credenciais incorretas ou projeto não ativo

**Solução**:

1. Verifique se as credenciais estão corretas
2. Verifique se o projeto está ativo no Supabase
3. Verifique se há problemas de rede/firewall

### Erro: "relation does not exist"

**Causa**: Tabelas não foram criadas

**Solução**:

1. Execute o script `SUPABASE_TABELAS.sql` novamente
2. Verifique se as tabelas foram criadas no Table Editor
3. Verifique se está usando o nome correto da tabela

### Erro: "permission denied"

**Causa**: Políticas RLS bloqueando o acesso

**Solução**:

1. Verifique se as políticas RLS estão configuradas
2. Se estiver em desenvolvimento, as políticas devem permitir acesso público
3. Verifique se está usando a chave correta (anon key)

### Erro: "JWT expired"

**Causa**: Token expirado

**Solução**:

1. Limpe o localStorage do navegador
2. Recarregue a página
3. Verifique se as credenciais estão corretas

## 📚 PRÓXIMOS PASSOS

Após completar todos os passos:

1. ✅ Integração com Supabase concluída
2. ✅ Tabelas criadas
3. ✅ Conexão testada
4. ⬜ Agora você pode começar a desenvolver o sistema
5. ⬜ Implementar as funcionalidades
6. ⬜ Testar todas as operações CRUD
7. ⬜ Implementar autenticação (opcional)
8. ⬜ Configurar políticas RLS para produção

## 🎉 CONCLUSÃO

Agora o Supabase está completamente integrado ao seu projeto! Você pode:

- ✅ Criar, ler, atualizar e deletar dados
- ✅ Usar todas as 14 tabelas criadas
- ✅ Desenvolver o sistema com TypeScript
- ✅ Ter type-safety com os tipos gerados

**Próximo passo**: Agora você pode me enviar o prompt para começar a desenvolver o sistema! 🚀

---

**DICA**: Guarde suas credenciais do Supabase em um local seguro. Nunca commite as credenciais no Git sem usar variáveis de ambiente!
