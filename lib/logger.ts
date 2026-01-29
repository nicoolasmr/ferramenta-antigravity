/**
 * Structured logger utility for ANTIGRAVITY.
 * replaces console.log and console.error with environment-aware logging.
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    CRITICAL = 'critical',
}

interface LogContext {
    [key: string]: any;
}

const currentLogLevel = (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) || (process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO);

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.CRITICAL]: 4,
};

function shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLogLevel];
}

function formatLog(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    return {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...context,
    };
}

export const logger = {
    debug(message: string, context?: LogContext) {
        if (shouldLog(LogLevel.DEBUG)) {
            console.debug(JSON.stringify(formatLog(LogLevel.DEBUG, message, context)));
        }
    },

    info(message: string, context?: LogContext) {
        if (shouldLog(LogLevel.INFO)) {
            console.info(JSON.stringify(formatLog(LogLevel.INFO, message, context)));
        }
    },

    warn(message: string, context?: LogContext) {
        if (shouldLog(LogLevel.WARN)) {
            console.warn(JSON.stringify(formatLog(LogLevel.WARN, message, context)));
        }
    },

    error(message: string, context?: LogContext) {
        if (shouldLog(LogLevel.ERROR)) {
            console.error(JSON.stringify(formatLog(LogLevel.ERROR, message, context)));
        }
    },

    critical(message: string, context?: LogContext) {
        if (shouldLog(LogLevel.CRITICAL)) {
            console.error(JSON.stringify(formatLog(LogLevel.CRITICAL, message, context)));
        }
    },
};
