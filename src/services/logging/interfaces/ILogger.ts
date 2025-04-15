import { LogLevel } from '../types/LogLevel';
import { ILogMessage } from './ILogMessage';

/**
 * Represents the severity level of a log message
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Represents metadata that can be attached to a log message
 */
export interface LogMetadata {
  timestamp?: number;
  correlationId?: string;
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Interface defining the logger service functionality
 */
export interface ILogger {
  /**
   * Log a message at the specified level
   */
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log a debug level message
   */
  debug(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log an info level message
   */
  info(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log a warning level message
   */
  warn(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Log an error level message
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;

  /**
   * Log a fatal level message
   */
  fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void;

  /**
   * Set the minimum log level
   */
  setMinLevel(level: LogLevel): void;

  /**
   * Get the current minimum log level
   */
  getMinLevel(): LogLevel;

  /**
   * Add correlation ID to the logger context
   */
  setCorrelationId(correlationId: string): void;

  /**
   * Add request ID to the logger context
   */
  setRequestId(requestId: string): void;

  /**
   * Set the service/component name for the logger
   */
  setService(service: string): void;

  /**
   * Format a log message according to the logger's configuration
   */
  formatMessage(level: LogLevel, message: string, error?: Error, metadata?: Record<string, unknown>): ILogMessage;
} 