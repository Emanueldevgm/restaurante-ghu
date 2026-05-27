import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/validation.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '..', '..', 'uploads', 'menu');
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return cb(err as any, uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de ficheiro não permitido'));
    }
  },
});

const router = Router();

// ============ ROTAS PÚBLICAS ============
router.get('/categories', asyncHandler(MenuController.getCategories));
router.get('/items', asyncHandler(MenuController.getMenuItems));
router.get('/items/:id', asyncHandler(MenuController.getMenuItem));

// ============ ROTAS DE CATEGORIAS (ADMIN) ============
router.post('/categories', authMiddleware, adminMiddleware, asyncHandler(MenuController.createCategory));
router.put('/categories/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.updateCategory));
router.delete('/categories/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.deleteCategory));

// ============ ROTAS DE ITENS (ADMIN) - Com upload de imagem ============
router.post(
  '/items',
  authMiddleware,
  adminMiddleware,
  upload.single('imagem'),
  asyncHandler(MenuController.createMenuItem),
);

router.put(
  '/items/:id',
  authMiddleware,
  adminMiddleware,
  upload.single('imagem'),
  asyncHandler(MenuController.updateMenuItem),
);

router.delete('/items/:id', authMiddleware, adminMiddleware, asyncHandler(MenuController.deleteMenuItem));
router.patch('/items/:id/status', authMiddleware, adminMiddleware, asyncHandler(MenuController.toggleStatus));

export default router;