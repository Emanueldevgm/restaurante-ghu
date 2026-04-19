import { z } from 'zod';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Schema de validação das variáveis de ambiente
const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),
    API_URL: z.string().url().default('http://localhost:3001'),
    
    // Database
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(3306),
    DB_USER: z.string().default('root'),
    DB_PASSWORD: z.string().default(''),
    DB_NAME: z.string().default('restaurante_angola_db'),
    
    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET deve ter pelo menos 32 caracteres'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
    
    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000'),
    
    // Files
    MAX_FILE_SIZE: z.coerce.number().default(5242880),
    UPLOAD_PATH: z.string().default('./uploads'),
    
    // Email
    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.coerce.number().optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
    
    // SMS
    SMS_PROVIDER: z.string().optional(),
    SMS_API_KEY: z.string().optional(),
    SMS_SENDER: z.string().optional(),
    
    // Pagamentos
    MULTICAIXA_ENTITY: z.string().optional(),
    MULTICAIXA_API_KEY: z.string().optional(),
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    
    // Logs
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE: z.string().default('./logs/app.log'),
});

// Tipo do objeto de environment
export type Env = z.infer<typeof EnvSchema>;

// Validar e exportar variáveis de ambiente
let validatedEnv: Env;

try {
    validatedEnv = EnvSchema.parse(process.env);
    console.log('✅ Variáveis de ambiente validadas com sucesso');
} catch (error) {
    if (error instanceof z.ZodError) {
        console.error('❌ Erro na validação de variáveis de ambiente:');
        error.errors.forEach((err) => {
            console.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
    }
    process.exit(1);
}

export default validatedEnv;
