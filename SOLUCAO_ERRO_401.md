# 🚨 SOLUÇÃO: ERRO 401 (UNAUTHORIZED) - ACESSO NEGADO

## ⚠️ PROBLEMA IDENTIFICADO

O console mostra:
- ✅ "Supabase conectado: Credenciais de produção (fallback)" - **CONEXÃO OK**
- ❌ Múltiplos erros **401 (Unauthorized)** nas requisições
- ❌ "Failed to load resource: the server responded with a status of 401"

**Causa:** As políticas RLS (Row Level Security) estão bloqueando o acesso às tabelas.

## ✅ SOLUÇÃO IMEDIATA (1 MINUTO)

### Passo 1: Acessar Supabase SQL Editor

1. Acesse: **https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry**
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

### Passo 2: Executar Script

1. Abra o arquivo **`HABILITAR_ACESSO_PUBLICO.sql`** no seu projeto
2. **Copie TODO o conteúdo** do arquivo
3. **Cole no SQL Editor** do Supabase
4. Clique em **Run** (ou pressione `Ctrl + Enter`)
5. Aguarde a execução terminar (10-20 segundos)

### Passo 3: Verificar Resultado

No final do script, você verá uma tabela mostrando todas as políticas criadas. Deve mostrar:
- 14 tabelas
- 4 políticas por tabela (SELECT, INSERT, UPDATE, DELETE)
- Total: 56 políticas

### Passo 4: Testar no Sistema

1. **Limpe o cache do navegador:**
   - `Ctrl + Shift + R` (hard refresh)
2. **Recarregue a página**
3. **Verifique o console (F12):**
   - ❌ Não deve mais aparecer erros 401
   - ✅ Os dados devem aparecer nas páginas

## 🔍 O QUE O SCRIPT FAZ

O script `HABILITAR_ACESSO_PUBLICO.sql`:
1. ✅ Habilita RLS em todas as 14 tabelas
2. ✅ Remove políticas antigas (se existirem)
3. ✅ Cria políticas de acesso público para:
   - **SELECT** (leitura)
   - **INSERT** (inserção)
   - **UPDATE** (atualização)
   - **DELETE** (exclusão)
4. ✅ Verifica se as políticas foram criadas

## ⏱️ TEMPO ESTIMADO

- Executar script: 10-20 segundos
- Limpar cache: 10 segundos
- **Total: ~30 segundos**

## ✅ CHECKLIST

- [ ] Script `HABILITAR_ACESSO_PUBLICO.sql` executado no Supabase
- [ ] Mensagem de sucesso apareceu no resultado
- [ ] Tabela de verificação mostra 56 políticas criadas
- [ ] Cache do navegador limpo
- [ ] Página recarregada
- [ ] Erros 401 desapareceram do console
- [ ] Dados aparecem na tela

## 📝 NOTA IMPORTANTE

Este script habilita acesso **público total** às tabelas. Isso é adequado para:
- ✅ Desenvolvimento
- ✅ Sistemas internos
- ✅ Aplicações com autenticação própria

Para produção com múltiplos usuários, você pode ajustar as políticas depois.

## 🆘 SE AINDA NÃO FUNCIONAR

1. Verifique se o script foi executado completamente (sem erros)
2. Verifique se todas as 56 políticas foram criadas
3. Verifique se o cache foi limpo completamente
4. Tente em modo anônimo (`Ctrl + Shift + N`)
5. Verifique se há erros de CORS no console

