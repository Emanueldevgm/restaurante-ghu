import { Router } from 'express';
import { TableController } from '../controllers/table.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Rotas públicas
router.get('/', TableController.getTables);
router.get('/status', TableController.getTableStatus);

// Rotas Admin
router.post('/', authMiddleware, adminMiddleware, TableController.createTable);
router.put('/:id', authMiddleware, adminMiddleware, TableController.updateTable);
router.patch('/:id/toggle', authMiddleware, adminMiddleware, TableController.toggleTableStatus);
router.delete('/:id', authMiddleware, adminMiddleware, TableController.deleteTable);

export default router;
