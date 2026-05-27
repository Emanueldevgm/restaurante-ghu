import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { corsOptions } from './config/cors';
import env from './config/env.config';
import { errorMiddleware } from './middleware/error.middleware';
import { logger } from './middleware/logger.middleware';
import path from 'path';

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir ficheiros estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Logger
app.use(logger);

// Rate Limiting global
const globalLimiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX_REQUESTS,
    message: 'Muitas requisições, tente novamente mais tarde',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);

// ============ ROTA DE SAÚDE ============

app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'API Restaurante GHU está funcionando!',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
    });
});

// ============ ROTAS DA API ============

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/delivery', deliveryRoutes);

// ============ ROTA 404 ============

app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: `Rota ${req.originalUrl} não encontrada`,
    });
});

// ============ MIDDLEWARE DE ERRO ============

app.use(errorMiddleware);

export default app;