import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { Logger } from '../../services/logging/Logger';

export class DatabaseService {
    private static instance: DatabaseService;
    private dataSource: DataSource;
    private logger: Logger;

    private constructor() {
        this.dataSource = new DataSource(databaseConfig);
        this.logger = new Logger({ name: 'DatabaseService' });
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public async initialize(): Promise<void> {
        try {
            if (!this.dataSource.isInitialized) {
                await this.dataSource.initialize();
                this.logger.info('Database connection established successfully');
            }
        } catch (error) {
            this.logger.error('Error during database initialization:', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.dataSource.isInitialized) {
                await this.dataSource.destroy();
                this.logger.info('Database connection closed successfully');
            }
        } catch (error) {
            this.logger.error('Error during database disconnection:', {
                error: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    }

    public getDataSource(): DataSource {
        if (!this.dataSource.isInitialized) {
            throw new Error('Database connection not initialized');
        }
        return this.dataSource;
    }

    public getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
        return this.getDataSource().getRepository(entity);
    }
} 