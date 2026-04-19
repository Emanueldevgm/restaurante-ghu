import { Router } from 'express';
import { DeliveryController } from '../controllers/delivery.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

/**
 * POST /api/delivery/calculate-fee
 * Público - calcula taxa de entrega
 */
router.post('/calculate-fee', DeliveryController.calculateFee);

/**
 * GET /api/delivery/zones
 * Admin - lista zonas de entrega
 */
router.get('/zones', authMiddleware, adminMiddleware, DeliveryController.getZones);

export default router;