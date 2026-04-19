import { Request, Response, NextFunction } from 'express';

type UserRole = 'cliente' | 'administrador' | 'garcom' | 'cozinha' | 'entregador' | 'gerente';

export function adminMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Autenticação necessária',
        });
        return;
    }

    if (req.user.role !== 'administrador' && req.user.role !== 'gerente') {
        res.status(403).json({
            success: false,
            message: 'Acesso negado. Apenas administradores e gerentes podem acessar este recurso.',
        });
        return;
    }

    next();
}

// Middleware para verificar múltiplos roles
export function roleMiddleware(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Autenticação necessária',
            });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Acesso negado. Permitido apenas para: ${allowedRoles.join(', ')}`,
            });
            return;
        }

        next();
    };
}
