import { z } from 'zod';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Schema de validação
const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3001),
    API_URL: z.string().default('http://localhost:3001'),
    
    // Database
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string().default('postgres'),
    DB_PASSWORD: z.string().default(''),
    DB_NAME: z.string().default('restaurante_angola_db'),
    DB_SSL: z.coerce.boolean().default(false),
    
    // JWT - em produção exige 32 caracteres, em dev aceita qualquer
    JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
    
    // CORS
    CORS_ORIGIN: z.string().default('*'),
    
    // Files
    MAX_FILE_SIZE: z.coerce.number().default(5242880),
    UPLOAD_PATH: z.string().default('./uploads'),
    
    // Email (opcional)
    EMAIL_HOST: z.string().optional(),
    EMAIL_PORT: z.coerce.number().optional(),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASSWORD: z.string().optional(),
    EMAIL_FROM: z.string().optional(),

    // SMTP (opcional)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),

    // SMS (opcional)
    SMS_PROVIDER: z.string().optional(),
    SMS_API_KEY: z.string().optional(),
    SMS_SENDER: z.string().optional(),
    
    // Pagamentos (opcional)
    MULTICAIXA_ENTITY: z.string().optional(),
    MULTICAIXA_API_KEY: z.string().optional(),
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
    
    // Logs
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    LOG_FILE: z.string().default('./logs/app.log'),
});

export type Env = z.infer<typeof EnvSchema>;

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