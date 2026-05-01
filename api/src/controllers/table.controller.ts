import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { Mesa, ApiResponse } from '../types';
import {
    NotFoundError,
    BadRequestError,
} from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';

export class TableController {
    static async getTables(
        req: Request,
        res: Response<ApiResponse<Mesa[]>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { ativa, tipo, localizacao } = req.query;

            let sql = 'SELECT * FROM mesas WHERE 1=1';
            const params: any[] = [];

            if (ativa !== undefined) {
                sql += ' AND ativa = ?';
                params.push(ativa === 'true');
            }
            if (tipo) {
                sql += ' AND tipo = ?';
                params.push(tipo);
            }
            if (localizacao) {
                sql += ' AND localizacao LIKE ?';
                params.push(`%${localizacao}%`);
            }

            sql += ' ORDER BY numero ASC';
            const tables = await query<Mesa[]>(sql, params);
            res.json({ success: true, data: tables });
        } catch (error) {
            next(error);
        }
    }

    static async getTableStatus(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { data } = req.query;
            const dataConsulta = data || new Date().toISOString().split('T')[0];

            const tables = await query<any[]>(
                `SELECT 
          m.id, m.numero, m.capacidade, m.localizacao, m.tipo, m.ativa,
          r.id as reserva_id, r.nome_cliente, r.telefone_cliente, r.quantidade_pessoas,
          r.hora_reserva, r.status as status_reserva, r.ocasiao_especial,
          CASE 
            WHEN r.status = 'em_andamento' THEN 'ocupada'
            WHEN r.status = 'confirmada' AND r.data_reserva = ? THEN 'reservada'
            ELSE 'disponivel'
          END as status_mesa
        FROM mesas m
        LEFT JOIN reservas r ON m.id = r.mesa_id 
          AND r.data_reserva = ?
          AND r.status IN ('confirmada', 'em_andamento')
        WHERE m.ativa = TRUE
        ORDER BY m.numero ASC`,
                [dataConsulta, dataConsulta]
            );

            res.json({ success: true, data: tables });
        } catch (error) {
            next(error);
        }
    }

    static async createTable(req: Request, res: Response<ApiResponse>, next: NextFunction) {
        try {
            const { numero, capacidade, localizacao, tipo, observacoes } = req.body;
            if (!numero || !capacidade) throw new BadRequestError('Número e capacidade são obrigatórios');
            if (capacidade < 1) throw new BadRequestError('Capacidade deve ser maior que zero');

            const existing = await query<Mesa[]>('SELECT id FROM mesas WHERE numero = ?', [numero]);
            if (existing.length > 0) throw new BadRequestError('Já existe uma mesa com este número');

            const mesaId = uuidv4();
            await query(
                `INSERT INTO mesas (id, numero, capacidade, localizacao, tipo, observacoes, ativa)
         VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
                [mesaId, numero, capacidade, localizacao || null, tipo || 'normal', observacoes || null]
            );

            res.status(201).json({ success: true, message: 'Mesa criada com sucesso', data: { id: mesaId } });
        } catch (error) {
            next(error);
        }
    }

    static async updateTable(req: Request, res: Response<ApiResponse>, next: NextFunction) {
        try {
            const { id } = req.params;
            const { numero, capacidade, localizacao, tipo, observacoes } = req.body;
            const [mesa] = await query<Mesa[]>('SELECT id FROM mesas WHERE id = ?', [id]);
            if (!mesa) throw new NotFoundError('Mesa');

            if (numero) {
                const existing = await query<Mesa[]>('SELECT id FROM mesas WHERE numero = ? AND id != ?', [numero, id]);
                if (existing.length > 0) throw new BadRequestError('Já existe uma mesa com este número');
            }

            await query(
                `UPDATE mesas SET 
         numero = COALESCE(?, numero),
         capacidade = COALESCE(?, capacidade),
         localizacao = COALESCE(?, localizacao),
         tipo = COALESCE(?, tipo),
         observacoes = COALESCE(?, observacoes)
         WHERE id = ?`,
                [numero, capacidade, localizacao, tipo, observacoes, id]
            );

            res.json({ success: true, message: 'Mesa atualizada com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    static async toggleTableStatus(req: Request, res: Response<ApiResponse>, next: NextFunction) {
        try {
            const { id } = req.params;
            const { ativa } = req.body;
            await query('UPDATE mesas SET ativa = ? WHERE id = ?', [ativa, id]);
            res.json({ success: true, message: `Mesa ${ativa ? 'ativada' : 'desativada'} com sucesso` });
        } catch (error) {
            next(error);
        }
    }

    static async deleteTable(req: Request, res: Response<ApiResponse>, next: NextFunction) {
        try {
            const { id } = req.params;
            const reservas = await query<any[]>(`SELECT id FROM reservas WHERE mesa_id = ? AND data_reserva >= CURDATE() AND status IN ('pendente', 'confirmada')`, [id]);
            if (reservas.length > 0) throw new BadRequestError('Não é possível deletar mesa com reservas futuras');

            await query('DELETE FROM mesas WHERE id = ?', [id]);
            res.json({ success: true, message: 'Mesa deletada com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}