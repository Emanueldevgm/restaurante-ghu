import { Request, Response, NextFunction } from 'express';
import env from '../config/env.config';

export interface ApiError extends Error {
    statusCode?: number;
    details?: any;
}

/**
 * Middleware centralizado para tratamento de erros
 * Deve ser o último middleware registrado
 */
export const errorMiddleware = (
    err: ApiError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Erro interno do servidor';
    const timestamp = new Date().toISOString();

    // Log detalhado do erro
    const errorLog = {
        timestamp,
        method: req.method,
        path: req.path,
        statusCode,
        message: err.message,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: (req as any).user?.userId,
    };

    // Log em desenvolvimento mostra stack trace
    if (env.NODE_ENV === 'development') {
        console.error('❌ [ERROR]', errorLog);
        console.error('Stack Trace:', err.stack);
    } else {
        // Em produção, apenas log do erro (sem detalhes sensíveis)
        console.error('❌ [ERROR]', {
            timestamp,
            statusCode,
            message,
            path: req.path,
        });
    }

    // Resposta para o cliente
    const response: any = {
        success: false,
        message,
        timestamp,
    };

    // Em desenvolvimento, incluir detalhes adicionais
    if (env.NODE_ENV === 'development') {
        response.details = err.details;
        response.stack = err.stack?.split('\n').slice(0, 5); // Primeiras 5 linhas do stack
    }

    res.status(statusCode).json(response);
};

// ============ CLASSES DE ERRO CUSTOMIZADAS ============

/**
 * Classe base para erros HTTP
 */
export class HttpError extends Error implements ApiError {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, HttpError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Erro 400 - Requisição inválida
 */
export class BadRequestError extends HttpError {
    constructor(message: string, details?: any) {
        super(400, message, details);
    }
}

/**
 * Erro 401 - Não autenticado
 */
export class UnauthorizedError extends HttpError {
    constructor(message = 'Autenticação necessária') {
        super(401, message);
    }
}

/**
 * Erro 403 - Acesso negado
 */
export class ForbiddenError extends HttpError {
    constructor(message = 'Acesso negado') {
        super(403, message);
    }
}

/**
 * Erro 404 - Não encontrado
 */
export class NotFoundError extends HttpError {
    constructor(resource: string) {
        super(404, `${resource} não encontrado(a)`);
    }
}

/**
 * Erro 409 - Conflito (ex: recurso duplicado)
 */
export class ConflictError extends HttpError {
    constructor(message: string) {
        super(409, message);
    }
}

/**
 * Erro 422 - Entidade não processável
 */
export class UnprocessableEntityError extends HttpError {
    constructor(message: string, details?: any) {
        super(422, message, details);
    }
}

/**
 * Erro 429 - Muitas requisições
 */
export class TooManyRequestsError extends HttpError {
    constructor(message = 'Muitas requisições, tente novamente mais tarde') {
        super(429, message);
    }
}

/**
 * Erro 500 - Erro interno do servidor
 */
export class InternalServerError extends HttpError {
    constructor(message = 'Erro interno do servidor', details?: any) {
        super(500, message, details);
    }
}
