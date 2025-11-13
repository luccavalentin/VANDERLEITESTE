# 🚨 FORÇAR DEPLOY NO VERCEL - SOLUÇÃO IMEDIATA

## ⚠️ PROBLEMA
O console ainda mostra `placeholder.supabase.co` porque o Vercel está usando código antigo em cache.

## ✅ SOLUÇÃO IMEDIATA

### Opção 1: Redeploy Manual (MAIS RÁPIDO)

1. **Acesse:** https://vercel.com
2. **Faça login** e selecione o projeto **VANDERLEITESTE**
3. **Vá em:** Deployments
4. **Clique nos 3 pontos** (⋯) do último deploy
5. **Selecione:** "Redeploy"
6. **Marque:** "Use existing Build Cache" = **DESMARCADO** (importante!)
7. **Clique:** "Redeploy"
8. **Aguarde** 2-3 minutos

### Opção 2: Fazer Commit Vazio (Forçar Deploy)

Se o Vercel está conectado ao GitHub, faça um commit vazio:

```bash
git commit --allow-empty -m "Forçar redeploy no Vercel"
git push origin main
```

### Opção 3: Limpar Cache do Vercel

1. Vá em **Settings** → **General**
2. Role até **"Build & Development Settings"**
3. Clique em **"Clear Build Cache"**
4. Faça um novo deploy

## 🔍 VERIFICAR SE FUNCIONOU

Após o redeploy:

1. **Aguarde 2-3 minutos** para o deploy terminar
2. **Limpe o cache do navegador:**
   - `Ctrl + Shift + R` (hard refresh)
   - Ou `Ctrl + Shift + Delete` → Limpar cache
3. **Abra o Console (F12):**
   - ✅ Deve aparecer: `✅ Supabase conectado: Credenciais de produção (fallback)`
   - ❌ NÃO deve aparecer: `placeholder.supabase.co`
4. **Verifique os dados:**
   - Os valores devem aparecer (não mais zeros)

## ⏱️ TEMPO ESTIMADO

- Redeploy: 2-3 minutos
- Limpar cache: 30 segundos
- **Total: ~3-4 minutos**

## 📝 NOTA

O código já está correto no GitHub. O problema é apenas o cache do Vercel usando a versão antiga.

