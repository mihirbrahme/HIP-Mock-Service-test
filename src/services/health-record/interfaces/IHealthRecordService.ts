import { HealthRecord } from '../types/HealthRecord';
import { HealthRecordType } from '../../../infrastructure/database/entities/HealthRecord.entity';
import { RecordStatus } from '../../../infrastructure/database/entities/HealthRecord.entity';
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

    /**
     * Creates a new health record
     * @param dto The data to create the record
     * @returns The created health record
     */
    createRecord(dto: CreateHealthRecordDto): Promise<Record<string, unknown>>;

    /**
     * Retrieves a health record by ID
     * @param id The record ID
     * @returns The health record or null if not found
     */
    getRecordById(id: string): Promise<Record<string, unknown> | null>;

    /**
     * Retrieves health records for a patient
     * @param patientId The patient ID
     * @param filters Optional filters for the records
     * @returns Array of health records
     */
    getRecordsByPatientId(
        patientId: string,
        filters?: {
            recordType?: HealthRecordType;
            status?: RecordStatus;
            fromDate?: Date;
            toDate?: Date;
        }
    ): Promise<Record<string, unknown>[]>;

    /**
     * Updates a health record
     * @param id The record ID
     * @param dto The update data
     * @returns The updated health record
     */
    updateRecord(id: string, dto: UpdateHealthRecordDto): Promise<Record<string, unknown>>;

    /**
     * Deletes a health record
     * @param id The record ID
     */
    deleteRecord(id: string): Promise<void>;

    /**
     * Changes the status of a health record
     * @param id The record ID
     * @param status The new status
     */
    changeRecordStatus(id: string, status: RecordStatus): Promise<void>;

    /**
     * Gets the version history of a health record
     * @param id The record ID
     * @returns Array of version history entries
     */
    getRecordHistory(id: string): Promise<Record<string, unknown>[]>;
} 