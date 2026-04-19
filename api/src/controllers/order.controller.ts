import { Request, Response, NextFunction } from 'express';
import { query, transaction } from '../config/database';
import {
    Pedido,
    ItemPedido,
    CreatePedidoDTO,
    ApiResponse,
} from '../types';
import {
    NotFoundError,
    BadRequestError,
    ForbiddenError,
} from '../middleware/error.middleware';
import { v4 as uuidv4 } from 'uuid';
import { PoolConnection } from 'mysql2/promise';

export class OrderController {
    // Criar novo pedido
    static async createOrder(
        req: Request<{}, {}, CreatePedidoDTO>,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            const {
                tipo,
                endereco_id,
                mesa_id,
                itens,
                observacoes,
                observacoes_entrega,
                cupom_codigo,
            } = req.body;

            // Validações
            if (!tipo || !itens || itens.length === 0) {
                throw new BadRequestError('Tipo e itens são obrigatórios');
            }

            if (tipo === 'delivery' && !endereco_id) {
                throw new BadRequestError('Endereço é obrigatório para delivery');
            }

            if (tipo === 'mesa' && !mesa_id) {
                throw new BadRequestError('Mesa é obrigatória para pedidos no local');
            }

            // Usar transação para garantir consistência
            const result = await transaction(async (conn: PoolConnection) => {
                // Buscar itens do cardápio e calcular subtotal
                let subtotal_kz = 0;
                const itensValidados = [];

                for (const item of itens) {
                    const [menuItem] = await conn.query<any[]>(
                        'SELECT * FROM itens_cardapio WHERE id = ? AND status = "disponivel"',
                        [item.item_cardapio_id]
                    );

                    if (!menuItem || menuItem.length === 0) {
                        throw new NotFoundError(`Item ${item.item_cardapio_id}`);
                    }

                    const itemData = menuItem[0];
                    const preco = itemData.preco_promocional_kz || itemData.preco_kz;
                    const subtotal_item = preco * item.quantidade;

                    subtotal_kz += subtotal_item;

                    itensValidados.push({
                        ...item,
                        nome_item: itemData.nome,
                        preco_unitario_kz: preco,
                        subtotal_kz: subtotal_item,
                    });
                }

                // Calcular taxa de entrega
                let taxa_entrega_kz = 0;
                let distancia_km = null;

                if (tipo === 'delivery' && endereco_id) {
                    // Buscar endereço
                    const [endereco] = await conn.query<any[]>(
                        'SELECT * FROM enderecos_clientes WHERE id = ?',
                        [endereco_id]
                    );

                    if (!endereco || endereco.length === 0) {
                        throw new NotFoundError('Endereço');
                    }

                    const enderecoData = endereco[0];

                    // Buscar taxa de entrega da zona
                    const [zona] = await conn.query<any[]>(
                        `SELECT taxa_entrega_kz FROM zonas_entrega 
             WHERE provincia = ? 
             AND ativa = TRUE
             AND (
               JSON_CONTAINS(municipios, JSON_QUOTE(?))
               OR JSON_LENGTH(municipios) = 0
             )
             LIMIT 1`,
                        [enderecoData.provincia, enderecoData.municipio]
                    );

                    if (zona && zona.length > 0) {
                        taxa_entrega_kz = zona[0].taxa_entrega_kz;
                    } else {
                        // Taxa padrão se não encontrar zona
                        const [config] = await conn.query<any[]>(
                            'SELECT taxa_entrega_base_kz FROM configuracoes_restaurante LIMIT 1'
                        );
                        taxa_entrega_kz = config?.[0]?.taxa_entrega_base_kz || 0;
                    }
                }

                // Aplicar cupom se fornecido
                let desconto_kz = 0;
                let cupom_id = null;

                if (cupom_codigo) {
                    const [cupom] = await conn.query<any[]>(
                        `SELECT * FROM cupons 
             WHERE codigo = ? 
             AND status = 'ativo'
             AND data_inicio <= CURDATE()
             AND data_fim >= CURDATE()
             AND (quantidade_disponivel IS NULL OR quantidade_disponivel > quantidade_usada)`,
                        [cupom_codigo]
                    );

                    if (cupom && cupom.length > 0) {
                        const cupomData = cupom[0];

                        // Verificar valor mínimo
                        if (subtotal_kz >= cupomData.valor_minimo_pedido_kz) {
                            cupom_id = cupomData.id;

                            if (cupomData.tipo === 'percentual') {
                                desconto_kz = (subtotal_kz * cupomData.valor) / 100;
                            } else {
                                desconto_kz = cupomData.valor;
                            }

                            // Desconto não pode ser maior que o subtotal
                            if (desconto_kz > subtotal_kz) {
                                desconto_kz = subtotal_kz;
                            }
                        }
                    }
                }

                // Calcular total
                const total_kz = subtotal_kz - desconto_kz + taxa_entrega_kz;

                // Criar pedido
                const pedidoId = uuidv4();
                await conn.query(
                    `INSERT INTO pedidos (
            id, usuario_id, tipo, status, endereco_id, mesa_id,
            taxa_entrega_kz, distancia_km, subtotal_kz, desconto_kz,
            total_kz, observacoes, observacoes_entrega, cupom_id,
            tempo_estimado
          ) VALUES (?, ?, ?, 'pendente', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        pedidoId,
                        userId || null,
                        tipo,
                        endereco_id || null,
                        mesa_id || null,
                        taxa_entrega_kz,
                        distancia_km,
                        subtotal_kz,
                        desconto_kz,
                        total_kz,
                        observacoes || null,
                        observacoes_entrega || null,
                        cupom_id,
                        45, // tempo estimado padrão
                    ]
                );

                // Adicionar itens do pedido
                for (const item of itensValidados) {
                    const itemPedidoId = uuidv4();
                    await conn.query(
                        `INSERT INTO itens_pedido (
              id, pedido_id, item_cardapio_id, nome_item,
              preco_unitario_kz, quantidade, subtotal_kz, observacoes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            itemPedidoId,
                            pedidoId,
                            item.item_cardapio_id,
                            item.nome_item,
                            item.preco_unitario_kz,
                            item.quantidade,
                            item.subtotal_kz,
                            item.observacoes || null,
                        ]
                    );
                }

                // Registrar uso do cupom
                if (cupom_id) {
                    await conn.query(
                        'INSERT INTO cupons_utilizados (id, cupom_id, pedido_id, usuario_id, valor_desconto_kz) VALUES (?, ?, ?, ?, ?)',
                        [uuidv4(), cupom_id, pedidoId, userId, desconto_kz]
                    );
                }

                return { pedidoId, numero_pedido: null };
            });

            // Buscar número do pedido
            const [pedido] = await query<Pedido[]>(
                'SELECT numero_pedido FROM pedidos WHERE id = ?',
                [result.pedidoId]
            );

            res.status(201).json({
                success: true,
                message: 'Pedido criado com sucesso',
                data: {
                    id: result.pedidoId,
                    numero_pedido: pedido.numero_pedido,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Listar pedidos do usuário
    static async getMyOrders(
        req: Request,
        res: Response<ApiResponse<Pedido[]>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { status, tipo, page = 1, limit = 20 } = req.query;

            let sql = `
        SELECT p.*, 
               u.nome_completo as cliente_nome,
               m.numero as mesa_numero
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN mesas m ON p.mesa_id = m.id
        WHERE p.usuario_id = ?
      `;
            const params: any[] = [userId];

            if (status) {
                sql += ' AND p.status = ?';
                params.push(status);
            }

            if (tipo) {
                sql += ' AND p.tipo = ?';
                params.push(tipo);
            }

            sql += ' ORDER BY p.created_at DESC';

            // Paginação
            const offset = (Number(page) - 1) * Number(limit);
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), offset);

            const orders = await query<Pedido[]>(sql, params);

            res.json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    }

    // Obter detalhes de um pedido
    static async getOrderDetails(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const userRole = req.user?.role;

            // Buscar pedido
            const [pedido] = await query<any[]>(
                `SELECT p.*,
                u.nome_completo as cliente_nome,
                u.telefone as cliente_telefone,
                m.numero as mesa_numero,
                ec.rua, ec.bairro, ec.municipio, ec.provincia
         FROM pedidos p
         LEFT JOIN usuarios u ON p.usuario_id = u.id
         LEFT JOIN mesas m ON p.mesa_id = m.id
         LEFT JOIN enderecos_clientes ec ON p.endereco_id = ec.id
         WHERE p.id = ?`,
                [id]
            );

            if (!pedido) {
                throw new NotFoundError('Pedido');
            }

            // Verificar permissão
            if (
                userRole !== 'administrador' &&
                userRole !== 'gerente' &&
                pedido.usuario_id !== userId
            ) {
                throw new ForbiddenError('Você não tem permissão para visualizar este pedido');
            }

            // Buscar itens do pedido
            const itens = await query<ItemPedido[]>(
                'SELECT * FROM itens_pedido WHERE pedido_id = ?',
                [id]
            );

            res.json({
                success: true,
                data: {
                    ...pedido,
                    itens,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    // Atualizar status do pedido (Admin/Cozinha)
    static async updateOrderStatus(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = [
                'pendente',
                'confirmado',
                'em_preparo',
                'pronto',
                'saiu_entrega',
                'entregue',
                'cancelado',
            ];

            if (!validStatuses.includes(status)) {
                throw new BadRequestError('Status inválido');
            }

            // Atualizar status
            await query(
                'UPDATE pedidos SET status = ?, updated_at = NOW() WHERE id = ?',
                [status, id]
            );

            // Se confirmado, registrar timestamp
            if (status === 'confirmado') {
                await query('UPDATE pedidos SET confirmado_em = NOW() WHERE id = ?', [id]);
            }

            // Se entregue, registrar timestamp
            if (status === 'entregue') {
                await query('UPDATE pedidos SET finalizado_em = NOW() WHERE id = ?', [id]);
            }

            res.json({
                success: true,
                message: 'Status do pedido atualizado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancelar pedido
    static async cancelOrder(
        req: Request,
        res: Response<ApiResponse>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { id } = req.params;
            const userId = req.user?.userId;
            const userRole = req.user?.role;

            // Buscar pedido
            const [pedido] = await query<Pedido[]>(
                'SELECT * FROM pedidos WHERE id = ?',
                [id]
            );

            if (!pedido) {
                throw new NotFoundError('Pedido');
            }

            // Verificar permissão
            if (
                userRole !== 'administrador' &&
                userRole !== 'gerente' &&
                pedido.usuario_id !== userId
            ) {
                throw new ForbiddenError('Você não tem permissão para cancelar este pedido');
            }

            // Verificar se pedido pode ser cancelado
            if (['entregue', 'cancelado'].includes(pedido.status)) {
                throw new BadRequestError(
                    `Pedido ${pedido.status === 'entregue' ? 'já entregue' : 'já cancelado'}`
                );
            }

            await query(
                'UPDATE pedidos SET status = "cancelado", updated_at = NOW() WHERE id = ?',
                [id]
            );

            res.json({
                success: true,
                message: 'Pedido cancelado com sucesso',
            });
        } catch (error) {
            next(error);
        }
    }

    // Listar todos os pedidos (Admin)
    static async getAllOrders(
        req: Request,
        res: Response<ApiResponse<Pedido[]>>,
        next: NextFunction
    ): Promise<void> {
        try {
            const { status, tipo, data_inicio, data_fim, page = 1, limit = 50 } = req.query;

            let sql = `
        SELECT p.*,
               u.nome_completo as cliente_nome,
               u.telefone as cliente_telefone,
               m.numero as mesa_numero
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN mesas m ON p.mesa_id = m.id
        WHERE 1=1
      `;
            const params: any[] = [];

            if (status) {
                sql += ' AND p.status = ?';
                params.push(status);
            }

            if (tipo) {
                sql += ' AND p.tipo = ?';
                params.push(tipo);
            }

            if (data_inicio) {
                sql += ' AND DATE(p.created_at) >= ?';
                params.push(data_inicio);
            }

            if (data_fim) {
                sql += ' AND DATE(p.created_at) <= ?';
                params.push(data_fim);
            }

            sql += ' ORDER BY p.created_at DESC';

            const offset = (Number(page) - 1) * Number(limit);
            sql += ' LIMIT ? OFFSET ?';
            params.push(Number(limit), offset);

            const orders = await query<Pedido[]>(sql, params);

            res.json({
                success: true,
                data: orders,
            });
        } catch (error) {
            next(error);
        }
    }
}
