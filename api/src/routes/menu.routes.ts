import { Router, Request, Response, NextFunction } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/validation.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'menu');
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
    } catch (err) {
      return cb(err as Error, uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de ficheiro não permitido'));
    }
  },
});

const router = Router();

// Rotas públicas
router.get('/categories', asyncHandler(MenuController.getCategories));
router.get('/items', asyncHandler(MenuController.getMenuItems));
router.get('/items/:id', asyncHandler(MenuController.getMenuItem));

// Rotas de categorias (admin)
router.post('/categories', authMiddleware, adminMiddleware, asyncHandler(MenuController.createCategory));
router.put('/categories/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.updateCategory));
router.delete('/categories/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.deleteCategory));

// Rotas de itens (admin) - Com upload de imagem
router.post('/items', authMiddleware, adminMiddleware, upload.single('imagem'), asyncHandler(MenuController.createMenuItem));
router.put('/items/:id', authMiddleware, adminMiddleware, upload.single('imagem'), asyncHandler(MenuController.updateMenuItem));
router.delete('/items/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.deleteMenuItem));
router.patch('/items/:id/status', authMiddleware, adminMiddleware, asyncHandler(MenuController.toggleStatus));

export default router;