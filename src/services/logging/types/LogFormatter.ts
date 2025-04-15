import { LogEntry } from './LogEntry';

/**
 * Interface for log formatters that define how log entries should be formatted
 */
export interface LogFormatter {
    /**
     * Format a log entry into a string representation
     * @param entry The log entry to format
     * @returns A formatted string representation of the log entry
     */
    format(entry: LogEntry): string;
} 