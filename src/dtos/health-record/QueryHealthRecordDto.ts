import { HealthRecordType } from '../../services/health-record/types/HealthRecordType';
import { RecordStatus } from '../../infrastructure/database/entities/HealthRecord.entity';

export interface QueryHealthRecordDto {
    patientId: string;
    recordType?: HealthRecordType;
    status?: RecordStatus;
    fromDate?: Date;
    toDate?: Date;
} 