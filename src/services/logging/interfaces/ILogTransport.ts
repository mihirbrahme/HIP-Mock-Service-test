import { LogLevel } from '../types/LogLevel';
import { LogEntry } from '../types/LogEntry';

/**
 * Interface for log entry metadata
 */
export interface LogMetadata {
  correlationId?: string;
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Interface for log transport implementations
 * Transports are responsible for writing log entries to their respective destinations
 */
export interface ILogTransport {
  /**
   * Write a log entry to the transport destination
   * @param entry The log entry to write
   * @returns A promise that resolves when the write is complete
   */
  write(entry: LogEntry): Promise<void>;

  /**
   * Close the transport and clean up any resources
   * @returns A promise that resolves when cleanup is complete
   */
  close(): Promise<void>;
} 