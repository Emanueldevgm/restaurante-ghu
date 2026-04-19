import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { corsOptions } from './config/cors';
import env from './config/env.config';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './middleware/logger.middleware';

// Importar rotas
import authRoutes from './routes/auth.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import reservationRoutes from './routes/reservation.routes';
import tableRoutes from './routes/table.routes';
import deliveryRoutes from './routes/delivery.routes';
import reviewRoutes from './routes/review.routes';

const app: Application = express();

// ============ MIDDLEWARES DE SEGURANÇA ============

// Helmet para headers de segurança
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Body Parser
app.use(express.json({ limit: env.MAX_FILE_SIZE.toString() }));
app.use(express.urlencoded({ extended: true, limit: env.MAX_FILE_SIZE.toString() }));

// Logger
app.use(logger);

app.use('/api/delivery', deliveryRoutes);

// Rate Limiting (aplicado globalmente - apenas em produção)
if (env.NODE_ENV === 'production') {
    const globalLimiter = rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX_REQUESTS,
        message: 'Muitas requisições, tente novamente mais tarde',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.use(globalLimiter);
}

// Rate Limiting mais rigoroso para rotas de autenticação
// Em desenvolvimento, usar limites altos; em produção, manter rigoroso
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: env.NODE_ENV === 'production' ? 5 : 100, // 5 em prod, 100 em dev
    message: 'Muitas tentativas de login, tente novamente em 15 minutos',
    skip: () => env.NODE_ENV === 'development', // Desabilitar em desenvolvimento
});

// ============ ROTAS DE SAÚDE ============

/**
 * GET /health
 * Verifica se a API está funcionando
 */
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'API Restaurante GHU está funcionando!',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// ============ ROTAS DA API ============

// Rotas de autenticação (com rate limiting)
if (env.NODE_ENV === 'production') {
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
}
app.use('/api/auth', authRoutes);

// Rotas de menu
app.use('/api/menu', menuRoutes);

// Rotas de pedidos
app.use('/api/orders', orderRoutes);

// Rotas de reservas
app.use('/api/reservations', reservationRoutes);

// Rotas de mesas
app.use('/api/tables', tableRoutes);

// Rotas de avaliações
app.use('/api/reviews', reviewRoutes);

// ============ ROTA 404 ============

/**
 * Qualquer rota não definida retorna 404
 */
app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`,
        timestamp: new Date().toISOString(),
    });
});

// ============ MIDDLEWARE DE ERRO ============

/**
 * Middleware de erro deve ser o último
 */
app.use(errorMiddleware);

export default app;
