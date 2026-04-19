import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.util';

// Estender Request do Express para incluir user
declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Token de autenticação não fornecido',
            });
            return;
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Use: Bearer {token}',
            });
            return;
        }

        const token = parts[1];

        try {
            const decoded = verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Token inválido ou expirado',
            });
            return;
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao validar autenticação',
        });
    }
};
