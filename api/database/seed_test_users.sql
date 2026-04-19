-- Script para inserir usuários de teste para cada role
-- Execute este script no banco de dados restaurante_angola_db

-- Senha hash para '123456' (gerada com bcrypt)
-- IMPORTANTE: Em produção, use senhas fortes e únicas!

INSERT INTO usuarios (id, nome_completo, email, telefone, senha_hash, role, status) VALUES
-- Administrador
('admin-001', 'Administrador Sistema', 'admin@restauranteghu.ao', '911111111', '$2a$10$GERpp9ZlYZG/An0xEibYq..4ZqHHF8lPBFuEMYc.oL2gQ1i1p2PMq', 'administrador', 'ativo'),

-- Gerente
('manager-001', 'João Silva', 'gerente@restauranteghu.ao', '922222222', '$2a$10$GERpp9ZlYZG/An0xEibYq..4ZqHHF8lPBFuEMYc.oL2gQ1i1p2PMq', 'gerente', 'ativo'),

-- Garçom
('waiter-001', 'Maria Santos', 'garcom@restauranteghu.ao', '933333333', '$2a$10$GERpp9ZlYZG/An0xEibYq..4ZqHHF8lPBFuEMYc.oL2gQ1i1p2PMq', 'garcom', 'ativo'),

-- Cozinha
('kitchen-001', 'Carlos Oliveira', 'cozinha@restauranteghu.ao', '944444444', '$2a$10$GERpp9ZlYZG/An0xEibYq..4ZqHHF8lPBFuEMYc.oL2gQ1i1p2PMq', 'cozinha', 'ativo'),

-- Entregador
('delivery-001', 'Ana Costa', 'entregador@restauranteghu.ao', '955555555', '$2a$10$GERpp9ZlYZG/An0xEibYq..4ZqHHF8lPBFuEMYc.oL2gQ1i1p2PMq', 'entregador', 'ativo'),

-- Cliente (já existe no dump)
-- ('879216dd-0298-44bc-8fb2-4173885e5ded', 'eminova tech', 'eminovatech931@gmail.com', '931441110', '$2a$10$GERpp9ZlYZG/An0xEibYq..4ZqHHF8lPBFuEMYc.oL2gQ1i1p2PMq', 'cliente', 'ativo'),

-- Cliente adicional
('client-002', 'Pedro Rodrigues', 'cliente2@restauranteghu.ao', '966666666', '$2a$10$GERpp9ZlYZG/An0xEibYq..4ZqHHF8lPBFuEMYc.oL2gQ1i1p2PMq', 'cliente', 'ativo')

ON DUPLICATE KEY UPDATE
    nome_completo = VALUES(nome_completo),
    email = VALUES(email),
    senha_hash = VALUES(senha_hash),
    role = VALUES(role),
    status = VALUES(status);

-- Inserir algumas mesas de exemplo
INSERT INTO mesas (id, numero, capacidade, tipo, ativa) VALUES
('table-001', '1', 4, 'normal', 1),
('table-002', '2', 2, 'casal', 1),
('table-003', '3', 6, 'familia', 1),
('table-004', '4', 8, 'vip', 1),
('table-005', '5', 4, 'normal', 1)
ON DUPLICATE KEY UPDATE
    numero = VALUES(numero),
    capacidade = VALUES(capacidade),
    tipo = VALUES(tipo),
    ativa = VALUES(ativa);

-- Inserir algumas categorias de exemplo
INSERT INTO categorias (id, nome, nome_en, ativo) VALUES
('cat-001', 'Entradas', 'Appetizers', 1),
('cat-002', 'Pratos Principais', 'Main Courses', 1),
('cat-003', 'Sobremesas', 'Desserts', 1),
('cat-004', 'Bebidas', 'Drinks', 1)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    nome_en = VALUES(nome_en),
    ativo = VALUES(ativo);

-- Inserir alguns itens do cardápio de exemplo
INSERT INTO itens_cardapio (id, categoria_id, nome, descricao, preco_kz, status, destaque) VALUES
('item-001', 'cat-001', 'Calulu de Peixe', 'Tradicional prato angolano com peixe fresco', 2500.00, 'disponivel', 1),
('item-002', 'cat-002', 'Moqueca de Peixe', 'Peixe cozido com molho de tomate e cebola', 3500.00, 'disponivel', 1),
('item-003', 'cat-003', 'Bolo de Chocolate', 'Bolo caseiro com cobertura de chocolate', 1200.00, 'disponivel', 0),
('item-004', 'cat-004', 'Cerveja Cuca', 'Cerveja angolana premium', 800.00, 'disponivel', 0)
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome),
    descricao = VALUES(descricao),
    preco_kz = VALUES(preco_kz),
    status = VALUES(status),
    destaque = VALUES(destaque);

COMMIT;