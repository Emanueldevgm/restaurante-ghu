-- =============================================
-- RESTAURANTE GHU - PostgreSQL COMPLETO
-- (Estrutura + Dados + Usuários Atualizados)
-- Data: 27/05/2026
-- =============================================

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- FUNÇÃO DE TRIGGER (atualizar updated_at)
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABELAS
-- =============================================

-- 1. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefone VARCHAR(20) NOT NULL UNIQUE,
    telefone_alternativo VARCHAR(20),
    senha_hash VARCHAR(255) NOT NULL,
    bi VARCHAR(20) UNIQUE,
    nif VARCHAR(20) UNIQUE,
    role VARCHAR(20) DEFAULT 'cliente' CHECK (role IN ('cliente', 'administrador', 'garcom', 'cozinha', 'entregador', 'gerente')),
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
    foto_perfil VARCHAR(255),
    data_nascimento DATE,
    genero VARCHAR(20) CHECK (genero IN ('masculino', 'feminino', 'outro')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP
);

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 2. CATEGORIAS
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(50) NOT NULL,
    nome_en VARCHAR(50),
    descricao TEXT,
    imagem VARCHAR(255),
    ordem_exibicao INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_categorias_updated_at ON categorias;
CREATE TRIGGER update_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. ITENS_CARDAPIO
CREATE TABLE IF NOT EXISTS itens_cardapio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    nome_en VARCHAR(100),
    descricao TEXT,
    preco_kz DECIMAL(10,2) NOT NULL,
    preco_promocional_kz DECIMAL(10,2),
    tempo_preparo INTEGER,
    calorias INTEGER,
    vegetariano BOOLEAN DEFAULT FALSE,
    vegano BOOLEAN DEFAULT FALSE,
    sem_gluten BOOLEAN DEFAULT FALSE,
    picante BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'indisponivel', 'esgotado')),
    destaque BOOLEAN DEFAULT FALSE,
    prato_do_dia BOOLEAN DEFAULT FALSE,
    imagem VARCHAR(255),
    ordem_exibicao INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_itens_cardapio_updated_at ON itens_cardapio;
CREATE TRIGGER update_itens_cardapio_updated_at
    BEFORE UPDATE ON itens_cardapio
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ENDERECOS_CLIENTES
CREATE TABLE IF NOT EXISTS enderecos_clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_endereco VARCHAR(50) NOT NULL,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_enderecos_clientes_updated_at ON enderecos_clientes;
CREATE TRIGGER update_enderecos_clientes_updated_at
    BEFORE UPDATE ON enderecos_clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. MESAS
CREATE TABLE IF NOT EXISTS mesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(10) NOT NULL UNIQUE,
    capacidade INTEGER NOT NULL,
    localizacao VARCHAR(50),
    tipo VARCHAR(20) DEFAULT 'normal' CHECK (tipo IN ('normal', 'vip', 'familia', 'casal')),
    ativa BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. RESERVAS
CREATE TABLE IF NOT EXISTS reservas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    mesa_id UUID REFERENCES mesas(id) ON DELETE SET NULL,
    nome_cliente VARCHAR(100) NOT NULL,
    telefone_cliente VARCHAR(20) NOT NULL,
    email_cliente VARCHAR(100),
    quantidade_pessoas INTEGER NOT NULL,
    data_reserva DATE NOT NULL,
    hora_reserva TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmada', 'em_andamento', 'finalizada', 'cancelada', 'nao_compareceu')),
    ocasiao_especial VARCHAR(100),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmada_em TIMESTAMP,
    check_in_em TIMESTAMP,
    check_out_em TIMESTAMP
);

DROP TRIGGER IF EXISTS update_reservas_updated_at ON reservas;
CREATE TRIGGER update_reservas_updated_at
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. CUPONS
CREATE TABLE IF NOT EXISTS cupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('percentual', 'fixo')),
    valor DECIMAL(10,2) NOT NULL,
    valor_minimo_pedido_kz DECIMAL(10,2) DEFAULT 0.00,
    quantidade_disponivel INTEGER,
    quantidade_usada INTEGER DEFAULT 0,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. ZONAS_ENTREGA
CREATE TABLE IF NOT EXISTS zonas_entrega (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    provincia VARCHAR(50) NOT NULL,
    municipios JSONB,
    bairros JSONB,
    taxa_entrega_kz DECIMAL(10,2) NOT NULL,
    tempo_estimado_min INTEGER,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. CONFIGURACOES_RESTAURANTE
CREATE TABLE IF NOT EXISTS configuracoes_restaurante (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    nome_restaurante VARCHAR(100) DEFAULT 'Restaurante GHU',
    taxa_entrega_base_kz DECIMAL(10,2) DEFAULT 1000.00,
    tempo_preparo_padrao_min INTEGER DEFAULT 30,
    pedido_minimo_delivery_kz DECIMAL(10,2) DEFAULT 0.00,
    aberto BOOLEAN DEFAULT TRUE,
    horario_funcionamento JSONB,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_configuracoes_updated_at ON configuracoes_restaurante;
CREATE TRIGGER update_configuracoes_updated_at
    BEFORE UPDATE ON configuracoes_restaurante
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. PEDIDOS
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido SERIAL UNIQUE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrega', 'retirada', 'mesa')),
    status VARCHAR(20) DEFAULT 'carrinho' CHECK (status IN ('carrinho', 'pendente', 'confirmado', 'em_preparo', 'pronto', 'saiu_entrega', 'entregue', 'cancelado')),
    endereco_id UUID REFERENCES enderecos_clientes(id) ON DELETE SET NULL,
    mesa_id UUID REFERENCES mesas(id) ON DELETE SET NULL,
    taxa_entrega_kz DECIMAL(10,2) DEFAULT 0.00,
    distancia_km DECIMAL(5,2),
    subtotal_kz DECIMAL(10,2) NOT NULL,
    desconto_kz DECIMAL(10,2) DEFAULT 0.00,
    total_kz DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    observacoes_entrega TEXT,
    tempo_estimado INTEGER,
    data_prevista_entrega TIMESTAMP,
    reserva_id UUID REFERENCES reservas(id) ON DELETE SET NULL,
    cupom_id UUID REFERENCES cupons(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmado_em TIMESTAMP,
    finalizado_em TIMESTAMP
);

DROP TRIGGER IF EXISTS update_pedidos_updated_at ON pedidos;
CREATE TRIGGER update_pedidos_updated_at
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 11. ITENS_PEDIDO
CREATE TABLE IF NOT EXISTS itens_pedido (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    item_cardapio_id UUID REFERENCES itens_cardapio(id) ON DELETE SET NULL,
    nome_item VARCHAR(100) NOT NULL,
    preco_unitario_kz DECIMAL(10,2) NOT NULL,
    quantidade INTEGER NOT NULL,
    subtotal_kz DECIMAL(10,2) NOT NULL,
    observacoes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. PAGAMENTOS
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo VARCHAR(30) NOT NULL CHECK (metodo IN ('dinheiro', 'multicaixa', 'multicaixa_express', 'transferencia_bancaria', 'paypal', 'unitel_money', 'atlantico_money')),
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'aprovado', 'recusado', 'estornado', 'cancelado')),
    valor_pago_kz DECIMAL(10,2) NOT NULL,
    referencia_transacao VARCHAR(100),
    comprovativo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_pagamentos_updated_at ON pagamentos;
CREATE TRIGGER update_pagamentos_updated_at
    BEFORE UPDATE ON pagamentos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 13. AVALIACOES
CREATE TABLE IF NOT EXISTS avaliacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
    comentario TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. CUPONS_UTILIZADOS
CREATE TABLE IF NOT EXISTS cupons_utilizados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cupom_id UUID NOT NULL REFERENCES cupons(id) ON DELETE CASCADE,
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    usuario_id UUID,
    valor_desconto_kz DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. LOGS_ACESSO
CREATE TABLE IF NOT EXISTS logs_acesso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID,
    metodo VARCHAR(10),
    url VARCHAR(255),
    ip VARCHAR(45),
    user_agent TEXT,
    status_code INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. PONTOS_FIDELIDADE
CREATE TABLE IF NOT EXISTS pontos_fidelidade (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    pontos INTEGER NOT NULL,
    data_expiracao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. PASSWORD_RESETS
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_avaliacoes_pedido ON avaliacoes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_usuario ON avaliacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_cupons_utilizados_cupom ON cupons_utilizados(cupom_id);
CREATE INDEX IF NOT EXISTS idx_cupons_utilizados_pedido ON cupons_utilizados(pedido_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_usuario ON enderecos_clientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_itens_cardapio_categoria ON itens_cardapio(categoria_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_pedido ON itens_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_itens_pedido_item ON itens_pedido(item_cardapio_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_pedido ON pagamentos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_endereco ON pedidos(endereco_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_mesa ON pedidos(mesa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_reserva ON pedidos(reserva_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cupom ON pedidos(cupom_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON reservas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_reservas_mesa ON reservas(mesa_id);
CREATE INDEX IF NOT EXISTS idx_reservas_data ON reservas(data_reserva);
CREATE INDEX IF NOT EXISTS idx_pontos_fidelidade_usuario ON pontos_fidelidade(usuario_id);

-- =============================================
-- FUNÇÕES E PROCEDURES
-- =============================================

CREATE OR REPLACE FUNCTION buscar_pedidos_por_status(status_busca VARCHAR)
RETURNS TABLE (
    id UUID, numero_pedido INTEGER, usuario_id UUID, tipo VARCHAR(20), status VARCHAR(20),
    endereco_id UUID, mesa_id UUID, taxa_entrega_kz DECIMAL(10,2), distancia_km DECIMAL(5,2),
    subtotal_kz DECIMAL(10,2), desconto_kz DECIMAL(10,2), total_kz DECIMAL(10,2),
    observacoes TEXT, observacoes_entrega TEXT, tempo_estimado INTEGER,
    data_prevista_entrega TIMESTAMP, reserva_id UUID, cupom_id UUID,
    created_at TIMESTAMP, updated_at TIMESTAMP, confirmado_em TIMESTAMP, finalizado_em TIMESTAMP,
    cliente_nome VARCHAR, cliente_telefone VARCHAR, cliente_email VARCHAR, localizacao TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.numero_pedido, p.usuario_id, p.tipo, p.status,
        p.endereco_id, p.mesa_id, p.taxa_entrega_kz, p.distancia_km,
        p.subtotal_kz, p.desconto_kz, p.total_kz, p.observacoes, p.observacoes_entrega,
        p.tempo_estimado, p.data_prevista_entrega, p.reserva_id, p.cupom_id,
        p.created_at, p.updated_at, p.confirmado_em, p.finalizado_em,
        u.nome_completo::VARCHAR, u.telefone::VARCHAR, u.email::VARCHAR,
        CASE WHEN p.tipo = 'entrega' THEN CONCAT(ec.bairro, ', ', ec.municipio, ' - ', ec.provincia)
             WHEN p.tipo = 'mesa' THEN CONCAT('Mesa ', m.numero)
             ELSE 'Retirada' END::TEXT
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN enderecos_clientes ec ON p.endereco_id = ec.id
    LEFT JOIN mesas m ON p.mesa_id = m.id
    WHERE p.status = status_busca
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calcular_taxa_entrega(
    provincia_param VARCHAR, municipio_param VARCHAR, bairro_param VARCHAR,
    OUT taxa_kz DECIMAL(12,2), OUT tempo_estimado INTEGER
) AS $$
DECLARE taxa_base DECIMAL(10,2);
BEGIN
    SELECT ze.taxa_entrega_kz, ze.tempo_estimado_min
    INTO taxa_kz, tempo_estimado
    FROM zonas_entrega ze
    WHERE ze.provincia = provincia_param AND ze.ativa = TRUE
        AND (ze.municipios @> to_jsonb(municipio_param) OR ze.municipios IS NULL OR jsonb_array_length(ze.municipios) = 0)
        AND (ze.bairros @> to_jsonb(bairro_param) OR ze.bairros IS NULL OR jsonb_array_length(ze.bairros) = 0)
    ORDER BY COALESCE(jsonb_array_length(ze.bairros), 0) DESC, COALESCE(jsonb_array_length(ze.municipios), 0) DESC
    LIMIT 1;
    
    IF taxa_kz IS NULL THEN
        SELECT taxa_entrega_base_kz INTO taxa_kz FROM configuracoes_restaurante LIMIT 1;
        tempo_estimado := 45;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION estatisticas_dia(data_referencia DATE)
RETURNS TABLE (
    total_pedidos BIGINT, pedidos_concluidos BIGINT, pedidos_cancelados BIGINT,
    faturamento_kz DECIMAL(10,2), ticket_medio_kz DECIMAL, clientes_atendidos BIGINT,
    entregas BIGINT, mesas_atendidas BIGINT, retiradas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT COUNT(*),
        SUM(CASE WHEN status = 'entregue' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END),
        SUM(CASE WHEN status NOT IN ('cancelado', 'carrinho') THEN total_kz ELSE 0 END),
        AVG(CASE WHEN status NOT IN ('cancelado', 'carrinho') THEN total_kz ELSE NULL END),
        COUNT(DISTINCT usuario_id),
        SUM(CASE WHEN tipo = 'entrega' THEN 1 ELSE 0 END),
        SUM(CASE WHEN tipo = 'mesa' THEN 1 ELSE 0 END),
        SUM(CASE WHEN tipo = 'retirada' THEN 1 ELSE 0 END)
    FROM pedidos WHERE DATE(created_at) = data_referencia;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION obter_saldo_pontos(
    usuario_param UUID, OUT saldo_total INTEGER, OUT pontos_a_expirar INTEGER, OUT data_proxima_expiracao DATE
) AS $$
BEGIN
    SELECT COALESCE(SUM(pontos), 0) INTO saldo_total FROM pontos_fidelidade WHERE usuario_id = usuario_param;
    SELECT COALESCE(SUM(pontos), 0), MIN(data_expiracao)
    INTO pontos_a_expirar, data_proxima_expiracao
    FROM pontos_fidelidade
    WHERE usuario_id = usuario_param AND pontos > 0
        AND data_expiracao BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Configuração do restaurante
INSERT INTO configuracoes_restaurante (nome_restaurante, taxa_entrega_base_kz, tempo_preparo_padrao_min)
VALUES ('Restaurante GHU', 1000.00, 30)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- USUÁRIOS (COM SENHAS ATUALIZADAS)
-- =============================================

-- Limpar usuários existentes para evitar conflitos (opcional - comenta se não quiseres)
-- DELETE FROM usuarios;

-- Admin 1 - Senha: admin123
INSERT INTO usuarios (nome_completo, email, telefone, senha_hash, role, status)
VALUES (
    'Administrador Principal',
    'admin@restauranteghu.com',
    '900000000',
    '$2a$10$Hq0I9THhVCBzT3O2qtR2vOF3lLvvDi.BOKHMcehsC5KgHajtnUtq6',
    'administrador',
    'ativo'
) ON CONFLICT (email) DO UPDATE SET senha_hash = '$2a$10$Hq0I9THhVCBzT3O2qtR2vOF3lLvvDi.BOKHMcehsC5KgHajtnUtq6';

-- Admin 2 - Senha: 123456
INSERT INTO usuarios (nome_completo, email, telefone, senha_hash, role, status)
VALUES (
    'Administrador Principal',
    'admin@rest.com',
    '900000001',
    '$2a$10$lejU2qZwNUFICUoFrGTSgOknFKtPwkI36EhP/b.nQ0gtXk3AO632S',
    'administrador',
    'ativo'
) ON CONFLICT (email) DO UPDATE SET senha_hash = '$2a$10$lejU2qZwNUFICUoFrGTSgOknFKtPwkI36EhP/b.nQ0gtXk3AO632S';

-- Cliente - Senha: cliente123
INSERT INTO usuarios (nome_completo, email, telefone, senha_hash, role, status)
VALUES (
    'eminova tech',
    'eminovatech931@gmail.com',
    '931441110',
    '$2a$10$f4vtKRZtKCgQp7BkDV3Id.i4YJSQr2EyeEPS9jOmhSRCs8JnxHF8W',
    'cliente',
    'ativo'
) ON CONFLICT (email) DO UPDATE SET senha_hash = '$2a$10$f4vtKRZtKCgQp7BkDV3Id.i4YJSQr2EyeEPS9jOmhSRCs8JnxHF8W';

-- =============================================
-- CATEGORIAS
-- =============================================

INSERT INTO categorias (nome, nome_en, descricao, ordem_exibicao, ativo) VALUES
('Entradas', 'Starters', 'Pratos leves para começar a refeição', 1, TRUE),
('Pratos Principais', 'Main Courses', 'Pratos tradicionais angolanos e internacionais', 2, TRUE),
('Grelhados', 'Grilled', 'Carnes e peixes grelhados na brasa', 3, TRUE),
('Bebidas', 'Drinks', 'Sumos, refrigerantes, cervejas e vinhos', 4, TRUE),
('Sobremesas', 'Desserts', 'Doces tradicionais e sobremesas especiais', 5, TRUE),
('Petiscos', 'Snacks', 'Petiscos e aperitivos para partilhar', 6, TRUE),
('Menu Infantil', 'Kids Menu', 'Pratos especiais para os mais pequenos', 7, TRUE),
('Pratos do Dia', 'Daily Specials', 'Pratos especiais disponíveis hoje', 8, TRUE)
ON CONFLICT DO NOTHING;

-- =============================================
-- SEQUÊNCIAS
-- =============================================

SELECT setval('pedidos_numero_pedido_seq', COALESCE((SELECT MAX(numero_pedido) FROM pedidos), 0) + 1);

-- =============================================
-- MENSAGEM FINAL
-- =============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de dados COMPLETA pronta!';
    RAISE NOTICE '   Usuários: admin@rest.com (123456) | admin@restauranteghu.com (admin123) | eminovatech931@gmail.com (cliente123)';
    RAISE NOTICE '   Categorias: 8 categorias criadas';
    RAISE NOTICE '   Tabelas: 17 tabelas + índices + funções';
END $$;