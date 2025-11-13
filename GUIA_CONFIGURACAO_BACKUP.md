# 📦 GUIA DE CONFIGURAÇÃO DO BACKUP ONLINE

Este guia explica como configurar o sistema de backup automático online no Supabase Storage.

## 🎯 Visão Geral

O sistema de backup automático salva todos os dados do sistema em formato Excel (.xlsx) no Supabase Storage e envia automaticamente por email para **luccasantana88@gmail.com**. Os backups são gerados automaticamente diariamente (a cada 24 horas), são armazenados online na nuvem e enviados por email como anexo.

## 📋 Pré-requisitos

- Projeto Supabase configurado
- Credenciais do Supabase configuradas no sistema
- Acesso ao painel do Supabase
- Conta no Resend (gratuita até 100 emails/dia) para envio por email
- API Key do Resend configurada (veja GUIA_CONFIGURACAO_EMAIL.md)

## 🔧 Configuração do Bucket no Supabase

### Passo 1: Acessar o Painel do Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto do sistema

### Passo 2: Criar o Bucket de Backup

1. No menu lateral, clique em **Storage**
2. Clique em **Buckets**
3. Clique em **New Bucket**
4. Preencha os seguintes campos:
   - **Name**: `backups-sistema` (exatamente este nome)
   - **Public bucket**: Desmarque esta opção (bucket privado)
   - **File size limit**: `104857600` (100 MB)
   - **Allowed MIME types**: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
5. Clique em **Create bucket**

### Passo 3: Configurar Políticas RLS (Row Level Security)

Por padrão, o Supabase Storage usa RLS para controlar o acesso aos arquivos. Você precisa configurar políticas para permitir que o sistema faça upload e download dos backups.

#### 3.1 Criar Política de Upload

1. No bucket `backups-sistema`, clique em **Policies**
2. Clique em **New Policy**
3. Selecione **For full customization**
4. Configure a política:

**Policy name**: `Allow upload backups`

**Allowed operation**: `INSERT`

**Policy definition**:
```sql
bucket_id = 'backups-sistema'
```

**Policy command**: `INSERT` with check: `true`

#### 3.2 Criar Política de Download

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Configure a política:

**Policy name**: `Allow download backups`

**Allowed operation**: `SELECT`

**Policy definition**:
```sql
bucket_id = 'backups-sistema'
```

**Policy command**: `SELECT` with check: `true`

#### 3.3 Criar Política de Atualização (para substituir backup antigo)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Configure a política:

**Policy name**: `Allow update backups`

**Allowed operation**: `UPDATE`

**Policy definition**:
```sql
bucket_id = 'backups-sistema'
```

**Policy command**: `UPDATE` with check: `true`

#### 3.4 Criar Política de Exclusão (para remover backup antigo)

1. Clique em **New Policy** novamente
2. Selecione **For full customization**
3. Configure a política:

**Policy name**: `Allow delete backups`

**Allowed operation**: `DELETE`

**Policy definition**:
```sql
bucket_id = 'backups-sistema'
```

**Policy command**: `DELETE` with check: `true`

### Passo 4: Verificar Configuração

1. Verifique se o bucket `backups-sistema` foi criado
2. Verifique se as políticas RLS foram criadas
3. Teste o sistema gerando um backup manual

## 🔄 Como Funciona

### Backup Automático

- O sistema verifica automaticamente a necessidade de backup ao abrir
- Se passaram 24 horas ou mais desde o último backup, um novo é gerado automaticamente
- O backup é salvo online no Supabase Storage
- O backup é enviado automaticamente por email para **luccasantana88@gmail.com** como anexo
- O backup antigo é substituído automaticamente
- Backups são gerados diariamente para garantir que você sempre tenha uma cópia recente dos dados
- O email contém o arquivo Excel como anexo

### Backup Manual

- Você pode gerar um backup manual a qualquer momento
- Acesse a página "Backup do Sistema" no menu lateral
- Clique em "Gerar Backup Online"
- O backup será salvo online no Supabase Storage
- O backup será enviado automaticamente por email para **luccasantana88@gmail.com** como anexo
- O backup anterior será substituído

### Download do Backup

- Para baixar o backup para seu computador, use o botão "Baixar Backup Online"
- O arquivo será baixado com o nome "BACKUP_SISTEMA_VANDERLEI.xlsx"
- Você pode mover o arquivo para a pasta "planilha vanderlei" se desejar

## 📊 Dados Incluídos no Backup

O backup inclui todas as tabelas do sistema:

- **Anotações**: Todas as anotações cadastradas
- **Caminhões**: Informações dos caminhões
- **Clientes**: Cadastro completo de clientes
- **Financiamentos**: Financiamentos e empréstimos
- **Fretes**: Fretes da transportadora
- **Gado**: Gestão de gado
- **Imóveis**: Informações dos imóveis
- **Investimentos**: Carteira de investimentos
- **Leads**: Leads e prospects
- **Motoristas**: Cadastro de motoristas
- **Orçamentos e Recibos**: Orçamentos e recibos
- **Processos**: Processos jurídicos
- **Tarefas**: Tarefas e compromissos
- **Transações**: Transações financeiras

## 🛠️ Troubleshooting

### Erro: "Bucket de backup não encontrado"

**Solução**: 
1. Verifique se o bucket `backups-sistema` foi criado no Supabase
2. Verifique se o nome do bucket está correto (exatamente `backups-sistema`)
3. Tente criar o bucket manualmente no painel do Supabase

### Erro: "Erro ao salvar backup online"

**Solução**:
1. Verifique se as políticas RLS estão configuradas corretamente
2. Verifique se o bucket está configurado como privado
3. Verifique se há espaço suficiente no Supabase Storage
4. Verifique as credenciais do Supabase no sistema

### Erro: "Erro ao baixar backup"

**Solução**:
1. Verifique se existe um backup online
2. Verifique se as políticas RLS permitem download
3. Verifique se o arquivo não foi deletado

### Backup não está sendo gerado automaticamente

**Solução**:
1. Verifique se passaram 24 horas desde o último backup
2. Verifique se o sistema está verificando automaticamente (ao abrir o sistema)
3. Gere um backup manual para testar
4. O sistema verifica a cada vez que você abre o sistema, então abra novamente após 24 horas

### Email não está sendo enviado

**Solução**:
1. Verifique se a API Key do Resend está configurada no arquivo `.env.local`
2. Verifique se há créditos disponíveis no Resend (100 emails/dia no plano gratuito)
3. Verifique se o email de destino está correto (luccasantana88@gmail.com)
4. Verifique os logs do console para erros
5. O backup ainda é salvo no Supabase Storage mesmo se o email falhar
6. Veja **GUIA_CONFIGURACAO_EMAIL.md** para mais detalhes sobre configuração de email

## 📝 Notas Importantes

- O sistema mantém apenas um backup online por vez
- Quando um novo backup é gerado, o backup anterior é substituído
- O backup é enviado automaticamente por email para **luccasantana88@gmail.com** toda vez que é gerado
- O email contém o arquivo Excel como anexo
- Para manter backups antigos, baixe o backup antes de gerar um novo ou mantenha os emails recebidos
- Os backups são armazenados no formato Excel (.xlsx)
- O tamanho máximo do backup é de 100 MB (configurável no bucket)
- O backup ainda é salvo no Supabase Storage mesmo se o email não puder ser enviado

## 🔒 Segurança

- Os backups são armazenados em um bucket privado (não público)
- Apenas usuários autenticados podem acessar os backups
- As políticas RLS controlam o acesso aos arquivos
- Recomendamos configurar políticas RLS adequadas para seu caso de uso

## 📞 Suporte

Se você encontrar problemas ao configurar o backup online, verifique:

1. As credenciais do Supabase estão corretas?
2. O bucket `backups-sistema` foi criado?
3. As políticas RLS estão configuradas?
4. Há espaço suficiente no Supabase Storage?
5. O sistema está conectado ao Supabase corretamente?

Para mais informações, consulte a documentação do Supabase Storage: [https://supabase.com/docs/guides/storage](https://supabase.com/docs/guides/storage)

