import app from './app';
import { testConnection } from './config/database';
import env from './config/env.config';

const PORT = env.PORT;

// Função para iniciar o servidor
const startServer = async () => {
    try {
        // Testar conexão com o banco de dados
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Falha ao conectar ao banco de dados. Verifique as configurações.');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('==============================================');
            console.log('🍽️  API RESTAURANTE GHU');
            console.log('==============================================');
            console.log(`✅ Servidor rodando na porta: ${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URL: http://localhost:${PORT}`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log('==============================================');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

// Handlers de erros não tratados
process.on('unhandledRejection', (reason: any) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Iniciar servidor
startServer();
