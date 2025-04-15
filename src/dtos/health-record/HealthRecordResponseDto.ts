import { HealthRecordType } from '../../services/health-record/types/HealthRecordType';
import { RecordStatus } from '../../infrastructure/database/entities/HealthRecord.entity';

export interface HealthRecordResponseDto {
    id: string;
    patientId: string;
    careContextId: string;
    recordType: HealthRecordType;
    data: Record<string, unknown>;
    metadata: Record<string, unknown>;
    status: RecordStatus;
    version: string;
    createdAt: Date;
    updatedAt: Date;
} 