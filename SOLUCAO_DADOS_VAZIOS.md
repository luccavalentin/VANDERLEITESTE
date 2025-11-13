# 🔧 SOLUÇÃO: Dados Vazios em Produção

## ⚠️ PROBLEMA
Os dados cadastrados não estão aparecendo em produção. O console mostra erros de `placeholder.supabase.co`.

## ✅ SOLUÇÕES

### Solução 1: Limpar Cache do Navegador

O navegador pode estar usando uma versão antiga em cache:

1. **Chrome/Edge:**
   - Pressione `Ctrl + Shift + Delete`
   - Selecione "Imagens e arquivos em cache"
   - Período: "Última hora" ou "Todo o período"
   - Clique em "Limpar dados"

2. **Hard Refresh:**
   - Pressione `Ctrl + Shift + R` (ou `Ctrl + F5`)
   - Isso força o navegador a recarregar tudo

3. **Modo Anônimo:**
   - Abra uma janela anônima (`Ctrl + Shift + N`)
   - Acesse o site
   - Verifique se os dados aparecem

### Solução 2: Verificar se o Deploy Atualizou

1. Acesse o Vercel Dashboard
2. Vá em **Deployments**
3. Verifique se o último deploy foi **DEPOIS** da correção
4. Se não, faça um novo deploy:
   - Vá em **Settings** → **Git**
   - Clique em **Redeploy** no último commit

### Solução 3: Verificar Console do Navegador

1. Abra o Console (F12)
2. Procure por mensagens que começam com:
   - ✅ `ℹ️ Supabase: Usando credenciais de produção` = CORRETO
   - ❌ `ERRO: Variáveis de ambiente não configuradas` = PROBLEMA

### Solução 4: Verificar Dados no Supabase

Os dados podem estar no banco, mas não aparecendo:

1. Acesse https://supabase.com/dashboard
2. Vá em **Table Editor**
3. Verifique se as tabelas têm dados:
   - `clientes`
   - `tarefas`
   - `processos`
   - etc.

### Solução 5: Reinserir Dados (Se Necessário)

Se os dados realmente não existem no banco:

1. Execute o script SQL no Supabase:
   - Vá em **SQL Editor**
   - Execute `INSERIR_DADOS_FAKE_SISTEMA.sql` (se tiver)
   - Ou insira manualmente alguns registros de teste

## 🔍 DIAGNÓSTICO RÁPIDO

Execute no Console do navegador (F12):

```javascript
// Verificar se Supabase está configurado
console.log('URL:', import.meta.env.VITE_SUPABASE_URL || 'USANDO FALLBACK');
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'CONFIGURADA' : 'USANDO FALLBACK');

// Testar conexão
import { supabase } from './src/integrations/supabase/client';
supabase.from('clientes').select('count').then(({ data, error }) => {
  console.log('Teste conexão:', error ? 'ERRO: ' + error.message : 'OK - ' + data + ' registros');
});
```

## ✅ CHECKLIST

- [ ] Limpei o cache do navegador
- [ ] Fiz hard refresh (Ctrl + Shift + R)
- [ ] Verifiquei que o deploy foi atualizado
- [ ] Console mostra "Usando credenciais de produção"
- [ ] Dados existem no Supabase Table Editor
- [ ] Testei em modo anônimo

## 📞 SE NADA FUNCIONAR

1. Verifique se o build em produção está usando o código atualizado
2. Verifique se há erros de CORS no console
3. Verifique se as políticas RLS no Supabase permitem leitura pública

