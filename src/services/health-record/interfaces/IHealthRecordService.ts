import { HealthRecord } from '../types/HealthRecord';
import { HealthRecordType } from '../types/HealthRecordType';
import { RecordStatus } from '../types/RecordStatus';
import { HealthRecordAccess } from '../../../infrastructure/database/entities/HealthRecordAccess.entity';
import { CreateHealthRecordDto } from '../../../dtos/health-record/CreateHealthRecordDto';
import { UpdateHealthRecordDto } from '../../../dtos/health-record/UpdateHealthRecordDto';
import { QueryHealthRecordDto } from '../../../dtos/health-record/QueryHealthRecordDto';
import { LogHealthRecordAccessDto } from '../../../dtos/health-record/LogHealthRecordAccessDto';
import { HealthRecordResponseDto } from '../../../dtos/health-record/HealthRecordResponseDto';

export interface IHealthRecordService {
    /**
     * Creates a new health record
     */
    createHealthRecord(dto: CreateHealthRecordDto): Promise<HealthRecordResponseDto>;

    /**
     * Updates an existing health record
     */
    updateHealthRecord(id: string, dto: UpdateHealthRecordDto): Promise<HealthRecordResponseDto>;

    /**
     * Retrieves a health record by ID
     */
    getHealthRecord(id: string): Promise<HealthRecordResponseDto>;

    /**
     * Lists health records based on query parameters
     */
    listHealthRecords(query: QueryHealthRecordDto): Promise<HealthRecordResponseDto[]>;

    /**
     * Archives a health record
     */
    archiveHealthRecord(id: string): Promise<void>;

    /**
     * Logs access to a health record
     */
    logHealthRecordAccess(dto: LogHealthRecordAccessDto): Promise<void>;

    /**
     * Gets the access history for a health record
     */
    getHealthRecordAccessHistory(id: string): Promise<HealthRecordAccess[]>;

    /**
     * Gets the version history for a health record
     */
    getHealthRecordHistory(id: string): Promise<HealthRecordResponseDto[]>;

    createRecord(
        patientId: string,
        careContextId: string,
        recordType: HealthRecordType,
        data: Record<string, unknown>,
        metadata: Record<string, unknown>
    ): Promise<HealthRecord>;

    getRecordById(id: string): Promise<HealthRecord | null>;

    getRecordsByPatientId(
        patientId: string,
        filters?: {
            recordType?: HealthRecordType;
            status?: RecordStatus;
            startDate?: Date;
            endDate?: Date;
        }
    ): Promise<HealthRecord[]>;

    updateRecord(
        id: string,
        updates: Partial<Omit<HealthRecord, 'id' | 'patientId' | 'careContextId' | 'createdAt'>>
    ): Promise<HealthRecord>;

    deleteRecord(id: string): Promise<void>;

    changeRecordStatus(id: string, status: RecordStatus): Promise<HealthRecord>;

    getRecordHistory(id: string): Promise<HealthRecord[]>;
} 