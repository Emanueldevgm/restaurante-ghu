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

router.get('/categories', asyncHandler(MenuController.getCategories));
router.get('/items', asyncHandler(MenuController.getMenuItems));
router.get('/items/:id', asyncHandler(MenuController.getMenuItem));

// ============ ROTAS DE CATEGORIAS (ADMIN) ============

router.post(
  '/categories',
  authMiddleware,
  adminMiddleware,
  asyncHandler(MenuController.createCategory),
);

router.put(
  '/categories/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(MenuController.updateCategory),
);

router.delete(
  '/categories/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(MenuController.deleteCategory),
);

// ============ ROTAS DE ITENS (ADMIN) ============

router.post(
  '/items',
  authMiddleware,
  adminMiddleware,
  validateBody(CreateItemCardapioDTOSchema),
  asyncHandler(MenuController.createMenuItem),
);

router.put(
  '/items/:id',
  authMiddleware,
  adminMiddleware,
  validateBody(UpdateItemCardapioDTOSchema),
  asyncHandler(MenuController.updateMenuItem),
);

router.delete(
  '/items/:id',
  authMiddleware,
  adminMiddleware,
  asyncHandler(MenuController.deleteMenuItem),
);

router.patch(
  '/items/:id/status',
  authMiddleware,
  adminMiddleware,
  asyncHandler(MenuController.toggleStatus),
);

export default router;