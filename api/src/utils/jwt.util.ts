import jwt from 'jsonwebtoken';
import env from '../config/env.config';

export interface JwtPayload {
    userId: string;
    email: string;
    role: 'cliente' | 'administrador' | 'garcom' | 'cozinha' | 'entregador' | 'gerente';
}

/**
 * Gera um token JWT com o payload fornecido
 * @param payload - Dados para o token
 * @returns Token JWT
 */
export const generateToken = (payload: JwtPayload): string => {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
};

/**
 * Verifica e decodifica um token JWT
 * @param token - Token para verificar
 * @returns Payload decodificado
 * @throws Error se token for inválido ou expirado
 */
export const verifyToken = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
        throw new Error('Token inválido ou expirado');
    }
};

/**
 * Decodifica um token JWT sem verificar assinatura
 * @param token - Token para decodificar
 * @returns Payload ou null se inválido
 */
export const decodeToken = (token: string): JwtPayload | null => {
    try {
        return jwt.decode(token) as JwtPayload;
    } catch (error) {
        return null;
    }
};
