/* eslint-disable quotes */
/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import Logger from '../utils/logger.util';
import { BadRequestError } from '../middleware/error.middleware';

export class DeliveryController {
  static async calculateFee(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { provincia, municipio, bairro } = req.body;

      if (!provincia || !municipio || !bairro) {
        throw new BadRequestError('Província, município e bairro são obrigatórios');
      }

      // Buscar zona de entrega correspondente (PostgreSQL)
      const zonaRows = await query<any[]>(
        `SELECT taxa_entrega_kz, tempo_estimado_min 
         FROM zonas_entrega
         WHERE provincia = $1
         AND ativa = TRUE
         AND (
           municipios @> to_jsonb($2::text)
           OR municipios IS NULL
           OR jsonb_array_length(municipios) = 0
         )
         AND (
           bairros @> to_jsonb($3::text)
           OR bairros IS NULL
           OR jsonb_array_length(bairros) = 0
         )
         ORDER BY
           COALESCE(jsonb_array_length(bairros), 0) DESC,
           COALESCE(jsonb_array_length(municipios), 0) DESC
         LIMIT 1`,
        [provincia, municipio, bairro]
      );

      const taxa_kz = zonaRows[0]?.taxa_entrega_kz 
        ? parseFloat(String(zonaRows[0].taxa_entrega_kz)) 
        : 0;
      const tempo_estimado_min = zonaRows[0]?.tempo_estimado_min || null;

      if (taxa_kz === 0) {
        const configRows = await query<any[]>(
          `SELECT taxa_entrega_base_kz FROM configuracoes_restaurante LIMIT 1`
        );
        const taxaBase = configRows[0]?.taxa_entrega_base_kz 
          ? parseFloat(String(configRows[0].taxa_entrega_base_kz)) 
          : 0;

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

  static async getZones(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const rows = await query<any[]>(
        `SELECT id, nome, provincia, municipios, bairros, taxa_entrega_kz, tempo_estimado_min, ativa 
         FROM zonas_entrega 
         WHERE ativa = TRUE 
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