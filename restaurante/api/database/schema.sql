-- Placeholder: O usuário forneceu o schema SQL completo.
-- Este arquivo deve conter o schema.sql que o usuário enviou anteriormente.
-- Por favor, copie o conteúdo do schema SQL fornecido para este arquivo.-- ============================================
-- SCHEMA SQL PARA SISTEMA DE RESTAURANTE
-- MySQL 8.0+ - ADAPTADO PARA ANGOLA
-- ============================================

-- Configurações iniciais
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- Criar database
CREATE DATABASE IF NOT EXISTS restaurante_angola_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurante_angola_db;

-- ============================================
-- TABELAS DE USUÁRIOS E AUTENTICAÇÃO
-- ============================================

-- Tabela de usuários
CREATE TABLE usuarios (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefone VARCHAR(20) NOT NULL COMMENT 'Formato: +244 9XX XXX XXX',
    telefone_alternativo VARCHAR(20),
    senha_hash TEXT NOT NULL,
    
    -- Documentação angolana
    bi VARCHAR(14) UNIQUE COMMENT 'Bilhete de Identidade',
    nif VARCHAR(10) COMMENT 'Número de Identificação Fiscal',
    
    role ENUM('cliente', 'administrador', 'garcom', 'cozinha', 'entregador', 'gerente') NOT NULL DEFAULT 'cliente',
    status ENUM('ativo', 'inativo', 'bloqueado') NOT NULL DEFAULT 'ativo',
    
    foto_perfil TEXT,
    data_nascimento DATE,
    genero ENUM('masculino', 'feminino', 'outro'),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_telefone (telefone),
    INDEX idx_bi (bi),
    INDEX idx_role (role),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Endereços dos clientes (adaptado para Angola)
CREATE TABLE enderecos_clientes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    nome_endereco VARCHAR(50) NOT NULL COMMENT 'Ex: Casa, Trabalho',
    
    -- Estrutura de endereço angolana
    provincia ENUM(
        'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 
        'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene',
        'Huambo', 'Huíla', 'Lunda Norte', 'Lunda Sul', 'Malanje',
        'Moxico', 'Namibe', 'Uíge', 'Zaire'
    ) NOT NULL DEFAULT 'Luanda',
    municipio VARCHAR(100) NOT NULL COMMENT 'Ex: Luanda, Viana, Cacuaco',
    bairro VARCHAR(100) NOT NULL COMMENT 'Ex: Talatona, Miramar, Maianga',
    rua VARCHAR(200) NOT NULL,
    numero VARCHAR(20),
    condominio VARCHAR(100),
    apartamento VARCHAR(20),
    ponto_referencia TEXT COMMENT 'Importante em Angola para localização',
    
    coordenadas_gps VARCHAR(100) COMMENT 'Latitude,Longitude',
    
    principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_provincia (provincia),
    INDEX idx_municipio (municipio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GESTÃO DE CARDÁPIO
-- ============================================

-- Categorias do cardápio
CREATE TABLE categorias (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(100) NOT NULL UNIQUE,
    nome_en VARCHAR(100) COMMENT 'Nome em inglês',
    descricao TEXT,
    imagem TEXT,
    ordem_exibicao INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo),
    INDEX idx_ordem (ordem_exibicao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens do cardápio
CREATE TABLE itens_cardapio (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    categoria_id CHAR(36) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    nome_en VARCHAR(150) COMMENT 'Nome em inglês',
    descricao TEXT,
    
    -- Preços em Kwanzas (AOA)
    preco_kz DECIMAL(12, 2) NOT NULL CHECK (preco_kz >= 0) COMMENT 'Preço em Kwanzas',
    preco_promocional_kz DECIMAL(12, 2) CHECK (preco_promocional_kz >= 0),
    
    tempo_preparo INT COMMENT 'em minutos',
    calorias INT,
    
    -- Informações nutricionais importantes
    vegetariano BOOLEAN DEFAULT FALSE,
    vegano BOOLEAN DEFAULT FALSE,
    sem_gluten BOOLEAN DEFAULT FALSE,
    picante BOOLEAN DEFAULT FALSE,
    
    status ENUM('disponivel', 'indisponivel', 'esgotado') DEFAULT 'disponivel',
    destaque BOOLEAN DEFAULT FALSE,
    prato_do_dia BOOLEAN DEFAULT FALSE,
    
    imagem TEXT,
    ordem_exibicao INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT,
    INDEX idx_categoria (categoria_id),
    INDEX idx_status (status),
    INDEX idx_destaque (destaque),
    INDEX idx_prato_dia (prato_do_dia),
    
    CONSTRAINT preco_promocional_check CHECK (
        preco_promocional_kz IS NULL OR preco_promocional_kz < preco_kz
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variações/opções dos itens
CREATE TABLE variacoes_item (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    item_id CHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL COMMENT 'Ex: Tamanho, Acompanhamento',
    tipo VARCHAR(50) NOT NULL COMMENT 'Ex: select, multiple, radio',
    obrigatorio BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES itens_cardapio(id) ON DELETE CASCADE,
    INDEX idx_item (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Opções das variações
CREATE TABLE opcoes_variacao (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    variacao_id CHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL COMMENT 'Ex: Grande, Médio, Pequeno',
    preco_adicional_kz DECIMAL(12, 2) DEFAULT 0.00,
    disponivel BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (variacao_id) REFERENCES variacoes_item(id) ON DELETE CASCADE,
    INDEX idx_variacao (variacao_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SISTEMA DE PEDIDOS
-- ============================================

-- Pedidos
CREATE TABLE pedidos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    numero_pedido INT AUTO_INCREMENT UNIQUE NOT NULL,
    usuario_id CHAR(36),
    tipo ENUM('delivery', 'retirada', 'mesa') NOT NULL,
    status ENUM(
        'carrinho', 
        'pendente', 
        'confirmado', 
        'em_preparo', 
        'pronto', 
        'saiu_entrega',
        'entregue', 
        'cancelado'
    ) DEFAULT 'pendente',
    
    -- Dados de entrega/retirada
    endereco_id CHAR(36),
    taxa_entrega_kz DECIMAL(12, 2) DEFAULT 0.00,
    distancia_km DECIMAL(5, 2) COMMENT 'Distância em KM',
    
    -- Valores em Kwanzas
    subtotal_kz DECIMAL(12, 2) NOT NULL CHECK (subtotal_kz >= 0),
    desconto_kz DECIMAL(12, 2) DEFAULT 0.00 CHECK (desconto_kz >= 0),
    total_kz DECIMAL(12, 2) NOT NULL CHECK (total_kz >= 0),
    
    -- Observações
    observacoes TEXT,
    observacoes_entrega TEXT COMMENT 'Instruções específicas para entrega',
    
    -- Previsões
    tempo_estimado INT COMMENT 'em minutos',
    data_prevista_entrega TIMESTAMP NULL,
    
    -- Relacionamentos
    reserva_id CHAR(36),
    mesa_id CHAR(36),
    cupom_id CHAR(36),
    
    -- Controle
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmado_em TIMESTAMP NULL,
    finalizado_em TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (endereco_id) REFERENCES enderecos_clientes(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status),
    INDEX idx_tipo (tipo),
    INDEX idx_data (created_at DESC),
    INDEX idx_numero (numero_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens do pedido
CREATE TABLE itens_pedido (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pedido_id CHAR(36) NOT NULL,
    item_cardapio_id CHAR(36),
    
    -- Dados do item no momento do pedido
    nome_item VARCHAR(150) NOT NULL,
    preco_unitario_kz DECIMAL(12, 2) NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    subtotal_kz DECIMAL(12, 2) NOT NULL,
    
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (item_cardapio_id) REFERENCES itens_cardapio(id) ON DELETE SET NULL,
    INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Variações selecionadas no pedido
CREATE TABLE variacoes_item_pedido (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    item_pedido_id CHAR(36) NOT NULL,
    nome_variacao VARCHAR(100) NOT NULL,
    nome_opcao VARCHAR(100) NOT NULL,
    preco_adicional_kz DECIMAL(12, 2) DEFAULT 0.00,
    FOREIGN KEY (item_pedido_id) REFERENCES itens_pedido(id) ON DELETE CASCADE,
    INDEX idx_item_pedido (item_pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROCESSAMENTO DE PAGAMENTOS (Angola)
-- ============================================

CREATE TABLE pagamentos (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pedido_id CHAR(36) NOT NULL,
    
    -- Métodos de pagamento comuns em Angola
    metodo ENUM(
        'dinheiro', 
        'multicaixa', 
        'multicaixa_express',
        'transferencia_bancaria',
        'paypal',
        'unitel_money',
        'atlantico_money'
    ) NOT NULL,
    
    status ENUM('pendente', 'processando', 'aprovado', 'recusado', 'estornado', 'cancelado') DEFAULT 'pendente',
    valor_kz DECIMAL(12, 2) NOT NULL CHECK (valor_kz >= 0),
    
    -- Dados adicionais
    troco_para_kz DECIMAL(12, 2),
    referencia_pagamento VARCHAR(100) COMMENT 'Referência Multicaixa, número de transferência, etc',
    banco VARCHAR(100) COMMENT 'Nome do banco para transferências',
    codigo_transacao TEXT,
    comprovativo TEXT COMMENT 'Link ou caminho para comprovativo de pagamento',
    
    dados_gateway JSON,
    
    -- Controle
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processado_em TIMESTAMP NULL,
    confirmado_em TIMESTAMP NULL,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_pedido (pedido_id),
    INDEX idx_status (status),
    INDEX idx_metodo (metodo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- GESTÃO DE RESERVAS DE MESAS
-- ============================================

-- Mesas do restaurante
CREATE TABLE mesas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    numero VARCHAR(10) UNIQUE NOT NULL,
    capacidade INT NOT NULL CHECK (capacidade > 0),
    localizacao VARCHAR(100) COMMENT 'Ex: Área interna, Varanda, VIP, Esplanada',
    tipo ENUM('normal', 'vip', 'familia', 'casal') DEFAULT 'normal',
    ativa BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservas
CREATE TABLE reservas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36),
    mesa_id CHAR(36),
    
    -- Dados da reserva
    nome_cliente VARCHAR(150) NOT NULL,
    telefone_cliente VARCHAR(20) NOT NULL,
    email_cliente VARCHAR(150),
    
    quantidade_pessoas INT NOT NULL CHECK (quantidade_pessoas > 0),
    data_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    
    status ENUM('pendente', 'confirmada', 'em_andamento', 'finalizada', 'cancelada', 'nao_compareceu') DEFAULT 'pendente',
    
    ocasiao_especial ENUM('aniversario', 'casamento', 'negocio', 'familia', 'outro') COMMENT 'Tipo de evento',
    observacoes TEXT,
    
    -- Controle
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmada_em TIMESTAMP NULL,
    check_in_em TIMESTAMP NULL,
    check_out_em TIMESTAMP NULL,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_mesa (mesa_id),
    INDEX idx_data (data_reserva, hora_reserva),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar FKs em pedidos
ALTER TABLE pedidos 
    ADD FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE SET NULL,
    ADD FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE SET NULL;

-- ============================================
-- RASTREAMENTO DE ENTREGAS
-- ============================================

CREATE TABLE entregas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pedido_id CHAR(36) NOT NULL,
    entregador_id CHAR(36),
    
    status ENUM('preparando', 'saiu_entrega', 'em_transito', 'proximo_destino', 'entregue', 'falha_entrega') DEFAULT 'preparando',
    
    -- Informações do entregador
    nome_entregador VARCHAR(150),
    telefone_entregador VARCHAR(20),
    veiculo VARCHAR(50) COMMENT 'Ex: Moto, Carro, Bicicleta',
    placa_veiculo VARCHAR(20),
    
    -- Localização
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    ultima_atualizacao_localizacao TIMESTAMP NULL,
    
    -- Controle
    saiu_em TIMESTAMP NULL,
    entregue_em TIMESTAMP NULL,
    tempo_entrega INT COMMENT 'em minutos',
    
    observacoes TEXT,
    motivo_falha TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (entregador_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_pedido (pedido_id),
    INDEX idx_entregador (entregador_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Histórico de status da entrega
CREATE TABLE historico_entrega (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    entrega_id CHAR(36) NOT NULL,
    status ENUM('preparando', 'saiu_entrega', 'em_transito', 'proximo_destino', 'entregue', 'falha_entrega') NOT NULL,
    observacao TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entrega_id) REFERENCES entregas(id) ON DELETE CASCADE,
    INDEX idx_entrega (entrega_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AVALIAÇÕES E FEEDBACK
-- ============================================

CREATE TABLE avaliacoes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    pedido_id CHAR(36) NOT NULL,
    usuario_id CHAR(36),
    
    -- Notas (1 a 5)
    nota_comida INT CHECK (nota_comida BETWEEN 1 AND 5),
    nota_entrega INT CHECK (nota_entrega BETWEEN 1 AND 5),
    nota_atendimento INT CHECK (nota_atendimento BETWEEN 1 AND 5),
    nota_preco INT CHECK (nota_preco BETWEEN 1 AND 5) COMMENT 'Relação qualidade/preço',
    nota_geral INT NOT NULL CHECK (nota_geral BETWEEN 1 AND 5),
    
    comentario TEXT,
    resposta_restaurante TEXT,
    respondido_em TIMESTAMP NULL,
    respondido_por CHAR(36) COMMENT 'ID do usuário que respondeu',
    
    publicar BOOLEAN DEFAULT TRUE,
    idioma ENUM('pt', 'en') DEFAULT 'pt',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_pedido (pedido_id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_nota (nota_geral),
    INDEX idx_publicar (publicar)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CUPONS E PROMOÇÕES
-- ============================================

CREATE TABLE cupons (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT,
    tipo ENUM('percentual', 'valor_fixo') NOT NULL,
    valor DECIMAL(12, 2) NOT NULL CHECK (valor > 0),
    valor_minimo_pedido_kz DECIMAL(12, 2) DEFAULT 0.00,
    
    quantidade_disponivel INT,
    quantidade_usada INT DEFAULT 0,
    uso_maximo_por_cliente INT DEFAULT 1,
    
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status ENUM('ativo', 'inativo', 'expirado') DEFAULT 'ativo',
    
    -- Restrições
    apenas_primeira_compra BOOLEAN DEFAULT FALSE,
    apenas_delivery BOOLEAN DEFAULT FALSE,
    provincias_validas JSON COMMENT 'Array de províncias onde o cupom é válido',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_codigo (codigo),
    INDEX idx_status (status),
    INDEX idx_datas (data_inicio, data_fim),
    
    CONSTRAINT valor_percentual_check CHECK (
        tipo != 'percentual' OR (valor > 0 AND valor <= 100)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uso de cupons
CREATE TABLE cupons_utilizados (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    cupom_id CHAR(36) NOT NULL,
    pedido_id CHAR(36) NOT NULL,
    usuario_id CHAR(36),
    valor_desconto_kz DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE CASCADE,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    INDEX idx_cupom (cupom_id),
    INDEX idx_pedido (pedido_id),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Adicionar FK em pedidos
ALTER TABLE pedidos 
    ADD FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE SET NULL;

-- ============================================
-- NOTIFICAÇÕES
-- ============================================

CREATE TABLE notificacoes (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36),
    tipo ENUM('pedido', 'pagamento', 'entrega', 'reserva', 'promocao', 'sistema') NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    
    -- Canais de envio
    enviada_app BOOLEAN DEFAULT FALSE,
    enviada_sms BOOLEAN DEFAULT FALSE,
    enviada_email BOOLEAN DEFAULT FALSE,
    enviada_whatsapp BOOLEAN DEFAULT FALSE,
    
    lida BOOLEAN DEFAULT FALSE,
    lida_em TIMESTAMP NULL,
    
    dados_adicionais JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_lida (lida),
    INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CONFIGURAÇÕES DO RESTAURANTE
-- ============================================

CREATE TABLE configuracoes_restaurante (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome_restaurante VARCHAR(200) NOT NULL,
    slogan TEXT,
    telefone VARCHAR(20),
    telefone_alternativo VARCHAR(20),
    email VARCHAR(150),
    whatsapp VARCHAR(20),
    
    -- Endereço
    provincia ENUM(
        'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 
        'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene',
        'Huambo', 'Huíla', 'Lunda Norte', 'Lunda Sul', 'Malanje',
        'Moxico', 'Namibe', 'Uíge', 'Zaire'
    ) DEFAULT 'Luanda',
    municipio VARCHAR(100),
    bairro VARCHAR(100),
    endereco TEXT,
    ponto_referencia TEXT,
    
    -- Coordenadas
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Horários (formato JSON)
    horario_funcionamento JSON COMMENT 'Ex: {"segunda": {"abertura": "11:00", "fechamento": "23:00"}}',
    
    -- Delivery
    taxa_entrega_base_kz DECIMAL(12, 2) DEFAULT 0.00,
    taxa_por_km_kz DECIMAL(12, 2) DEFAULT 0.00,
    raio_entrega_km DECIMAL(5, 2) DEFAULT 10.00,
    tempo_preparo_medio INT DEFAULT 30 COMMENT 'em minutos',
    pedido_minimo_kz DECIMAL(12, 2) DEFAULT 0.00,
    delivery_gratuito_acima_kz DECIMAL(12, 2) COMMENT 'Valor mínimo para frete grátis',
    
    -- Pagamento
    aceita_dinheiro BOOLEAN DEFAULT TRUE,
    aceita_multicaixa BOOLEAN DEFAULT TRUE,
    aceita_transferencia BOOLEAN DEFAULT TRUE,
    aceita_unitel_money BOOLEAN DEFAULT FALSE,
    
    -- Configurações gerais
    logo TEXT,
    sobre TEXT,
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    tiktok VARCHAR(100),
    website VARCHAR(200),
    
    -- Informações fiscais
    nif_empresa VARCHAR(10),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ZONAS DE ENTREGA E TAXAS
-- ============================================

CREATE TABLE zonas_entrega (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(100) NOT NULL,
    provincia ENUM(
        'Luanda', 'Bengo', 'Benguela', 'Bié', 'Cabinda', 
        'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene',
        'Huambo', 'Huíla', 'Lunda Norte', 'Lunda Sul', 'Malanje',
        'Moxico', 'Namibe', 'Uíge', 'Zaire'
    ) NOT NULL,
    municipios JSON COMMENT 'Array de municípios atendidos',
    bairros JSON COMMENT 'Array de bairros atendidos',
    
    taxa_entrega_kz DECIMAL(12, 2) NOT NULL,
    tempo_estimado_min INT COMMENT 'Tempo em minutos',
    
    ativa BOOLEAN DEFAULT TRUE,
    ordem_exibicao INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_provincia (provincia),
    INDEX idx_ativa (ativa)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- PROGRAMA DE FIDELIDADE
-- ============================================

CREATE TABLE pontos_fidelidade (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    usuario_id CHAR(36) NOT NULL,
    pedido_id CHAR(36),
    
    tipo ENUM('ganho', 'resgate', 'expiracao', 'bonus') NOT NULL,
    pontos INT NOT NULL COMMENT 'Positivo para ganho, negativo para resgate',
    saldo_anterior INT NOT NULL,
    saldo_atual INT NOT NULL,
    
    descricao TEXT,
    data_expiracao DATE COMMENT 'Data de expiração dos pontos',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL,
    INDEX idx_usuario (usuario_id),
    INDEX idx_pedido (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger para calcular total do pedido
CREATE TRIGGER calcular_total_pedido_insert
BEFORE INSERT ON pedidos
FOR EACH ROW
BEGIN
    SET NEW.total_kz = NEW.subtotal_kz - NEW.desconto_kz + IFNULL(NEW.taxa_entrega_kz, 0);
END$$

CREATE TRIGGER calcular_total_pedido_update
BEFORE UPDATE ON pedidos
FOR EACH ROW
BEGIN
    SET NEW.total_kz = NEW.subtotal_kz - NEW.desconto_kz + IFNULL(NEW.taxa_entrega_kz, 0);
END$$

-- Trigger para registrar histórico de entrega
CREATE TRIGGER registrar_historico_entrega_insert
AFTER INSERT ON entregas
FOR EACH ROW
BEGIN
    INSERT INTO historico_entrega (entrega_id, status, latitude, longitude)
    VALUES (NEW.id, NEW.status, NEW.latitude, NEW.longitude);
END$$

CREATE TRIGGER registrar_historico_entrega_update
AFTER UPDATE ON entregas
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO historico_entrega (entrega_id, status, latitude, longitude)
        VALUES (NEW.id, NEW.status, NEW.latitude, NEW.longitude);
    END IF;
END$$

-- Trigger para incrementar uso de cupom
CREATE TRIGGER incrementar_uso_cupom
AFTER INSERT ON cupons_utilizados
FOR EACH ROW
BEGIN
    UPDATE cupons 
    SET quantidade_usada = quantidade_usada + 1
    WHERE id = NEW.cupom_id;
END$$

-- Trigger para adicionar pontos de fidelidade
CREATE TRIGGER adicionar_pontos_fidelidade
AFTER UPDATE ON pedidos
FOR EACH ROW
BEGIN
    DECLARE pontos_ganhos INT;
    DECLARE saldo INT DEFAULT 0;
    
    -- Adiciona pontos quando pedido é entregue
    IF NEW.status = 'entregue' AND OLD.status != 'entregue' AND NEW.usuario_id IS NOT NULL THEN
        -- Calcula pontos: 1 ponto a cada 1000 Kz gastos
        SET pontos_ganhos = FLOOR(NEW.total_kz / 1000);
        
        -- Obtém saldo atual
        SELECT IFNULL(SUM(pontos), 0) INTO saldo
        FROM pontos_fidelidade
        WHERE usuario_id = NEW.usuario_id;
        
        -- Registra os pontos
        IF pontos_ganhos > 0 THEN
            INSERT INTO pontos_fidelidade (
                usuario_id, 
                pedido_id, 
                tipo, 
                pontos, 
                saldo_anterior, 
                saldo_atual,
                descricao,
                data_expiracao
            ) VALUES (
                NEW.usuario_id,
                NEW.id,
                'ganho',
                pontos_ganhos,
                saldo,
                saldo + pontos_ganhos,
                CONCAT('Ganhou ', pontos_ganhos, ' pontos no pedido #', NEW.numero_pedido),
                DATE_ADD(CURRENT_DATE, INTERVAL 1 YEAR)
            );
        END IF;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ============================================

-- View: Vendas por dia
CREATE OR REPLACE VIEW vendas_por_dia AS
SELECT 
    DATE(created_at) as data,
    COUNT(*) as total_pedidos,
    SUM(total_kz) as valor_total_kz,
    AVG(total_kz) as ticket_medio_kz,
    SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END) as pedidos_concluidos,
    SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as pedidos_cancelados,
    SUM(CASE WHEN tipo = 'delivery' THEN 1 ELSE 0 END) as pedidos_delivery,
    SUM(CASE WHEN tipo = 'mesa' THEN 1 ELSE 0 END) as pedidos_mesa,
    SUM(CASE WHEN tipo = 'retirada' THEN 1 ELSE 0 END) as pedidos_retirada
FROM pedidos
WHERE status NOT IN ('carrinho')
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- View: Itens mais vendidos
CREATE OR REPLACE VIEW itens_mais_vendidos AS
SELECT 
    ic.id,
    ic.nome,
    c.nome as categoria,
    COUNT(ip.id) as quantidade_vendida,
    SUM(ip.subtotal_kz) as valor_total_kz,
    AVG(ip.preco_unitario_kz) as preco_medio_kz
FROM itens_cardapio ic
LEFT JOIN itens_pedido ip ON ic.id = ip.item_cardapio_id
LEFT JOIN categorias c ON ic.categoria_id = c.id
LEFT JOIN pedidos p ON ip.pedido_id = p.id
WHERE p.status IN ('confirmado', 'em_preparo', 'pronto', 'saiu_entrega', 'entregue')
GROUP BY ic.id, ic.nome, c.nome
ORDER BY quantidade_vendida DESC;

-- View: Avaliação geral do restaurante
CREATE OR REPLACE VIEW avaliacao_geral AS
SELECT 
    COUNT(*) as total_avaliacoes,
    ROUND(AVG(nota_geral), 2) as media_geral,
    ROUND(AVG(nota_comida), 2) as media_comida,
    ROUND(AVG(nota_entrega), 2) as media_entrega,
    ROUND(AVG(nota_atendimento), 2) as media_atendimento,
    ROUND(AVG(nota_preco), 2) as media_preco,
    SUM(CASE WHEN nota_geral = 5 THEN 1 ELSE 0 END) as avaliacoes_5_estrelas,
    SUM(CASE WHEN nota_geral = 4 THEN 1 ELSE 0 END) as avaliacoes_4_estrelas,
    SUM(CASE WHEN nota_geral = 3 THEN 1 ELSE 0 END) as avaliacoes_3_estrelas,
    SUM(CASE WHEN nota_geral <= 2 THEN 1 ELSE 0 END) as avaliacoes_baixas
FROM avaliacoes
WHERE publicar = TRUE;

-- View: Status de mesas
CREATE OR REPLACE VIEW status_mesas AS
SELECT 
    m.id,
    m.numero,
    m.capacidade,
    m.localizacao,
    m.tipo,
    m.ativa,
    r.id as reserva_id,
    r.nome_cliente,
    r.quantidade_pessoas,
    r.telefone_cliente,
    r.data_reserva,
    r.hora_reserva,
    r.status as status_reserva,
    r.ocasiao_especial,
    CASE 
        WHEN r.status = 'em_andamento' THEN 'ocupada'
        WHEN r.status = 'confirmada' AND r.data_reserva = CURDATE() THEN 'reservada'
        ELSE 'disponivel'
    END as status_mesa
FROM mesas m
LEFT JOIN reservas r ON m.id = r.mesa_id 
    AND r.data_reserva = CURDATE()
    AND r.status IN ('confirmada', 'em_andamento')
WHERE m.ativa = TRUE
ORDER BY m.numero;

-- View: Pedidos do dia
CREATE OR REPLACE VIEW pedidos_do_dia AS
SELECT 
    p.id,
    p.numero_pedido,
    p.tipo,
    p.status,
    p.total_kz,
    u.nome_completo as cliente_nome,
    u.telefone as cliente_telefone,
    p.created_at,
    p.tempo_estimado,
    p.observacoes,
    e.status as status_entrega,
    e.nome_entregador,
    e.telefone_entregador,
    CASE 
        WHEN p.tipo = 'delivery' THEN CONCAT(
            ec.rua, ', ', 
            IFNULL(ec.numero, 'S/N'), 
            ' - ', ec.bairro, 
            ', ', ec.municipio
        )
        WHEN p.tipo = 'mesa' THEN CONCAT('Mesa ', m.numero)
        ELSE 'Retirada no local'
    END as destino,
    ec.ponto_referencia
FROM pedidos p
LEFT JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN enderecos_clientes ec ON p.endereco_id = ec.id
LEFT JOIN mesas m ON p.mesa_id = m.id
LEFT JOIN entregas e ON p.id = e.pedido_id
WHERE DATE(p.created_at) = CURDATE()
    AND p.status NOT IN ('carrinho', 'cancelado')
ORDER BY 
    CASE p.status
        WHEN 'pendente' THEN 1
        WHEN 'confirmado' THEN 2
        WHEN 'em_preparo' THEN 3
        WHEN 'pronto' THEN 4
        WHEN 'saiu_entrega' THEN 5
        ELSE 6
    END,
    p.created_at ASC;

-- View: Entregas ativas
CREATE OR REPLACE VIEW entregas_ativas AS
SELECT 
    e.id,
    p.numero_pedido,
    e.status,
    e.nome_entregador,
    e.telefone_entregador,
    e.veiculo,
    u.nome_completo as cliente_nome,
    u.telefone as cliente_telefone,
    CONCAT(
        ec.rua, ', ',
        IFNULL(ec.numero, 'S/N'),
        ' - ', ec.bairro,
        ', ', ec.municipio
    ) as endereco_entrega,
    ec.ponto_referencia,
    ec.coordenadas_gps,
    e.latitude as lat_entregador,
    e.longitude as lng_entregador,
    e.saiu_em,
    TIMESTAMPDIFF(MINUTE, e.saiu_em, NOW()) as tempo_decorrido_min,
    p.tempo_estimado,
    p.total_kz
FROM entregas e
INNER JOIN pedidos p ON e.pedido_id = p.id
LEFT JOIN usuarios u ON p.usuario_id = u.id
LEFT JOIN enderecos_clientes ec ON p.endereco_id = ec.id
WHERE e.status IN ('saiu_entrega', 'em_transito', 'proximo_destino')
ORDER BY e.saiu_em ASC;

-- View: Ranking de clientes
CREATE OR REPLACE VIEW ranking_clientes AS
SELECT 
    u.id,
    u.nome_completo,
    u.telefone,
    u.email,
    COUNT(p.id) as total_pedidos,
    SUM(p.total_kz) as valor_total_gasto_kz,
    AVG(p.total_kz) as ticket_medio_kz,
    MAX(p.created_at) as ultimo_pedido,
    IFNULL(SUM(pf.pontos), 0) as pontos_fidelidade,
    ROUND(AVG(a.nota_geral), 2) as media_avaliacoes
FROM usuarios u
INNER JOIN pedidos p ON u.id = p.usuario_id
LEFT JOIN avaliacoes a ON p.id = a.pedido_id
LEFT JOIN pontos_fidelidade pf ON u.id = pf.usuario_id
WHERE p.status = 'entregue'
    AND u.role = 'cliente'
GROUP BY u.id, u.nome_completo, u.telefone, u.email
ORDER BY valor_total_gasto_kz DESC;

-- View: Performance por província
CREATE OR REPLACE VIEW vendas_por_provincia AS
SELECT 
    ec.provincia,
    COUNT(DISTINCT p.id) as total_pedidos,
    SUM(p.total_kz) as valor_total_kz,
    AVG(p.total_kz) as ticket_medio_kz,
    COUNT(DISTINCT p.usuario_id) as clientes_unicos,
    AVG(p.tempo_estimado) as tempo_medio_preparo
FROM pedidos p
INNER JOIN enderecos_clientes ec ON p.endereco_id = ec.id
WHERE p.status = 'entregue'
GROUP BY ec.provincia
ORDER BY valor_total_kz DESC;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure: Estatísticas do dia
CREATE PROCEDURE estatisticas_dia(IN data_referencia DATE)
BEGIN
    SELECT 
        COUNT(*) as total_pedidos,
        SUM(CASE WHEN status IN ('entregue') THEN 1 ELSE 0 END) as pedidos_concluidos,
        SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) as pedidos_cancelados,
        SUM(CASE WHEN status NOT IN ('cancelado', 'carrinho') THEN total_kz ELSE 0 END) as faturamento_kz,
        AVG(CASE WHEN status NOT IN ('cancelado', 'carrinho') THEN total_kz ELSE NULL END) as ticket_medio_kz,
        COUNT(DISTINCT usuario_id) as clientes_atendidos,
        SUM(CASE WHEN tipo = 'delivery' THEN 1 ELSE 0 END) as entregas,
        SUM(CASE WHEN tipo = 'mesa' THEN 1 ELSE 0 END) as mesas_atendidas,
        SUM(CASE WHEN tipo = 'retirada' THEN 1 ELSE 0 END) as retiradas
    FROM pedidos
    WHERE DATE(created_at) = data_referencia;
END$$

-- Procedure: Buscar pedidos por status
CREATE PROCEDURE buscar_pedidos_por_status(IN status_busca VARCHAR(20))
BEGIN
    SELECT 
        p.*,
        u.nome_completo as cliente_nome,
        u.telefone as cliente_telefone,
        u.email as cliente_email,
        CASE 
            WHEN p.tipo = 'delivery' THEN CONCAT(
                ec.bairro, ', ', 
                ec.municipio, 
                ' - ', ec.provincia
            )
            WHEN p.tipo = 'mesa' THEN CONCAT('Mesa ', m.numero)
            ELSE 'Retirada'
        END as localizacao
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN enderecos_clientes ec ON p.endereco_id = ec.id
    LEFT JOIN mesas m ON p.mesa_id = m.id
    WHERE p.status = status_busca
    ORDER BY p.created_at DESC;
END$$

-- Procedure: Calcular taxa de entrega por zona
CREATE PROCEDURE calcular_taxa_entrega(
    IN provincia_param VARCHAR(50),
    IN municipio_param VARCHAR(100),
    IN bairro_param VARCHAR(100),
    OUT taxa_kz DECIMAL(12, 2),
    OUT tempo_estimado INT
)
BEGIN
    SELECT 
        ze.taxa_entrega_kz,
        ze.tempo_estimado_min
    INTO taxa_kz, tempo_estimado
    FROM zonas_entrega ze
    WHERE ze.provincia = provincia_param
        AND ze.ativa = TRUE
        AND (
            JSON_CONTAINS(ze.municipios, JSON_QUOTE(municipio_param))
            OR JSON_LENGTH(ze.municipios) = 0
        )
        AND (
            JSON_CONTAINS(ze.bairros, JSON_QUOTE(bairro_param))
            OR JSON_LENGTH(ze.bairros) = 0
        )
    ORDER BY 
        JSON_LENGTH(ze.bairros) DESC,
        JSON_LENGTH(ze.municipios) DESC
    LIMIT 1;
    
    -- Se não encontrar, usa taxa padrão
    IF taxa_kz IS NULL THEN
        SELECT taxa_entrega_base_kz INTO taxa_kz
        FROM configuracoes_restaurante
        LIMIT 1;
        
        SET tempo_estimado = 45; -- tempo padrão
    END IF;
END$$

-- Procedure: Obter saldo de pontos
CREATE PROCEDURE obter_saldo_pontos(
    IN usuario_param CHAR(36),
    OUT saldo_total INT,
    OUT pontos_a_expirar INT,
    OUT data_proxima_expiracao DATE
)
BEGIN
    -- Saldo total
    SELECT IFNULL(SUM(pontos), 0)
    INTO saldo_total
    FROM pontos_fidelidade
    WHERE usuario_id = usuario_param;
    
    -- Pontos que expiram nos próximos 30 dias
    SELECT 
        IFNULL(SUM(pontos), 0),
        MIN(data_expiracao)
    INTO pontos_a_expirar, data_proxima_expiracao
    FROM pontos_fidelidade
    WHERE usuario_id = usuario_param
        AND pontos > 0
        AND data_expiracao BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
END$$

DELIMITER ;

-- ============================================
-- DADOS INICIAIS (SEEDS) - ANGOLA
-- ============================================

-- Configuração do restaurante
INSERT INTO configuracoes_restaurante (
    nome_restaurante,
    slogan,
    telefone,
    whatsapp,
    email,
    provincia,
    municipio,
    bairro,
    endereco,
    latitude,
    longitude,
    taxa_entrega_base_kz,
    taxa_por_km_kz,
    raio_entrega_km,
    tempo_preparo_medio,
    pedido_minimo_kz,
    delivery_gratuito_acima_kz,
    aceita_dinheiro,
    aceita_multicaixa,
    aceita_transferencia,
    horario_funcionamento
) VALUES (
    'Sabores de Angola',
    'Comida caseira com sabor de Angola',
    '+244 923 456 789',
    '+244 923 456 789',
    'contato@saboresdeangola.ao',
    'Luanda',
    'Luanda',
    'Talatona',
    'Rua Principal de Talatona, Edifício Monte Belo',
    -8.9094,
    13.1844,
    2000.00,
    100.00,
    15.00,
    45,
    3000.00,
    15000.00,
    TRUE,
    TRUE,
    TRUE,
    JSON_OBJECT(
        'segunda', JSON_OBJECT('abertura', '10:00', 'fechamento', '23:00'),
        'terca', JSON_OBJECT('abertura', '10:00', 'fechamento', '23:00'),
        'quarta', JSON_OBJECT('abertura', '10:00', 'fechamento', '23:00'),
        'quinta', JSON_OBJECT('abertura', '10:00', 'fechamento', '23:00'),
        'sexta', JSON_OBJECT('abertura', '10:00', 'fechamento', '00:00'),
        'sabado', JSON_OBJECT('abertura', '10:00', 'fechamento', '00:00'),
        'domingo', JSON_OBJECT('abertura', '10:00', 'fechamento', '23:00')
    )
);

-- Usuário administrador
INSERT INTO usuarios (
    nome_completo,
    email,
    telefone,
    senha_hash,
    bi,
    role,
    status,
    data_nascimento,
    genero
) VALUES (
    'António Manuel dos Santos',
    'admin@saboresdeangola.ao',
    '+244 923 456 789',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: admin123
    '006789012LA041',
    'administrador',
    'ativo',
    '1985-03-15',
    'masculino'
);

-- Cliente exemplo (dados realistas angolanos)
INSERT INTO usuarios (
    nome_completo,
    email,
    telefone,
    telefone_alternativo,
    senha_hash,
    bi,
    nif,
    role,
    status,
    data_nascimento,
    genero
) VALUES (
    'Maria da Conceição Fernandes',
    'maria.fernandes@gmail.com',
    '+244 946 123 456',
    '+244 222 345 678',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- senha: senha123
    '007123456LA042',
    '5123456789',
    'cliente',
    'ativo',
    '1990-07-22',
    'feminino'
);

-- Endereço do cliente
INSERT INTO enderecos_clientes (
    usuario_id,
    nome_endereco,
    provincia,
    municipio,
    bairro,
    rua,
    numero,
    condominio,
    apartamento,
    ponto_referencia,
    coordenadas_gps,
    principal
) VALUES (
    (SELECT id FROM usuarios WHERE email = 'maria.fernandes@gmail.com'),
    'Casa',
    'Luanda',
    'Luanda',
    'Miramar',
    'Rua Kwame Nkrumah',
    '45',
    'Condomínio Atlântico',
    '3B',
    'Próximo ao Belas Shopping, ao lado da farmácia São José',
    '-8.8272,13.2439',
    TRUE
);

-- Categorias típicas de Angola
INSERT INTO categorias (nome, nome_en, descricao, ordem_exibicao) VALUES
('Pratos Típicos Angolanos', 'Angolan Traditional Dishes', 'Muamba, calulu, funge e outros pratos tradicionais', 1),
('Grelhados', 'Grilled', 'Carnes e peixes grelhados', 2),
('Petiscos', 'Appetizers', 'Entradas e petiscos variados', 3),
('Bebidas', 'Beverages', 'Sucos naturais, refrigerantes e bebidas', 4),
('Sobremesas', 'Desserts', 'Doces e sobremesas', 5);

-- Itens do cardápio típicos de Angola
INSERT INTO itens_cardapio (
    categoria_id,
    nome,
    nome_en,
    descricao,
    preco_kz,
    tempo_preparo,
    status,
    destaque,
    vegetariano,
    picante
) VALUES
(
    (SELECT id FROM categorias WHERE nome = 'Pratos Típicos Angolanos'),
    'Muamba de Galinha',
    'Chicken Muamba',
    'Tradicional muamba de galinha com funge de bombó, quiabo e dendém',
    8500.00,
    45,
    'disponivel',
    TRUE,
    FALSE,
    TRUE
),
(
    (SELECT id FROM categorias WHERE nome = 'Pratos Típicos Angolanos'),
    'Calulu de Peixe',
    'Fish Calulu',
    'Calulu de peixe seco com batata doce, quiabo e óleo de palma',
    9500.00,
    50,
    'disponivel',
    TRUE,
    FALSE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Pratos Típicos Angolanos'),
    'Funge com Pirão',
    'Funge with Pirão',
    'Funge de bombó acompanhado de pirão de peixe',
    4500.00,
    30,
    'disponivel',
    FALSE,
    FALSE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Grelhados'),
    'Cabrito Grelhado',
    'Grilled Goat',
    'Cabrito grelhado temperado com especiarias, acompanha arroz e batata',
    12000.00,
    40,
    'disponivel',
    TRUE,
    FALSE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Grelhados'),
    'Peixe Cacusso Grelhado',
    'Grilled Cacusso Fish',
    'Peixe cacusso grelhado com molho especial da casa',
    10500.00,
    35,
    'disponivel',
    FALSE,
    FALSE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Petiscos'),
    'Ginguba Torrada',
    'Roasted Peanuts',
    'Amendoim torrado tradicional angolano',
    1500.00,
    5,
    'disponivel',
    FALSE,
    TRUE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Petiscos'),
    'Pastéis de Carne',
    'Meat Pastries',
    'Pastéis crocantes recheados com carne temperada (6 unidades)',
    3500.00,
    20,
    'disponivel',
    FALSE,
    FALSE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Bebidas'),
    'Sumo de Múcua',
    'Baobab Juice',
    'Suco natural de múcua (fruto do imbondeiro)',
    2000.00,
    10,
    'disponivel',
    TRUE,
    TRUE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Bebidas'),
    'Sumo de Ginguba',
    'Peanut Juice',
    'Refresco tradicional de ginguba',
    1800.00,
    10,
    'disponivel',
    FALSE,
    TRUE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Bebidas'),
    'Cuca (Cerveja)',
    'Cuca Beer',
    'Cerveja angolana tradicional',
    800.00,
    2,
    'disponivel',
    FALSE,
    FALSE,
    FALSE
),
(
    (SELECT id FROM categorias WHERE nome = 'Sobremesas'),
    'Cocada',
    'Coconut Sweet',
    'Doce tradicional de coco',
    2500.00,
    15,
    'disponivel',
    FALSE,
    FALSE,
    FALSE
);

-- Mesas do restaurante
INSERT INTO mesas (numero, capacidade, localizacao, tipo) VALUES
('1', 4, 'Área interna', 'normal'),
('2', 4, 'Área interna', 'normal'),
('3', 2, 'Área interna', 'casal'),
('4', 6, 'Área interna', 'familia'),
('5', 4, 'Varanda', 'normal'),
('6', 2, 'Varanda', 'casal'),
('7', 8, 'Salão VIP', 'vip'),
('8', 4, 'Esplanada', 'normal');

-- Zonas de entrega em Luanda
INSERT INTO zonas_entrega (
    nome,
    provincia,
    municipios,
    bairros,
    taxa_entrega_kz,
    tempo_estimado_min,
    ativa
) VALUES
(
    'Luanda - Zona Central',
    'Luanda',
    JSON_ARRAY('Luanda'),
    JSON_ARRAY('Miramar', 'Alvalade', 'Maianga', 'Ingombota'),
    1500.00,
    30,
    TRUE
),
(
    'Luanda - Talatona',
    'Luanda',
    JSON_ARRAY('Luanda'),
    JSON_ARRAY('Talatona', 'Camama'),
    2500.00,
    40,
    TRUE
),
(
    'Luanda - Viana',
    'Luanda',
    JSON_ARRAY('Viana'),
    JSON_ARRAY(),
    3500.00,
    50,
    TRUE
),
(
    'Luanda - Kilamba',
    'Luanda',
    JSON_ARRAY('Belas'),
    JSON_ARRAY('Kilamba Kiaxi'),
    3000.00,
    45,
    TRUE
);

-- Cupons promocionais
INSERT INTO cupons (
    codigo,
    descricao,
    tipo,
    valor,
    valor_minimo_pedido_kz,
    quantidade_disponivel,
    data_inicio,
    data_fim,
    status,
    apenas_primeira_compra
) VALUES
(
    'BEMVINDO',
    'Desconto de boas-vindas para novos clientes',
    'percentual',
    15.00,
    5000.00,
    100,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    'ativo',
    TRUE
),
(
    'FIMDESEMANA',
    'Promoção de fim de semana',
    'valor_fixo',
    2000.00,
    10000.00,
    NULL,
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 90 DAY),
    'ativo',
    FALSE
);

-- ============================================
-- RESTAURAR CONFIGURAÇÕES
-- ============================================

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- ============================================
-- QUERIES ÚTEIS PARA CONSULTA
-- ============================================

-- Exibir resumo
SELECT 'Schema criado com sucesso para Angola!' as status;

SELECT 
    'Tabelas criadas' as tipo,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'restaurante_angola_db'
UNION ALL
SELECT 
    'Views criadas' as tipo,
    COUNT(*) as quantidade
FROM information_schema.views 
WHERE table_schema = 'restaurante_angola_db'
UNION ALL
SELECT 
    'Procedures criadas' as tipo,
    COUNT(*) as quantidade
FROM information_schema.routines 
WHERE routine_schema = 'restaurante_angola_db';

-- Mostrar dados iniciais inseridos
SELECT 'Dados de exemplo inseridos:' as resumo;
SELECT 'Usuários' as tabela, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'Categorias', COUNT(*) FROM categorias
UNION ALL
SELECT 'Itens do Cardápio', COUNT(*) FROM itens_cardapio
UNION ALL
SELECT 'Mesas', COUNT(*) FROM mesas
UNION ALL
SELECT 'Zonas de Entrega', COUNT(*) FROM zonas_entrega
UNION ALL
SELECT 'Cupons', COUNT(*) FROM cupons;