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
                const [mesa] = await query<Mesa[]>(
                    'SELECT * FROM mesas WHERE id = ? AND ativa = TRUE',
                    [mesa_id]
                );
                if (!mesa) {
                    throw new NotFoundError('Mesa não encontrada ou inativa');
                }
                const conflitos = await query<Reserva[]>(
                    `SELECT id FROM reservas 
           WHERE mesa_id = ? 
           AND data_reserva = ? 
           AND status IN ('confirmada', 'em_andamento')
           AND TIME(hora_reserva) BETWEEN 
             TIME_FORMAT(SUBTIME(?, '02:00:00'), '%H:%i:%s') AND 
             TIME_FORMAT(ADDTIME(?, '02:00:00'), '%H:%i:%s')`,
                    [mesa_id, data_reserva, hora_reserva, hora_reserva]
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendente', ?, ?)`,
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
        WHERE r.usuario_id = ?
      `;
            const params: any[] = [userId];

            if (status) {
                sql += ' AND r.status = ?';
                params.push(status);
            }
            if (data_inicial) {
                sql += ' AND r.data_reserva >= ?';
                params.push(data_inicial);
            }
            if (data_final) {
                sql += ' AND r.data_reserva <= ?';
                params.push(data_final);
            }

            sql += ' ORDER BY r.data_reserva DESC, r.hora_reserva DESC';

            const parsedLimit = Math.max(1, parseInt(limit as string, 10) || 20);
            const parsedOffset = Math.max(0, (parseInt(page as string, 10) - 1) * parsedLimit);

            sql += ` LIMIT ${parsedLimit} OFFSET ${parsedOffset}`;

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

            const [reserva] = await query<Reserva[]>(
                'SELECT * FROM reservas WHERE id = ?',
                [id]
            );
            if (!reserva) throw new NotFoundError('Reserva');

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
                'UPDATE reservas SET status = "cancelada", updated_at = NOW() WHERE id = ?',
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

            if (status) {
                sql += ' AND r.status = ?';
                params.push(status);
            }
            if (data) {
                sql += ' AND r.data_reserva = ?';
                params.push(data);
            } else {
                sql += ' AND r.data_reserva >= CURDATE()';
            }
            if (mesa_id) {
                sql += ' AND r.mesa_id = ?';
                params.push(mesa_id);
            }

            sql += ' ORDER BY r.data_reserva ASC, r.hora_reserva ASC';

            const parsedLimit = Math.max(1, parseInt(limit as string, 10) || 50);
            const parsedOffset = Math.max(0, (parseInt(page as string, 10) - 1) * parsedLimit);

            sql += ` LIMIT ${parsedLimit} OFFSET ${parsedOffset}`;

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
         WHERE id = ?`,
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
         WHERE id = ?`,
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
         WHERE id = ?`,
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