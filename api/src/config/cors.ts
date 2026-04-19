import { CorsOptions } from 'cors';
import env from './env.config';

/**
 * Parse das origens permitidas a partir da variável de ambiente
 * Formato: "http://localhost:5173,http://localhost:3000"
 */
const getAllowedOrigins = (): string[] => {
    const origins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
    
    // Adicionar localhost em desenvolvimento
    if (env.NODE_ENV === 'development') {
        origins.push('http://localhost:5173');
        origins.push('http://localhost:3000');
        origins.push('http://localhost:8080');
        origins.push('http://localhost:8081');
    }

    return origins;
};

const allowedOrigins = getAllowedOrigins();

console.log('✅ CORS Origins permitidas:', allowedOrigins);

/**
 * Configuração CORS para a API
 * Define quem pode fazer requisições cross-origin
 */
export const corsOptions: CorsOptions = {
    // Valida a origem da requisição
    origin: (origin, callback) => {
        // Sem origin (mobile apps, Postman, etc) - permitir
        if (!origin) {
            return callback(null, true);
        }

        // Verificar se origem está na whitelist
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            const error = new Error(`CORS bloqueado para origem: ${origin}`);
            error.name = 'NotAllowedByCorSError';
            callback(error);
        }
    },

    // Permitir credentials (cookies, auth headers)
    credentials: true,

    // Métodos HTTP permitidos
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Headers permitidos nas requisições
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
    ],

    // Headers expostos para o cliente
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Has-Next-Page',
        'Content-Length',
    ],

    // Cache de preflight por 24 horas
    maxAge: 86400,

    // Sucesso em status 200
    optionsSuccessStatus: 200,
};
