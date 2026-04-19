import { Router } from 'express';
import { ReservationController } from '../controllers/reservation.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas do cliente
router.post('/', ReservationController.createReservation);
router.get('/my-reservations', ReservationController.getMyReservations);
router.delete('/:id', ReservationController.cancelReservation);

// Rotas Admin
router.get('/admin/all', adminMiddleware, ReservationController.getAllReservations);
router.patch('/:id/confirm', adminMiddleware, ReservationController.confirmReservation);
router.patch('/:id/check-in', adminMiddleware, ReservationController.checkIn);
router.patch('/:id/check-out', adminMiddleware, ReservationController.checkOut);

export default router;
