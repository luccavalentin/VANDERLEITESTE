# 🧪 Guia: Como Testar a Conexão com o Banco de Dados

## 🚀 Método 1: Teste Rápido pelo Console do Navegador

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Abra o navegador** em `http://localhost:5173`

3. **Abra o Console** (F12 → Console ou Ctrl+Shift+I)

4. **Cole e execute este código:**
   ```javascript
   // Importar o cliente Supabase
   import { supabase } from './src/integrations/supabase/client';
   
   // Teste 1: Verificar conexão básica
   supabase.from('tarefas').select('count').then(({ data, error }) => {
     if (error) {
       console.error('❌ Erro:', error.message);
     } else {
       console.log('✅ Conexão OK!');
     }
   });
   ```

   **OU** use este código mais simples (sem import):
   ```javascript
   // Teste direto via fetch
   // ⚠️ Substitua pela URL e chave do seu projeto Supabase
   const SUPABASE_URL = 'https://seu-projeto.supabase.co';
   const SUPABASE_ANON_KEY = 'sua_chave_anonima_aqui';
   
   fetch(`${SUPABASE_URL}/rest/v1/tarefas?select=count`, {
     headers: {
       'apikey': SUPABASE_ANON_KEY,
       'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
     }
   })
   .then(r => r.json())
   .then(data => console.log('✅ Conexão OK!', data))
   .catch(err => console.error('❌ Erro:', err));
   ```

---

## 🎯 Método 2: Teste Prático - Criar um Dado

### Teste 1: Criar uma Tarefa

1. No sistema, vá em **"Gestão de Tarefas"**
2. Clique em **"+ Nova Tarefa"**
3. Preencha:
   - Título: "Teste de Conexão"
   - Descrição: "Testando se o banco está funcionando"
   - Data de Vencimento: escolha uma data
   - Prioridade: Média
4. Clique em **"Salvar"**

✅ **Se funcionar:** A tarefa aparece na lista = Conexão OK!  
❌ **Se der erro:** Aparece mensagem de erro = Verifique as credenciais

### Teste 2: Criar um Cliente

1. Vá em **"Escritório" → "Clientes"**
2. Clique em **"+ Novo Cliente"**
3. Preencha:
   - Nome: "Cliente Teste"
   - Tipo: Pessoa Física
   - Telefone: "(00) 00000-0000"
4. Clique em **"Salvar"**

✅ **Se funcionar:** Cliente aparece na lista = Conexão OK!  
❌ **Se der erro:** Verifique o console do navegador (F12)

### Teste 3: Criar uma Anotação

1. Vá em **"Bloco de Anotações"**
2. Clique em **"+ Nova Anotação"**
3. Preencha:
   - Título: "Teste"
   - Conteúdo: "Testando conexão"
   - Categoria: Geral
4. Clique em **"Salvar"**

---

## 🔍 Método 3: Verificar no Console do Navegador

1. Abra o sistema no navegador
2. Pressione **F12** (ou Ctrl+Shift+I)
3. Vá na aba **Console**
4. Procure por:
   - ✅ **"✅ Conexão OK"** ou mensagens de sucesso
   - ❌ **"Failed to fetch"** = Erro de conexão
   - ❌ **"Invalid API key"** = Chave incorreta
   - ❌ **"relation does not exist"** = Tabela não existe

---

## 📊 Método 4: Verificar no Supabase Dashboard

1. Acesse: https://supabase.com/dashboard (seu projeto)
2. Vá em **Table Editor**
3. Selecione uma tabela (ex: `tarefas`)
4. Se você conseguir ver a tabela e seus dados = Banco OK!

---

## 🛠️ Método 5: Usar o Script de Teste

Execute o script de teste que criamos:

```bash
node testar-conexao.js
```

**Nota:** Este script verifica todas as 16 tabelas e mostra quais estão acessíveis.

---

## ✅ Checklist de Verificação

Marque cada item conforme testa:

- [ ] Servidor inicia sem erros (`npm run dev`)
- [ ] Sistema carrega no navegador
- [ ] Console não mostra erros de conexão
- [ ] Consigo criar uma tarefa
- [ ] Consigo criar um cliente
- [ ] Consigo criar uma anotação
- [ ] Os dados aparecem na lista após criar
- [ ] Consigo editar um dado criado
- [ ] Consigo deletar um dado criado

---

## 🐛 Problemas Comuns e Soluções

### ❌ Erro: "Failed to fetch"
**Causa:** URL do Supabase incorreta ou servidor offline  
**Solução:** 
- Verifique se o arquivo `.env.local` está na raiz do projeto
- Verifique se a URL está correta: `https://seu-projeto.supabase.co`
- Reinicie o servidor (`Ctrl+C` e `npm run dev`)

### ❌ Erro: "Invalid API key"
**Causa:** Chave API incorreta  
**Solução:**
- Verifique se a chave no `.env.local` está completa
- Obtenha uma nova chave em: Settings → API → anon public

### ❌ Erro: "relation does not exist"
**Causa:** Tabela não foi criada no banco  
**Solução:**
- Execute o script `BANCO_DADOS_COMPLETO.sql` no SQL Editor do Supabase
- Verifique se todas as 16 tabelas foram criadas

### ❌ Erro: "new row violates row-level security policy"
**Causa:** Política RLS bloqueando  
**Solução:**
- No Supabase, vá em Table Editor → Selecione a tabela → RLS
- Verifique se as políticas estão permitindo operações

### ❌ Dados não aparecem após criar
**Causa:** Cache ou erro silencioso  
**Solução:**
- Recarregue a página (F5)
- Verifique o console do navegador para erros
- Verifique no Supabase Table Editor se o dado foi criado

---

## 🎉 Resultado Esperado

Se tudo estiver funcionando, você deve conseguir:

✅ Criar, editar e deletar dados em todas as telas  
✅ Ver os dados aparecendo imediatamente após criar  
✅ Não ver erros no console do navegador  
✅ Ver os dados no Supabase Table Editor

---

## 📞 Precisa de Ajuda?

Se encontrar algum problema:
1. Verifique o console do navegador (F12)
2. Verifique se o arquivo `.env.local` existe e está correto
3. Verifique se todas as tabelas foram criadas no Supabase
4. Reinicie o servidor de desenvolvimento

**Boa sorte! 🚀**

