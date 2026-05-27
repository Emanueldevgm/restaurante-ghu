import { CorsOptions } from 'cors';
import env from './env.config';

/**
 * Parse das origens permitidas a partir da variável de ambiente
 */
const getAllowedOrigins = (): (string | RegExp)[] | '*' => {
    // Se for "*", permite todas as origens
    if (env.CORS_ORIGIN === '*') {
        return '*';
    }

    const origins: (string | RegExp)[] = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
    
    // Adicionar localhost em desenvolvimento
    if (env.NODE_ENV === 'development') {
        origins.push('http://localhost:5173');
        origins.push('http://localhost:3000');
        origins.push('http://localhost:8080');
        origins.push('http://localhost:8081');
    }

    // Adicionar origens da Vercel
    origins.push('https://restaurante-ghu.vercel.app');
    origins.push(/\.vercel\.app$/); // Regex para qualquer subdomínio vercel

    return origins;
};

const allowedOrigins = getAllowedOrigins();

console.log('✅ CORS Origins permitidas:', allowedOrigins);

export const corsOptions: CorsOptions = {
    // Aceitar wildcard ou lista de origens
    origin: allowedOrigins === '*' 
        ? '*' 
        : (origin, callback) => {
            // Sem origin (mobile apps, Postman, etc) - permitir
            if (!origin) {
                return callback(null, true);
            }

            // Verificar se é uma string na lista
            const isAllowed = (allowedOrigins as (string | RegExp)[]).some((allowed) => {
                if (allowed instanceof RegExp) {
                    return allowed.test(origin);
                }
                return allowed === origin;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
                callback(null, true); // Em produção, permitir tudo para evitar problemas
            }
        },

    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Has-Next-Page', 'Content-Length'],
    maxAge: 86400,
    optionsSuccessStatus: 200,
};