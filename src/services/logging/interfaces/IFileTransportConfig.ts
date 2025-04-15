import { LogLevel } from '../types/LogLevel';

/**
 * Interface for FileTransport configuration
 */
export interface IFileTransportConfig {
  /**
   * Directory path where log files will be stored
   */
  logDirectory: string;

  /**
   * Maximum size of a log file in bytes before rotation
   * @default 10485760 (10MB)
   */
  maxFileSize?: number;

  /**
   * Maximum number of log files to keep
   * @default 5
   */
  maxFiles?: number;

  /**
   * Minimum log level to write
   * @default LogLevel.INFO
   */
  minLevel?: LogLevel;

  /**
   * Log file name pattern
   * @default 'app-%DATE%.log'
   */
  filename?: string;

  /**
   * Whether to append to existing log files
   * @default true
   */
  append?: boolean;

  /**
   * Whether to include timestamps in log entries
   * @default true
   */
  timestamp?: boolean;
} 