# ✅ CHECKLIST DE DEPLOY EM PRODUÇÃO

Use este checklist para garantir que tudo está configurado corretamente antes e depois do deploy.

## 📋 ANTES DO DEPLOY

### Configuração do Projeto

- [ ] Código testado localmente
- [ ] Todas as dependências instaladas
- [ ] Build funcionando localmente (`pnpm build`)
- [ ] Sem erros no console
- [ ] Sem warnings críticos

### Variáveis de Ambiente

- [ ] Arquivo `.env.local` criado (não commitar!)
- [ ] `VITE_SUPABASE_URL` configurado
- [ ] `VITE_SUPABASE_ANON_KEY` configurado
- [ ] Arquivo `.env.example` criado (para documentação)
- [ ] `.gitignore` configurado para ignorar `.env*`
- [ ] Código atualizado para usar `import.meta.env.VITE_*`

### Supabase

- [ ] Projeto criado no Supabase
- [ ] Tabelas criadas (14 tabelas)
- [ ] Políticas RLS configuradas
- [ ] Triggers criados (updated_at)
- [ ] CORS configurado (adicionar URL do deploy depois)
- [ ] Credenciais obtidas (URL e anon key)

### Git

- [ ] Repositório Git configurado
- [ ] Todas as alterações commitadas
- [ ] Push para repositório remoto (GitHub, GitLab, etc.)
- [ ] `.env.local` não está no Git
- [ ] Arquivos sensíveis não estão no Git

## 🚀 DURANTE O DEPLOY

### Vercel

- [ ] Projeto importado na Vercel
- [ ] Framework configurado (Vite)
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `dist`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy executado
- [ ] Build completado com sucesso

### Netlify

- [ ] Projeto importado no Netlify
- [ ] Build command: `pnpm build`
- [ ] Publish directory: `dist`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy executado
- [ ] Build completado com sucesso

## ✅ DEPOIS DO DEPLOY

### Configuração do Supabase

- [ ] CORS configurado com URL do deploy
- [ ] Políticas RLS configuradas (produção)
- [ ] Testado acesso às tabelas

### Testes em Produção

- [ ] Site acessível na URL do deploy
- [ ] Sem erros no console do navegador
- [ ] Conexão com Supabase funcionando
- [ ] Teste de leitura de dados (SELECT)
- [ ] Teste de criação de dados (INSERT)
- [ ] Teste de atualização de dados (UPDATE)
- [ ] Teste de exclusão de dados (DELETE)
- [ ] Políticas RLS funcionando (se usar auth)
- [ ] Performance aceitável
- [ ] Responsividade testada (mobile/desktop)

### Segurança

- [ ] Variáveis de ambiente não expostas no código
- [ ] Políticas RLS configuradas corretamente
- [ ] CORS configurado corretamente
- [ ] SSL/TLS habilitado
- [ ] Headers de segurança configurados
- [ ] Credenciais não committadas no Git

### Monitoramento

- [ ] Logs configurados (Vercel/Netlify)
- [ ] Logs do Supabase monitorados
- [ ] Alertas configurados (opcional)
- [ ] Backup configurado (opcional)

## 🔄 MANTENÇÃO CONTÍNUA

### Regular

- [ ] Monitorar logs regularmente
- [ ] Verificar erros no console
- [ ] Verificar performance
- [ ] Atualizar dependências
- [ ] Fazer backup do banco de dados

### Quando Atualizar

- [ ] Fazer alterações no código
- [ ] Testar localmente primeiro
- [ ] Fazer commit e push
- [ ] Verificar deploy automático
- [ ] Testar em produção
- [ ] Verificar se tudo está funcionando

## 🚨 PROBLEMAS COMUNS

### Erro: "Failed to fetch"

**Checklist**:
- [ ] CORS configurado no Supabase
- [ ] URL do deploy adicionada no CORS
- [ ] Variáveis de ambiente configuradas corretamente
- [ ] Credenciais corretas

### Erro: "permission denied"

**Checklist**:
- [ ] Políticas RLS configuradas
- [ ] Autenticação configurada (se usar)
- [ ] user_id sendo definido corretamente
- [ ] Políticas permitindo acesso

### Erro: "Build failed"

**Checklist**:
- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando localmente
- [ ] Dependências instaladas
- [ ] Sem erros no código
- [ ] Logs de build verificados

### Erro: "Environment variables not found"

**Checklist**:
- [ ] Variáveis configuradas na plataforma
- [ ] Nomes das variáveis corretos (`VITE_*`)
- [ ] Variáveis aplicadas ao ambiente correto
- [ ] Build executado após configurar variáveis

## 📊 MÉTRICAS DE SUCESSO

### Performance

- [ ] Tempo de carregamento < 3 segundos
- [ ] Primeira renderização < 1 segundo
- [ ] Tamanho do bundle otimizado
- [ ] Imagens otimizadas
- [ ] CSS otimizado

### Funcionalidade

- [ ] Todas as funcionalidades trabalhando
- [ ] CRUD funcionando em todas as tabelas
- [ ] Filtros e buscas funcionando
- [ ] Formulários funcionando
- [ ] Validações funcionando

### Segurança

- [ ] Políticas RLS ativas
- [ ] CORS configurado
- [ ] Credenciais protegidas
- [ ] SSL/TLS habilitado
- [ ] Headers de segurança configurados

## 🎉 PRONTO!

Se todos os itens estiverem marcados, seu projeto está pronto para produção! 🚀

---

## 📚 RECURSOS

- [Guia Completo de Deploy](GUIA_DEPLOY_PRODUCAO.md)
- [Deploy Rápido](DEPLOY_RAPIDO.md)
- [Políticas RLS para Produção](POLITICAS_RLS_PRODUCAO.sql)
- [Documentação da Vercel](https://vercel.com/docs)
- [Documentação do Netlify](https://docs.netlify.com)
- [Documentação do Supabase](https://supabase.com/docs)

