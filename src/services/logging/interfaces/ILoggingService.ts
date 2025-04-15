export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: Date;
  correlationId?: string;
  metadata?: Record<string, unknown>;
  error?: Error;
  source?: string;
  userId?: string;
  requestId?: string;
}

export interface ILoggingService {
  /**
   * Logs a message with the specified level
   * @param entry The log entry to record
   */
  log(entry: LogEntry): Promise<void>;

  /**
   * Gets logs based on filters
   * @param filters Optional filters for the logs
   * @returns Array of log entries
   */
  getLogs(filters?: {
    level?: LogLevel;
    source?: string;
    userId?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<LogEntry[]>;

  /**
   * Clears logs older than the specified date
   * @param date The date to clear logs before
   */
  clearLogsBefore(date: Date): Promise<void>;
} 