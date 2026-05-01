import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import {
  CreateItemCardapioDTOSchema,
  UpdateItemCardapioDTOSchema,
} from '../schemas/validation.schemas';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';
import Logger from '../utils/logger.util';

// Helper para transformar dados de item do cardápio (garantir tipos corretos)
function formatMenuItem(item: any) {
  return {
    ...item,
    preco_kz: typeof item.preco_kz === 'string' ? parseFloat(item.preco_kz) : item.preco_kz,
    preco_promocional_kz: item.preco_promocional_kz
      ? typeof item.preco_promocional_kz === 'string'
        ? parseFloat(item.preco_promocional_kz)
        : item.preco_promocional_kz
      : null,
    destaque: Boolean(item.destaque),
    prato_do_dia: Boolean(item.prato_do_dia),
    vegetariano: Boolean(item.vegetariano),
    vegano: Boolean(item.vegano),
    sem_gluten: Boolean(item.sem_gluten),
    picante: Boolean(item.picante),
  };
}

export class MenuController {
  // ============ CATEGORIAS ============

  /**
   * GET /api/menu/categories
   * Listar todas as categorias
   */
  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ativo = req.query.ativo !== 'false';

      const [categories] = await pool.query<any[]>(
        `SELECT * FROM categorias 
                 WHERE ativo = ? 
                 ORDER BY ordem_exibicao ASC, nome ASC`,
        [ativo ? 1 : 0],
      );

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ ITENS DO CARDÁPIO ============

  /**
   * GET /api/menu/items
   * Listar itens do cardápio com filtros
   */
  static async getMenuItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        categoria_id,
        status,
        destaque,
        prato_do_dia,
        vegetariano,
        vegano,
        sem_gluten,
        search,
        page = 1,
        limit = 50,
      } = req.query;

      let sql = `
                SELECT ic.*, c.nome as categoria_nome
                FROM itens_cardapio ic
                LEFT JOIN categorias c ON ic.categoria_id = c.id
                WHERE 1=1
            `;
      const params: any[] = [];

      if (categoria_id) {
        sql += ' AND ic.categoria_id = ?';
        params.push(categoria_id);
      }

      if (status) {
        sql += ' AND ic.status = ?';
        params.push(status);
      } else {
        sql += ' AND ic.status = "disponivel"';
      }

      if (destaque === 'true') {
        sql += ' AND ic.destaque = 1';
      }

      if (prato_do_dia === 'true') {
        sql += ' AND ic.prato_do_dia = 1';
      }

      if (vegetariano === 'true') {
        sql += ' AND ic.vegetariano = 1';
      }

      if (vegano === 'true') {
        sql += ' AND ic.vegano = 1';
      }

      if (sem_gluten === 'true') {
        sql += ' AND ic.sem_gluten = 1';
      }

      if (search) {
        sql += ' AND (ic.nome LIKE ? OR ic.descricao LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      sql += ' ORDER BY ic.ordem_exibicao ASC, ic.nome ASC';

      const offset = (Number(page) - 1) * Number(limit);
      sql += ' LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);

      const [items] = await pool.query<any[]>(sql, params);

      // Contar total
      const countSql = `
                SELECT COUNT(*) as total FROM itens_cardapio ic
                WHERE 1=1
                ${categoria_id ? ' AND ic.categoria_id = ?' : ''}
                ${status ? ' AND ic.status = ?' : ' AND ic.status = "disponivel"'}
                ${destaque === 'true' ? ' AND ic.destaque = 1' : ''}
                ${prato_do_dia === 'true' ? ' AND ic.prato_do_dia = 1' : ''}
                ${vegetariano === 'true' ? ' AND ic.vegetariano = 1' : ''}
                ${vegano === 'true' ? ' AND ic.vegano = 1' : ''}
                ${sem_gluten === 'true' ? ' AND ic.sem_gluten = 1' : ''}
                ${search ? ' AND (ic.nome LIKE ? OR ic.descricao LIKE ?)' : ''}
            `;
      const countParams = params.slice(0, -2);
      const [countResult] = await pool.query<any[]>(countSql, countParams);

      res.json({
        success: true,
        data: items.map(formatMenuItem),
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: countResult[0].total,
          totalPages: Math.ceil(countResult[0].total / Number(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/menu/items/:id
   * Obter item específico
   */
  static async getMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const [items] = await pool.query<any[]>(
        `SELECT ic.*, c.nome as categoria_nome
                 FROM itens_cardapio ic
                 LEFT JOIN categorias c ON ic.categoria_id = c.id
                 WHERE ic.id = ?`,
        [id],
      );

      if (items.length === 0) {
        throw new NotFoundError('Item do cardápio');
      }

      res.json({
        success: true,
        data: formatMenuItem(items[0]),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/menu/items
   * Criar novo item (Admin)
   */
  static async createMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = CreateItemCardapioDTOSchema.parse(req.body);

      // Verificar se categoria existe
      const [categories] = await pool.query<any[]>('SELECT id FROM categorias WHERE id = ?', [
        validatedData.categoria_id,
      ]);

      if (categories.length === 0) {
        throw new BadRequestError('Categoria não encontrada');
      }

      const id = uuidv4();
      const now = new Date();

      await pool.query(
        `INSERT INTO itens_cardapio (
                    id, categoria_id, nome, nome_en, descricao, 
                    preco_kz, preco_promocional_kz, tempo_preparo, calorias,
                    vegetariano, vegano, sem_gluten, picante,
                    destaque, prato_do_dia, imagem, ordem_exibicao,
                    status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          validatedData.categoria_id,
          validatedData.nome,
          validatedData.nome_en || null,
          validatedData.descricao || null,
          validatedData.preco_kz,
          validatedData.preco_promocional_kz || null,
          validatedData.tempo_preparo || null,
          validatedData.calorias || null,
          validatedData.vegetariano ? 1 : 0,
          validatedData.vegano ? 1 : 0,
          validatedData.sem_gluten ? 1 : 0,
          validatedData.picante ? 1 : 0,
          validatedData.destaque ? 1 : 0,
          validatedData.prato_do_dia ? 1 : 0,
          validatedData.imagem || null,
          validatedData.ordem_exibicao || 0,
          'disponivel',
          now,
          now,
        ],
      );

      Logger.info(`Item de cardápio criado: ${id} por ${req.user?.userId}`);

      res.status(201).json({
        success: true,
        message: 'Item criado com sucesso',
        data: { id, ...validatedData },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/menu/items/:id
   * Atualizar item (Admin)
   */
  static async updateMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = UpdateItemCardapioDTOSchema.parse(req.body);

      // Verificar se item existe
      const [items] = await pool.query<any[]>('SELECT * FROM itens_cardapio WHERE id = ?', [id]);

      if (items.length === 0) {
        throw new NotFoundError('Item do cardápio');
      }

      // Se categoria foi fornecida, verificar
      if (validatedData.categoria_id) {
        const [categories] = await pool.query<any[]>('SELECT id FROM categorias WHERE id = ?', [
          validatedData.categoria_id,
        ]);

        if (categories.length === 0) {
          throw new BadRequestError('Categoria não encontrada');
        }
      }

      // Filtrar dados definidos (não undefined)
      const definedData = Object.fromEntries(
        Object.entries(validatedData).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(definedData).length === 0) {
        res.json({
          success: true,
          message: 'Nenhuma alteração necessária',
          data: formatMenuItem(items[0]),
        });
        return;
      }

      // Construir query dinamicamente
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      Object.entries(definedData).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          updateFields.push(`${key} = ${value ? 1 : 0}`);
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });

      const updateQuery = `UPDATE itens_cardapio SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
      updateValues.push(id);

      await pool.query(updateQuery, updateValues);

      Logger.info(`Item atualizado: ${id} por ${req.user?.userId}`);

      res.json({
        success: true,
        message: 'Item atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/menu/items/:id
   * Deletar item (Admin)
   */
  static async deleteMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const [items] = await pool.query<any[]>('SELECT * FROM itens_cardapio WHERE id = ?', [id]);

      if (items.length === 0) {
        throw new NotFoundError('Item do cardápio');
      }

      await pool.query('DELETE FROM itens_cardapio WHERE id = ?', [id]);

      Logger.info(`Item deletado: ${id} por ${req.user?.userId}`);

      res.json({
        success: true,
        message: 'Item deletado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/menu/items/:id/status
   * Atualizar status de um item
   */
  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['disponivel', 'indisponivel', 'esgotado'].includes(status)) {
        throw new BadRequestError('Status inválido. Use: disponivel, indisponivel ou esgotado');
      }

      const [items] = await pool.query<any[]>('SELECT * FROM itens_cardapio WHERE id = ?', [id]);

      if (items.length === 0) {
        throw new NotFoundError('Item do cardápio');
      }

      await pool.query('UPDATE itens_cardapio SET status = ?, updated_at = NOW() WHERE id = ?', [
        status,
        id,
      ]);

      Logger.info(`Status do item atualizado: ${id} -> ${status} por ${req.user?.userId}`);

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
      });
    } catch (error) {
      next(error);
    }
  }
}
