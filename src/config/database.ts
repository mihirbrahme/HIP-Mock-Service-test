import { DataSourceOptions } from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();

export const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'hip_mock_system',
    entities: ['src/models/database/**/*.ts'],
    migrations: ['src/infrastructure/database/migrations/**/*.ts'],
    synchronize: process.env.NODE_ENV === 'development', // Only enable in development
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
}; 