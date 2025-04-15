import { LogLevel } from '../interfaces/ILogger';
import { ILoggerConfig } from '../interfaces/ILoggerConfig';

/**
 * Default configuration for the logger
 */
export const DEFAULT_LOGGER_CONFIG: ILoggerConfig = {
  minLevel: LogLevel.INFO,
  includeTimestamp: true,
  includeStackTrace: true,
  format: 'json',
  prefix: 'HIP-MOCK',
  globalMetadata: {
    service: 'hip-mock-system',
    environment: process.env.NODE_ENV || 'development'
  }
};

/**
 * Maximum log file size (100MB)
 */
export const MAX_LOG_FILE_SIZE = 100 * 1024 * 1024;

/**
 * Default number of log files to keep
 */
export const DEFAULT_MAX_LOG_FILES = 5;

/**
 * Log level priorities (higher number = higher priority)
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4
};

/**
 * ANSI color codes for different log levels in console output
 */
export const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.FATAL]: '\x1b[35m'  // Magenta
};

/**
 * Reset ANSI color code
 */
export const RESET_COLOR = '\x1b[0m'; 