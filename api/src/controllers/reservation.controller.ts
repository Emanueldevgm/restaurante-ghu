/* eslint-disable quotes */
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
  /**
   * Criar uma nova reserva
   * 
   * Regras de negócio:
   * 1. Mesa deve existir e estar ativa
   * 2. Capacidade da mesa deve ser suficiente
   * 3. Não pode haver outra reserva ATIVA para a mesma mesa no mesmo horário
   * 4. Data/hora da reserva devem ser futuras
   */
  static async createReservation(
    req: Request<Record<string, never>, Record<string, never>, CreateReservaDTO>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as Request & { user?: { userId: string } }).user?.userId;
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

      // Validação de campos obrigatórios
      if (!nome_cliente || !telefone_cliente || !quantidade_pessoas || !data_reserva || !hora_reserva) {
        throw new BadRequestError(
          'Nome, telefone, quantidade de pessoas, data e hora são obrigatórios'
        );
      }

      // Validação de data futura
      const dataReserva = new Date(`${data_reserva}T${hora_reserva}`);
      if (dataReserva < new Date()) {
        throw new BadRequestError('A data e hora da reserva devem ser futuras');
      }

      // Validação da mesa (se fornecida)
      if (mesa_id) {
        const mesaResult = await query<Mesa[]>(
          'SELECT * FROM mesas WHERE id = $1 AND ativa = TRUE',
          [mesa_id]
        );

        if (!mesaResult[0]) {
          throw new NotFoundError('Mesa não encontrada ou inativa');
        }

        const mesa = mesaResult[0];

        // Verificar capacidade
        if (quantidade_pessoas > mesa.capacidade) {
          throw new BadRequestError(
            `A mesa ${mesa.numero} comporta apenas ${mesa.capacidade} pessoa(s). ` +
            `Sua reserva é para ${quantidade_pessoas} pessoa(s).`
          );
        }

        // ============================================
        // REGRA DE NEGÓCIO: MESA NÃO PODE SER RESERVADA
        // POR MAIS DE UMA PESSOA NO MESMO HORÁRIO
        // ============================================
        const conflitos = await query<Reserva[]>(
          `SELECT id, nome_cliente, status 
           FROM reservas 
           WHERE mesa_id = $1 
             AND data_reserva = $2::date 
             AND hora_reserva = $3::time
             AND status IN ('pendente', 'confirmada', 'em_andamento')`,
          [mesa_id, data_reserva, hora_reserva]
        );

        if (conflitos.length > 0) {
          const conflito = conflitos[0];
          throw new ConflictError(
            `A mesa ${mesa.numero} já está reservada para ${hora_reserva} do dia ${data_reserva}. ` +
            `Reserva de "${conflito.nome_cliente}" (status: ${conflito.status}). ` +
            `Por favor, escolha outro horário ou outra mesa.`
          );
        }
      }

      // Criar reserva
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

  /**
   * Listar reservas do utilizador autenticado
   */
  static async getMyReservations(
    req: Request,
    res: Response<ApiResponse<Reserva[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req as Request & { user?: { userId: string } }).user?.userId;
      const { status, data_inicial, data_final, page = '1', limit = '20' } = req.query as Record<string, string>;

      let sql = `
        SELECT r.*, m.numero as mesa_numero, m.capacidade as mesa_capacidade
        FROM reservas r
        LEFT JOIN mesas m ON r.mesa_id = m.id
        WHERE r.usuario_id = $1
      `;
      const params: (string | number)[] = [userId!];
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

      const parsedLimit = Math.max(1, parseInt(limit, 10) || 20);
      const parsedOffset = Math.max(0, (parseInt(page, 10) - 1) * parsedLimit);

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

  /**
   * Cancelar uma reserva
   */
  static async cancelReservation(
    req: Request<{ id: string }>,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as Request & { user?: { userId: string; role: string } }).user?.userId;
      const userRole = (req as Request & { user?: { userId: string; role: string } }).user?.role;

      const reservaResult = await query<Reserva[]>(
        'SELECT * FROM reservas WHERE id = $1',
        [id]
      );

      if (!reservaResult[0]) {
        throw new NotFoundError('Reserva');
      }

      const reserva = reservaResult[0];

      // Verificar permissão
      if (
        userRole !== 'administrador' &&
        userRole !== 'gerente' &&
        reserva.usuario_id !== userId
      ) {
        throw new ForbiddenError('Você não tem permissão para cancelar esta reserva');
      }

      // Verificar se já está finalizada ou cancelada
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

  /**
   * Listar todas as reservas (admin)
   */
  static async getAllReservations(
    req: Request,
    res: Response<ApiResponse<Reserva[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status, data, mesa_id, page = '1', limit = '50' } = req.query as Record<string, string>;

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
      const params: (string | number)[] = [];
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

      const parsedLimit = Math.max(1, parseInt(limit, 10) || 50);
      const parsedOffset = Math.max(0, (parseInt(page, 10) - 1) * parsedLimit);

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

  /**
   * Confirmar uma reserva (admin)
   */
  static async confirmReservation(
    req: Request<{ id: string }>,
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

  /**
   * Check-in da reserva (admin)
   */
  static async checkIn(
    req: Request<{ id: string }>,
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

  /**
   * Check-out da reserva (admin)
   */
  static async checkOut(
    req: Request<{ id: string }>,
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