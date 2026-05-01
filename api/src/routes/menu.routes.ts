import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/validation.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  CreateItemCardapioDTOSchema,
  UpdateItemCardapioDTOSchema,
} from '../schemas/validation.schemas';

const router = Router();

// ============ ROTAS PÚBLICAS ============

/**
 * GET /api/menu/categories
 * Listar categorias ativas
 */
router.get('/categories', asyncHandler(MenuController.getCategories));

/**
 * GET /api/menu/items
 * Listar items do cardápio com filtros
 */
router.get('/items', asyncHandler(MenuController.getMenuItems));

/**
 * GET /api/menu/items/:id
 * Obter detalhes de um item específico
 */
router.get('/items/:id', asyncHandler(MenuController.getMenuItem));

// ============ ROTAS PROTEGIDAS (ADMIN) ============

/**
 * POST /api/admin/menu/items
 * Criar novo item no cardápio (admin)
 */
router.post(
  '/admin/items',
  authMiddleware,
  adminMiddleware,
  validateBody(CreateItemCardapioDTOSchema),
  asyncHandler(MenuController.createMenuItem),
);

/**
 * PUT /api/admin/menu/items/:id
 * Atualizar item (admin)
 */
router.put(
  '/admin/items/:id',
  authMiddleware,
  adminMiddleware,
  validateBody(UpdateItemCardapioDTOSchema),
  asyncHandler(MenuController.updateMenuItem),
);

/**
 * DELETE /api/admin/menu/items/:id
 * Deletar item (admin)
 */
router.delete(
  '/admin/items/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(MenuController.deleteMenuItem),
);

/**
 * PATCH /api/admin/menu/items/:id/status
 * Alternar status de disponibilidade (admin)
 */
router.patch(
  '/admin/items/:id/status',
  authMiddleware,
  adminMiddleware,
  asyncHandler(MenuController.toggleStatus),
);

export default router;
