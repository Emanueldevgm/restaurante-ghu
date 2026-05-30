import { Router, Request, Response, NextFunction } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/validation.middleware';
import { upload } from '../config/cloudinary';

const router = Router();

// Rotas públicas
router.get('/categories', asyncHandler(MenuController.getCategories));
router.get('/items', asyncHandler(MenuController.getMenuItems));
router.get('/items/:id', asyncHandler(MenuController.getMenuItem));

// Rotas de categorias (admin)
router.post('/categories', authMiddleware, adminMiddleware, asyncHandler(MenuController.createCategory));
router.put('/categories/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.updateCategory));
router.delete('/categories/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.deleteCategory));

// Rotas de itens (admin) - Com upload de imagem para Cloudinary
router.post('/items', authMiddleware, adminMiddleware, upload.single('imagem'), asyncHandler(MenuController.createMenuItem));
router.put('/items/:id', authMiddleware, adminMiddleware, upload.single('imagem'), asyncHandler(MenuController.updateMenuItem));
router.delete('/items/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.deleteMenuItem));
router.patch('/items/:id/status', authMiddleware, adminMiddleware, asyncHandler(MenuController.toggleStatus));

export default router;