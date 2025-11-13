# 📧 GUIA DE CONFIGURAÇÃO DO ENVIO DE BACKUP POR EMAIL

Este guia explica como configurar o envio automático de backups por email para **luccasantana88@gmail.com**.

## 🎯 Visão Geral

O sistema de backup automático agora envia o backup por email automaticamente toda vez que um backup é gerado (diariamente). O backup é enviado como anexo em formato Excel (.xlsx).

## 📋 Pré-requisitos

- Conta no Resend (gratuita até 100 emails/dia)
- API Key do Resend
- Email configurado no Resend (domínio ou email verificado)

## 🔧 Configuração do Resend

### Passo 1: Criar Conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Clique em **Sign Up** para criar uma conta
3. Verifique seu email

### Passo 2: Obter API Key

1. Após fazer login, vá em **API Keys**
2. Clique em **Create API Key**
3. Dê um nome para a chave (ex: "Sistema Vanderlei Backup")
4. Copie a API Key gerada (ela só aparece uma vez!)
5. Salve a API Key em um local seguro

### Passo 3: Configurar Email de Envio

#### Opção 1: Usar Email Verificado (Mais Simples)

1. No Resend, vá em **Domains**
2. Clique em **Add Domain** ou use um email verificado
3. Para testes, você pode usar um email pessoal verificado
4. O Resend permite enviar de qualquer email verificado

#### Opção 2: Configurar Domínio (Recomendado para Produção)

1. No Resend, vá em **Domains**
2. Clique em **Add Domain**
3. Adicione seu domínio (ex: sistema-vanderlei.com)
4. Configure os registros DNS conforme instruções do Resend
5. Aguarde a verificação (pode levar algumas horas)

### Passo 4: Configurar no Sistema

1. Abra o arquivo `.env.local` na raiz do projeto
2. Adicione a seguinte linha:

```env
VITE_RESEND_API_KEY=re_sua_api_key_aqui
```

3. Substitua `re_sua_api_key_aqui` pela sua API Key do Resend
4. Salve o arquivo

### Passo 5: Reiniciar o Sistema

1. Pare o servidor de desenvolvimento (Ctrl+C)
2. Inicie novamente com `npm run dev`
3. O sistema agora está configurado para enviar emails

## 📧 Email de Destino

O email de destino está configurado para: **luccasantana88@gmail.com**

Para alterar o email de destino, edite o arquivo `src/lib/email-backup-service.ts`:

```typescript
const EMAIL_DESTINO = 'seu-email@exemplo.com';
```

## 🔄 Como Funciona

### Backup Automático com Email

1. O sistema verifica automaticamente a necessidade de backup a cada vez que você abre o sistema
2. Se passaram 24 horas desde o último backup, um novo backup é gerado
3. O backup é salvo no Supabase Storage
4. O backup é enviado automaticamente por email para **luccasantana88@gmail.com**
5. O email contém o arquivo Excel como anexo

### Backup Manual com Email

1. Acesse a página "Backup do Sistema"
2. Clique em "Gerar Backup Online"
3. O backup é gerado, salvo online e enviado por email automaticamente

## 📊 Conteúdo do Email

O email enviado contém:

- **Assunto**: "Backup Automático - Sistema Vanderlei - [Data]"
- **Corpo**: Informações sobre o backup (data/hora, total de registros)
- **Anexo**: Arquivo Excel (.xlsx) com todos os dados do sistema

## 🛠️ Troubleshooting

### Erro: "Resend API Key não configurada"

**Solução**:
1. Verifique se a variável `VITE_RESEND_API_KEY` está configurada no arquivo `.env.local`
2. Verifique se a API Key está correta
3. Reinicie o servidor de desenvolvimento

### Erro: "Não foi possível enviar email"

**Solução**:
1. Verifique se a API Key do Resend está válida
2. Verifique se você tem créditos disponíveis no Resend (100 emails/dia no plano gratuito)
3. Verifique se o email de envio está verificado no Resend
4. Verifique os logs do console para mais detalhes

### Email não está sendo recebido

**Solução**:
1. Verifique a pasta de spam/lixo eletrônico
2. Verifique se o email de destino está correto (luccasantana88@gmail.com)
3. Verifique se o Resend está funcionando (teste enviando um email manual)
4. Verifique os logs do console para erros

### Backup é gerado mas email não é enviado

**Solução**:
1. O backup ainda é salvo no Supabase Storage mesmo se o email falhar
2. Verifique se a API Key do Resend está configurada
3. Verifique se há créditos disponíveis no Resend
4. O sistema não falha se o email não puder ser enviado (backup ainda é salvo)

## 🔒 Segurança

### API Key do Resend

- **NUNCA** compartilhe sua API Key
- **NUNCA** faça commit da API Key no Git
- A API Key está no arquivo `.env.local` que já está no `.gitignore`
- Se a API Key for exposta, revogue-a no Resend e gere uma nova

### Limites do Plano Gratuito

- **100 emails por dia** no plano gratuito do Resend
- Se você precisar enviar mais emails, considere fazer upgrade do plano
- O sistema verifica se há créditos disponíveis antes de enviar

## 📝 Notas Importantes

- O email é enviado automaticamente toda vez que um backup é gerado
- O backup ainda é salvo no Supabase Storage mesmo se o email falhar
- O sistema não falha se o email não puder ser enviado
- Você pode baixar o backup manualmente do Supabase Storage se necessário
- O email contém o arquivo Excel como anexo

## 🔄 Alternativa: Edge Function do Supabase

Se você preferir usar uma Edge Function do Supabase (mais seguro):

1. Crie uma Edge Function no Supabase chamada `backup-email`
2. Configure a função para usar Resend ou outro serviço de email
3. A função será chamada automaticamente quando um backup for gerado
4. Veja `supabase/functions/backup-email/index.ts` para um exemplo

## 📞 Suporte

Se você encontrar problemas ao configurar o envio de email:

1. Verifique se a API Key do Resend está correta
2. Verifique se há créditos disponíveis no Resend
3. Verifique os logs do console para erros
4. Teste enviando um email manual usando a API do Resend
5. Verifique a documentação do Resend: [https://resend.com/docs](https://resend.com/docs)

## 🎯 Próximos Passos

1. Configure a API Key do Resend no arquivo `.env.local`
2. Reinicie o servidor de desenvolvimento
3. Gere um backup manual para testar
4. Verifique se o email foi recebido em **luccasantana88@gmail.com**
5. O sistema agora enviará backups automaticamente por email todos os dias

