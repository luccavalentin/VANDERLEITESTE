# PROMPT DE RÉPLICA EXATA DO SISTEMA FINANCEIRO VANDE

## DESCRIÇÃO DO SISTEMA

Este é um sistema completo de gestão empresarial com foco em escritório jurídico, gestão financeira, imóveis, gado e transportadora. O sistema foi desenvolvido em React + TypeScript + Vite, utilizando Supabase como backend e Shadcn/ui como biblioteca de componentes.

## STACK TECNOLÓGICA

- **Frontend**: React 18.3.1 + TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Framework**: Shadcn/ui (Radix UI + Tailwind CSS)
- **Backend/DB**: Supabase (PostgreSQL)
- **State Management**: TanStack Query (React Query)
- **Formulários**: React Hook Form + Zod
- **Rotas**: React Router DOM
- **Gráficos**: Recharts
- **Tema**: next-themes (dark/light mode)
- **Notificações**: Sonner
- **Validações**: Zod
- **Utilitários**: date-fns, lucide-react

## ESTRUTURA DO PROJETO

```
/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── ComparativoTable.tsx
│   │   │   ├── FinancialSummaryCard.tsx
│   │   │   ├── FluxoChart.tsx
│   │   │   └── RankingCard.tsx
│   │   ├── Layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── Logo.tsx
│   │   ├── NavLink.tsx
│   │   ├── Processos/
│   │   │   ├── ClienteSelector.tsx
│   │   │   └── MapeamentoEstrategico.tsx
│   │   └── ui/ (50+ componentes Shadcn/ui)
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Tarefas.tsx
│   │   ├── Clientes.tsx
│   │   ├── Leads.tsx
│   │   ├── Processos.tsx
│   │   ├── OrcamentosRecibos.tsx
│   │   ├── GestaoImoveis.tsx
│   │   ├── EntradaCaixa.tsx
│   │   ├── SaidaCaixa.tsx
│   │   ├── DashboardCaixa.tsx
│   │   ├── Gado.tsx
│   │   ├── Transportadora.tsx
│   │   ├── Financiamentos.tsx
│   │   ├── Investimentos.tsx
│   │   ├── Relatorios.tsx
│   │   └── Anotacoes.tsx
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── validations.ts
│   │   ├── processos-data.ts
│   │   └── notifications.ts
│   ├── hooks/
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## FUNCIONALIDADES PRINCIPAIS

### 1. DASHBOARD

- Resumo financeiro (saldo de caixa, entradas/saídas do mês, fluxo líquido)
- Comparativo mensal com gráficos
- Cards de estatísticas (clientes, processos, tarefas)
- Alertas de tarefas urgentes
- Gráfico de fluxo de caixa (últimos 6 meses)
- Rankings de entradas e saídas
- Tabela comparativa periódica

### 2. GESTÃO DE TAREFAS

- CRUD completo de tarefas
- Filtros por status e prioridade
- Categorização por prioridade (alta, média, baixa)
- Status (pendente, em_andamento, concluida, cancelada)
- Data de vencimento
- Responsável
- Visualização de tarefas do dia e do dia seguinte
- Contadores de tarefas pendentes, concluídas e atrasadas

### 3. GESTÃO DE CLIENTES

- CRUD completo de clientes
- Suporte para Pessoa Física (PF) e Pessoa Jurídica (PJ)
- Validação de CPF/CNPJ
- Validação de email
- Busca automática de endereço por CEP
- Campos: nome, tipo, CPF/CNPJ, telefone, email, endereço completo, status
- Filtros e busca
- Estatísticas de clientes ativos/inativos

### 4. GESTÃO DE LEADS

- CRUD completo de leads
- Status: novo, contatado, interessado, convertido, perdido
- Histórico de interações (JSONB)
- Origem do lead
- Conversão de lead para cliente
- Observações e contato

### 5. GESTÃO DE PROCESSOS

- CRUD completo de processos
- Vinculação com clientes
- Número do processo (único)
- Tipo de processo
- Status: em_andamento, concluido, arquivado
- Histórico de andamentos (JSONB)
- Andamento atual e próximos passos
- Valor da causa
- Responsável
- Mapeamento estratégico de processos
- Criação automática de transações financeiras

### 6. ORÇAMENTOS E RECIBOS

- CRUD completo de orçamentos e recibos
- Vinculação com clientes e processos
- Itens (JSONB) com descrição, quantidade e valor unitário
- Cálculo automático de valor total
- Data de emissão e vencimento
- Status: pendente, aprovado, recusado, convertido
- Numero único do documento

### 7. GESTÃO DE IMÓVEIS

- CRUD completo de imóveis
- Endereço completo
- Matrícula
- Proprietário
- Valor
- Status: disponivel, alugado, vendido, manutencao
- Controle de documentação (pago/não pago)
- Data de pagamento

### 8. FLUXO DE CAIXA

- Entrada de Caixa
- Saída de Caixa
- Dashboard de Caixa com gráficos
- Categorização de transações
- Área de negócio
- Data e valor
- Observações
- Filtros por período

### 9. GESTÃO DE GADO

- CRUD completo de gado
- Identificação única
- Categoria
- Status: ativo, vendido, abatido
- Idade em meses
- Peso atual
- Origem
- Histórico de peso (JSONB)
- Histórico de saúde (JSONB)
- Eventos (JSONB)
- Observações

### 10. TRANSPORTADORA (VEDD)

- Gestão de Caminhões
  - Placa (única)
  - Modelo
  - Ano
  - Quilometragem
  - Status: ativo, manutencao, inativo
  - Data da última revisão
- Gestão de Motoristas
  - Nome
  - CNH (única)
  - Validade da CNH
  - Telefone
  - Vinculação com caminhão
- Gestão de Fretes
  - Cliente
  - Origem e destino
  - Valor do frete
  - Despesas
  - Data
  - Observações

### 11. FINANCIAMENTOS E EMPRÉSTIMOS

- CRUD completo de financiamentos
- Banco
- Valor total
- Taxa de juros
- Tipo: financiamento, emprestimo
- Número de parcelas
- Valor da parcela
- IOF
- Seguro
- Data de início e término

### 12. INVESTIMENTOS

- CRUD completo de investimentos
- Tipo
- Instituição
- Valor aplicado
- Rentabilidade
- Prazo em dias
- Data de aplicação e vencimento
- Observações

### 13. RELATÓRIOS

- Relatórios financeiros
- Relatórios de processos
- Relatórios de clientes
- Exportação de dados

### 14. BLOCO DE ANOTAÇÕES

- CRUD completo de anotações
- Categorias
- Título e conteúdo
- Data
- Organização por categoria

## COMPONENTES UI PRINCIPAIS

O sistema utiliza Shadcn/ui com os seguintes componentes principais:

- Button, Input, Textarea, Select
- Dialog, Card, Table
- Badge, Label
- Toast, Sonner (notificações)
- Tooltip, Popover
- Calendar, Date Picker
- Scroll Area
- Tabs, Accordion
- Sidebar, Header
- Charts (Recharts)

## TEMAS E ESTILOS

- Tema claro e escuro (dark mode)
- Cores personalizadas via CSS variables
- Animações suaves (fade-in, pulse)
- Design responsivo (mobile-first)
- Tailwind CSS com configuração customizada

## AUTENTICAÇÃO E SEGURANÇA

- Supabase Auth (preparado para implementação)
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso (atualmente permitindo acesso público para desenvolvimento)
- Campo user_id em todas as tabelas para isolamento de dados

## VALIDAÇÕES

- Validação de CPF/CNPJ
- Validação de email
- Validação de CEP (busca automática)
- Validação de telefone
- Validação de formulários com Zod
- Máscaras de entrada (CPF, CNPJ, telefone, CEP)

## INTEGRAÇÕES

- Supabase (backend e banco de dados)
- API ViaCEP (busca de endereço)
- Date-fns (formatação de datas)
- React Query (cache e sincronização de dados)

## PRÓXIMOS PASSOS PARA REPLICAÇÃO

1. Criar projeto no Supabase
2. Executar scripts SQL para criar todas as tabelas
3. Configurar políticas RLS
4. Clonar estrutura do projeto
5. Instalar dependências
6. Configurar variáveis de ambiente
7. Configurar Supabase client
8. Testar todas as funcionalidades

## OBSERVAÇÕES IMPORTANTES

- O sistema está preparado para multi-usuário (campo user_id em todas as tabelas)
- As políticas RLS atuais permitem acesso público (alterar em produção)
- Alguns módulos estão marcados como "em desenvolvimento" (placeholder)
- O sistema utiliza UUIDs como chaves primárias
- Todas as tabelas têm campos created_at e updated_at
- JSONB é usado para armazenar dados estruturados (históricos, itens, etc.)

## DEPENDÊNCIAS PRINCIPAIS

```json
{
  "react": "^18.3.1",
  "react-dom": "latest",
  "@tanstack/react-query": "latest",
  "@supabase/supabase-js": "latest",
  "react-router-dom": "latest",
  "react-hook-form": "latest",
  "zod": "^3.25.76",
  "recharts": "latest",
  "date-fns": "latest",
  "lucide-react": "^0.454.0",
  "next-themes": "latest",
  "sonner": "latest",
  "tailwindcss": "^3.4.17",
  "vite": "^5.4.19",
  "typescript": "^5"
}
```

## ESTRUTURA DE DADOS

O sistema possui 14 tabelas principais:

1. tarefas
2. clientes
3. leads
4. processos
5. orcamentos_recibos
6. imoveis
7. transacoes
8. gado
9. caminhoes
10. motoristas
11. fretes
12. financiamentos
13. investimentos
14. anotacoes

Todas as tabelas possuem:

- id (UUID, primary key)
- user_id (UUID, para multi-usuário)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

## COMANDOS DE INSTALAÇÃO

```bash
# Instalar dependências
pnpm install

# Executar em desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Preview da build
pnpm preview
```

## CONFIGURAÇÃO DO VITE

O servidor de desenvolvimento está configurado para:

- Porta: 8080
- Host: :: (todas as interfaces)
- Hot Module Replacement (HMR) habilitado
- React Refresh habilitado

## CONFIGURAÇÃO DO TAILWIND

- Modo escuro: class-based
- Cores customizadas via CSS variables
- Animações personalizadas
- Tipografia customizada
- Plugins: tailwindcss-animate, @tailwindcss/typography

---

**NOTA**: Este é um sistema completo e funcional. Para replicá-lo, siga os passos descritos nos arquivos de documentação de criação das tabelas no Supabase.
