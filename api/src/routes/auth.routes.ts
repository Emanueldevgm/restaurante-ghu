import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/validation.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
    LoginDTOSchema,
    RegisterDTOSchema,
    AdminCreateUserDTOSchema,
    ChangePasswordDTOSchema,
    UpdateProfileDTOSchema,
} from '../schemas/validation.schemas';

const router = Router();

// ============ ROTAS PÚBLICAS ============

/**
 * POST /api/auth/register
 * Registrar novo usuário
 */
router.post(
    '/register',
    validateBody(RegisterDTOSchema),
    asyncHandler(AuthController.register)
);

/**
 * POST /api/auth/login
 * Login de usuário
 */
router.post(
    '/login',
    validateBody(LoginDTOSchema),
    asyncHandler(AuthController.login)
);

// ============ ROTAS PROTEGIDAS ============

/**
 * GET /api/auth/profile
 * Obter perfil do usuário autenticado
 */
router.get(
    '/profile',
    authMiddleware,
    asyncHandler(AuthController.getProfile)
);

/**
 * PUT /api/auth/profile
 * Atualizar perfil do usuário
 */
router.put(
    '/profile',
    authMiddleware,
    validateBody(UpdateProfileDTOSchema),
    asyncHandler(AuthController.updateProfile)
);

/**
 * PUT /api/auth/change-password
 * Alterar senha do usuário
 */
router.put(
    '/change-password',
    authMiddleware,
    validateBody(ChangePasswordDTOSchema),
    asyncHandler(AuthController.changePassword)
);

/**
 * GET /api/auth/users
 * Listar todos os usuários (apenas admin)
 */
router.get(
    '/users',
    authMiddleware,
    asyncHandler(AuthController.listUsers)
);

/**
 * POST /api/auth/users
 * Criar novo usuário (apenas admin)
 */
router.post(
    '/users',
    authMiddleware,
    validateBody(AdminCreateUserDTOSchema),
    asyncHandler(AuthController.createUser)
);

/**
 * PUT /api/auth/users/:id/status
 * Alterar status do usuário (apenas admin)
 */
router.put(
    '/users/:id/status',
    authMiddleware,
    asyncHandler(AuthController.updateUserStatus)
);

export default router;
