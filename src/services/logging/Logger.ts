import { getRequestContext } from '../../middleware/requestContext.middleware';
import { InMemoryMetricsCollector } from '../monitoring/MetricsCollector';

interface LoggerConfig {
    name: string;
    level?: LogLevel;
}

export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    DEBUG = 'debug'
}

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3
};

interface LogMessage {
    level: LogLevel;
    message: string;
    timestamp: string;
    service: string;
    requestId?: string;
    correlationId?: string;
    userId?: string;
    metadata?: Record<string, unknown>;
}

export class Logger {
    private name: string;
    private level: LogLevel;
    private metricsCollector: InMemoryMetricsCollector;

    constructor(config: LoggerConfig) {
        this.name = config.name;
        this.level = config.level || LogLevel.INFO;
        this.metricsCollector = InMemoryMetricsCollector.getInstance();
    }

    public error(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.ERROR, message, metadata);
    }

    public warn(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, metadata);
    }

    public info(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, metadata);
    }

    public debug(message: string, metadata?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, metadata);
    }

    private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
        if (LOG_LEVEL_SEVERITY[level] > LOG_LEVEL_SEVERITY[this.level]) {
            return;
        }

        const context = getRequestContext();
        const timestamp = new Date().toISOString();

        const logMessage: LogMessage = {
            level,
            message,
            timestamp,
            service: this.name,
            requestId: context?.requestId,
            correlationId: context?.correlationId,
            userId: context?.userId,
            metadata
        };

        // Record metrics
        this.metricsCollector.incrementCounter('log.count', 1, {
            level,
            service: this.name
        });

        // Output log message
        const output = JSON.stringify(logMessage);
        
        switch (level) {
            case LogLevel.ERROR:
                console.error(output);
                break;
            case LogLevel.WARN:
                console.warn(output);
                break;
            case LogLevel.INFO:
                console.info(output);
                break;
            case LogLevel.DEBUG:
                console.debug(output);
                break;
        }
    }

    public setLevel(level: LogLevel): void {
        this.level = level;
    }
} 