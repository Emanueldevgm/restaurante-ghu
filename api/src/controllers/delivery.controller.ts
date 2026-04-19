import { Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import Logger from '../utils/logger.util';
import { BadRequestError } from '../middleware/error.middleware';

export class DeliveryController {
  /**
   * POST /api/delivery/calculate-fee
   * Calcula a taxa de entrega com base em província, município e bairro
   * Utiliza a procedure calcular_taxa_entrega
   */
  static async calculateFee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { provincia, municipio, bairro } = req.body;

      // Validação
      if (!provincia || !municipio || !bairro) {
        throw new BadRequestError('Província, município e bairro são obrigatórios');
      }

      // Chama a procedure
      await pool.query(
        `CALL calcular_taxa_entrega(?, ?, ?, @taxa_kz, @tempo_estimado)`,
        [provincia, municipio, bairro]
      );

      // Recupera os valores de saída
      const [result] = await pool.query<any[]>(
        `SELECT @taxa_kz AS taxa_kz, @tempo_estimado AS tempo_estimado_min`
      );

      const taxa_kz = parseFloat(result[0]?.taxa_kz) || 0;
      const tempo_estimado_min = result[0]?.tempo_estimado_min || null;

      // Se não encontrou zona específica, usa taxa base
      if (taxa_kz === 0) {
        const [configRows] = await pool.query<any[]>(
          `SELECT taxa_entrega_base_kz FROM configuracoes_restaurante LIMIT 1`
        );

        const taxaBase = configRows[0]?.taxa_entrega_base_kz || 0;

        res.json({
          success: true,
          data: {
            taxa_kz: taxaBase,
            tempo_estimado_min: 45,
            usando_taxa_base: true,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          taxa_kz,
          tempo_estimado_min: tempo_estimado_min || 45,
          usando_taxa_base: false,
        },
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erro ao calcular taxa de entrega:', err);
      next(err);
    }
  }

  /**
   * GET /api/delivery/zones
   * Lista zonas de entrega ativas (admin)
   */
  static async getZones(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const [rows] = await pool.query<any[]>(
        `SELECT id, nome, provincia, municipios, taxa_entrega_kz, tempo_estimado_min, ativa 
         FROM zonas_entrega 
         WHERE ativa = 1 
         ORDER BY provincia, nome`
      );

      res.json({
        success: true,
        data: rows,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      Logger.error('Erro ao buscar zonas de entrega:', err);
      next(err);
    }
  }
}