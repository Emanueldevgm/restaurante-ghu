import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';
import { asyncHandler } from '../middleware/validation.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
    LoginDTOSchema,
    RegisterDTOSchema,
    AdminCreateUserDTOSchema,
    ChangePasswordDTOSchema,
    UpdateProfileDTOSchema,
    ForgotPasswordDTOSchema,
    ResetPasswordDTOSchema,
} from '../schemas/validation.schemas';

const router = Router();

// ============ ROTAS PÚBLICAS ============

router.post('/register', validateBody(RegisterDTOSchema), asyncHandler(AuthController.register));
router.post('/login', validateBody(LoginDTOSchema), asyncHandler(AuthController.login));
router.post('/forgot-password', validateBody(ForgotPasswordDTOSchema), asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', validateBody(ResetPasswordDTOSchema), asyncHandler(AuthController.resetPassword));

// ============ ROTAS PROTEGIDAS ============

router.get('/profile', authMiddleware, asyncHandler(AuthController.getProfile));
router.put('/profile', authMiddleware, validateBody(UpdateProfileDTOSchema), asyncHandler(AuthController.updateProfile));
router.put('/change-password', authMiddleware, validateBody(ChangePasswordDTOSchema), asyncHandler(AuthController.changePassword));

// ============ ROTAS DE ADMIN ============

router.get('/users', authMiddleware, adminMiddleware, asyncHandler(AuthController.listUsers));
router.post('/users', authMiddleware, adminMiddleware, validateBody(AdminCreateUserDTOSchema), asyncHandler(AuthController.createUser));
router.put('/users/:id', authMiddleware, adminMiddleware, asyncHandler(AuthController.updateUser));
router.delete('/users/:id', authMiddleware, adminMiddleware, asyncHandler(AuthController.deleteUser));
router.patch('/users/:id/status', authMiddleware, adminMiddleware, asyncHandler(AuthController.updateUserStatus));

export default router;