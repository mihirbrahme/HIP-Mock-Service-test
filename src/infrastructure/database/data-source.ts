import { DataSource } from 'typeorm';
import { HealthRecord } from './entities/HealthRecord.entity';
import { Patient } from './entities/Patient.entity';
import { CareContext } from './entities/CareContext.entity';
import { ConsentRequest } from './entities/ConsentRequest.entity';
import { ConsentDetail } from './entities/ConsentDetail.entity';
import { ConsentArtefact } from './entities/ConsentArtefact.entity';
import { HealthRecordAccess } from './entities/HealthRecordAccess.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'health_records',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [
    HealthRecord,
    Patient,
    CareContext,
    ConsentRequest,
    ConsentDetail,
    ConsentArtefact,
    HealthRecordAccess
  ],
  migrations: [],
  subscribers: []
}); 