import { Request, Response } from 'express';
import { query } from '../config/database';
import Logger from '../utils/logger.util';

export class ReviewController {
  static async getReviews(req: Request, res: Response) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const reviews = await query<any[]>(
        `SELECT a.*, u.nome_completo as usuario_nome
         FROM avaliacoes a
         LEFT JOIN usuarios u ON a.usuario_id = u.id
         ORDER BY a.created_at DESC
         LIMIT ? OFFSET ?`,
        [Number(limit), Number(offset)]
      );
      res.json({ success: true, data: reviews });
    } catch (error: any) {
      Logger.error('Erro ao listar avaliações:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar avaliações' });
    }
  }

  static async getReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const [reviews] = await query<any[]>(
        'SELECT * FROM avaliacoes WHERE id = ?', [id]
      );
      if (!reviews || reviews.length === 0) {
        return res.status(404).json({ success: false, message: 'Avaliação não encontrada' });
      }
      return res.json({ success: true, data: reviews[0] });
    } catch (error: any) {
      Logger.error('Erro ao obter avaliação:', error);
      return res.status(500).json({ success: false, message: 'Erro ao obter avaliação' });
    }
  }

  static async getRestaurantRating(_req: Request, res: Response) {
    try {
      const result = await query<any[]>(
        `SELECT COUNT(*) as total_avaliacoes, ROUND(AVG(nota), 1) as media_geral FROM avaliacoes`
      );
      res.json({
        success: true,
        data: result[0] || { total_avaliacoes: 0, media_geral: 0 },
      });
    } catch (error: any) {
      Logger.error('Erro ao obter avaliação geral:', error);
      res.status(500).json({ success: false, message: 'Erro ao obter avaliação geral' });
    }
  }

  static async createReview(req: Request, res: Response) {
    try {
      const { pedido_id, nota, comentario } = req.body;
      const usuario_id = (req as any).user?.userId;
      if (!usuario_id) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado' });
      }
      if (typeof nota !== 'number' || nota < 1 || nota > 5) {
        return res.status(400).json({ success: false, message: 'Nota deve estar entre 1 e 5' });
      }
      const reviewId = require('crypto').randomUUID();
      await query(
        'INSERT INTO avaliacoes (id, pedido_id, usuario_id, nota, comentario) VALUES (?, ?, ?, ?, ?)',
        [reviewId, pedido_id, usuario_id, nota, comentario || null]
      );
      res.status(201).json({ success: true, message: 'Avaliação criada com sucesso', data: { id: reviewId } });
    } catch (error: any) {
      Logger.error('Erro ao criar avaliação:', error);
      return res.status(500).json({ success: false, message: 'Erro ao criar avaliação' });
    }
  }

  static async respondReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { resposta_restaurante } = req.body;
      if (!resposta_restaurante) {
        return res.status(400).json({ success: false, message: 'Resposta não pode estar vazia' });
      }
      await query('UPDATE avaliacoes SET resposta_restaurante = ? WHERE id = ?', [resposta_restaurante, id]);
      res.json({ success: true, message: 'Resposta registrada com sucesso' });
    } catch (error: any) {
      Logger.error('Erro ao responder avaliação:', error);
      return res.status(500).json({ success: false, message: 'Erro ao responder avaliação' });
    }
  }

  static async getOrderReview(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const [reviews] = await query<any[]>(
        'SELECT * FROM avaliacoes WHERE pedido_id = ?', [orderId]
      );
      res.json({ success: true, data: reviews?.[0] || null });
    } catch (error: any) {
      Logger.error('Erro ao obter avaliação do pedido:', error);
      res.status(500).json({ success: false, message: 'Erro ao obter avaliação' });
    }
  }
}