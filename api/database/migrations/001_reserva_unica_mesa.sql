-- =============================================
-- MIGRATION: Impedir reservas duplicadas na mesma mesa
-- Data: 29/05/2026
-- =============================================

-- Índice único condicional: apenas para reservas com status ATIVO
-- Uma mesa não pode ter duas reservas ativas no mesmo dia e hora
CREATE UNIQUE INDEX IF NOT EXISTS idx_reserva_unica_mesa_ativa
ON reservas (mesa_id, data_reserva, hora_reserva)
WHERE status IN ('pendente', 'confirmada', 'em_andamento');

-- Também impede que a mesma mesa seja reservada para horários sobrepostos
-- (mesma data, horas próximas até 2h de diferença)
-- Esta regra é aplicada no backend, mas o índice acima já cobre o caso exato