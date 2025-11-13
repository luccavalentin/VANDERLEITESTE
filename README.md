# Sistema Gerenciador Empresarial - Vanderlei

Sistema completo de gestão empresarial desenvolvido com React, TypeScript, Vite e Supabase.

## 🚀 Tecnologias

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server rápido
- **Supabase** - Backend como serviço (BaaS) com PostgreSQL
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI baseados em Radix UI
- **React Query** - Gerenciamento de estado do servidor
- **Lucide React** - Ícones

## 📋 Pré-requisitos

- Node.js 18+ e npm/pnpm/yarn
- Conta no Supabase (gratuita)
- Git

## 🛠️ Instalação

1. **Clone o repositório ou navegue até a pasta do projeto:**
```bash
cd "C:\Users\lucca\Downloads\SISTEMA VANDERLEI DO ZERO"
```

2. **Instale as dependências:**
```bash
npm install
# ou
pnpm install
# ou
yarn install
```

3. **Configure as variáveis de ambiente:**
   
   Crie um arquivo `.env.local` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

   **Onde encontrar essas informações:**
   - Acesse [Supabase](https://supabase.com)
   - Crie um novo projeto ou use um existente
   - Vá em Settings > API
   - Copie a URL e a anon key

4. **Configure o banco de dados:**
   
   - Acesse o SQL Editor no Supabase
   - Execute o arquivo `database.sql` que está na raiz do projeto
   - Isso criará todas as tabelas necessárias

## 🚀 Executando o Projeto

```bash
npm run dev
# ou
pnpm dev
# ou
yarn dev
```

O sistema estará disponível em `http://localhost:5173`

## 📁 Estrutura do Projeto

```
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── Layout/         # Header, Sidebar
│   │   └── ui/             # Componentes UI (Button, Card, etc.)
│   ├── pages/              # Páginas do sistema
│   │   ├── Dashboard.tsx
│   │   ├── Tarefas.tsx
│   │   ├── Clientes.tsx
│   │   └── ...
│   ├── integrations/       # Integrações externas
│   │   └── supabase/       # Cliente e tipos do Supabase
│   ├── lib/                # Utilitários
│   ├── hooks/              # Custom hooks
│   ├── App.tsx             # Componente principal
│   └── main.tsx            # Ponto de entrada
├── database.sql            # Script SQL para criar tabelas
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 🗄️ Banco de Dados

O sistema utiliza 14 tabelas principais:

1. **tarefas** - Gestão de tarefas e compromissos
2. **clientes** - Cadastro de clientes (PF e PJ)
3. **leads** - Gerenciamento de leads e prospects
4. **processos** - Processos jurídicos
5. **orcamentos_recibos** - Orçamentos e recibos
6. **imoveis** - Gestão de imóveis
7. **transacoes** - Entradas e saídas financeiras
8. **gado** - Gestão de gado
9. **caminhoes** - Frota de caminhões
10. **motoristas** - Cadastro de motoristas
11. **fretes** - Gestão de fretes
12. **financiamentos** - Financiamentos e empréstimos
13. **investimentos** - Investimentos
14. **anotacoes** - Bloco de anotações

## 📝 Funcionalidades

### ✅ Implementadas
- Dashboard com estatísticas gerais
- Gestão de Tarefas (visualização)
- Gestão de Clientes (visualização)
- Gestão de Leads (visualização)
- Gestão de Processos (visualização)
- Sistema de navegação com Sidebar
- Tema claro/escuro
- Responsividade mobile

### 🚧 Em Desenvolvimento
- CRUD completo para todas as páginas
- Formulários de cadastro e edição
- Relatórios avançados
- Gráficos e visualizações
- Exportação de dados

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 🔐 Segurança

⚠️ **IMPORTANTE**: As políticas RLS (Row Level Security) estão configuradas para permitir acesso público apenas para desenvolvimento. 

**Para produção**, você deve:
1. Configurar autenticação no Supabase
2. Atualizar as políticas RLS para usar `auth.uid()`
3. Configurar variáveis de ambiente de forma segura

## 📚 Documentação Adicional

- [Documentação do React](https://react.dev)
- [Documentação do Vite](https://vitejs.dev)
- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do Tailwind CSS](https://tailwindcss.com)
- [Shadcn/ui](https://ui.shadcn.com)

## 🤝 Contribuindo

Este é um projeto privado. Para sugestões ou melhorias, entre em contato com o desenvolvedor.

## 📄 Licença

Este projeto é privado e de uso exclusivo.

---

**Desenvolvido com ❤️ para gestão empresarial**

