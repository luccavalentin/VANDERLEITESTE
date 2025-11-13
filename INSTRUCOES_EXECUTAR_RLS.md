# 🚀 INSTRUÇÕES RÁPIDAS: EXECUTAR RLS AGORA

## ⚠️ PROBLEMA
Erros **401 (Unauthorized)** no console = Políticas RLS bloqueando acesso

## ✅ SOLUÇÃO EM 3 PASSOS (1 MINUTO)

### Passo 1: Abrir Supabase SQL Editor
1. Acesse: https://supabase.com/dashboard/project/tahanrdxbzaenpxcrsry
2. Clique em **SQL Editor** (menu lateral)
3. Clique em **New Query** (ou use a query existente)

### Passo 2: Copiar e Colar Script
1. Abra o arquivo **`RLS_SIMPLES.sql`** no seu projeto
2. **Selecione TODO o conteúdo** (`Ctrl + A`)
3. **Copie** (`Ctrl + C`)
4. **Cole no SQL Editor** do Supabase (`Ctrl + V`)

### Passo 3: Executar
1. Clique no botão **Run** (ou pressione `Ctrl + Enter`)
2. Aguarde 10-20 segundos
3. Verifique o resultado:
   - Deve aparecer uma tabela com 14 linhas (uma por tabela)
   - Cada linha deve mostrar "total_politicas: 4"
   - Deve aparecer mensagem: "✅ Políticas RLS criadas com sucesso!"

### Passo 4: Testar no Sistema
1. **Limpe o cache do navegador:**
   - `Ctrl + Shift + R` (hard refresh)
2. **Recarregue a página**
3. **Verifique o console (F12):**
   - ❌ Erros 401 devem desaparecer
   - ✅ Dados devem aparecer nas páginas

## 🔍 O QUE O SCRIPT FAZ

1. ✅ Habilita RLS em 14 tabelas
2. ✅ Remove políticas antigas (se existirem)
3. ✅ Cria 56 políticas novas (14 tabelas × 4 operações):
   - SELECT (leitura)
   - INSERT (inserção)
   - UPDATE (atualização)
   - DELETE (exclusão)
4. ✅ Verifica se tudo foi criado

## ⏱️ TEMPO TOTAL: ~1 MINUTO

## ✅ CHECKLIST

- [ ] Script `RLS_SIMPLES.sql` copiado completamente
- [ ] Script colado no Supabase SQL Editor
- [ ] Botão Run clicado
- [ ] Mensagem de sucesso apareceu
- [ ] Tabela de verificação mostra 14 linhas com 4 políticas cada
- [ ] Cache do navegador limpo (`Ctrl + Shift + R`)
- [ ] Página recarregada
- [ ] Erros 401 desapareceram
- [ ] Dados aparecem na tela

## 🆘 SE NÃO FUNCIONAR

1. **Verifique se copiou o script COMPLETO** (deve ter ~150 linhas)
2. **Verifique se não há erros no resultado** do SQL Editor
3. **Tente executar novamente** (o script é seguro para re-executar)
4. **Verifique se todas as 14 tabelas aparecem** na tabela de verificação
5. **Limpe o cache completamente:**
   - `Ctrl + Shift + Delete` → Limpar dados de navegação
   - Ou use modo anônimo: `Ctrl + Shift + N`

## 📝 NOTA

Este script habilita acesso **público total** para desenvolvimento. É seguro e pode ser executado múltiplas vezes.

