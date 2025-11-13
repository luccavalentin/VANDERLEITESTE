# 📊 DOCUMENTAÇÃO COMPLETA DO BANCO DE DADOS

## Sistema Gerenciador Empresarial - Vanderlei

---

## 📋 ÍNDICE

1. [Visão Geral](#visão-geral)
2. [Tabelas do Sistema](#tabelas-do-sistema)
3. [Relacionamentos](#relacionamentos)
4. [Índices](#índices)
5. [Triggers](#triggers)
6. [Row Level Security (RLS)](#row-level-security-rls)
7. [Script SQL Completo](#script-sql-completo)

---

## 🎯 VISÃO GERAL

O banco de dados foi projetado para suportar todas as funcionalidades do sistema, incluindo:

- Gestão de Clientes e Leads
- Processos Jurídicos
- Financeiro (Entradas/Saídas)
- Imóveis e Contratos de Locação
- Gado
- Transportadora (Caminhões, Motoristas, Fretes)
- Financiamentos e Investimentos
- Tarefas e Follow-ups
- Anotações
- Orçamentos e Recibos

**Total de Tabelas:** 15 tabelas principais

---

## 📊 TABELAS DO SISTEMA

### 1. TAREFAS

**Descrição:** Gerencia tarefas e compromissos do sistema.

| Campo             | Tipo      | Obrigatório | Descrição                                                     |
| ----------------- | --------- | ----------- | ------------------------------------------------------------- |
| `id`              | UUID      | ✅          | Chave primária (gerada automaticamente)                       |
| `titulo`          | TEXT      | ✅          | Título da tarefa                                              |
| `descricao`       | TEXT      | ❌          | Descrição detalhada                                           |
| `data_vencimento` | DATE      | ✅          | Data de vencimento                                            |
| `prioridade`      | TEXT      | ✅          | Valores: 'alta', 'media', 'baixa'                             |
| `status`          | TEXT      | ✅          | Valores: 'pendente', 'em_andamento', 'concluida', 'cancelada' |
| `responsavel`     | TEXT      | ❌          | Nome do responsável                                           |
| `observacoes`     | TEXT      | ❌          | Observações adicionais                                        |
| `user_id`         | UUID      | ❌          | ID do usuário (para multi-tenant)                             |
| `created_at`      | TIMESTAMP | ✅          | Data de criação (automático)                                  |
| `updated_at`      | TIMESTAMP | ✅          | Data de atualização (automático)                              |

**Índices:**

- `idx_tarefas_user_id` - Busca por usuário
- `idx_tarefas_status` - Filtro por status
- `idx_tarefas_data_vencimento` - Ordenação por data

---

### 2. CLIENTES

**Descrição:** Cadastro de clientes (Pessoa Física ou Jurídica).

| Campo         | Tipo      | Obrigatório | Descrição                     |
| ------------- | --------- | ----------- | ----------------------------- |
| `id`          | UUID      | ✅          | Chave primária                |
| `nome`        | TEXT      | ✅          | Nome completo ou Razão Social |
| `tipo`        | TEXT      | ✅          | Valores: 'pf', 'pj'           |
| `cpf_cnpj`    | TEXT      | ❌          | CPF ou CNPJ                   |
| `telefone`    | TEXT      | ✅          | Telefone de contato           |
| `email`       | TEXT      | ❌          | E-mail                        |
| `cep`         | TEXT      | ✅          | CEP                           |
| `endereco`    | TEXT      | ✅          | Endereço completo             |
| `numero`      | TEXT      | ❌          | Número do endereço            |
| `complemento` | TEXT      | ❌          | Complemento                   |
| `cidade`      | TEXT      | ✅          | Cidade                        |
| `estado`      | TEXT      | ✅          | Estado (UF)                   |
| `status`      | TEXT      | ✅          | Valores: 'ativo', 'inativo'   |
| `user_id`     | UUID      | ❌          | ID do usuário                 |
| `created_at`  | TIMESTAMP | ✅          | Data de criação               |
| `updated_at`  | TIMESTAMP | ✅          | Data de atualização           |

**Índices:**

- `idx_clientes_user_id` - Busca por usuário
- `idx_clientes_nome` - Busca por nome
- `idx_clientes_cpf_cnpj` - Busca por CPF/CNPJ
- `idx_clientes_status` - Filtro por status

---

### 3. LEADS

**Descrição:** Gestão de leads e oportunidades de negócio.

| Campo                  | Tipo      | Obrigatório | Descrição                                                            |
| ---------------------- | --------- | ----------- | -------------------------------------------------------------------- |
| `id`                   | UUID      | ✅          | Chave primária                                                       |
| `nome`                 | TEXT      | ✅          | Nome do lead                                                         |
| `contato`              | TEXT      | ✅          | Telefone ou e-mail                                                   |
| `origem`               | TEXT      | ✅          | Origem do lead (ex: site, indicação)                                 |
| `status`               | TEXT      | ✅          | Valores: 'novo', 'contatado', 'interessado', 'convertido', 'perdido' |
| `observacoes`          | TEXT      | ❌          | Observações                                                          |
| `historico_interacoes` | JSONB     | ❌          | Histórico de interações (array)                                      |
| `user_id`              | UUID      | ❌          | ID do usuário                                                        |
| `created_at`           | TIMESTAMP | ✅          | Data de criação                                                      |
| `updated_at`           | TIMESTAMP | ✅          | Data de atualização                                                  |

**Índices:**

- `idx_leads_user_id` - Busca por usuário
- `idx_leads_status` - Filtro por status
- `idx_leads_origem` - Filtro por origem
- `idx_leads_historico` - Busca no histórico (GIN)

---

### 4. PROCESSOS

**Descrição:** Gestão completa de processos jurídicos.

| Campo                        | Tipo          | Obrigatório | Descrição                                                                            |
| ---------------------------- | ------------- | ----------- | ------------------------------------------------------------------------------------ |
| `id`                         | UUID          | ✅          | Chave primária                                                                       |
| `numero_processo`            | TEXT          | ✅          | Número único do processo                                                             |
| `tipo`                       | TEXT          | ✅          | Tipo de processo                                                                     |
| `tipo_acao_area`             | TEXT          | ❌          | Área do direito (ex: Civil, Família)                                                 |
| `tipo_acao`                  | TEXT          | ❌          | Tipo específico de ação                                                              |
| `cliente_id`                 | UUID          | ❌          | FK para clientes(id)                                                                 |
| `status`                     | TEXT          | ✅          | Valores: 'em_andamento', 'concluido', 'arquivado'                                    |
| `status_categoria`           | TEXT          | ❌          | Categoria do status                                                                  |
| `status_detalhado`           | TEXT          | ❌          | Status detalhado                                                                     |
| `data_inicial`               | DATE          | ✅          | Data de início                                                                       |
| `data_conclusao`             | DATE          | ❌          | Data de conclusão                                                                    |
| `responsavel`                | TEXT          | ❌          | Advogado responsável                                                                 |
| `valor_causa`                | DECIMAL(10,2) | ❌          | Valor da causa                                                                       |
| `resultado_causa`            | TEXT          | ❌          | Valores: 'ganha', 'perdida', 'acordo', 'parcial', 'indeferida', 'anulada', 'extinta' |
| `andamento_atual`            | TEXT          | ❌          | Andamento atual                                                                      |
| `observacoes`                | TEXT          | ❌          | Observações                                                                          |
| `proximos_passos`            | TEXT          | ❌          | Próximos passos                                                                      |
| `historico_andamentos`       | JSONB         | ❌          | Histórico de andamentos (array)                                                      |
| `comarca`                    | TEXT          | ❌          | Comarca                                                                              |
| `tribunal`                   | TEXT          | ❌          | Tribunal                                                                             |
| `fase_processual`            | TEXT          | ❌          | Fase processual                                                                      |
| `data_distribuicao`          | DATE          | ❌          | Data de distribuição                                                                 |
| `data_citacao`               | DATE          | ❌          | Data de citação/intimação                                                            |
| `data_contestacao`           | DATE          | ❌          | Data de contestação                                                                  |
| `data_audiencia_conciliacao` | DATE          | ❌          | Data de audiência de conciliação                                                     |
| `data_audiencia_instrucao`   | DATE          | ❌          | Data de audiência de instrução                                                       |
| `data_sentenca`              | DATE          | ❌          | Data da sentença                                                                     |
| `data_publicacao_sentenca`   | DATE          | ❌          | Data de publicação da sentença                                                       |
| `data_recurso`               | DATE          | ❌          | Data de recurso                                                                      |
| `data_transito_julgado`      | DATE          | ❌          | Data de trânsito em julgado                                                          |
| `data_arquivamento`          | DATE          | ❌          | Data de arquivamento                                                                 |
| `data_cumprimento_sentenca`  | DATE          | ❌          | Data de cumprimento da sentença                                                      |
| `data_acordo`                | DATE          | ❌          | Data de acordo                                                                       |
| `data_pagamento_liquidacao`  | DATE          | ❌          | Data de pagamento/liquidação                                                         |
| `data_limite_prazo`          | DATE          | ❌          | Data limite de prazo                                                                 |
| `cronologia`                 | JSONB         | ❌          | Cronologia completa (array)                                                          |
| `user_id`                    | UUID          | ❌          | ID do usuário                                                                        |
| `created_at`                 | TIMESTAMP     | ✅          | Data de criação                                                                      |
| `updated_at`                 | TIMESTAMP     | ✅          | Data de atualização                                                                  |

**Índices:**

- `idx_processos_user_id` - Busca por usuário
- `idx_processos_cliente_id` - Busca por cliente
- `idx_processos_numero_processo` - Busca por número (único)
- `idx_processos_status` - Filtro por status
- `idx_processos_historico` - Busca no histórico (GIN)

---

### 5. ORÇAMENTOS E RECIBOS

**Descrição:** Gestão de orçamentos e recibos.

| Campo             | Tipo          | Obrigatório | Descrição                                                 |
| ----------------- | ------------- | ----------- | --------------------------------------------------------- |
| `id`              | UUID          | ✅          | Chave primária                                            |
| `numero`          | TEXT          | ✅          | Número do documento                                       |
| `tipo`            | TEXT          | ✅          | Valores: 'orcamento', 'recibo'                            |
| `cliente_id`      | UUID          | ❌          | FK para clientes(id)                                      |
| `processo_id`     | UUID          | ❌          | FK para processos(id)                                     |
| `itens`           | JSONB         | ✅          | Array de itens do documento                               |
| `valor_total`     | DECIMAL(10,2) | ✅          | Valor total                                               |
| `data_emissao`    | DATE          | ✅          | Data de emissão                                           |
| `data_vencimento` | DATE          | ❌          | Data de vencimento                                        |
| `observacoes`     | TEXT          | ❌          | Observações                                               |
| `status`          | TEXT          | ✅          | Valores: 'pendente', 'aprovado', 'recusado', 'convertido' |
| `user_id`         | UUID          | ❌          | ID do usuário                                             |
| `created_at`      | TIMESTAMP     | ✅          | Data de criação                                           |
| `updated_at`      | TIMESTAMP     | ✅          | Data de atualização                                       |

**Estrutura do campo `itens` (JSONB):**

```json
[
  {
    "descricao": "Consulta Jurídica",
    "quantidade": 1,
    "valorUnitario": 500.0
  }
]
```

**Índices:**

- `idx_orcamentos_recibos_user_id` - Busca por usuário
- `idx_orcamentos_recibos_cliente_id` - Busca por cliente
- `idx_orcamentos_recibos_processo_id` - Busca por processo
- `idx_orcamentos_recibos_numero` - Busca por número
- `idx_orcamentos_recibos_tipo` - Filtro por tipo
- `idx_orcamentos_recibos_status` - Filtro por status
- `idx_orcamentos_recibos_itens` - Busca nos itens (GIN)

---

### 6. IMÓVEIS

**Descrição:** Gestão de imóveis próprios.

| Campo                 | Tipo          | Obrigatório | Descrição                                                 |
| --------------------- | ------------- | ----------- | --------------------------------------------------------- |
| `id`                  | UUID          | ✅          | Chave primária                                            |
| `endereco`            | TEXT          | ✅          | Endereço completo                                         |
| `cep`                 | TEXT          | ✅          | CEP                                                       |
| `numero`              | TEXT          | ✅          | Número                                                    |
| `complemento`         | TEXT          | ❌          | Complemento                                               |
| `cidade`              | TEXT          | ✅          | Cidade                                                    |
| `estado`              | TEXT          | ✅          | Estado (UF)                                               |
| `matricula`           | TEXT          | ❌          | Matrícula do imóvel                                       |
| `proprietario`        | TEXT          | ❌          | Nome do proprietário                                      |
| `valor`               | DECIMAL(10,2) | ✅          | Valor do imóvel                                           |
| `status`              | TEXT          | ✅          | Valores: 'disponivel', 'alugado', 'vendido', 'manutencao' |
| `documento_pago`      | BOOLEAN       | ❌          | Documento pago?                                           |
| `data_pagamento`      | DATE          | ❌          | Data de pagamento do documento                            |
| `inquilino_id`        | UUID          | ❌          | FK para clientes(id) - Inquilino                          |
| `valor_aluguel`       | DECIMAL(10,2) | ❌          | Valor do aluguel                                          |
| `data_inicio_aluguel` | DATE          | ❌          | Data de início do aluguel                                 |
| `data_fim_aluguel`    | DATE          | ❌          | Data de fim do aluguel                                    |
| `conta_agua`          | TEXT          | ❌          | Valores: 'inquilino', 'proprietario'                      |
| `conta_energia`       | TEXT          | ❌          | Valores: 'inquilino', 'proprietario'                      |
| `tornar_receita`      | BOOLEAN       | ❌          | Tornar receita recorrente?                                |
| `user_id`             | UUID          | ❌          | ID do usuário                                             |
| `created_at`          | TIMESTAMP     | ✅          | Data de criação                                           |
| `updated_at`          | TIMESTAMP     | ✅          | Data de atualização                                       |

**Índices:**

- `idx_imoveis_user_id` - Busca por usuário
- `idx_imoveis_status` - Filtro por status
- `idx_imoveis_cidade` - Busca por cidade
- `idx_imoveis_matricula` - Busca por matrícula

---

### 7. CONTRATOS DE LOCAÇÃO

**Descrição:** Gestão de contratos de locação de imóveis.

| Campo             | Tipo          | Obrigatório | Descrição                                 |
| ----------------- | ------------- | ----------- | ----------------------------------------- |
| `id`              | UUID          | ✅          | Chave primária                            |
| `imovel_id`       | UUID          | ✅          | FK para imoveis(id) - CASCADE DELETE      |
| `locatario_id`    | UUID          | ✅          | FK para clientes(id) - CASCADE DELETE     |
| `valor_aluguel`   | DECIMAL(10,2) | ✅          | Valor do aluguel mensal                   |
| `data_inicio`     | DATE          | ✅          | Data de início do contrato                |
| `data_fim`        | DATE          | ✅          | Data de fim do contrato                   |
| `deposito_caucao` | DECIMAL(10,2) | ❌          | Valor do depósito caução                  |
| `reajuste_indice` | TEXT          | ❌          | Índice de reajuste (IGPM, IPCA, etc.)     |
| `dia_vencimento`  | INTEGER       | ✅          | Dia do mês de vencimento (1-31)           |
| `conta_agua`      | TEXT          | ✅          | Valores: 'inquilino', 'proprietario'      |
| `conta_energia`   | TEXT          | ✅          | Valores: 'inquilino', 'proprietario'      |
| `tornar_receita`  | BOOLEAN       | ❌          | Tornar receita recorrente?                |
| `gerar_previsao`  | BOOLEAN       | ❌          | Gerar previsão no financeiro?             |
| `observacoes`     | TEXT          | ❌          | Observações                               |
| `status`          | TEXT          | ✅          | Valores: 'ativo', 'encerrado', 'suspenso' |
| `user_id`         | UUID          | ❌          | ID do usuário                             |
| `created_at`      | TIMESTAMP     | ✅          | Data de criação                           |
| `updated_at`      | TIMESTAMP     | ✅          | Data de atualização                       |

**Índices:**

- `idx_contratos_locacao_user_id` - Busca por usuário
- `idx_contratos_locacao_imovel_id` - Busca por imóvel
- `idx_contratos_locacao_locatario_id` - Busca por locatário
- `idx_contratos_locacao_status` - Filtro por status

**Relacionamentos:**

- `imovel_id` → `imoveis(id)` ON DELETE CASCADE
- `locatario_id` → `clientes(id)` ON DELETE CASCADE

---

### 8. TRANSAÇÕES (ENTRADA/SAÍDA)

**Descrição:** Registro de todas as transações financeiras.

| Campo                 | Tipo          | Obrigatório | Descrição                                                    |
| --------------------- | ------------- | ----------- | ------------------------------------------------------------ |
| `id`                  | UUID          | ✅          | Chave primária                                               |
| `tipo`                | TEXT          | ✅          | Valores: 'entrada', 'saida'                                  |
| `descricao`           | TEXT          | ✅          | Descrição da transação                                       |
| `categoria`           | TEXT          | ✅          | Categoria (ex: Vendas, Salários)                             |
| `valor`               | DECIMAL(10,2) | ✅          | Valor da transação                                           |
| `data`                | DATE          | ✅          | Data da transação                                            |
| `area`                | TEXT          | ❌          | Área relacionada                                             |
| `observacoes`         | TEXT          | ❌          | Observações                                                  |
| `status`              | TEXT          | ❌          | Valores: 'realizado', 'previsto' (para previsões de aluguel) |
| `contrato_locacao_id` | UUID          | ❌          | FK para contratos_locacao(id) - Para previsões de aluguel    |
| `user_id`             | UUID          | ❌          | ID do usuário                                                |
| `created_at`          | TIMESTAMP     | ✅          | Data de criação                                              |
| `updated_at`          | TIMESTAMP     | ✅          | Data de atualização                                          |

**Índices:**

- `idx_transacoes_user_id` - Busca por usuário
- `idx_transacoes_tipo` - Filtro por tipo
- `idx_transacoes_categoria` - Filtro por categoria
- `idx_transacoes_data` - Ordenação por data
- `idx_transacoes_area` - Filtro por área
- `idx_transacoes_status` - Filtro por status (se adicionado)
- `idx_transacoes_contrato_locacao_id` - Busca por contrato (se adicionado)

**Nota:** O campo `status` e `contrato_locacao_id` devem ser adicionados para suportar previsões de aluguel.

---

### 9. GADO

**Descrição:** Gestão de rebanho bovino.

| Campo             | Tipo          | Obrigatório | Descrição                                       |
| ----------------- | ------------- | ----------- | ----------------------------------------------- |
| `id`              | UUID          | ✅          | Chave primária                                  |
| `identificacao`   | TEXT          | ✅          | Identificação única (único)                     |
| `brinco`          | TEXT          | ❌          | Número do brinco                                |
| `lote`            | TEXT          | ❌          | Lote                                            |
| `categoria`       | TEXT          | ✅          | Categoria (ex: Bezerro, Novilho, Touro)         |
| `status`          | TEXT          | ✅          | Valores: 'ativo', 'vendido', 'abatido', 'morto' |
| `data_nascimento` | DATE          | ❌          | Data de nascimento                              |
| `raca`            | TEXT          | ❌          | Raça                                            |
| `origem`          | TEXT          | ❌          | Valores: 'cria', 'compra'                       |
| `idade_meses`     | INTEGER       | ❌          | Idade em meses                                  |
| `peso_atual`      | DECIMAL(10,2) | ❌          | Peso atual (kg)                                 |
| `localizacao`     | TEXT          | ❌          | Localização (pasto, curral, etc.)               |
| `observacoes`     | TEXT          | ❌          | Observações                                     |
| `historico_peso`  | JSONB         | ❌          | Histórico de pesagens (array)                   |
| `historico_saude` | JSONB         | ❌          | Histórico de saúde (array)                      |
| `eventos`         | JSONB         | ❌          | Eventos (cobrição, nascimento, venda, etc.)     |
| `user_id`         | UUID          | ❌          | ID do usuário                                   |
| `created_at`      | TIMESTAMP     | ✅          | Data de criação                                 |
| `updated_at`      | TIMESTAMP     | ✅          | Data de atualização                             |

**Estrutura do campo `historico_peso` (JSONB):**

```json
[
  {
    "data": "2025-01-15",
    "peso": 350.5,
    "observacoes": "Pesagem mensal"
  }
]
```

**Estrutura do campo `eventos` (JSONB):**

```json
[
  {
    "tipo": "cobricao",
    "data": "2025-01-10",
    "observacoes": "Coberta pelo touro X"
  }
]
```

**Índices:**

- `idx_gado_user_id` - Busca por usuário
- `idx_gado_identificacao` - Busca por identificação (único)
- `idx_gado_status` - Filtro por status
- `idx_gado_categoria` - Filtro por categoria
- `idx_gado_historico_peso` - Busca no histórico de peso (GIN)
- `idx_gado_historico_saude` - Busca no histórico de saúde (GIN)
- `idx_gado_eventos` - Busca nos eventos (GIN)

---

### 10. CAMINHÕES

**Descrição:** Gestão da frota de caminhões.

| Campo                 | Tipo      | Obrigatório | Descrição                                 |
| --------------------- | --------- | ----------- | ----------------------------------------- |
| `id`                  | UUID      | ✅          | Chave primária                            |
| `placa`               | TEXT      | ✅          | Placa do veículo (único)                  |
| `modelo`              | TEXT      | ✅          | Modelo do caminhão                        |
| `ano`                 | INTEGER   | ❌          | Ano de fabricação                         |
| `quilometragem`       | INTEGER   | ❌          | Quilometragem atual                       |
| `status`              | TEXT      | ✅          | Valores: 'ativo', 'manutencao', 'inativo' |
| `data_ultima_revisao` | DATE      | ❌          | Data da última revisão                    |
| `user_id`             | UUID      | ❌          | ID do usuário                             |
| `created_at`          | TIMESTAMP | ✅          | Data de criação                           |
| `updated_at`          | TIMESTAMP | ✅          | Data de atualização                       |

**Índices:**

- `idx_caminhoes_user_id` - Busca por usuário
- `idx_caminhoes_placa` - Busca por placa (único)
- `idx_caminhoes_status` - Filtro por status

---

### 11. MOTORISTAS

**Descrição:** Gestão de motoristas.

| Campo          | Tipo      | Obrigatório | Descrição                                  |
| -------------- | --------- | ----------- | ------------------------------------------ |
| `id`           | UUID      | ✅          | Chave primária                             |
| `nome`         | TEXT      | ✅          | Nome completo                              |
| `cnh`          | TEXT      | ✅          | Número da CNH (único)                      |
| `validade_cnh` | DATE      | ✅          | Data de validade da CNH                    |
| `telefone`     | TEXT      | ✅          | Telefone de contato                        |
| `caminhao_id`  | UUID      | ❌          | FK para caminhoes(id) - Caminhão vinculado |
| `user_id`      | UUID      | ❌          | ID do usuário                              |
| `created_at`   | TIMESTAMP | ✅          | Data de criação                            |
| `updated_at`   | TIMESTAMP | ✅          | Data de atualização                        |

**Índices:**

- `idx_motoristas_user_id` - Busca por usuário
- `idx_motoristas_cnh` - Busca por CNH (único)
- `idx_motoristas_caminhao_id` - Busca por caminhão
- `idx_motoristas_validade_cnh` - Alerta de CNH vencendo

**Relacionamentos:**

- `caminhao_id` → `caminhoes(id)` ON DELETE SET NULL

---

### 12. FRETES

**Descrição:** Gestão de fretes realizados.

| Campo          | Tipo          | Obrigatório | Descrição                     |
| -------------- | ------------- | ----------- | ----------------------------- |
| `id`           | UUID          | ✅          | Chave primária                |
| `cliente`      | TEXT          | ✅          | Nome do cliente (texto livre) |
| `caminhao_id`  | UUID          | ❌          | FK para caminhoes(id)         |
| `motorista_id` | UUID          | ❌          | FK para motoristas(id)        |
| `origem`       | TEXT          | ✅          | Local de origem               |
| `destino`      | TEXT          | ✅          | Local de destino              |
| `valor_frete`  | DECIMAL(10,2) | ✅          | Valor do frete                |
| `despesas`     | DECIMAL(10,2) | ❌          | Despesas do frete             |
| `data`         | DATE          | ✅          | Data do frete                 |
| `observacoes`  | TEXT          | ❌          | Observações                   |
| `user_id`      | UUID          | ❌          | ID do usuário                 |
| `created_at`   | TIMESTAMP     | ✅          | Data de criação               |
| `updated_at`   | TIMESTAMP     | ✅          | Data de atualização           |

**Índices:**

- `idx_fretes_user_id` - Busca por usuário
- `idx_fretes_data` - Ordenação por data
- `idx_fretes_cliente` - Busca por cliente
- `idx_fretes_caminhao_id` - Busca por caminhão (se adicionado)
- `idx_fretes_motorista_id` - Busca por motorista (se adicionado)

**Nota:** Os campos `caminhao_id` e `motorista_id` devem ser adicionados para vincular fretes a caminhões e motoristas.

---

### 13. FINANCIAMENTOS

**Descrição:** Gestão de financiamentos e empréstimos.

| Campo                 | Tipo          | Obrigatório | Descrição                                |
| --------------------- | ------------- | ----------- | ---------------------------------------- |
| `id`                  | UUID          | ✅          | Chave primária                           |
| `banco`               | TEXT          | ✅          | Nome do banco/instituição                |
| `tipo`                | TEXT          | ✅          | Valores: 'financiamento', 'emprestimo'   |
| `valor_total`         | DECIMAL(10,2) | ✅          | Valor total financiado                   |
| `taxa_juros`          | DECIMAL(5,2)  | ✅          | Taxa de juros anual (%)                  |
| `sistema_amortizacao` | TEXT          | ❌          | Valores: 'SAC', 'PRICE'                  |
| `numero_parcelas`     | INTEGER       | ✅          | Número de parcelas                       |
| `valor_parcela`       | DECIMAL(10,2) | ✅          | Valor da parcela                         |
| `iof`                 | DECIMAL(10,2) | ❌          | IOF                                      |
| `seguro`              | DECIMAL(10,2) | ❌          | Valor do seguro                          |
| `cet`                 | DECIMAL(5,2)  | ❌          | Custo Efetivo Total (%)                  |
| `data_inicio`         | DATE          | ✅          | Data de início                           |
| `data_termino`        | DATE          | ❌          | Data de término                          |
| `status`              | TEXT          | ❌          | Valores: 'ativo', 'quitado', 'cancelado' |
| `documento_url`       | TEXT          | ❌          | URL do documento anexado                 |
| `user_id`             | UUID          | ❌          | ID do usuário                            |
| `created_at`          | TIMESTAMP     | ✅          | Data de criação                          |
| `updated_at`          | TIMESTAMP     | ✅          | Data de atualização                      |

**Índices:**

- `idx_financiamentos_user_id` - Busca por usuário
- `idx_financiamentos_tipo` - Filtro por tipo
- `idx_financiamentos_banco` - Busca por banco
- `idx_financiamentos_data_inicio` - Ordenação por data

---

### 14. INVESTIMENTOS

**Descrição:** Gestão de investimentos financeiros.

| Campo                  | Tipo          | Obrigatório | Descrição                                    |
| ---------------------- | ------------- | ----------- | -------------------------------------------- |
| `id`                   | UUID          | ✅          | Chave primária                               |
| `tipo`                 | TEXT          | ✅          | Tipo de investimento (ex: CDB, LCI, Tesouro) |
| `instituicao`          | TEXT          | ✅          | Banco/Instituição financeira                 |
| `valor_aplicado`       | DECIMAL(10,2) | ✅          | Valor aplicado                               |
| `rentabilidade`        | DECIMAL(5,2)  | ✅          | Rentabilidade anual (%)                      |
| `prazo_dias`           | INTEGER       | ❌          | Prazo em dias                                |
| `data_aplicacao`       | DATE          | ✅          | Data de aplicação                            |
| `data_vencimento`      | DATE          | ❌          | Data de vencimento                           |
| `status`               | TEXT          | ✅          | Valores: 'ativo', 'resgatado', 'vencido'     |
| `vincular_fluxo_caixa` | BOOLEAN       | ❌          | Vincular ao fluxo de caixa?                  |
| `observacoes`          | TEXT          | ❌          | Observações                                  |
| `historico_rendimento` | JSONB         | ❌          | Histórico de rendimentos (array)             |
| `user_id`              | UUID          | ❌          | ID do usuário                                |
| `created_at`           | TIMESTAMP     | ✅          | Data de criação                              |
| `updated_at`           | TIMESTAMP     | ✅          | Data de atualização                          |

**Estrutura do campo `historico_rendimento` (JSONB):**

```json
[
  {
    "data": "2025-01-15",
    "valor": 10500.0,
    "rendimento": 500.0
  }
]
```

**Índices:**

- `idx_investimentos_user_id` - Busca por usuário
- `idx_investimentos_tipo` - Filtro por tipo
- `idx_investimentos_instituicao` - Busca por instituição
- `idx_investimentos_data_aplicacao` - Ordenação por data de aplicação
- `idx_investimentos_data_vencimento` - Alerta de vencimentos

---

### 15. ANOTAÇÕES

**Descrição:** Bloco de anotações e lembretes.

| Campo        | Tipo      | Obrigatório | Descrição                         |
| ------------ | --------- | ----------- | --------------------------------- |
| `id`         | UUID      | ✅          | Chave primária                    |
| `titulo`     | TEXT      | ✅          | Título da anotação                |
| `categoria`  | TEXT      | ✅          | Categoria (ex: Pessoal, Trabalho) |
| `conteudo`   | TEXT      | ✅          | Conteúdo da anotação              |
| `data`       | DATE      | ❌          | Data da anotação (padrão: hoje)   |
| `user_id`    | UUID      | ❌          | ID do usuário                     |
| `created_at` | TIMESTAMP | ✅          | Data de criação                   |
| `updated_at` | TIMESTAMP | ✅          | Data de atualização               |

**Índices:**

- `idx_anotacoes_user_id` - Busca por usuário
- `idx_anotacoes_categoria` - Filtro por categoria
- `idx_anotacoes_data` - Ordenação por data

---

### 16. FOLLOW-UPS DE CLIENTES

**Descrição:** Histórico de relacionamento e follow-ups com clientes.

| Campo                | Tipo      | Obrigatório | Descrição                                              |
| -------------------- | --------- | ----------- | ------------------------------------------------------ |
| `id`                 | UUID      | ✅          | Chave primária                                         |
| `cliente_id`         | UUID      | ✅          | FK para clientes(id) - CASCADE DELETE                  |
| `mensagem`           | TEXT      | ✅          | Mensagem/descrição do follow-up                        |
| `responsavel`        | TEXT      | ✅          | Nome do responsável                                    |
| `data_hora`          | TIMESTAMP | ✅          | Data e hora (padrão: agora)                            |
| `lembrete_data`      | DATE      | ❌          | Data do lembrete                                       |
| `lembrete_texto`     | TEXT      | ❌          | Texto do lembrete                                      |
| `transformar_tarefa` | BOOLEAN   | ❌          | Transformar em tarefa?                                 |
| `tarefa_id`          | UUID      | ❌          | FK para tarefas(id) - Tarefa vinculada                 |
| `status`             | TEXT      | ✅          | Valores: 'pendente', 'concluido', 'aguardando_cliente' |
| `anexos`             | JSONB     | ❌          | Array de anexos (URLs)                                 |
| `user_id`            | UUID      | ❌          | ID do usuário                                          |
| `created_at`         | TIMESTAMP | ✅          | Data de criação                                        |
| `updated_at`         | TIMESTAMP | ✅          | Data de atualização                                    |

**Estrutura do campo `anexos` (JSONB):**

```json
[
  {
    "nome": "documento.pdf",
    "url": "https://...",
    "tipo": "application/pdf"
  }
]
```

**Índices:**

- `idx_followups_user_id` - Busca por usuário
- `idx_followups_cliente_id` - Busca por cliente
- `idx_followups_tarefa_id` - Busca por tarefa
- `idx_followups_status` - Filtro por status
- `idx_followups_data_hora` - Ordenação por data/hora
- `idx_followups_lembrete_data` - Alertas de lembretes

**Relacionamentos:**

- `cliente_id` → `clientes(id)` ON DELETE CASCADE
- `tarefa_id` → `tarefas(id)` ON DELETE SET NULL

---

## 🔗 RELACIONAMENTOS

### Diagrama de Relacionamentos:

```
CLIENTES (1) ──< (N) PROCESSOS
CLIENTES (1) ──< (N) ORÇAMENTOS_RECIBOS
CLIENTES (1) ──< (N) FOLLOWUPS
CLIENTES (1) ──< (N) IMOVEIS (como inquilino)
CLIENTES (1) ──< (N) CONTRATOS_LOCACAO (como locatário)

PROCESSOS (1) ──< (N) ORÇAMENTOS_RECIBOS

IMOVEIS (1) ──< (N) CONTRATOS_LOCACAO

CONTRATOS_LOCACAO (1) ──< (N) TRANSAÇÕES (previsões)

TAREFAS (1) ──< (N) FOLLOWUPS

CAMINHOES (1) ──< (N) MOTORISTAS
CAMINHOES (1) ──< (N) FRETES
MOTORISTAS (1) ──< (N) FRETES
```

---

## 📑 ÍNDICES

Todos os índices foram criados para otimizar as consultas mais frequentes:

### Índices por Tabela:

**TAREFAS:**

- `idx_tarefas_user_id` - Filtro por usuário
- `idx_tarefas_status` - Filtro por status
- `idx_tarefas_data_vencimento` - Ordenação e alertas

**CLIENTES:**

- `idx_clientes_user_id` - Filtro por usuário
- `idx_clientes_nome` - Busca por nome
- `idx_clientes_cpf_cnpj` - Busca por CPF/CNPJ
- `idx_clientes_status` - Filtro por status

**LEADS:**

- `idx_leads_user_id` - Filtro por usuário
- `idx_leads_status` - Filtro por status
- `idx_leads_origem` - Filtro por origem
- `idx_leads_historico` - Busca no histórico (GIN)

**PROCESSOS:**

- `idx_processos_user_id` - Filtro por usuário
- `idx_processos_cliente_id` - Busca por cliente
- `idx_processos_numero_processo` - Busca por número (único)
- `idx_processos_status` - Filtro por status
- `idx_processos_historico` - Busca no histórico (GIN)

**ORÇAMENTOS_RECIBOS:**

- `idx_orcamentos_recibos_user_id` - Filtro por usuário
- `idx_orcamentos_recibos_cliente_id` - Busca por cliente
- `idx_orcamentos_recibos_processo_id` - Busca por processo
- `idx_orcamentos_recibos_numero` - Busca por número
- `idx_orcamentos_recibos_tipo` - Filtro por tipo
- `idx_orcamentos_recibos_status` - Filtro por status
- `idx_orcamentos_recibos_itens` - Busca nos itens (GIN)

**IMOVEIS:**

- `idx_imoveis_user_id` - Filtro por usuário
- `idx_imoveis_status` - Filtro por status
- `idx_imoveis_cidade` - Busca por cidade
- `idx_imoveis_matricula` - Busca por matrícula

**CONTRATOS_LOCACAO:**

- `idx_contratos_locacao_user_id` - Filtro por usuário
- `idx_contratos_locacao_imovel_id` - Busca por imóvel
- `idx_contratos_locacao_locatario_id` - Busca por locatário
- `idx_contratos_locacao_status` - Filtro por status

**TRANSAÇÕES:**

- `idx_transacoes_user_id` - Filtro por usuário
- `idx_transacoes_tipo` - Filtro por tipo (entrada/saída)
- `idx_transacoes_categoria` - Filtro por categoria
- `idx_transacoes_data` - Ordenação por data
- `idx_transacoes_area` - Filtro por área

**GADO:**

- `idx_gado_user_id` - Filtro por usuário
- `idx_gado_identificacao` - Busca por identificação (único)
- `idx_gado_status` - Filtro por status
- `idx_gado_categoria` - Filtro por categoria
- `idx_gado_historico_peso` - Busca no histórico (GIN)
- `idx_gado_historico_saude` - Busca no histórico (GIN)
- `idx_gado_eventos` - Busca nos eventos (GIN)

**CAMINHOES:**

- `idx_caminhoes_user_id` - Filtro por usuário
- `idx_caminhoes_placa` - Busca por placa (único)
- `idx_caminhoes_status` - Filtro por status

**MOTORISTAS:**

- `idx_motoristas_user_id` - Filtro por usuário
- `idx_motoristas_cnh` - Busca por CNH (único)
- `idx_motoristas_caminhao_id` - Busca por caminhão
- `idx_motoristas_validade_cnh` - Alerta de CNH vencendo

**FRETES:**

- `idx_fretes_user_id` - Filtro por usuário
- `idx_fretes_data` - Ordenação por data
- `idx_fretes_cliente` - Busca por cliente

**FINANCIAMENTOS:**

- `idx_financiamentos_user_id` - Filtro por usuário
- `idx_financiamentos_tipo` - Filtro por tipo
- `idx_financiamentos_banco` - Busca por banco
- `idx_financiamentos_data_inicio` - Ordenação por data

**INVESTIMENTOS:**

- `idx_investimentos_user_id` - Filtro por usuário
- `idx_investimentos_tipo` - Filtro por tipo
- `idx_investimentos_instituicao` - Busca por instituição
- `idx_investimentos_data_aplicacao` - Ordenação por data
- `idx_investimentos_data_vencimento` - Alerta de vencimentos

**ANOTAÇÕES:**

- `idx_anotacoes_user_id` - Filtro por usuário
- `idx_anotacoes_categoria` - Filtro por categoria
- `idx_anotacoes_data` - Ordenação por data

**FOLLOWUPS:**

- `idx_followups_user_id` - Filtro por usuário
- `idx_followups_cliente_id` - Busca por cliente
- `idx_followups_tarefa_id` - Busca por tarefa
- `idx_followups_status` - Filtro por status
- `idx_followups_data_hora` - Ordenação por data/hora
- `idx_followups_lembrete_data` - Alertas de lembretes

---

## ⚙️ TRIGGERS

### Função de Atualização Automática

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### Triggers por Tabela:

Todas as tabelas têm um trigger que atualiza automaticamente o campo `updated_at` quando um registro é modificado:

- `update_tarefas_updated_at`
- `update_clientes_updated_at`
- `update_leads_updated_at`
- `update_processos_updated_at`
- `update_orcamentos_recibos_updated_at`
- `update_imoveis_updated_at`
- `update_contratos_locacao_updated_at`
- `update_transacoes_updated_at`
- `update_gado_updated_at`
- `update_caminhoes_updated_at`
- `update_motoristas_updated_at`
- `update_fretes_updated_at`
- `update_financiamentos_updated_at`
- `update_investimentos_updated_at`
- `update_anotacoes_updated_at`
- `update_followups_updated_at`

---

## 🔒 ROW LEVEL SECURITY (RLS)

### Status Atual:

**Todas as tabelas têm RLS habilitado** com políticas permissivas para desenvolvimento:

```sql
ALTER TABLE [nome_tabela] ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for [nome_tabela]" ON [nome_tabela]
FOR ALL USING (true) WITH CHECK (true);
```

### ⚠️ IMPORTANTE PARA PRODUÇÃO:

As políticas atuais permitem acesso total. **Em produção, alterar para:**

```sql
-- Exemplo de política segura para produção:
CREATE POLICY "Users can only see their own data" ON [nome_tabela]
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 📝 CAMPOS ADICIONAIS NECESSÁRIOS

### TRANSAÇÕES - Campos para Previsões de Aluguel:

```sql
ALTER TABLE transacoes
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('realizado', 'previsto')) DEFAULT 'realizado',
ADD COLUMN IF NOT EXISTS contrato_locacao_id UUID REFERENCES contratos_locacao(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_transacoes_status ON transacoes(status);
CREATE INDEX IF NOT EXISTS idx_transacoes_contrato_locacao_id ON transacoes(contrato_locacao_id);
```

### FRETES - Campos para Vinculação:

```sql
ALTER TABLE fretes
ADD COLUMN IF NOT EXISTS caminhao_id UUID REFERENCES caminhoes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS motorista_id UUID REFERENCES motoristas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_fretes_caminhao_id ON fretes(caminhao_id);
CREATE INDEX IF NOT EXISTS idx_fretes_motorista_id ON fretes(motorista_id);
```

---

## 🚀 SCRIPT SQL COMPLETO

O arquivo `database.sql` contém o script completo para criação de todas as tabelas, índices, triggers e políticas RLS.

### Ordem de Execução:

1. Criar todas as tabelas
2. Criar todos os índices
3. Criar a função `update_updated_at_column()`
4. Criar todos os triggers
5. Habilitar RLS em todas as tabelas
6. Criar políticas RLS
7. Adicionar campos adicionais (se necessário)

---

## 📊 RESUMO ESTATÍSTICO

- **Total de Tabelas:** 16
- **Total de Índices:** ~70+
- **Total de Triggers:** 16
- **Total de Políticas RLS:** 16
- **Tabelas com JSONB:** 5 (processos, orcamentos_recibos, gado, investimentos, followups)
- **Tabelas com Relacionamentos:** 10+

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Todas as tabelas criadas
- [x] Todos os índices criados
- [x] Todos os triggers criados
- [x] RLS habilitado em todas as tabelas
- [x] Políticas RLS criadas (desenvolvimento)
- [ ] Campos adicionais em `transacoes` (status, contrato_locacao_id)
- [ ] Campos adicionais em `fretes` (caminhao_id, motorista_id)
- [ ] Políticas RLS de produção (baseadas em auth.uid())

---

## 🔧 MANUTENÇÃO

### Backup Recomendado:

- Backup diário de todas as tabelas
- Backup antes de alterações estruturais

### Monitoramento:

- Verificar índices não utilizados
- Analisar performance de queries
- Monitorar crescimento de tabelas JSONB

---

**Última atualização:** 2025-01-12
**Versão do Schema:** 1.0.0

