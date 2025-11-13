# 🚀 Início Rápido - Sistema Vanderlei

## ⚠️ IMPORTANTE: Como Acessar o Sistema

### ❌ NÃO USE:
- Live Server (porta 5500)
- Abrir o arquivo HTML diretamente no navegador

### ✅ USE:
- O servidor Vite que está configurado

## 📋 Passos para Ver o Sistema Funcionando

### 1. Instalar Dependências (JÁ FEITO ✅)
```bash
npm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

### 3. Acessar no Navegador
Abra o navegador e acesse:
```
http://localhost:5173
```

**OU** o servidor deve abrir automaticamente quando você rodar `npm run dev`

## 🔍 Se Ainda Estiver em Branco

### Verifique o Console do Navegador:
1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Veja se há erros em vermelho

### Erros Comuns:

#### 1. Erro de Conexão com Supabase
**Solução:** Crie o arquivo `.env.local` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```
**Obtenha suas credenciais em:** Supabase Dashboard → Settings → API

#### 2. Erro de Módulo Não Encontrado
**Solução:** Reinstale as dependências:
```bash
npm install
```

#### 3. Porta Já em Uso
**Solução:** Pare o servidor (Ctrl+C) e rode novamente:
```bash
npm run dev
```

## 🎯 Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Criar build de produção
npm run build

# Ver preview do build
npm run preview
```

## 📞 Se Nada Funcionar

1. Verifique se o Node.js está instalado:
```bash
node --version
```
Deve mostrar versão 18 ou superior.

2. Verifique se o npm está instalado:
```bash
npm --version
```

3. Limpe o cache e reinstale:
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

---

**Lembre-se:** O sistema deve rodar em `http://localhost:5173` (não na porta 5500!)

