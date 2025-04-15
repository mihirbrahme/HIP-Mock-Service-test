import * as dotenv from 'dotenv';
import { Logger } from '../services/logging/Logger';

export class ConfigService {
    private static instance: ConfigService;
    private config: Record<string, string>;
    private logger: Logger;

    private constructor() {
        this.logger = new Logger({ name: 'ConfigService' });
        this.loadConfig();
    }

    public static getInstance(): ConfigService {
        if (!ConfigService.instance) {
            ConfigService.instance = new ConfigService();
        }
        return ConfigService.instance;
    }

    private loadConfig(): void {
        try {
            dotenv.config();
            // Filter out undefined values and convert to Record<string, string>
            this.config = Object.entries(process.env)
                .filter(([_, value]) => value !== undefined)
                .reduce((acc, [key, value]) => ({
                    ...acc,
                    [key]: value as string
                }), {} as Record<string, string>);
                
            this.logger.info('Configuration loaded successfully');
        } catch (error) {
            this.logger.error('Error loading configuration', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    /**
     * Get configuration value by key
     * @param key Configuration key
     * @returns Configuration value
     * @throws Error if key not found
     */
    public get(key: string): string {
        const value = this.config[key];
        if (!value) {
            this.logger.error('Configuration key not found', { key });
            throw new Error(`Configuration key not found: ${key}`);
        }
        return value;
    }

    /**
     * Get configuration value by key with default value
     * @param key Configuration key
     * @param defaultValue Default value if key not found
     * @returns Configuration value or default value
     */
    public getOrDefault(key: string, defaultValue: string): string {
        const value = this.config[key];
        if (!value) {
            this.logger.warn('Configuration key not found, using default', { key, defaultValue });
            return defaultValue;
        }
        return value;
    }

    /**
     * Check if configuration key exists
     * @param key Configuration key
     * @returns true if key exists, false otherwise
     */
    public has(key: string): boolean {
        return !!this.config[key];
    }
} 