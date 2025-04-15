import { LogLevel } from './LogLevel';

/**
 * Interface representing a structured log entry
 */
export interface LogEntry {
    /** The severity level of the log entry */
    level: LogLevel;

    /** The main message to be logged */
    message: string;

    /** Timestamp when the log entry was created */
    timestamp: Date;

    /** Optional correlation ID for request tracing */
    correlationId?: string;

    /** Optional metadata object containing additional context */
    metadata?: Record<string, unknown>;

    /** Optional error object if this is an error log */
    error?: Error;

    /** The name of the service or component that generated the log */
    source?: string;

    /** Optional user ID associated with the log entry */
    userId?: string;

    /** Optional request ID for tracking HTTP requests */
    requestId?: string;
} 