/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable comma-dangle */
import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import {
    Mesa,
    Reserva,
    CreateReservaDTO,
    ApiResponse,
} from '../types';
import {
    NotFoundError,
    BadRequestError,
    ConflictError,
    ForbiddenError,
} from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';

export class ReservationController {
    static async createReservation(
        req: Request<{}, {}, CreateReservaDTO>,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const {
                mesa_id,
                nome_cliente,
                telefone_cliente,
                email_cliente,
                quantidade_pessoas,
                data_reserva,
                hora_reserva,
                ocasiao_especial,
                observacoes,
            } = req.body;

            if (!nome_cliente || !telefone_cliente || !quantidade_pessoas || !data_reserva || !hora_reserva) {
                throw new BadRequestError('Nome, telefone, quantidade de pessoas, data e hora são obrigatórios');
            }

            const dataReserva = new Date(data_reserva + ' ' + hora_reserva);
            if (dataReserva < new Date()) {
                throw new BadRequestError('A data e hora da reserva devem ser futuras');
            }

            if (mesa_id) {
                const mesaResult = await query<Mesa[]>(
                    'SELECT * FROM mesas WHERE id = $1 AND ativa = TRUE',
                    [mesa_id]
                );
                if (!mesaResult[0]) {
                    throw new NotFoundError('Mesa não encontrada ou inativa');
                }
                const mesa = mesaResult[0];

                const conflitos = await query<Reserva[]>(
                    `SELECT id FROM reservas 
           WHERE mesa_id = $1 
           AND data_reserva = $2 
           AND status IN ('confirmada', 'em_andamento')
           AND hora_reserva BETWEEN 
             ($3::time - interval '2 hours') AND 
             ($3::time + interval '2 hours')`,
                    [mesa_id, data_reserva, hora_reserva]
                );
                if (conflitos.length > 0) {
                    throw new ConflictError('Mesa já reservada neste horário');
                }
                if (quantidade_pessoas > mesa.capacidade) {
                    throw new BadRequestError(`Mesa só comporta ${mesa.capacidade} pessoa(s)`);
                }
            }

            const reservaId = uuidv4();
            await query(
                `INSERT INTO reservas (
          id, usuario_id, mesa_id, nome_cliente, telefone_cliente,
          email_cliente, quantidade_pessoas, data_reserva, hora_reserva,
          status, ocasiao_especial, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pendente', $10, $11)`,
                [
                    reservaId,
                    userId || null,
                    mesa_id || null,
                    nome_cliente,
                    telefone_cliente,
                    email_cliente || null,
                    quantidade_pessoas,
                    data_reserva,
                    hora_reserva,
                    ocasiao_especial || null,
                    observacoes || null,
                ]
            );

            res.status(201).json({
                success: true,
                message: 'Reserva criada com sucesso',
                data: { id: reservaId },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMyReservations(
        req: Request,
        res: Response<ApiResponse<Reserva[]>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req as any).user?.userId;
            const { status, data_inicial, data_final, page = 1, limit = 20 } = req.query;

            let sql = `
        SELECT r.*, m.numero as mesa_numero, m.capacidade as mesa_capacidade
        FROM reservas r
        LEFT JOIN mesas m ON r.mesa_id = m.id
        WHERE r.usuario_id = $1
      `;
            const params: any[] = [userId];
            let paramCount = 1;

            if (status) {
                paramCount++;
                sql += ` AND r.status = $${paramCount}`;
                params.push(status);
            }
            if (data_inicial) {
                paramCount++;
                sql += ` AND r.data_reserva >= $${paramCount}`;
                params.push(data_inicial);
            }
            if (data_final) {
                paramCount++;
                sql += ` AND r.data_reserva <= $${paramCount}`;
                params.push(data_final);
            }

            sql += ' ORDER BY r.data_reserva DESC, r.hora_reserva DESC';

            const parsedLimit = Math.max(1, parseInt(limit as string, 10) || 20);
            const parsedOffset = Math.max(0, (parseInt(page as string, 10) - 1) * parsedLimit);

            paramCount++;
            sql += ` LIMIT $${paramCount}`;
            params.push(parsedLimit);
            paramCount++;
            sql += ` OFFSET $${paramCount}`;
            params.push(parsedOffset);

            const reservations = await query<Reserva[]>(sql, params);

            res.json({
                success: true,
                data: reservations,
            });
        } catch (error) {
            next(error);
        }
    }

    static async cancelReservation(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.userId;
            const userRole = (req as any).user?.role;

            const reservaResult = await query<Reserva[]>(
                'SELECT * FROM reservas WHERE id = $1',
                [id]
            );
            if (!reservaResult[0]) throw new NotFoundError('Reserva');

            const reserva = reservaResult[0];

            if (
                userRole !== 'administrador' &&
                userRole !== 'gerente' &&
                reserva.usuario_id !== userId
            ) {
                throw new ForbiddenError('Você não tem permissão para cancelar esta reserva');
            }
            if (['finalizada', 'cancelada'].includes(reserva.status)) {
                throw new BadRequestError('Reserva já finalizada ou cancelada');
            }

            await query(
                "UPDATE reservas SET status = 'cancelada', updated_at = NOW() WHERE id = $1",
                [id]
            );

            res.json({
                success: true,
                message: 'Reserva cancelada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllReservations(
        req: Request,
        res: Response<ApiResponse<Reserva[]>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { status, data, mesa_id, page = 1, limit = 50 } = req.query;

            let sql = `
        SELECT r.*, 
               m.numero as mesa_numero,
               m.capacidade as mesa_capacidade,
               u.nome_completo as usuario_nome
        FROM reservas r
        LEFT JOIN mesas m ON r.mesa_id = m.id
        LEFT JOIN usuarios u ON r.usuario_id = u.id
        WHERE 1=1
      `;
            const params: any[] = [];
            let paramCount = 0;

            if (status) {
                paramCount++;
                sql += ` AND r.status = $${paramCount}`;
                params.push(status);
            }
            if (data) {
                paramCount++;
                sql += ` AND r.data_reserva = $${paramCount}`;
                params.push(data);
            } else {
                sql += ' AND r.data_reserva >= CURRENT_DATE';
            }
            if (mesa_id) {
                paramCount++;
                sql += ` AND r.mesa_id = $${paramCount}`;
                params.push(mesa_id);
            }

            sql += ' ORDER BY r.data_reserva ASC, r.hora_reserva ASC';

            const parsedLimit = Math.max(1, parseInt(limit as string, 10) || 50);
            const parsedOffset = Math.max(0, (parseInt(page as string, 10) - 1) * parsedLimit);

            paramCount++;
            sql += ` LIMIT $${paramCount}`;
            params.push(parsedLimit);
            paramCount++;
            sql += ` OFFSET $${paramCount}`;
            params.push(parsedOffset);

            const reservations = await query<Reserva[]>(sql, params);

            res.json({
                success: true,
                data: reservations,
            });
        } catch (error) {
            next(error);
        }
    }

    static async confirmReservation(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            await query(
                `UPDATE reservas 
         SET status = 'confirmada', confirmada_em = NOW(), updated_at = NOW() 
         WHERE id = $1`,
                [id]
            );

            res.json({
                success: true,
                message: 'Reserva confirmada com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    static async checkIn(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            await query(
                `UPDATE reservas 
         SET status = 'em_andamento', check_in_em = NOW(), updated_at = NOW() 
         WHERE id = $1`,
                [id]
            );

            res.json({
                success: true,
                message: 'Check-in realizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    static async checkOut(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;

            await query(
                `UPDATE reservas 
         SET status = 'finalizada', check_out_em = NOW(), updated_at = NOW() 
         WHERE id = $1`,
                [id]
            );

            res.json({
                success: true,
                message: 'Check-out realizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }
}