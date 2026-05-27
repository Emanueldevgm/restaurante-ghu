/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import {
  CreateItemCardapioDTOSchema,
  UpdateItemCardapioDTOSchema,
} from '../schemas/validation.schemas';
import { BadRequestError, NotFoundError } from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';
import Logger from '../utils/logger.util';
import path from 'path';
import fs from 'fs';

// Helper para transformar dados de item do cardápio
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

  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ativo = req.query.ativo !== 'false';

      const categories = await query<any[]>(
        `SELECT * FROM categorias 
         WHERE ativo = $1 
         ORDER BY ordem_exibicao ASC, nome ASC`,
        [ativo],
      );

      res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  // Criar categoria
  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, nome_en, descricao, imagem } = req.body;
      if (!nome) throw new BadRequestError('Nome da categoria é obrigatório');

      const id = uuidv4();
      await query(
        `INSERT INTO categorias (id, nome, nome_en, descricao, imagem, ativo, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())`,
        [id, nome, nome_en || null, descricao || null, imagem || null]
      );

      Logger.info(`Categoria criada: ${id} - ${nome}`);
      res.status(201).json({ success: true, message: 'Categoria criada com sucesso', data: { id, nome } });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar categoria
  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { nome, nome_en, descricao, imagem, ativo } = req.body;

      const categories = await query<any[]>('SELECT id FROM categorias WHERE id = $1', [id]);
      if (categories.length === 0) throw new NotFoundError('Categoria');

      await query(
        `UPDATE categorias SET 
          nome = COALESCE($1, nome),
          nome_en = COALESCE($2, nome_en),
          descricao = COALESCE($3, descricao),
          imagem = COALESCE($4, imagem),
          ativo = COALESCE($5, ativo),
          updated_at = NOW()
        WHERE id = $6`,
        [nome, nome_en, descricao, imagem, ativo, id]
      );

      res.json({ success: true, message: 'Categoria atualizada com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Deletar categoria
  static async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const categories = await query<any[]>('SELECT id FROM categorias WHERE id = $1', [id]);
      if (categories.length === 0) throw new NotFoundError('Categoria');

      await query('UPDATE itens_cardapio SET categoria_id = NULL WHERE categoria_id = $1', [id]);
      await query('DELETE FROM categorias WHERE id = $1', [id]);

      res.json({ success: true, message: 'Categoria removida com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ITENS DO CARDÁPIO ============

  static async getMenuItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        categoria_id, status, destaque, prato_do_dia,
        vegetariano, vegano, sem_gluten, search,
        page = 1, limit = 50,
      } = req.query;

      let sql = `
        SELECT ic.*, c.nome as categoria_nome
        FROM itens_cardapio ic
        LEFT JOIN categorias c ON ic.categoria_id = c.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (categoria_id) {
        sql += ' AND ic.categoria_id = $' + (params.length + 1);
        params.push(categoria_id);
      }

      if (status) {
        sql += ' AND ic.status = $' + (params.length + 1);
        params.push(status);
      } else {
        sql += ' AND ic.status = $' + (params.length + 1);
        params.push('disponivel');
      }

      if (destaque === 'true') sql += ' AND ic.destaque = TRUE';
      if (prato_do_dia === 'true') sql += ' AND ic.prato_do_dia = TRUE';
      if (vegetariano === 'true') sql += ' AND ic.vegetariano = TRUE';
      if (vegano === 'true') sql += ' AND ic.vegano = TRUE';
      if (sem_gluten === 'true') sql += ' AND ic.sem_gluten = TRUE';

      if (search) {
        const p1 = params.length + 1;
        const p2 = params.length + 2;
        sql += ` AND (ic.nome LIKE $${p1} OR ic.descricao LIKE $${p2})`;
        params.push(`%${search}%`, `%${search}%`);
      }

      sql += ' ORDER BY ic.ordem_exibicao ASC, ic.nome ASC';

      const offset = (Number(page) - 1) * Number(limit);
      const pLimit = params.length + 1;
      const pOffset = params.length + 2;
      sql += ` LIMIT $${pLimit} OFFSET $${pOffset}`;
      params.push(Number(limit), offset);

      const items = await query<any[]>(sql, params);

      res.json({
        success: true,
        data: items.map(formatMenuItem),
        pagination: { page: Number(page), limit: Number(limit), total: items.length },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const items = await query<any[]>(
        `SELECT ic.*, c.nome as categoria_nome
         FROM itens_cardapio ic
         LEFT JOIN categorias c ON ic.categoria_id = c.id
         WHERE ic.id = $1`,
        [id],
      );

      if (items.length === 0) throw new NotFoundError('Item do cardápio');
      res.json({ success: true, data: formatMenuItem(items[0]) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/menu/items
   * Criar novo item (Admin) - Com suporte a upload de imagem
   */
  static async createMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Se tem ficheiro, extrai o caminho; senão, usa o body normalmente
      const imagem = req.file ? `/uploads/menu/${req.file.filename}` : req.body.imagem || null;

      // Preparar dados para validação
      const rawData = {
        ...req.body,
        imagem: imagem,
        // Converter strings para boolean se necessário
        vegetariano: req.body.vegetariano === 'true' || req.body.vegetariano === true,
        vegano: req.body.vegano === 'true' || req.body.vegano === true,
        sem_gluten: req.body.sem_gluten === 'true' || req.body.sem_gluten === true,
        picante: req.body.picante === 'true' || req.body.picante === true,
        destaque: req.body.destaque === 'true' || req.body.destaque === true,
        prato_do_dia: req.body.prato_do_dia === 'true' || req.body.prato_do_dia === true,
      };

      const validatedData = CreateItemCardapioDTOSchema.parse(rawData);

      // Verificar se categoria existe
      const categories = await query<any[]>('SELECT id FROM categorias WHERE id = $1', [
        validatedData.categoria_id,
      ]);
      if (categories.length === 0) throw new BadRequestError('Categoria não encontrada');

      const id = uuidv4();

      await query(
        `INSERT INTO itens_cardapio (
          id, categoria_id, nome, nome_en, descricao,
          preco_kz, preco_promocional_kz, tempo_preparo, calorias,
          vegetariano, vegano, sem_gluten, picante,
          destaque, prato_do_dia, imagem, ordem_exibicao,
          status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
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
          validatedData.vegetariano,
          validatedData.vegano,
          validatedData.sem_gluten,
          validatedData.picante,
          validatedData.destaque,
          validatedData.prato_do_dia,
          validatedData.imagem || null,
          validatedData.ordem_exibicao || 0,
          'disponivel',
          new Date(),
          new Date(),
        ],
      );

      Logger.info(`Item de cardápio criado: ${id} por ${(req as any).user?.userId}`);

      res.status(201).json({
        success: true,
        message: 'Item criado com sucesso',
        data: { id, ...validatedData },
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar se item existe
      const items = await query<any[]>('SELECT * FROM itens_cardapio WHERE id = $1', [id]);
      if (items.length === 0) throw new NotFoundError('Item do cardápio');

      // Imagem do upload - CORRIGIDO
      let imagem: string | null | undefined = undefined;
      if (req.file) {
        imagem = `/uploads/menu/${req.file.filename}`;
      } else if (req.body.imagem) {
        // Se for string (URL/caminho), usa; se for objeto, ignora
        imagem = typeof req.body.imagem === 'string' ? req.body.imagem : undefined;
      }

      // Preparar dados brutos
      const rawData: any = {};

      // Copiar apenas campos relevantes
      const campos = ['categoria_id', 'nome', 'nome_en', 'descricao', 'preco_kz', 
                      'preco_promocional_kz', 'tempo_preparo', 'calorias',
                      'vegetariano', 'vegano', 'sem_gluten', 'picante',
                      'destaque', 'prato_do_dia', 'ordem_exibicao'];

      campos.forEach(campo => {
        if (req.body[campo] !== undefined && req.body[campo] !== '') {
          rawData[campo] = req.body[campo];
        }
      });

      // Adicionar imagem se definida
      if (imagem !== undefined) {
        rawData.imagem = imagem;
      }

      // Converter strings para boolean
      const booleanFields = ['vegetariano', 'vegano', 'sem_gluten', 'picante', 'destaque', 'prato_do_dia'];
      booleanFields.forEach(field => {
        if (rawData[field] !== undefined) {
          rawData[field] = rawData[field] === 'true' || rawData[field] === true;
        }
      });

      // Se não há nada para atualizar
      if (Object.keys(rawData).length === 0) {
        res.json({ success: true, message: 'Nenhuma alteração necessária', data: formatMenuItem(items[0]) });
        return;
      }

      const validatedData = UpdateItemCardapioDTOSchema.parse(rawData);

      if (validatedData.categoria_id) {
        const categories = await query<any[]>('SELECT id FROM categorias WHERE id = $1', [
          validatedData.categoria_id,
        ]);
        if (categories.length === 0) throw new BadRequestError('Categoria não encontrada');
      }

      const definedData = Object.fromEntries(
        Object.entries(validatedData).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(definedData).length === 0) {
        res.json({ success: true, message: 'Nenhuma alteração necessária', data: formatMenuItem(items[0]) });
        return;
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 0;

      Object.entries(definedData).forEach(([key, value]) => {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        updateValues.push(value);
      });

      paramCount++;
      const updateQuery = `UPDATE itens_cardapio SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount}`;
      updateValues.push(id);

      await query(updateQuery, updateValues);

      Logger.info(`Item atualizado: ${id} por ${(req as any).user?.userId}`);
      res.json({ success: true, message: 'Item atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMenuItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const items = await query<any[]>('SELECT * FROM itens_cardapio WHERE id = $1', [id]);
      if (items.length === 0) throw new NotFoundError('Item do cardápio');

      // Remover ficheiro de imagem se existir
      if (items[0].imagem) {
        const filePath = path.join(__dirname, '..', '..', items[0].imagem);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await query('DELETE FROM itens_cardapio WHERE id = $1', [id]);
      Logger.info(`Item deletado: ${id} por ${(req as any).user?.userId}`);
      res.json({ success: true, message: 'Item deletado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['disponivel', 'indisponivel', 'esgotado'].includes(status)) {
        throw new BadRequestError('Status inválido. Use: disponivel, indisponivel ou esgotado');
      }

      const items = await query<any[]>('SELECT * FROM itens_cardapio WHERE id = $1', [id]);
      if (items.length === 0) throw new NotFoundError('Item do cardápio');

      await query('UPDATE itens_cardapio SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);
      Logger.info(`Status do item atualizado: ${id} -> ${status}`);
      res.json({ success: true, message: 'Status atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}