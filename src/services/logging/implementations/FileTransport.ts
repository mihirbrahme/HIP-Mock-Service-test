import * as fs from 'fs';
import * as path from 'path';
import { ILogTransport, LogEntry } from '../interfaces/ILogTransport';
import { ILoggerConfig } from '../interfaces/ILoggerConfig';
import { MAX_LOG_FILE_SIZE, DEFAULT_MAX_LOG_FILES } from '../constants/logging.constants';

/**
 * File transport implementation with rotation support
 */
export class FileTransport implements ILogTransport {
  private config: ILoggerConfig;
  private currentFileStream: fs.WriteStream | null = null;
  private currentFileSize: number = 0;

  constructor(config: ILoggerConfig) {
    this.config = config;
    if (!this.config.logFilePath) {
      throw new Error('logFilePath is required for FileTransport');
    }
  }

  /**
   * Initialize the file transport
   */
  public async initialize(): Promise<void> {
    await this.ensureLogDirectory();
    await this.openLogStream();
  }

  /**
   * Clean up the file transport
   */
  public async cleanup(): Promise<void> {
    if (this.currentFileStream) {
      await new Promise<void>((resolve, reject) => {
        this.currentFileStream!.end(err => {
          if (err) reject(err);
          else resolve();
        });
      });
      this.currentFileStream = null;
    }
  }

  /**
   * Write a log entry to the file
   */
  public async write(entry: LogEntry): Promise<void> {
    if (!this.currentFileStream) {
      await this.openLogStream();
    }

    const logString = this.formatLogEntry(entry);
    const logBuffer = Buffer.from(logString + '\n');

    // Check if we need to rotate
    if (this.currentFileSize + logBuffer.length > (this.config.maxFileSize || MAX_LOG_FILE_SIZE)) {
      await this.rotateLog();
    }

    return new Promise((resolve, reject) => {
      this.currentFileStream!.write(logBuffer, err => {
        if (err) {
          reject(err);
        } else {
          this.currentFileSize += logBuffer.length;
          resolve();
        }
      });
    });
  }

  /**
   * Format a log entry as a string
   */
  private formatLogEntry(entry: LogEntry): string {
    const logData = {
      timestamp: new Date(entry.timestamp).toISOString(),
      level: entry.level,
      message: entry.message,
      ...entry.metadata
    };

    if (entry.error) {
      logData['error'] = {
        message: entry.error.message,
        name: entry.error.name,
        stack: entry.error.stack
      };
    }

    return JSON.stringify(logData);
  }

  /**
   * Ensure the log directory exists
   */
  private async ensureLogDirectory(): Promise<void> {
    const dir = path.dirname(this.config.logFilePath!);
    await fs.promises.mkdir(dir, { recursive: true });
  }

  /**
   * Open a new log stream
   */
  private async openLogStream(): Promise<void> {
    this.currentFileStream = fs.createWriteStream(this.config.logFilePath!, { flags: 'a' });
    
    try {
      const stats = await fs.promises.stat(this.config.logFilePath!);
      this.currentFileSize = stats.size;
    } catch (error) {
      this.currentFileSize = 0;
    }
  }

  /**
   * Rotate log files
   */
  private async rotateLog(): Promise<void> {
    await this.cleanup();

    const maxFiles = this.config.maxFiles || DEFAULT_MAX_LOG_FILES;
    const baseFilePath = this.config.logFilePath!;
    const ext = path.extname(baseFilePath);
    const baseFileName = path.basename(baseFilePath, ext);
    const dir = path.dirname(baseFilePath);

    // Rotate existing files
    for (let i = maxFiles - 1; i >= 0; i--) {
      const oldPath = i === 0 
        ? baseFilePath 
        : path.join(dir, `${baseFileName}.${i}${ext}`);
      const newPath = path.join(dir, `${baseFileName}.${i + 1}${ext}`);

      try {
        await fs.promises.access(oldPath);
        if (i === maxFiles - 1) {
          await fs.promises.unlink(oldPath);
        } else {
          await fs.promises.rename(oldPath, newPath);
        }
      } catch (error) {
        // File doesn't exist, skip
      }
    }

    await this.openLogStream();
  }
} 