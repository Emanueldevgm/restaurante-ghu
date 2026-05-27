/* eslint-disable comma-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool, QueryResult } from 'pg';
import env from './env.config';

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    // SSL para Render (produção)
    ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
});

/**
 * Converte placeholders ? do MySQL para $1, $2, $3 do PostgreSQL
 */
const formatQuery = (sql: string, params: any[] = []): { text: string; values: any[] } => {
    let index = 0;
    const text = sql.replace(/\?/g, () => `$${++index}`);
    return { text, values: params };
};

/**
 * Testa a conexão com o banco de dados
 */
export const testConnection = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
        console.log(`   Database: ${env.DB_NAME}`);
        console.log(`   Host: ${env.DB_HOST}:${env.DB_PORT}`);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Erro ao conectar ao PostgreSQL:', error);
        return false;
    }
};

/**
 * Executa uma query no banco de dados
 */
export const query = async <T = any>(sql: string, params: any[] = []): Promise<T> => {
    try {
        const { text, values } = formatQuery(sql, params);
        const result: QueryResult = await pool.query(text, values);
        return result.rows as unknown as T;
    } catch (error) {
        console.error('❌ Erro na query:', sql);
        throw error;
    }
};

export type DatabaseConnection = {
    query: <T = any>(sql: string, params?: any[]) => Promise<T>;
};

/**
 * Executa operações em uma transação
 */
export const transaction = async <T>(
    callback: (connection: DatabaseConnection) => Promise<T>
): Promise<T> => {
    const client = await pool.connect();
    const connection: DatabaseConnection = {
        query: async <R = any>(sql: string, params: any[] = []): Promise<R> => {
            const { text, values } = formatQuery(sql, params);
            const result: QueryResult = await client.query(text, values);
            return result.rows as unknown as R;
        },
    };

    try {
        await client.query('BEGIN');
        const result = await callback(connection);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

export default pool;