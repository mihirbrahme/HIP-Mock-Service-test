/**
 * Enum representing different severity levels for logging.
 */
export enum LogLevel {
    /** For detailed debugging information */
    DEBUG = 'DEBUG',
    
    /** For general information about program execution */
    INFO = 'INFO',
    
    /** For potentially harmful situations */
    WARN = 'WARN',
    
    /** For error events that might still allow the application to continue running */
    ERROR = 'ERROR',
    
    /** For very severe error events that will presumably lead the application to abort */
    FATAL = 'FATAL'
}

/**
 * Maps LogLevel to numeric severity value for comparison
 */
export const LogLevelSeverity: { [key in LogLevel]: number } = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.FATAL]: 4
};

/**
 * Type for log level strings
 */
export type LogLevelString = keyof typeof LogLevel; 