import { LogLevel } from './ILogger';

/**
 * Configuration options for the logger
 */
export interface ILoggerConfig {
  /**
   * Minimum log level to output
   */
  minLevel: LogLevel;

  /**
   * Whether to include timestamps in logs
   */
  includeTimestamp: boolean;

  /**
   * Whether to include stack traces for errors
   */
  includeStackTrace: boolean;

  /**
   * Output format for logs ('json' | 'text')
   */
  format: 'json' | 'text';

  /**
   * Optional prefix for all log messages
   */
  prefix?: string;

  /**
   * Optional global metadata to include in all logs
   */
  globalMetadata?: Record<string, any>;

  /**
   * Optional file path for log file output
   * If not provided, logs will only go to console
   */
  logFilePath?: string;

  /**
   * Maximum size of log file before rotation (in bytes)
   * Only applicable if logFilePath is provided
   */
  maxFileSize?: number;

  /**
   * Number of log files to keep when rotating
   * Only applicable if logFilePath is provided
   */
  maxFiles?: number;
} 