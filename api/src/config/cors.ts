import { CorsOptions } from 'cors';

/**
 * Configuração CORS para a API
 * Em produção, permite todas as origens
 */
export const corsOptions: CorsOptions = {
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};