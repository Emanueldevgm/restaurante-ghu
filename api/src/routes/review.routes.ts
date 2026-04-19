import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { auth } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/admin.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

/**
 * GET /api/reviews
 * Listar avaliações publicadas
 */
router.get(
  '/',
  asyncHandler(ReviewController.getReviews)
);

/**
 * GET /api/reviews/:id
 * Obter avaliação específica
 */
router.get(
  '/:id',
  asyncHandler(ReviewController.getReview)
);

/**
 * GET /api/reviews/order/:orderId
 * Obter avaliação de um pedido
 */
router.get(
  '/order/:orderId',
  asyncHandler(ReviewController.getOrderReview)
);

/**
 * GET /api/restaurant/rating
 * Obter avaliação geral do restaurante
 */
router.get(
  '/restaurant/rating',
  asyncHandler(ReviewController.getRestaurantRating)
);

/**
 * POST /api/reviews
 * Criar nova avaliação (cliente autenticado)
 */
router.post(
  '/',
  auth,
  asyncHandler(ReviewController.createReview)
);

/**
 * PUT /api/admin/reviews/:id
 * Responder avaliação (admin/gerente)
 */
router.put(
  '/:id/respond',
  auth,
  adminOnly,
  asyncHandler(ReviewController.respondReview)
);

export default router;
