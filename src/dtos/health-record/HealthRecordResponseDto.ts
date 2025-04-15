import { HealthRecordType } from '../../infrastructure/database/entities/enums/HealthRecordType';
import { RecordStatus } from '../../infrastructure/database/entities/enums/RecordStatus';

export class HealthRecordResponseDto {
    id: string;
    patientId: string;
    careContextId: string;
    recordType: HealthRecordType;
    data: Record<string, any>;
    metadata?: {
        source?: string;
        facility?: string;
        department?: string;
        practitioner?: string;
        deviceId?: string;
        tags?: string[];
    };
    status: RecordStatus;
    version: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<HealthRecordResponseDto>) {
        Object.assign(this, partial);
    }
} 