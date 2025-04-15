import { ILogTransport, LogEntry } from '../interfaces/ILogTransport';
import { LOG_LEVEL_COLORS, RESET_COLOR } from '../constants/logging.constants';
import { ILoggerConfig } from '../interfaces/ILoggerConfig';

/**
 * Console transport implementation for logging
 */
export class ConsoleTransport implements ILogTransport {
  private config: ILoggerConfig;

  constructor(config: ILoggerConfig) {
    this.config = config;
  }

  /**
   * Initialize the console transport
   */
  async initialize(): Promise<void> {
    // No initialization needed for console transport
  }

  /**
   * Write a log entry to the console
   * @param entry The log entry to write
   */
  async write(entry: LogEntry): Promise<void> {
    const output = this.formatLogEntry(entry);
    
    if (this.config.format === 'json') {
      console.log(JSON.stringify(output));
    } else {
      const color = LOG_LEVEL_COLORS[entry.level];
      const timestamp = this.config.includeTimestamp ? new Date(entry.timestamp).toISOString() : '';
      const prefix = this.config.prefix ? `[${this.config.prefix}]` : '';
      const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
      
      let message = `${color}${timestamp} ${prefix}[${entry.level.toUpperCase()}] ${entry.message}${metadata}${RESET_COLOR}`;
      
      if (entry.error && this.config.includeStackTrace) {
        message += `\n${entry.error.stack || entry.error.message}`;
      }
      
      console.log(message);
    }
  }

  /**
   * Clean up the console transport
   */
  async cleanup(): Promise<void> {
    // No cleanup needed for console transport
  }

  /**
   * Format a log entry based on configuration
   * @param entry The log entry to format
   */
  private formatLogEntry(entry: LogEntry): Record<string, any> {
    const output: Record<string, any> = {
      level: entry.level,
      message: entry.message
    };

    if (this.config.includeTimestamp) {
      output.timestamp = new Date(entry.timestamp).toISOString();
    }

    if (this.config.prefix) {
      output.service = this.config.prefix;
    }

    if (entry.metadata) {
      output.metadata = entry.metadata;
    }

    if (this.config.globalMetadata) {
      output.metadata = {
        ...output.metadata,
        ...this.config.globalMetadata
      };
    }

    if (entry.error) {
      output.error = {
        message: entry.error.message,
        name: entry.error.name
      };

      if (this.config.includeStackTrace && entry.error.stack) {
        output.error.stack = entry.error.stack;
      }
    }

    return output;
  }
} 