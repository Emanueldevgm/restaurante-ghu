/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import app from './app';
import { testConnection } from './config/database';
import env from './config/env.config';
import express from 'express';
import path from 'path';

const PORT = env.PORT;

// 🔧 CORREÇÃO: Servir arquivos estáticos da pasta uploads na instância principal
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

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
            console.log(`🌍 Ambiente: ${env.NODE_ENV || 'development'}`);
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
});

process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

startServer();