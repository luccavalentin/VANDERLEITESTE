# 🔄 FLUXO DE INTEGRAÇÃO COM SUPABASE

## 📊 VISÃO GERAL DO PROCESSO

```
┌─────────────────────────────────────────────────────────────┐
│                    1. CRIAR PROJETO NO SUPABASE              │
│  • Acesse https://supabase.com                              │
│  • Crie uma conta ou faça login                             │
│  • Crie um novo projeto                                      │
│  • Aguarde a inicialização (alguns minutos)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│             2. OBTER CREDENCIAIS DO SUPABASE                 │
│  • Project Settings > API                                    │
│  • Copie a Project URL                                       │
│  • Copie a anon public key                                   │
│  • Guarde em local seguro                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          3. INSTALAR DEPENDÊNCIAS DO SUPABASE                │
│  • pnpm add @supabase/supabase-js                            │
│  • Verificar instalação                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           4. CONFIGURAR CLIENTE SUPABASE                     │
│  • Abrir src/integrations/supabase/client.ts                 │
│  • Substituir SUA_PROJECT_URL_AQUI                           │
│  • Substituir SUA_ANON_KEY_AQUI                              │
│  • Salvar arquivo                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          5. CRIAR TABELAS NO SUPABASE                        │
│  • SQL Editor > New Query                                    │
│  • Abrir SUPABASE_TABELAS.sql                                │
│  • Copiar TODO o conteúdo                                    │
│  • Colar no SQL Editor                                       │
│  • Executar (Run ou Ctrl+Enter)                              │
│  • Verificar se 14 tabelas foram criadas                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│             6. TESTAR CONEXÃO COM SUPABASE                   │
│  • Executar: npx tsx TESTE_CONEXAO_SUPABASE.ts               │
│  • Verificar se todas as tabelas foram encontradas           │
│  • Verificar se a conexão está funcionando                   │
│  • Corrigir erros se necessário                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 7. PRONTO PARA DESENVOLVER!                  │
│  • Integração completa                                       │
│  • Tabelas criadas                                           │
│  • Conexão testada                                           │
│  • Agora você pode me enviar o prompt!                       │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 CHECKLIST DE INTEGRAÇÃO

### ✅ Fase 1: Configuração Inicial

- [ ] Projeto criado no Supabase
- [ ] Credenciais obtidas (Project URL e anon key)
- [ ] Dependências instaladas (`@supabase/supabase-js`)
- [ ] Cliente Supabase configurado

### ✅ Fase 2: Criação de Tabelas

- [ ] Script SQL executado no Supabase
- [ ] 14 tabelas criadas
- [ ] Políticas RLS configuradas
- [ ] Triggers criados (updated_at)

### ✅ Fase 3: Teste e Validação

- [ ] Conexão testada
- [ ] Tabelas verificadas
- [ ] Teste de criação de dados
- [ ] Sem erros no console

### ✅ Fase 4: Pronto para Desenvolver

- [ ] Tudo funcionando
- [ ] Integração completa
- [ ] Pronto para receber o prompt de desenvolvimento

## 📁 ARQUIVOS NECESSÁRIOS

### 1. Arquivos de Configuração

- `src/integrations/supabase/client.ts` - Cliente Supabase
- `src/integrations/supabase/types.ts` - Tipos TypeScript (gerar depois)

### 2. Arquivos de Script

- `SUPABASE_TABELAS.sql` - Script para criar tabelas
- `TESTE_CONEXAO_SUPABASE.ts` - Script de teste

### 3. Arquivos de Documentação

- `INICIO_RAPIDO.md` - Guia rápido
- `GUIA_INTEGRACAO_SUPABASE.md` - Guia completo
- `FLUXO_INTEGRACAO.md` - Este arquivo

## 🔑 CREDENCIAIS DO SUPABASE

### Onde Encontrar:

1. Acesse https://supabase.com
2. Selecione seu projeto
3. Vá em **Project Settings** > **API**
4. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIs...`

### Onde Colocar:

- Arquivo: `src/integrations/supabase/client.ts`
- Substitua: `SUA_PROJECT_URL_AQUI` e `SUA_ANON_KEY_AQUI`

## 🗄️ TABELAS CRIADAS

Após executar o script SQL, você deve ter 14 tabelas:

1. ✅ tarefas
2. ✅ clientes
3. ✅ leads
4. ✅ processos
5. ✅ orcamentos_recibos
6. ✅ imoveis
7. ✅ transacoes
8. ✅ gado
9. ✅ caminhoes
10. ✅ motoristas
11. ✅ fretes
12. ✅ financiamentos
13. ✅ investimentos
14. ✅ anotacoes

## 🧪 TESTE RÁPIDO

### Teste 1: Verificar Conexão

```bash
npx tsx TESTE_CONEXAO_SUPABASE.ts
```

### Teste 2: Criar uma Tarefa

```typescript
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.from("tarefas").insert([
  {
    titulo: "Teste",
    data_vencimento: "2024-01-01",
    prioridade: "media",
    status: "pendente",
  },
]);
```

### Teste 3: Buscar Tarefas

```typescript
const { data, error } = await supabase.from("tarefas").select("*");
```

## ⚠️ PROBLEMAS COMUNS

### Problema 1: "Failed to fetch"

**Solução**: Verifique se as credenciais estão corretas

### Problema 2: "relation does not exist"

**Solução**: Execute o script `SUPABASE_TABELAS.sql` no Supabase

### Problema 3: "permission denied"

**Solução**: Verifique se as políticas RLS estão configuradas

### Problema 4: "JWT expired"

**Solução**: Limpe o localStorage e recarregue a página

## 🎉 PRONTO!

Após completar todos os passos:

1. ✅ Integração com Supabase completa
2. ✅ Tabelas criadas
3. ✅ Conexão testada
4. ✅ Pronto para desenvolver

**Agora você pode me enviar o prompt para começar a desenvolver o sistema!** 🚀

---

## 📞 PRECISA DE AJUDA?

- Consulte: `GUIA_INTEGRACAO_SUPABASE.md` - Guia completo
- Consulte: `INICIO_RAPIDO.md` - Guia rápido
- Consulte: `GUIA_PASSO_A_PASSO_SUPABASE.md` - Guia de criação de tabelas
