import { LogLevel } from './LogLevel';

/**
 * Configuration options for the logging service.
 */
export interface LoggerConfig {
    /** Minimum level of logs to process */
    minimumLevel: LogLevel;
    
    /** Whether to include timestamps in log output */
    includeTimestamp: boolean;
    
    /** Whether to include correlation IDs in log output */
    includeCorrelationId: boolean;
    
    /** Format for log output ('json' | 'text') */
    outputFormat: 'json' | 'text';
    
    /** Optional file path for log file output */
    logFilePath?: string;
    
    /** Whether to also output logs to console */
    consoleOutput: boolean;
    
    /** Whether to pretty print JSON output */
    prettyPrint?: boolean;
} 