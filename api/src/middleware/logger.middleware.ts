import morgan from 'morgan';

// Formato customizado de log
morgan.token('user-id', (req: any) => {
    return req.user?.userId || 'anônimo';
});

// Formato para desenvolvimento
export const devLogger = morgan(
    ':method :url :status :response-time ms - :res[content-length] - User: :user-id'
);

// Formato para produção (mais compacto)
export const prodLogger = morgan('combined');

// Exportar logger baseado no ambiente
export const logger =
    process.env.NODE_ENV === 'production' ? prodLogger : devLogger;
