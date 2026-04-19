import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { db } from '../config/database';
import { Logger } from '../utils/logger.util';
import { ValidationError, NotFoundError } from '../utils/errors.util';

export class ReviewController {
  /**
   * GET /api/reviews
   * Listar avaliações com filtros
   */
  static async getReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const { limit = 10, offset = 0, orderBy = 'data_criacao' } = req.query;

      const conn = await db.getConnection();
      try {
        const sql = `
          SELECT 
            a.id,
            a.pedido_id,
            a.usuario_id,
            u.nome as usuario_nome,
            a.nota_comida,
            a.nota_entrega,
            a.nota_atendimento,
            a.nota_preco,
            a.nota_geral,
            a.comentario,
            a.resposta_restaurante,
            a.publicar,
            a.data_criacao,
            a.data_atualizacao
          FROM avaliacoes a
          LEFT JOIN usuarios u ON a.usuario_id = u.id
          WHERE a.publicar = true
          ORDER BY ${orderBy === 'nota_geral' ? 'a.nota_geral' : 'a.data_criacao'} DESC
          LIMIT ? OFFSET ?
        `;

        const [reviews] = await conn.query(sql, [limit, offset]);

        Logger.info(`Avaliações listadas: ${reviews.length}`);

        res.json({
          success: true,
          data: reviews,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
          },
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      Logger.error('Erro ao listar avaliações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar avaliações',
      });
    }
  }

  /**
   * GET /api/reviews/:id
   * Obter avaliação específica
   */
  static async getReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;

      const conn = await db.getConnection();
      try {
        const [reviews] = await conn.query(
          `SELECT * FROM avaliacoes WHERE id = ?`,
          [id]
        );

        if (!reviews || reviews.length === 0) {
          throw new NotFoundError('Avaliação');
        }

        res.json({
          success: true,
          data: reviews[0],
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      Logger.error('Erro ao obter avaliação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter avaliação',
      });
    }
  }

  /**
   * GET /api/restaurant/rating
   * Obter avaliação geral do restaurante
   */
  static async getRestaurantRating(req: Request, res: Response) {
    try {
      const conn = await db.getConnection();
      try {
        const [rating] = await conn.query(
          `SELECT * FROM avaliacao_geral`
        );

        res.json({
          success: true,
          data: rating && rating.length > 0 ? rating[0] : {
            total_avaliacoes: 0,
            media_geral: 0,
            cinco_estrelas: 0,
            quatro_estrelas: 0,
            tres_estrelas: 0,
            baixas_avaliacoes: 0,
          },
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      Logger.error('Erro ao obter avaliação geral:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter avaliação geral',
      });
    }
  }

  /**
   * POST /api/reviews
   * Criar nova avaliação
   */
  static async createReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { pedido_id, nota_comida, nota_entrega, nota_atendimento, nota_preco, comentario } = req.body;
      const usuario_id = req.user?.userId;

      if (!usuario_id) {
        throw new ValidationError('Usuário não autenticado');
      }

      // Validar notas (1-5)
      const notas = [nota_comida, nota_entrega, nota_atendimento, nota_preco];
      for (const nota of notas) {
        if (typeof nota !== 'number' || nota < 1 || nota > 5) {
          throw new ValidationError('Notas devem estar entre 1 e 5');
        }
      }

      // Calcular nota geral
      const nota_geral = Math.round((nota_comida + nota_entrega + nota_atendimento + nota_preco) / 4);

      const conn = await db.getConnection();
      try {
        // Verificar se o pedido pertence ao usuário
        const [pedidos] = await conn.query(
          `SELECT * FROM pedidos WHERE id = ? AND usuario_id = ?`,
          [pedido_id, usuario_id]
        );

        if (!pedidos || pedidos.length === 0) {
          throw new ValidationError('Pedido não encontrado ou não pertence ao usuário');
        }

        // Verificar se já existe avaliação para este pedido
        const [existentes] = await conn.query(
          `SELECT * FROM avaliacoes WHERE pedido_id = ?`,
          [pedido_id]
        );

        if (existentes && existentes.length > 0) {
          throw new ValidationError('Já existe uma avaliação para este pedido');
        }

        // Inserir avaliação
        const reviewId = require('crypto').randomUUID();
        await conn.query(
          `INSERT INTO avaliacoes (
            id, pedido_id, usuario_id, nota_comida, nota_entrega, 
            nota_atendimento, nota_preco, nota_geral, comentario, publicar
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
          [reviewId, pedido_id, usuario_id, nota_comida, nota_entrega, nota_atendimento, nota_preco, nota_geral, comentario || null]
        );

        Logger.info(`Avaliação criada: ${reviewId} por ${usuario_id}`);

        res.status(201).json({
          success: true,
          message: 'Avaliação criada com sucesso',
          data: { id: reviewId },
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      Logger.error('Erro ao criar avaliação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao criar avaliação',
      });
    }
  }

  /**
   * PUT /api/admin/reviews/:id
   * Responder avaliação (restaurante)
   */
  static async respondReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { resposta_restaurante } = req.body;

      if (!resposta_restaurante || resposta_restaurante.trim().length === 0) {
        throw new ValidationError('Resposta não pode estar vazia');
      }

      const conn = await db.getConnection();
      try {
        const [reviews] = await conn.query(
          `SELECT * FROM avaliacoes WHERE id = ?`,
          [id]
        );

        if (!reviews || reviews.length === 0) {
          throw new NotFoundError('Avaliação');
        }

        await conn.query(
          `UPDATE avaliacoes SET resposta_restaurante = ?, data_atualizacao = NOW() WHERE id = ?`,
          [resposta_restaurante, id]
        );

        Logger.info(`Resposta adicionada à avaliação: ${id}`);

        res.json({
          success: true,
          message: 'Resposta registrada com sucesso',
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      Logger.error('Erro ao responder avaliação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao responder avaliação',
      });
    }
  }

  /**
   * GET /api/reviews/order/:orderId
   * Obter avaliação de um pedido específico
   */
  static async getOrderReview(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      const conn = await db.getConnection();
      try {
        const [reviews] = await conn.query(
          `SELECT * FROM avaliacoes WHERE pedido_id = ?`,
          [orderId]
        );

        res.json({
          success: true,
          data: reviews && reviews.length > 0 ? reviews[0] : null,
        });
      } finally {
        conn.release();
      }
    } catch (error) {
      Logger.error('Erro ao obter avaliação do pedido:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter avaliação',
      });
    }
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} não encontrado`);
    this.name = 'NotFoundError';
  }
}
