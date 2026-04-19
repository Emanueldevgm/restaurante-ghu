import fs from 'fs';
import env from '../config/env.config';

/**
 * Tipos de logs
 */
export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

/**
 * Interface para estrutura de log
 */
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, any>;
    error?: {
        message: string;
        stack?: string;
    };
    userId?: string;
}

/**
 * Classe Logger
 * Fornece logging estruturado e persistente
 */
export class Logger {
    private static logDir = env.LOG_FILE.split('/').slice(0, -1).join('/');

    static {
        // Criar diretório de logs se não existir
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Log no console e arquivo
     */
    private static write(entry: LogEntry): void {
        const message = Logger.formatMessage(entry);

        // Console com cores
        Logger.logToConsole(entry, message);

        // Arquivo (em produção e desenvolvimento)
        if (env.LOG_LEVEL.includes(entry.level[0].toLowerCase())) {
            Logger.logToFile(message);
        }
    }

    /**
     * Formatar mensagem de log
     */
    private static formatMessage(entry: LogEntry): string {
        const { timestamp, level, message, context, error, userId } = entry;

        let formatted = `[${timestamp}] [${level}]`;

        if (userId) {
            formatted += ` [USER:${userId}]`;
        }

        formatted += ` ${message}`;

        if (context && Object.keys(context).length > 0) {
            formatted += ` | Context: ${JSON.stringify(context)}`;
        }

        if (error) {
            formatted += ` | Error: ${error.message}`;
            if (error.stack && env.NODE_ENV === 'development') {
                formatted += `\n${error.stack}`;
            }
        }

        return formatted;
    }

    /**
     * Log para console com cores
     */
    private static logToConsole(entry: LogEntry, message: string): void {
        const colors = {
            DEBUG: '\x1b[36m', // Cyan
            INFO: '\x1b[32m',  // Green
            WARN: '\x1b[33m',  // Yellow
            ERROR: '\x1b[31m', // Red
        };

        const color = colors[entry.level];
        const reset = '\x1b[0m';

        console.log(`${color}${message}${reset}`);
    }

    /**
     * Log para arquivo
     */
    private static logToFile(message: string): void {
        try {
            fs.appendFileSync(
                env.LOG_FILE,
                message + '\n',
                { encoding: 'utf-8' }
            );
        } catch (error) {
            console.error('❌ Erro ao escrever log:', error);
        }
    }

    /**
     * Log com nível DEBUG
     */
    static debug(message: string, context?: Record<string, any>, userId?: string): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: LogLevel.DEBUG,
            message,
            context,
            userId,
        };
        this.write(entry);
    }

    /**
     * Log com nível INFO
     */
    static info(message: string, context?: Record<string, any>, userId?: string): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: LogLevel.INFO,
            message,
            context,
            userId,
        };
        this.write(entry);
    }

    /**
     * Log com nível WARN
     */
    static warn(message: string, context?: Record<string, any>, userId?: string): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: LogLevel.WARN,
            message,
            context,
            userId,
        };
        this.write(entry);
    }

    /**
     * Log com nível ERROR
     */
    static error(
        message: string,
        error?: Error,
        context?: Record<string, any>,
        userId?: string
    ): void {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level: LogLevel.ERROR,
            message,
            context,
            userId,
            error: error ? {
                message: error.message,
                stack: error.stack,
            } : undefined,
        };
        this.write(entry);
    }

    /**
     * Log de requisição HTTP
     */
    static httpRequest(
        method: string,
        path: string,
        statusCode: number,
        duration: number,
        userId?: string
    ): void {
        const context = {
            method,
            path,
            statusCode,
            duration: `${duration}ms`,
        };
        this.info(`HTTP ${method} ${path} ${statusCode}`, context, userId);
    }

    /**
     * Log de operação de banco de dados
     */
    static database(
        operation: string,
        table: string,
        duration: number,
        success: boolean,
        error?: Error
    ): void {
        const context = {
            operation,
            table,
            duration: `${duration}ms`,
        };

        if (success) {
            this.debug(`DB ${operation} on ${table}`, context);
        } else {
            this.error(`DB ${operation} on ${table} failed`, error, context);
        }
    }
}

export default Logger;
