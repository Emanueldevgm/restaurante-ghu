import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Todas as rotas de pedidos requerem autenticação
router.use(authMiddleware);

// Rotas do cliente
router.post('/', OrderController.createOrder);
router.get('/my-orders', OrderController.getMyOrders);
router.get('/:id', OrderController.getOrderDetails);
router.patch('/:id/cancel', OrderController.cancelOrder);

// Rotas Admin/Gerente
router.get(
    '/admin/all',
    roleMiddleware('administrador', 'gerente'),
    OrderController.getAllOrders
);
router.patch(
    '/:id/status',
    roleMiddleware('administrador', 'gerente', 'cozinha'),
    OrderController.updateOrderStatus
);

export default router;
