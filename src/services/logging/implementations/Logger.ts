import { ILogger, LogLevel, LogMetadata } from '../interfaces/ILogger';
import { ILoggerConfig } from '../interfaces/ILoggerConfig';
import { ILogTransport, LogEntry } from '../interfaces/ILogTransport';
import { DEFAULT_LOGGER_CONFIG } from '../constants/logging.constants';

/**
 * Main logger implementation
 */
export class Logger implements ILogger {
  private config: ILoggerConfig;
  private transports: ILogTransport[];

  constructor(config: Partial<ILoggerConfig> = {}, transports: ILogTransport[] = []) {
    this.config = {
      ...DEFAULT_LOGGER_CONFIG,
      ...config
    };
    this.transports = transports;
  }

  /**
   * Initialize all transports
   */
  public async initialize(): Promise<void> {
    await Promise.all(this.transports.map(transport => transport.initialize()));
  }

  /**
   * Clean up all transports
   */
  public async cleanup(): Promise<void> {
    await Promise.all(this.transports.map(transport => transport.cleanup()));
  }

  /**
   * Add a transport to the logger
   * @param transport The transport to add
   */
  public addTransport(transport: ILogTransport): void {
    this.transports.push(transport);
  }

  /**
   * Log a debug message
   * @param message The message to log
   * @param metadata Additional metadata
   */
  public debug(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.DEBUG, message, undefined, metadata);
  }

  /**
   * Log an info message
   * @param message The message to log
   * @param metadata Additional metadata
   */
  public info(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, message, undefined, metadata);
  }

  /**
   * Log a warning message
   * @param message The message to log
   * @param metadata Additional metadata
   */
  public warn(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, message, undefined, metadata);
  }

  /**
   * Log an error message
   * @param message The message to log
   * @param error Optional error object
   * @param metadata Additional metadata
   */
  public error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log(LogLevel.ERROR, message, error, metadata);
  }

  /**
   * Log a fatal message
   * @param message The message to log
   * @param error Optional error object
   * @param metadata Additional metadata
   */
  public fatal(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log(LogLevel.FATAL, message, error, metadata);
  }

  /**
   * Internal method to handle logging
   */
  private log(level: LogLevel, message: string, error?: Error, metadata?: LogMetadata): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      metadata: {
        ...this.config.globalMetadata,
        ...metadata
      }
    };

    if (error) {
      entry.error = {
        message: error.message,
        name: error.name,
        stack: error.stack
      };
    }

    // Write to all transports asynchronously
    this.transports.forEach(transport => {
      transport.write(entry).catch(err => {
        console.error('Error writing to transport:', err);
      });
    });
  }

  /**
   * Check if a message should be logged based on minimum log level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = Object.values(LogLevel);
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);
    return currentLevelIndex >= minLevelIndex;
  }
} 