-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS restaurante_angola_db;
USE restaurante_angola_db;
-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id VARCHAR(36) PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    telefone_alternativo VARCHAR(20),
    senha_hash VARCHAR(255) NOT NULL,
    bi VARCHAR(20) UNIQUE,
    nif VARCHAR(20) UNIQUE,
    role ENUM(
        'cliente',
        'administrador',
        'garcom',
        'cozinha',
        'entregador',
        'gerente'
    ) DEFAULT 'cliente',
    status ENUM('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    foto_perfil VARCHAR(255),
    data_nascimento DATE,
    genero ENUM('masculino', 'feminino', 'outro'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP NULL
);
-- Tabela de Endereços dos Clientes
CREATE TABLE IF NOT EXISTS enderecos_clientes (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    nome_endereco VARCHAR(50) NOT NULL,
    -- Ex: Casa, Trabalho
    provincia VARCHAR(50) NOT NULL,
    municipio VARCHAR(50) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    rua VARCHAR(100) NOT NULL,
    numero VARCHAR(20),
    condominio VARCHAR(100),
    apartamento VARCHAR(50),
    ponto_referencia TEXT,
    coordenadas_gps VARCHAR(50),
    principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
-- Categorias do Cardápio
CREATE TABLE IF NOT EXISTS categorias (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    nome_en VARCHAR(50),
    descricao TEXT,
    imagem VARCHAR(255),
    ordem_exibicao INT DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Itens do Cardápio
CREATE TABLE IF NOT EXISTS itens_cardapio (
    id VARCHAR(36) PRIMARY KEY,
    categoria_id VARCHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nome_en VARCHAR(100),
    descricao TEXT,
    preco_kz DECIMAL(10, 2) NOT NULL,
    preco_promocional_kz DECIMAL(10, 2),
    tempo_preparo INT,
    -- em minutos
    calorias INT,
    vegetariano BOOLEAN DEFAULT FALSE,
    vegano BOOLEAN DEFAULT FALSE,
    sem_gluten BOOLEAN DEFAULT FALSE,
    picante BOOLEAN DEFAULT FALSE,
    status ENUM('disponivel', 'indisponivel', 'esgotado') DEFAULT 'disponivel',
    destaque BOOLEAN DEFAULT FALSE,
    prato_do_dia BOOLEAN DEFAULT FALSE,
    imagem VARCHAR(255),
    ordem_exibicao INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);
-- Mesas
CREATE TABLE IF NOT EXISTS mesas (
    id VARCHAR(36) PRIMARY KEY,
    numero VARCHAR(10) NOT NULL UNIQUE,
    capacidade INT NOT NULL,
    localizacao VARCHAR(50),
    -- Interna, Varanda, etc
    tipo ENUM('normal', 'vip', 'familia', 'casal') DEFAULT 'normal',
    ativa BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36),
    -- Pode ser nulo se reserva for feita por telefone
    mesa_id VARCHAR(36),
    nome_cliente VARCHAR(100) NOT NULL,
    telefone_cliente VARCHAR(20) NOT NULL,
    email_cliente VARCHAR(100),
    quantidade_pessoas INT NOT NULL,
    data_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    status ENUM(
        'pendente',
        'confirmada',
        'em_andamento',
        'finalizada',
        'cancelada',
        'nao_compareceu'
    ) DEFAULT 'pendente',
    ocasiao_especial VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmada_em TIMESTAMP NULL,
    check_in_em TIMESTAMP NULL,
    check_out_em TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE
    SET NULL,
        FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE
    SET NULL
);
-- Cupons de Desconto
CREATE TABLE IF NOT EXISTS cupons (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo ENUM('percentual', 'fixo') NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    valor_minimo_pedido_kz DECIMAL(10, 2) DEFAULT 0,
    quantidade_disponivel INT,
    quantidade_usada INT DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(36) PRIMARY KEY,
    numero_pedido INT AUTO_INCREMENT UNIQUE,
    usuario_id VARCHAR(36),
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
    ) DEFAULT 'carrinho',
    endereco_id VARCHAR(36),
    mesa_id VARCHAR(36),
    taxa_entrega_kz DECIMAL(10, 2) DEFAULT 0,
    distancia_km DECIMAL(5, 2),
    subtotal_kz DECIMAL(10, 2) NOT NULL,
    desconto_kz DECIMAL(10, 2) DEFAULT 0,
    total_kz DECIMAL(10, 2) NOT NULL,
    observacoes TEXT,
    observacoes_entrega TEXT,
    tempo_estimado INT,
    -- em minutos
    data_prevista_entrega DATETIME,
    reserva_id VARCHAR(36),
    cupom_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmado_em TIMESTAMP NULL,
    finalizado_em TIMESTAMP NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE
    SET NULL,
        FOREIGN KEY (endereco_id) REFERENCES enderecos_clientes(id) ON DELETE
    SET NULL,
        FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE
    SET NULL,
        FOREIGN KEY (reserva_id) REFERENCES reservas(id) ON DELETE
    SET NULL,
        FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE
    SET NULL
);
-- Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id VARCHAR(36) PRIMARY KEY,
    pedido_id VARCHAR(36) NOT NULL,
    item_cardapio_id VARCHAR(36),
    nome_item VARCHAR(100) NOT NULL,
    preco_unitario_kz DECIMAL(10, 2) NOT NULL,
    quantidade INT NOT NULL,
    subtotal_kz DECIMAL(10, 2) NOT NULL,
    observacoes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (item_cardapio_id) REFERENCES itens_cardapio(id) ON DELETE
    SET NULL
);
-- Cupons Utilizados
CREATE TABLE IF NOT EXISTS cupons_utilizados (
    id VARCHAR(36) PRIMARY KEY,
    cupom_id VARCHAR(36) NOT NULL,
    pedido_id VARCHAR(36) NOT NULL,
    usuario_id VARCHAR(36),
    valor_desconto_kz DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE CASCADE,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);
-- Pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
    id VARCHAR(36) PRIMARY KEY,
    pedido_id VARCHAR(36) NOT NULL,
    metodo ENUM(
        'dinheiro',
        'multicaixa',
        'multicaixa_express',
        'transferencia_bancaria',
        'paypal',
        'unitel_money',
        'atlantico_money'
    ) NOT NULL,
    status ENUM(
        'pendente',
        'processando',
        'aprovado',
        'recusado',
        'estornado',
        'cancelado'
    ) DEFAULT 'pendente',
    valor_pago_kz DECIMAL(10, 2) NOT NULL,
    referencia_transacao VARCHAR(100),
    -- ID da transação no gateway
    comprovativo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE
);
-- Zonas de Entrega
CREATE TABLE IF NOT EXISTS zonas_entrega (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    municipios JSON,
    -- Array de municípios ['Maianga', 'Ingombota']
    taxa_entrega_kz DECIMAL(10, 2) NOT NULL,
    tempo_estimado_min INT,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Configurações Gerais
CREATE TABLE IF NOT EXISTS configuracoes_restaurante (
    id INT PRIMARY KEY DEFAULT 1,
    nome_restaurante VARCHAR(100) DEFAULT 'Restaurante GHU',
    taxa_entrega_base_kz DECIMAL(10, 2) DEFAULT 1000.00,
    tempo_preparo_padrao_min INT DEFAULT 30,
    pedido_minimo_delivery_kz DECIMAL(10, 2) DEFAULT 0,
    aberto BOOLEAN DEFAULT TRUE,
    horario_funcionamento JSON,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Logs de Acesso
CREATE TABLE IF NOT EXISTS logs_acesso (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36),
    metodo VARCHAR(10),
    url VARCHAR(255),
    ip VARCHAR(45),
    user_agent TEXT,
    status_code INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id VARCHAR(36) PRIMARY KEY,
    pedido_id VARCHAR(36) NOT NULL,
    usuario_id VARCHAR(36) NOT NULL,
    nota INT NOT NULL CHECK (
        nota >= 1
        AND nota <= 5
    ),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
-- Inserir Configuração Padrão
INSERT INTO configuracoes_restaurante (id)
VALUES (1) ON DUPLICATE KEY
UPDATE id = 1;
-- Inserir Usuário Admin Padrão (Senha: admin123)
-- Hash bcrypt gerado previamente
INSERT IGNORE INTO usuarios (
        id,
        nome_completo,
        email,
        telefone,
        senha_hash,
        role,
        status
    )
VALUES (
        'admin-uuid-default',
        'Administrador GHU',
        'admin@ghu.ao',
        '+244900000000',
        '$2a$10$YourHashedPasswordHereChangedLater',
        'administrador',
        'ativo'
    );