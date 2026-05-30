import { Router, Request, Response, NextFunction } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { CreateReservacionDTOSchema } from '../schemas/validation.schemas';
import { BadRequestError } from '../middleware/error.middleware';

const router = Router();

// Middleware de validação Zod para criação de reserva
const validateCreateReservation = (req: Request, _res: Response, next: NextFunction): void => {
  const result = CreateReservacionDTOSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
    return next(new BadRequestError(`Dados inválidos: ${errors}`));
  }
  req.body = result.data;
  next();
};

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas do cliente
router.post('/', validateCreateReservation, ReservationController.createReservation);
router.get('/my-reservations', ReservationController.getMyReservations);
router.delete('/:id', ReservationController.cancelReservation);

// Rotas Admin
router.get('/admin/all', adminMiddleware, ReservationController.getAllReservations);
router.patch('/:id/confirm', adminMiddleware, ReservationController.confirmReservation);
router.patch('/:id/check-in', adminMiddleware, ReservationController.checkIn);
router.patch('/:id/check-out', adminMiddleware, ReservationController.checkOut);

export default router;