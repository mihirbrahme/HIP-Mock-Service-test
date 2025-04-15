import { LogLevel } from '../types/LogLevel';

/**
 * Interface for structured log messages
 */
export interface ILogMessage {
  /**
   * Log level of the message
   */
  level: LogLevel;

  /**
   * Timestamp of when the log was created
   */
  timestamp: Date;

  /**
   * The actual message content
   */
  message: string;

  /**
   * Optional error object if this is an error log
   */
  error?: Error;

  /**
   * Optional metadata/context for the log entry
   */
  metadata?: Record<string, unknown>;

  /**
   * Service or component name that generated the log
   */
  service?: string;

  /**
   * Correlation ID for request tracing
   */
  correlationId?: string;

  /**
   * Request ID for tracking specific requests
   */
  requestId?: string;
} 