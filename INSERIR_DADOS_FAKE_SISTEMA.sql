-- =====================================================
-- SCRIPT PARA INSERIR DADOS FAKE NO SISTEMA
-- Sistema Gerenciador Empresarial - Vanderlei
-- =====================================================
-- 
-- Este script insere 5 registros fake para cada tabela
-- do sistema, respeitando os relacionamentos (foreign keys).
--
-- ORDEM DE EXECUÇÃO:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Verifique se os dados foram inseridos
-- 3. Teste o sistema com os dados fake
-- =====================================================

-- =====================================================
-- LIMPAR DADOS EXISTENTES (OPCIONAL)
-- =====================================================
-- Descomente as linhas abaixo se quiser limpar os dados existentes antes de inserir os novos
-- DELETE FROM followups;
-- DELETE FROM anotacoes;
-- DELETE FROM investimentos;
-- DELETE FROM financiamentos;
-- DELETE FROM fretes;
-- DELETE FROM motoristas;
-- DELETE FROM caminhoes;
-- DELETE FROM gado;
-- DELETE FROM transacoes;
-- DELETE FROM contratos_locacao;
-- DELETE FROM imoveis;
-- DELETE FROM orcamentos_recibos;
-- DELETE FROM processos;
-- DELETE FROM leads;
-- DELETE FROM tarefas;
-- DELETE FROM clientes;

-- =====================================================
-- TABELA 1: CLIENTES (5 registros)
-- =====================================================
INSERT INTO clientes (nome, tipo, cpf_cnpj, telefone, email, cep, endereco, numero, complemento, cidade, estado, status) VALUES
('João Silva', 'pf', '123.456.789-00', '(11) 98765-4321', 'joao.silva@email.com', '01310-100', 'Avenida Paulista', '1000', 'Apto 101', 'São Paulo', 'SP', 'ativo'),
('Maria Santos', 'pf', '987.654.321-00', '(21) 97654-3210', 'maria.santos@email.com', '20040-020', 'Rua do Ouvidor', '50', 'Sala 205', 'Rio de Janeiro', 'RJ', 'ativo'),
('Empresa ABC Ltda', 'pj', '12.345.678/0001-90', '(11) 3456-7890', 'contato@empresaabc.com.br', '04547-130', 'Avenida Engenheiro Luís Carlos Berrini', '1200', '8º andar', 'São Paulo', 'SP', 'ativo'),
('Carlos Oliveira', 'pf', '111.222.333-44', '(31) 98888-7777', 'carlos.oliveira@email.com', '30130-010', 'Rua da Bahia', '1200', 'Loja 5', 'Belo Horizonte', 'MG', 'ativo'),
('Ana Costa', 'pf', '555.666.777-88', '(41) 99999-8888', 'ana.costa@email.com', '80020-300', 'Rua XV de Novembro', '500', 'Casa', 'Curitiba', 'PR', 'ativo');

-- =====================================================
-- TABELA 2: TAREFAS (5 registros)
-- =====================================================
INSERT INTO tarefas (titulo, descricao, data_vencimento, prioridade, status, responsavel, observacoes) VALUES
('Reunião com cliente João Silva', 'Discutir proposta de serviço jurídico', CURRENT_DATE + INTERVAL '3 days', 'alta', 'pendente', 'Vanderlei', 'Cliente interessado em processo trabalhista'),
('Enviar documentos para Maria Santos', 'Enviar contrato de locação assinado', CURRENT_DATE + INTERVAL '1 day', 'media', 'em_andamento', 'Assistente', 'Aguardar assinatura do locador'),
('Revisar orçamento Empresa ABC', 'Revisar proposta comercial', CURRENT_DATE + INTERVAL '5 days', 'media', 'pendente', 'Vanderlei', 'Cliente solicitou desconto'),
('Acompanhar processo do cliente Carlos', 'Verificar andamento processual', CURRENT_DATE + INTERVAL '7 days', 'baixa', 'pendente', 'Advogado', 'Processo em fase de audiência'),
('Atualizar cadastro de Ana Costa', 'Atualizar dados cadastrais do cliente', CURRENT_DATE + INTERVAL '2 days', 'baixa', 'pendente', 'Assistente', 'Cliente mudou de endereço');

-- =====================================================
-- TABELA 3: LEADS (5 registros)
-- =====================================================
INSERT INTO leads (nome, contato, origem, status, descricao, data_inicio, data_fim, valor_contrato, tarefa, observacoes) VALUES
('Pedro Almeida', '(11) 91234-5678', 'site', 'novo', 'Cliente interessado em consultoria jurídica empresarial', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '30 days', 15000.00, 'Entrar em contato para agendar reunião', 'Lead qualificado pelo site'),
('Fernanda Lima', '(21) 92345-6789', 'indicacao', 'contatado', 'Possível locadora de imóvel comercial', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '60 days', 8000.00, 'Enviar portfólio de imóveis disponíveis', 'Indicação de cliente existente'),
('Roberto Souza', '(31) 93456-7890', 'rede_social', 'interessado', 'Empresário interessado em gestão de processos', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '45 days', 25000.00, 'Agendar apresentação do sistema', 'Lead ativo nas redes sociais'),
('Juliana Ferreira', '(41) 94567-8901', 'telefone', 'convertido', 'Cliente convertido para processo trabalhista', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '90 days', 12000.00, 'Iniciar processo jurídico', 'Lead convertido com sucesso'),
('Lucas Martins', '(51) 95678-9012', 'evento', 'perdido', 'Lead que não se interessou pelo serviço', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '20 days', 0.00, 'Arquivar lead', 'Cliente desistiu do serviço');

-- =====================================================
-- TABELA 4: PROCESSOS (5 registros)
-- =====================================================
-- Primeiro, vamos obter os IDs dos clientes criados
DO $$
DECLARE
    cliente1_id UUID;
    cliente2_id UUID;
    cliente3_id UUID;
    cliente4_id UUID;
    cliente5_id UUID;
BEGIN
    -- Obter IDs dos clientes
    SELECT id INTO cliente1_id FROM clientes WHERE nome = 'João Silva' LIMIT 1;
    SELECT id INTO cliente2_id FROM clientes WHERE nome = 'Maria Santos' LIMIT 1;
    SELECT id INTO cliente3_id FROM clientes WHERE nome = 'Empresa ABC Ltda' LIMIT 1;
    SELECT id INTO cliente4_id FROM clientes WHERE nome = 'Carlos Oliveira' LIMIT 1;
    SELECT id INTO cliente5_id FROM clientes WHERE nome = 'Ana Costa' LIMIT 1;

    -- Inserir processos
    INSERT INTO processos (numero_processo, tipo, tipo_acao_area, tipo_acao, cliente_id, status, status_categoria, status_detalhado, data_inicial, data_conclusao, responsavel, valor_causa, resultado_causa, andamento_atual, observacoes, comarca, tribunal, fase_processual) VALUES
    ('0000123-45.2024.8.26.0100', 'trabalhista', 'Trabalhista', 'Rescisão Indireta', cliente1_id, 'em_andamento', 'Em Andamento', 'Aguardando Audiência', CURRENT_DATE - INTERVAL '30 days', NULL, 'Vanderlei', 50000.00, NULL, 'Processo em fase de instrução', 'Processo trabalhista com pedido de rescisão indireta', 'São Paulo', 'TRT-2', 'Instrução'),
    ('0000456-78.2024.8.26.0200', 'civil', 'Civil', 'Locação', cliente2_id, 'em_andamento', 'Em Andamento', 'Aguardando Sentença', CURRENT_DATE - INTERVAL '60 days', NULL, 'Advogado', 35000.00, NULL, 'Processo aguardando sentença do juiz', 'Processo de locação com questões de contrato', 'Rio de Janeiro', 'TJ-RJ', 'Aguardando Sentença'),
    ('0000789-01.2024.8.26.0300', 'trabalhista', 'Trabalhista', 'Adicional de Insalubridade', cliente3_id, 'concluido', 'Concluído', 'Sentença Favorável', CURRENT_DATE - INTERVAL '120 days', CURRENT_DATE - INTERVAL '10 days', 'Vanderlei', 75000.00, 'ganha', 'Processo concluído com sentença favorável', 'Processo trabalhista ganho pelo cliente', 'São Paulo', 'TRT-2', 'Concluído'),
    ('0000321-54.2024.8.26.0400', 'civil', 'Civil', 'Cobrança', cliente4_id, 'em_andamento', 'Em Andamento', 'Em Fase de Execução', CURRENT_DATE - INTERVAL '90 days', NULL, 'Advogado', 25000.00, NULL, 'Processo em fase de execução', 'Processo de cobrança em andamento', 'Belo Horizonte', 'TJ-MG', 'Execução'),
    ('0000654-87.2024.8.26.0500', 'trabalhista', 'Trabalhista', 'Horas Extras', cliente5_id, 'arquivado', 'Arquivado', 'Arquivado por Acordo', CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE - INTERVAL '30 days', 'Vanderlei', 40000.00, 'acordo', 'Processo arquivado após acordo', 'Processo arquivado após acordo entre as partes', 'Curitiba', 'TRT-9', 'Arquivado');
END $$;

-- =====================================================
-- TABELA 5: ORÇAMENTOS E RECIBOS (5 registros)
-- =====================================================
DO $$
DECLARE
    cliente1_id UUID;
    cliente2_id UUID;
    processo1_id UUID;
    processo2_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO cliente1_id FROM clientes WHERE nome = 'João Silva' LIMIT 1;
    SELECT id INTO cliente2_id FROM clientes WHERE nome = 'Maria Santos' LIMIT 1;
    SELECT id INTO processo1_id FROM processos WHERE numero_processo = '0000123-45.2024.8.26.0100' LIMIT 1;
    SELECT id INTO processo2_id FROM processos WHERE numero_processo = '0000456-78.2024.8.26.0200' LIMIT 1;

    -- Inserir orçamentos e recibos
    INSERT INTO orcamentos_recibos (numero, tipo, cliente_id, processo_id, itens, valor_total, data_emissao, data_vencimento, observacoes, status) VALUES
    ('ORC-001/2024', 'orcamento', cliente1_id, processo1_id, '[{"descricao": "Consultoria jurídica", "quantidade": 10, "valor_unitario": 500.00, "valor_total": 5000.00}, {"descricao": "Elaboração de petição", "quantidade": 5, "valor_unitario": 800.00, "valor_total": 4000.00}]', 9000.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '15 days', 'Orçamento para processo trabalhista', 'pendente'),
    ('REC-001/2024', 'recibo', cliente2_id, processo2_id, '[{"descricao": "Serviços advocatícios", "quantidade": 1, "valor_unitario": 3500.00, "valor_total": 3500.00}]', 3500.00, CURRENT_DATE - INTERVAL '10 days', NULL, 'Recibo de pagamento de serviços', 'aprovado'),
    ('ORC-002/2024', 'orcamento', cliente1_id, NULL, '[{"descricao": "Consultoria empresarial", "quantidade": 20, "valor_unitario": 300.00, "valor_total": 6000.00}]', 6000.00, CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '20 days', 'Orçamento para consultoria', 'aprovado'),
    ('REC-002/2024', 'recibo', cliente2_id, NULL, '[{"descricao": "Assessoria jurídica", "quantidade": 1, "valor_unitario": 2000.00, "valor_total": 2000.00}]', 2000.00, CURRENT_DATE - INTERVAL '7 days', NULL, 'Recibo de pagamento', 'aprovado'),
    ('ORC-003/2024', 'orcamento', cliente1_id, NULL, '[{"descricao": "Elaboração de contrato", "quantidade": 1, "valor_unitario": 1500.00, "valor_total": 1500.00}]', 1500.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'Orçamento para elaboração de contrato', 'pendente');
END $$;

-- =====================================================
-- TABELA 6: IMÓVEIS (5 registros)
-- =====================================================
DO $$
DECLARE
    cliente1_id UUID;
    cliente2_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO cliente1_id FROM clientes WHERE nome = 'João Silva' LIMIT 1;
    SELECT id INTO cliente2_id FROM clientes WHERE nome = 'Maria Santos' LIMIT 1;

    -- Inserir imóveis
    INSERT INTO imoveis (endereco, cep, numero, complemento, cidade, estado, matricula, proprietario, valor, status, documento_pago, data_pagamento, inquilino_id, valor_aluguel, data_inicio_aluguel, data_fim_aluguel, conta_agua, conta_energia, tornar_receita, vigencia_inicio, vigencia_fim, reajuste_locacao_percentual, reajuste_locacao_valor_inicial, reajuste_locacao_valor_final, inscricao_municipal, valor_venal, documentacao_status, contas_aberto_inquilino) VALUES
    ('Rua das Flores', '01310-100', '123', 'Apto 201', 'São Paulo', 'SP', '12345-6', 'João Silva', 500000.00, 'alugado', true, CURRENT_DATE - INTERVAL '5 days', cliente1_id, 3500.00, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '275 days', 'inquilino', 'inquilino', true, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '275 days', 5.50, 3500.00, 3692.50, 'IM-123456', 450000.00, 'ok', 0.00),
    ('Avenida Atlântica', '20040-020', '456', 'Cobertura', 'Rio de Janeiro', 'RJ', '23456-7', 'Maria Santos', 800000.00, 'disponivel', true, CURRENT_DATE - INTERVAL '10 days', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 'IM-234567', 750000.00, 'ok', 0.00),
    ('Rua da Paz', '30130-010', '789', 'Casa', 'Belo Horizonte', 'MG', '34567-8', 'Carlos Oliveira', 350000.00, 'alugado', false, NULL, cliente2_id, 2500.00, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days', 'proprietario', 'proprietario', true, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days', 4.80, 2500.00, 2620.00, 'IM-345678', 320000.00, 'pendente', 500.00),
    ('Avenida Sete de Setembro', '80020-300', '321', 'Sala Comercial', 'Curitiba', 'PR', '45678-9', 'Ana Costa', 600000.00, 'disponivel', true, CURRENT_DATE - INTERVAL '15 days', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 'IM-456789', 550000.00, 'ok', 0.00),
    ('Rua do Comércio', '01310-100', '654', 'Loja', 'São Paulo', 'SP', '56789-0', 'Empresa ABC Ltda', 1200000.00, 'vendido', true, CURRENT_DATE - INTERVAL '20 days', NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, 'IM-567890', 1100000.00, 'ok', 0.00);
END $$;

-- =====================================================
-- TABELA 7: CONTRATOS DE LOCAÇÃO (5 registros)
-- =====================================================
DO $$
DECLARE
    imovel1_id UUID;
    imovel3_id UUID;
    cliente1_id UUID;
    cliente2_id UUID;
    cliente3_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO imovel1_id FROM imoveis WHERE endereco = 'Rua das Flores' LIMIT 1;
    SELECT id INTO imovel3_id FROM imoveis WHERE endereco = 'Rua da Paz' LIMIT 1;
    SELECT id INTO cliente1_id FROM clientes WHERE nome = 'João Silva' LIMIT 1;
    SELECT id INTO cliente2_id FROM clientes WHERE nome = 'Maria Santos' LIMIT 1;
    SELECT id INTO cliente3_id FROM clientes WHERE nome = 'Empresa ABC Ltda' LIMIT 1;

    -- Inserir contratos de locação
    INSERT INTO contratos_locacao (imovel_id, locatario_id, valor_aluguel, data_inicio, data_fim, deposito_caucao, reajuste_indice, dia_vencimento, conta_agua, conta_energia, tornar_receita, gerar_previsao, observacoes, status) VALUES
    (imovel1_id, cliente1_id, 3500.00, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '275 days', 7000.00, 'IGP-M', 5, 'inquilino', 'inquilino', true, true, 'Contrato de locação residencial', 'ativo'),
    (imovel3_id, cliente2_id, 2500.00, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days', 5000.00, 'IPCA', 10, 'proprietario', 'proprietario', true, false, 'Contrato de locação residencial', 'ativo'),
    (imovel1_id, cliente3_id, 4000.00, CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '395 days', 8000.00, 'IGP-M', 5, 'inquilino', 'inquilino', true, true, 'Novo contrato a ser iniciado', 'ativo'),
    (imovel3_id, cliente1_id, 2800.00, CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE + INTERVAL '425 days', 5600.00, 'IPCA', 15, 'proprietario', 'proprietario', true, false, 'Contrato futuro', 'ativo'),
    (imovel1_id, cliente2_id, 3200.00, CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE - INTERVAL '90 days', 6400.00, 'IGP-M', 5, 'inquilino', 'inquilino', false, false, 'Contrato encerrado', 'encerrado');
END $$;

-- =====================================================
-- TABELA 8: TRANSAÇÕES (ENTRADA/SAÍDA) - 5 de cada tipo
-- =====================================================
DO $$
DECLARE
    contrato1_id UUID;
    contrato2_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO contrato1_id FROM contratos_locacao WHERE valor_aluguel = 3500.00 LIMIT 1;
    SELECT id INTO contrato2_id FROM contratos_locacao WHERE valor_aluguel = 2500.00 LIMIT 1;

    -- Inserir transações de ENTRADA
    INSERT INTO transacoes (tipo, descricao, categoria, valor, data, area, observacoes, status, contrato_locacao_id) VALUES
    ('entrada', 'Aluguel Recebido - Rua das Flores', 'Locação', 3500.00, CURRENT_DATE - INTERVAL '5 days', 'Imóveis', 'Aluguel mensal recebido', 'realizado', contrato1_id),
    ('entrada', 'Aluguel Recebido - Rua da Paz', 'Locação', 2500.00, CURRENT_DATE - INTERVAL '3 days', 'Imóveis', 'Aluguel mensal recebido', 'realizado', contrato2_id),
    ('entrada', 'Honorários Advocatícios', 'Serviços', 5000.00, CURRENT_DATE - INTERVAL '10 days', 'Escritório', 'Pagamento de honorários', 'realizado', NULL),
    ('entrada', 'Consultoria Jurídica', 'Serviços', 3000.00, CURRENT_DATE - INTERVAL '7 days', 'Escritório', 'Pagamento de consultoria', 'realizado', NULL),
    ('entrada', 'Recebimento de Processo', 'Serviços', 7500.00, CURRENT_DATE - INTERVAL '15 days', 'Escritório', 'Recebimento de processo ganho', 'realizado', NULL);

    -- Inserir transações de SAÍDA
    INSERT INTO transacoes (tipo, descricao, categoria, valor, data, area, observacoes, status, contrato_locacao_id) VALUES
    ('saida', 'Pagamento de Conta de Luz', 'Utilidades', 350.00, CURRENT_DATE - INTERVAL '2 days', 'Imóveis', 'Conta de luz do imóvel', 'realizado', NULL),
    ('saida', 'Pagamento de IPTU', 'Impostos', 1200.00, CURRENT_DATE - INTERVAL '8 days', 'Imóveis', 'IPTU do imóvel', 'realizado', NULL),
    ('saida', 'Manutenção Predial', 'Manutenção', 800.00, CURRENT_DATE - INTERVAL '12 days', 'Imóveis', 'Manutenção do prédio', 'realizado', NULL),
    ('saida', 'Salário Funcionários', 'Folha de Pagamento', 15000.00, CURRENT_DATE - INTERVAL '1 day', 'Escritório', 'Pagamento de salários', 'realizado', NULL),
    ('saida', 'Material de Escritório', 'Despesas', 500.00, CURRENT_DATE - INTERVAL '5 days', 'Escritório', 'Compra de material', 'realizado', NULL);
END $$;

-- =====================================================
-- TABELA 9: GADO (5 registros)
-- =====================================================
INSERT INTO gado (identificacao, brinco, lote, categoria, status, data_nascimento, raca, origem, idade_meses, peso_atual, localizacao, observacoes, historico_peso, historico_saude, eventos) VALUES
('BOV-001', 'BR-001', 'Lote A', 'Boi', 'ativo', CURRENT_DATE - INTERVAL '730 days', 'Nelore', 'cria', 24, 450.00, 'Pasto 1', 'Animal saudável, bom ganho de peso', '[{"data": "2024-01-01", "peso": 400.00}, {"data": "2024-06-01", "peso": 425.00}]', '[{"data": "2024-01-15", "tipo": "vacinação", "observacao": "Vacinação anual"}]', '[{"data": "2024-01-01", "evento": "Nascimento", "observacao": "Nascido no rebanho"}]'),
('BOV-002', 'BR-002', 'Lote A', 'Vaca', 'ativo', CURRENT_DATE - INTERVAL '1095 days', 'Angus', 'compra', 36, 380.00, 'Pasto 1', 'Vaca reprodutora, em lactação', '[{"data": "2024-01-01", "peso": 370.00}, {"data": "2024-06-01", "peso": 375.00}]', '[{"data": "2024-02-01", "tipo": "exame", "observacao": "Exame de prenhez positivo"}]', '[{"data": "2023-06-01", "evento": "Compra", "observacao": "Comprada de fornecedor"}]'),
('BOV-003', 'BR-003', 'Lote B', 'Novilho', 'ativo', CURRENT_DATE - INTERVAL '365 days', 'Brahman', 'cria', 12, 280.00, 'Pasto 2', 'Novilho em crescimento', '[{"data": "2024-01-01", "peso": 200.00}, {"data": "2024-06-01", "peso": 250.00}]', '[{"data": "2024-03-01", "tipo": "vermifugação", "observacao": "Vermifugação realizada"}]', '[{"data": "2023-01-15", "evento": "Nascimento", "observacao": "Nascido no rebanho"}]'),
('BOV-004', 'BR-004', 'Lote B', 'Boi', 'vendido', CURRENT_DATE - INTERVAL '1095 days', 'Nelore', 'cria', 36, 520.00, 'Pasto 2', 'Animal vendido para abate', '[{"data": "2024-01-01", "peso": 480.00}, {"data": "2024-05-01", "peso": 500.00}]', '[]', '[{"data": "2024-08-01", "evento": "Venda", "observacao": "Vendido para frigorífico"}]'),
('BOV-005', 'BR-005', 'Lote A', 'Bezerro', 'ativo', CURRENT_DATE - INTERVAL '180 days', 'Angus', 'cria', 6, 150.00, 'Pasto 1', 'Bezerro em amamentação', '[{"data": "2024-07-01", "peso": 80.00}, {"data": "2024-10-01", "peso": 120.00}]', '[{"data": "2024-07-15", "tipo": "vacinação", "observacao": "Primeira vacinação"}]', '[{"data": "2024-07-01", "evento": "Nascimento", "observacao": "Nascido no rebanho"}]');

-- =====================================================
-- TABELA 10: CAMINHÕES (5 registros)
-- =====================================================
INSERT INTO caminhoes (placa, modelo, ano, quilometragem, status, data_ultima_revisao) VALUES
('ABC-1234', 'Volvo FH 540', 2020, 150000, 'ativo', CURRENT_DATE - INTERVAL '30 days'),
('DEF-5678', 'Mercedes-Benz Actros', 2021, 120000, 'ativo', CURRENT_DATE - INTERVAL '15 days'),
('GHI-9012', 'Scania R 500', 2019, 180000, 'manutencao', CURRENT_DATE - INTERVAL '5 days'),
('JKL-3456', 'Iveco Stralis', 2022, 80000, 'ativo', CURRENT_DATE - INTERVAL '45 days'),
('MNO-7890', 'Ford Cargo', 2018, 220000, 'inativo', CURRENT_DATE - INTERVAL '90 days');

-- =====================================================
-- TABELA 11: MOTORISTAS (5 registros)
-- =====================================================
DO $$
DECLARE
    caminhao1_id UUID;
    caminhao2_id UUID;
    caminhao3_id UUID;
    caminhao4_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO caminhao1_id FROM caminhoes WHERE placa = 'ABC-1234' LIMIT 1;
    SELECT id INTO caminhao2_id FROM caminhoes WHERE placa = 'DEF-5678' LIMIT 1;
    SELECT id INTO caminhao3_id FROM caminhoes WHERE placa = 'GHI-9012' LIMIT 1;
    SELECT id INTO caminhao4_id FROM caminhoes WHERE placa = 'JKL-3456' LIMIT 1;

    -- Inserir motoristas
    INSERT INTO motoristas (nome, cnh, validade_cnh, telefone, caminhao_id) VALUES
    ('Roberto Silva', '12345678901', CURRENT_DATE + INTERVAL '365 days', '(11) 98765-4321', caminhao1_id),
    ('Paulo Santos', '98765432109', CURRENT_DATE + INTERVAL '180 days', '(21) 97654-3210', caminhao2_id),
    ('Marcos Oliveira', '11122233344', CURRENT_DATE + INTERVAL '90 days', '(31) 96543-2109', caminhao3_id),
    ('Fernando Costa', '55566677788', CURRENT_DATE + INTERVAL '270 days', '(41) 95432-1098', caminhao4_id),
    ('Ricardo Lima', '99988877766', CURRENT_DATE + INTERVAL '120 days', '(51) 94321-0987', NULL);
END $$;

-- =====================================================
-- TABELA 12: FRETES (5 registros)
-- =====================================================
DO $$
DECLARE
    caminhao1_id UUID;
    caminhao2_id UUID;
    caminhao4_id UUID;
    motorista1_id UUID;
    motorista2_id UUID;
    motorista4_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO caminhao1_id FROM caminhoes WHERE placa = 'ABC-1234' LIMIT 1;
    SELECT id INTO caminhao2_id FROM caminhoes WHERE placa = 'DEF-5678' LIMIT 1;
    SELECT id INTO caminhao4_id FROM caminhoes WHERE placa = 'JKL-3456' LIMIT 1;
    SELECT id INTO motorista1_id FROM motoristas WHERE nome = 'Roberto Silva' LIMIT 1;
    SELECT id INTO motorista2_id FROM motoristas WHERE nome = 'Paulo Santos' LIMIT 1;
    SELECT id INTO motorista4_id FROM motoristas WHERE nome = 'Fernando Costa' LIMIT 1;

    -- Inserir fretes
    INSERT INTO fretes (cliente, caminhao_id, motorista_id, origem, destino, valor_frete, despesas, data, observacoes) VALUES
    ('Transportadora XYZ', caminhao1_id, motorista1_id, 'São Paulo - SP', 'Rio de Janeiro - RJ', 5000.00, 800.00, CURRENT_DATE - INTERVAL '5 days', 'Frete de carga geral'),
    ('Empresa ABC Ltda', caminhao2_id, motorista2_id, 'Belo Horizonte - MG', 'Curitiba - PR', 6500.00, 1200.00, CURRENT_DATE - INTERVAL '3 days', 'Frete de máquinas'),
    ('Comércio DEF', caminhao1_id, motorista1_id, 'São Paulo - SP', 'Brasília - DF', 7500.00, 1500.00, CURRENT_DATE - INTERVAL '7 days', 'Frete de produtos'),
    ('Indústria GHI', caminhao4_id, motorista4_id, 'Porto Alegre - RS', 'Florianópolis - SC', 4000.00, 600.00, CURRENT_DATE - INTERVAL '10 days', 'Frete de materiais'),
    ('Distribuidora JKL', caminhao2_id, motorista2_id, 'Campinas - SP', 'São Paulo - SP', 2500.00, 400.00, CURRENT_DATE - INTERVAL '1 day', 'Frete urbano');
END $$;

-- =====================================================
-- TABELA 13: FINANCIAMENTOS (5 registros)
-- =====================================================
INSERT INTO financiamentos (banco, tipo, valor_total, taxa_juros, sistema_amortizacao, numero_parcelas, valor_parcela, iof, seguro, cet, data_inicio, data_termino, status, documento_url) VALUES
('Banco do Brasil', 'financiamento', 200000.00, 12.50, 'SAC', 120, 2500.00, 1500.00, 3000.00, 13.20, CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE + INTERVAL '4380 days', 'ativo', NULL),
('Bradesco', 'emprestimo', 50000.00, 15.00, 'PRICE', 36, 1800.00, 800.00, 1200.00, 16.50, CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '900 days', 'ativo', NULL),
('Itaú', 'financiamento', 150000.00, 11.00, 'SAC', 60, 3200.00, 1000.00, 2500.00, 12.30, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '1740 days', 'ativo', NULL),
('Santander', 'emprestimo', 30000.00, 18.00, 'PRICE', 24, 1600.00, 500.00, 800.00, 19.50, CURRENT_DATE - INTERVAL '720 days', CURRENT_DATE - INTERVAL '120 days', 'quitado', NULL),
('Caixa Econômica', 'financiamento', 300000.00, 10.50, 'SAC', 180, 2800.00, 2000.00, 4000.00, 11.80, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '6570 days', 'ativo', NULL);

-- =====================================================
-- TABELA 14: INVESTIMENTOS (5 registros)
-- =====================================================
INSERT INTO investimentos (tipo, instituicao, valor_aplicado, rentabilidade, prazo_dias, data_aplicacao, data_vencimento, status, vincular_fluxo_caixa, observacoes, historico_rendimento) VALUES
('CDB', 'Banco do Brasil', 100000.00, 12.50, 365, CURRENT_DATE - INTERVAL '180 days', CURRENT_DATE + INTERVAL '185 days', 'ativo', true, 'CDB pós-fixado', '[{"data": "2024-01-01", "rendimento": 1000.00}, {"data": "2024-06-01", "rendimento": 3000.00}]'),
('LCI', 'Bradesco', 50000.00, 11.00, 180, CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE + INTERVAL '90 days', 'ativo', true, 'LCI isenta de IR', '[{"data": "2024-04-01", "rendimento": 500.00}]'),
('Tesouro Direto', 'Tesouro Nacional', 200000.00, 10.50, 730, CURRENT_DATE - INTERVAL '365 days', CURRENT_DATE + INTERVAL '365 days', 'ativo', false, 'Tesouro IPCA+', '[{"data": "2024-01-01", "rendimento": 2000.00}, {"data": "2024-06-01", "rendimento": 6000.00}]'),
('Fundo de Investimento', 'XP Investimentos', 75000.00, 13.00, 0, CURRENT_DATE - INTERVAL '120 days', NULL, 'ativo', true, 'Fundo multimercado', '[{"data": "2024-02-01", "rendimento": 800.00}, {"data": "2024-07-01", "rendimento": 2500.00}]'),
('Poupança', 'Caixa Econômica', 30000.00, 6.50, 0, CURRENT_DATE - INTERVAL '60 days', NULL, 'resgatado', false, 'Poupança resgatada', '[{"data": "2024-05-01", "rendimento": 150.00}]');

-- =====================================================
-- TABELA 15: ANOTAÇÕES (5 registros)
-- =====================================================
INSERT INTO anotacoes (titulo, categoria, conteudo, data) VALUES
('Reunião com Cliente João Silva', 'Cliente', 'Reunião realizada para discutir processo trabalhista. Cliente interessado em prosseguir com a ação.', CURRENT_DATE - INTERVAL '5 days'),
('Lembrete: Renovação de Contrato', 'Imóveis', 'Contrato de locação do imóvel na Rua das Flores vence em 275 dias. Verificar interesse do locatário em renovar.', CURRENT_DATE - INTERVAL '3 days'),
('Anotação sobre Processo', 'Processo', 'Processo 0000123-45.2024.8.26.0100 em fase de instrução. Aguardando audiência marcada para próxima semana.', CURRENT_DATE - INTERVAL '7 days'),
('Financeiro: Recebimentos do Mês', 'Financeiro', 'Total de recebimentos do mês: R$ 21.500,00. Total de despesas: R$ 17.850,00. Saldo positivo: R$ 3.650,00.', CURRENT_DATE - INTERVAL '1 day'),
('Gestão de Gado: Vacinação', 'Gado', 'Realizar vacinação anual do rebanho no próximo mês. Verificar estoque de vacinas e agendar veterinário.', CURRENT_DATE - INTERVAL '2 days');

-- =====================================================
-- TABELA 16: FOLLOW-UPS (5 registros)
-- =====================================================
DO $$
DECLARE
    cliente1_id UUID;
    cliente2_id UUID;
    cliente3_id UUID;
    tarefa1_id UUID;
    tarefa2_id UUID;
BEGIN
    -- Obter IDs
    SELECT id INTO cliente1_id FROM clientes WHERE nome = 'João Silva' LIMIT 1;
    SELECT id INTO cliente2_id FROM clientes WHERE nome = 'Maria Santos' LIMIT 1;
    SELECT id INTO cliente3_id FROM clientes WHERE nome = 'Empresa ABC Ltda' LIMIT 1;
    SELECT id INTO tarefa1_id FROM tarefas WHERE titulo = 'Reunião com cliente João Silva' LIMIT 1;
    SELECT id INTO tarefa2_id FROM tarefas WHERE titulo = 'Enviar documentos para Maria Santos' LIMIT 1;

    -- Inserir follow-ups
    INSERT INTO followups (cliente_id, mensagem, responsavel, data_hora, lembrete_data, lembrete_texto, transformar_tarefa, tarefa_id, status, anexos) VALUES
    (cliente1_id, 'Cliente confirmou interesse em prosseguir com processo trabalhista. Agendar reunião para próxima semana.', 'Vanderlei', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '3 days', 'Lembrar de agendar reunião com cliente', true, tarefa1_id, 'pendente', '[]'),
    (cliente2_id, 'Documentos enviados para cliente. Aguardar retorno com assinatura.', 'Assistente', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '2 days', 'Verificar se cliente recebeu documentos', false, tarefa2_id, 'aguardando_cliente', '[]'),
    (cliente3_id, 'Cliente solicitou desconto no orçamento. Verificar possibilidade de negociação.', 'Vanderlei', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 'Retornar com proposta de desconto', false, NULL, 'pendente', '[]'),
    (cliente1_id, 'Processo em andamento. Cliente satisfeito com o atendimento.', 'Advogado', CURRENT_DATE - INTERVAL '10 days', NULL, NULL, false, NULL, 'concluido', '[]'),
    (cliente2_id, 'Cliente mudou de endereço. Atualizar cadastro no sistema.', 'Assistente', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', 'Atualizar endereço do cliente', false, NULL, 'pendente', '[]');
END $$;

-- =====================================================
-- RESUMO FINAL
-- =====================================================
-- 
-- ✅ 5 Clientes inseridos
-- ✅ 5 Tarefas inseridas
-- ✅ 5 Leads inseridos
-- ✅ 5 Processos inseridos
-- ✅ 5 Orçamentos/Recibos inseridos
-- ✅ 5 Imóveis inseridos
-- ✅ 5 Contratos de Locação inseridos
-- ✅ 10 Transações inseridas (5 entradas + 5 saídas)
-- ✅ 5 Gado inseridos
-- ✅ 5 Caminhões inseridos
-- ✅ 5 Motoristas inseridos
-- ✅ 5 Fretes inseridos
-- ✅ 5 Financiamentos inseridos
-- ✅ 5 Investimentos inseridos
-- ✅ 5 Anotações inseridas
-- ✅ 5 Follow-ups inseridos
-- 
-- PRÓXIMOS PASSOS:
-- 1. Verifique se os dados foram inseridos corretamente
-- 2. Teste o sistema com os dados fake
-- 3. Verifique os relacionamentos entre as tabelas
-- =====================================================

