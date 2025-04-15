import { HealthRecordType } from '../../services/health-record/types/HealthRecordType';

export interface CreateHealthRecordDto {
    patientId: string;
    careContextId: string;
    recordType: HealthRecordType;
    data: Record<string, unknown>;
    metadata?: Record<string, unknown>;
} 