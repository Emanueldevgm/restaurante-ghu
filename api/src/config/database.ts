import mysql from 'mysql2/promise';
import env from './env.config';

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    timezone: '+01:00', // Angola timezone (WAT - West Africa Time)
});

/**
 * Testa a conexão com o banco de dados
 * @returns true se conexão bem-sucedida, false caso contrário
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexão com MySQL estabelecida com sucesso!');
        console.log(`   Database: ${env.DB_NAME}`);
        console.log(`   Host: ${env.DB_HOST}:${env.DB_PORT}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao MySQL:', error);
        return false;
    }
};

/**
 * Executa uma query no banco de dados
 * @param sql - String SQL a executar
 * @param params - Parâmetros para prepared statement
 * @returns Array de resultados
 */
export const query = async <T = any>(
    sql: string,
    params?: any[]
): Promise<T> => {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows as T;
    } catch (error) {
        console.error('❌ Erro na query:', sql);
        throw error;
    }
};

/**
 * Executa operações em uma transação
 * @param callback - Função que executa as operações
 * @returns Resultado da transação
 */
export const transaction = async <T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> => {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

export default pool;
