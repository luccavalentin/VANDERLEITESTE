# 🧪 Como Testar se o Projeto Está Funcionando com o Banco de Dados

## 🚀 Método Mais Rápido: Página de Teste Integrada

### 1️⃣ Acessar a Página de Teste

**Opção A: Via URL direta**
- Abra o console do navegador (F12)
- Cole este código:
```javascript
window.dispatchEvent(new CustomEvent('navigate', { detail: 'teste-conexao' }));
```

**Opção B: Via Console do Navegador**
- Abra o sistema no navegador
- Pressione F12
- Na aba Console, cole:
```javascript
// Teste rápido
import { supabase } from './src/integrations/supabase/client';
supabase.from('tarefas').select('count').then(({ data, error }) => {
  if (error) {
    console.error('❌ Erro:', error.message);
  } else {
    console.log('✅ Conexão OK! Banco de dados funcionando!');
  }
});
```

---

## 🎯 Método Prático: Testar Criando Dados

### Teste 1: Criar uma Tarefa (2 minutos)

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse:** `http://localhost:5173`

3. **Vá em:** "Gestão de Tarefas" (no menu lateral)

4. **Clique em:** "+ Nova Tarefa"

5. **Preencha:**
   - Título: "Teste de Conexão"
   - Descrição: "Verificando se o banco está funcionando"
   - Data de Vencimento: escolha qualquer data
   - Prioridade: Média

6. **Clique em:** "Salvar"

✅ **Se funcionar:** A tarefa aparece na lista = **Conexão OK!**  
❌ **Se der erro:** Aparece mensagem vermelha = Verifique as credenciais

---

### Teste 2: Criar um Cliente (2 minutos)

1. **Vá em:** "Escritório" → "Clientes"

2. **Clique em:** "+ Novo Cliente"

3. **Preencha:**
   - Nome: "Cliente Teste"
   - Tipo: Pessoa Física
   - Telefone: "(00) 00000-0000"

4. **Clique em:** "Salvar"

✅ **Se funcionar:** Cliente aparece na lista = **Conexão OK!**

---

### Teste 3: Verificar Dashboard (1 minuto)

1. **Vá em:** "Dashboard" (primeira opção do menu)

2. **Verifique:**
   - Os cards carregam sem erros?
   - Os números aparecem?
   - Não há mensagem "Carregando..." infinitamente?

✅ **Se tudo carregar:** Conexão OK!

---

## 🔍 Verificação Rápida no Console

1. **Abra o navegador** com o sistema rodando
2. **Pressione F12** (ou Ctrl+Shift+I)
3. **Vá na aba Console**
4. **Procure por:**
   - ✅ Mensagens de sucesso
   - ❌ Erros em vermelho (especialmente "Failed to fetch" ou "Invalid API key")

---

## 📊 Verificar no Supabase Dashboard

1. **Acesse:** https://supabase.com/dashboard (seu projeto)
2. **Vá em:** Table Editor
3. **Selecione uma tabela** (ex: `tarefas`)
4. **Verifique:**
   - Se você consegue ver a tabela
   - Se os dados que você criou aparecem lá

✅ **Se aparecer:** Banco funcionando!

---

## ✅ Checklist Rápido

Marque cada item conforme testa:

- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Sistema carrega no navegador (`http://localhost:5173`)
- [ ] Console não mostra erros de conexão (F12)
- [ ] Consigo criar uma tarefa
- [ ] Consigo criar um cliente
- [ ] Os dados aparecem na lista após criar
- [ ] Dashboard carrega os dados
- [ ] Não há mensagem "Carregando..." infinitamente

---

## 🐛 Problemas Comuns

### ❌ Erro: "Failed to fetch"
**Solução:** 
- Verifique se o arquivo `.env.local` existe na raiz do projeto
- Reinicie o servidor (`Ctrl+C` e `npm run dev`)

### ❌ Erro: "Invalid API key"
**Solução:**
- Verifique se a chave no `.env.local` está completa
- Obtenha uma nova chave em: Supabase → Settings → API

### ❌ Dados não aparecem
**Solução:**
- Recarregue a página (F5)
- Verifique o console do navegador (F12)
- Verifique no Supabase Table Editor se o dado foi criado

---

## 🎉 Resultado Esperado

Se tudo estiver funcionando:

✅ Você consegue criar, editar e deletar dados  
✅ Os dados aparecem imediatamente após criar  
✅ Não há erros no console do navegador  
✅ O Dashboard mostra informações  
✅ Os dados aparecem no Supabase Table Editor

---

## 💡 Dica Extra

**Para testar todas as 16 tabelas de uma vez:**

1. Abra o console do navegador (F12)
2. Cole este código:

```javascript
const tabelas = ['tarefas', 'clientes', 'leads', 'processos', 'orcamentos_recibos', 'imoveis', 'contratos_locacao', 'transacoes', 'gado', 'caminhoes', 'motoristas', 'fretes', 'financiamentos', 'investimentos', 'anotacoes', 'followups'];

tabelas.forEach(async (tabela) => {
  const { data, error } = await supabase.from(tabela).select('count').limit(1);
  if (error) {
    console.error(`❌ ${tabela}:`, error.message);
  } else {
    console.log(`✅ ${tabela}: OK`);
  }
});
```

Isso testará todas as tabelas e mostrará quais estão funcionando!

---

**Boa sorte! 🚀**

