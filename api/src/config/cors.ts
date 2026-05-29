import { CorsOptions } from 'cors';

const originEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Permite pedidos sem origin (apps móveis, Postman, etc.)
    if (!origin) return callback(null, true);
    // Se a variável for '*', permite qualquer origem
    if (originEnv === '*') return callback(null, true);
    // Caso contrário, verifica se a origem está na lista (separada por vírgulas)
    const allowedOrigins = originEnv.split(',').map(o => o.trim());
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origem ${origin} não permitida pelo CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};