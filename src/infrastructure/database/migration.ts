import { DataSource } from 'typeorm';
import { databaseConfig } from '../../config/database';

const dataSource = new DataSource(databaseConfig);

dataSource.initialize()
    .then(async () => {
        console.log('Running migrations...');
        return dataSource.runMigrations();
    })
    .then((migrations) => {
        console.log('Migrations completed successfully');
        console.log('Applied migrations:', migrations.map(m => m.name).join(', '));
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during migration:', error);
        process.exit(1);
    }); 