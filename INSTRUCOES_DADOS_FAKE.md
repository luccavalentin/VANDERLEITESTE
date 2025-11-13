# 📋 INSTRUÇÕES PARA INSERIR DADOS FAKE NO SISTEMA

## Sistema Gerenciador Empresarial - Vanderlei

---

## 🎯 OBJETIVO

Este script insere **5 registros fake** para cada tabela do sistema, permitindo testar todas as funcionalidades do sistema sem dados reais.

---

## 📊 DADOS QUE SERÃO INSERIDOS

### Tabelas com 5 registros cada:

1. ✅ **Clientes** - 5 clientes (PF e PJ)
2. ✅ **Tarefas** - 5 tarefas
3. ✅ **Leads** - 5 leads
4. ✅ **Processos** - 5 processos jurídicos
5. ✅ **Orçamentos/Recibos** - 5 orçamentos/recibos
6. ✅ **Imóveis** - 5 imóveis
7. ✅ **Contratos de Locação** - 5 contratos
8. ✅ **Transações** - 10 transações (5 entradas + 5 saídas)
9. ✅ **Gado** - 5 animais
10. ✅ **Caminhões** - 5 caminhões
11. ✅ **Motoristas** - 5 motoristas
12. ✅ **Fretes** - 5 fretes
13. ✅ **Financiamentos** - 5 financiamentos
14. ✅ **Investimentos** - 5 investimentos
15. ✅ **Anotações** - 5 anotações
16. ✅ **Follow-ups** - 5 follow-ups

**Total:** ~90 registros inseridos

---

## 🚀 COMO EXECUTAR

### Passo 1: Acessar o Supabase SQL Editor

1. Acesse: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry/sql/new
2. Faça login na sua conta do Supabase

### Passo 2: Abrir o Script SQL

1. Abra o arquivo: `INSERIR_DADOS_FAKE_SISTEMA.sql`
2. Copie **TODO** o conteúdo do arquivo

### Passo 3: Executar o Script

1. Cole o conteúdo no SQL Editor do Supabase
2. Clique em **"Run"** ou pressione `Ctrl + Enter`
3. Aguarde a execução (pode levar alguns segundos)

### Passo 4: Verificar se Funcionou

1. Verifique se não há erros no console
2. Acesse as tabelas no Supabase:
   - Vá em **Table Editor**
   - Selecione cada tabela
   - Verifique se os dados foram inseridos

---

## ⚠️ IMPORTANTE

### Antes de Executar:

1. **Backup (Opcional):** Se você já tem dados importantes no banco, faça um backup antes de executar o script.

2. **Limpar Dados Existentes (Opcional):** Se você quiser limpar os dados existentes antes de inserir os novos, descomente as linhas no início do script:

   ```sql
   DELETE FROM followups;
   DELETE FROM anotacoes;
   -- ... etc
   ```

3. **Relacionamentos:** O script respeita os relacionamentos entre as tabelas (foreign keys), então:
   - Clientes são criados primeiro
   - Processos referenciam clientes
   - Contratos de locação referenciam imóveis e clientes
   - E assim por diante...

---

## ✅ VERIFICAÇÃO

### Após Executar o Script:

1. **Verificar Clientes:**

   - Vá em **Table Editor** → **clientes**
   - Deve ter 5 registros

2. **Verificar Tarefas:**

   - Vá em **Table Editor** → **tarefas**
   - Deve ter 5 registros

3. **Verificar Processos:**

   - Vá em **Table Editor** → **processos**
   - Deve ter 5 registros
   - Verifique se os `cliente_id` estão corretos

4. **Verificar Imóveis:**

   - Vá em **Table Editor** → **imoveis**
   - Deve ter 5 registros

5. **Verificar Transações:**

   - Vá em **Table Editor** → **transacoes**
   - Deve ter 10 registros (5 entradas + 5 saídas)

6. **E assim por diante...**

---

## 🧪 TESTAR NO SISTEMA

### Após Inserir os Dados:

1. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

2. **Acesse o sistema:**

   - Abra: http://localhost:5173
   - Faça login (se necessário)

3. **Teste cada página:**
   - ✅ **Clientes** - Deve mostrar 5 clientes
   - ✅ **Tarefas** - Deve mostrar 5 tarefas
   - ✅ **Leads** - Deve mostrar 5 leads
   - ✅ **Processos** - Deve mostrar 5 processos
   - ✅ **Orçamentos/Recibos** - Deve mostrar 5 orçamentos/recibos
   - ✅ **Imóveis** - Deve mostrar 5 imóveis
   - ✅ **Entrada de Caixa** - Deve mostrar 5 transações de entrada
   - ✅ **Saída de Caixa** - Deve mostrar 5 transações de saída
   - ✅ **Gado** - Deve mostrar 5 animais
   - ✅ **Caminhões** - Deve mostrar 5 caminhões
   - ✅ **Motoristas** - Deve mostrar 5 motoristas
   - ✅ **Fretes** - Deve mostrar 5 fretes
   - ✅ **Financiamentos** - Deve mostrar 5 financiamentos
   - ✅ **Investimentos** - Deve mostrar 5 investimentos
   - ✅ **Anotações** - Deve mostrar 5 anotações
   - ✅ **Follow-ups** - Deve mostrar 5 follow-ups

---

## 🔍 TROUBLESHOOTING

### Erro: "violates foreign key constraint"

**Causa:** O script tentou inserir um registro que referencia uma tabela que ainda não foi criada.

**Solução:** Execute o script `SCRIPT_SQL_PRODUCAO_COMPLETO.sql` primeiro para criar todas as tabelas.

### Erro: "duplicate key value"

**Causa:** Os dados já existem no banco.

**Solução:** Limpe os dados existentes antes de executar o script (descomente as linhas `DELETE FROM ...` no início do script).

### Erro: "column does not exist"

**Causa:** A estrutura da tabela está diferente do esperado.

**Solução:** Verifique se as tabelas foram criadas corretamente usando o script `SCRIPT_SQL_PRODUCAO_COMPLETO.sql`.

---

## 📝 NOTAS

- Os dados são **fake** e servem apenas para **testes**
- Os relacionamentos entre as tabelas são **respeitados**
- Os dados incluem valores **realistas** para facilitar os testes
- Você pode **modificar** os dados conforme necessário

---

## 🎉 PRONTO!

Após executar o script, você terá dados fake em todas as tabelas do sistema, permitindo testar todas as funcionalidades do sistema.

---

**Criado em:** 2025-01-12  
**Versão:** 1.0.0  
**Sistema:** Gerenciador Empresarial - Vanderlei
