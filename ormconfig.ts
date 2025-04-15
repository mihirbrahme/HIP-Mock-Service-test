import { DataSourceOptions } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

const baseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'hip_mock_system',
  synchronize: false, // Disable synchronize in production
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: ['src/subscribers/**/*.ts'],
};

const developmentConfig: DataSourceOptions = {
  ...baseConfig,
  logging: true,
};

const productionConfig: DataSourceOptions = {
  ...baseConfig,
  logging: ['error', 'warn'],
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  subscribers: ['dist/subscribers/**/*.js'],
};

const ormConfig: DataSourceOptions = 
  process.env.NODE_ENV === 'production' ? productionConfig : developmentConfig;

export default ormConfig; 