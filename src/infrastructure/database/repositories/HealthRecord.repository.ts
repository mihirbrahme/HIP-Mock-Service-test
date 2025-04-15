import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { HealthRecord } from '../entities/HealthRecord.entity';
import { HealthRecordType, RecordStatus } from '../entities/HealthRecord.entity';
import { NotFoundError } from '../../../utils/errors';

export class HealthRecordRepository {
    private repository: Repository<HealthRecord>;

    constructor() {
        this.repository = AppDataSource.getRepository(HealthRecord);
    }

    /**
     * Creates a new health record
     * @param record The health record to create
     * @returns The created health record
     */
    async create(record: Partial<HealthRecord>): Promise<HealthRecord> {
        const newRecord = this.repository.create(record);
        return await this.repository.save(newRecord);
    }

    /**
     * Finds a health record by ID
     * @param id The record ID
     * @returns The health record or null if not found
     */
    async findById(id: string): Promise<HealthRecord | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ['patient', 'careContext']
        });
    }

    /**
     * Finds health records by patient ID
     * @param patientId The patient ID
     * @param filters Optional filters for the records
     * @returns Array of health records
     */
    async findByPatientId(
        patientId: string,
        filters?: {
            recordType?: HealthRecordType;
            status?: RecordStatus;
            fromDate?: Date;
            toDate?: Date;
        }
    ): Promise<HealthRecord[]> {
        const query = this.repository
            .createQueryBuilder('record')
            .leftJoinAndSelect('record.patient', 'patient')
            .leftJoinAndSelect('record.careContext', 'careContext')
            .where('record.patientId = :patientId', { patientId });

        if (filters?.recordType) {
            query.andWhere('record.recordType = :recordType', { recordType: filters.recordType });
        }

        if (filters?.status) {
            query.andWhere('record.status = :status', { status: filters.status });
        }

        if (filters?.fromDate) {
            query.andWhere('record.createdAt >= :fromDate', { fromDate: filters.fromDate });
        }

        if (filters?.toDate) {
            query.andWhere('record.createdAt <= :toDate', { toDate: filters.toDate });
        }

        return await query.getMany();
    }

    /**
     * Updates a health record
     * @param id The record ID
     * @param updates The updates to apply
     * @returns The updated health record
     */
    async update(id: string, updates: Partial<HealthRecord>): Promise<HealthRecord | null> {
        const record = await this.findById(id);
        if (!record) {
            return null;
        }

        Object.assign(record, updates);
        return await this.repository.save(record);
    }

    /**
     * Soft deletes a health record
     * @param id The record ID
     */
    async softDelete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    /**
     * Changes the status of a health record
     * @param id The record ID
     * @param status The new status
     * @returns The updated health record
     */
    async changeStatus(id: string, status: RecordStatus): Promise<HealthRecord | null> {
        return await this.update(id, { status });
    }

    /**
     * Gets the version history of a health record
     * @param id The record ID
     * @returns Array of version history entries
     */
    async getHistory(id: string): Promise<HealthRecord[]> {
        // This is a placeholder implementation
        // In a real system, you would implement proper versioning
        const record = await this.findById(id);
        return record ? [record] : [];
    }

    async findByCareContextId(careContextId: string): Promise<HealthRecord[]> {
        return this.repository.find({
            where: { careContextId },
            relations: ['patient', 'careContext']
        });
    }

    async archiveRecord(id: string): Promise<void> {
        const record = await this.findById(id);
        if (record) {
            record.archive();
            await this.repository.save(record);
        }
    }

    async deleteRecord(id: string): Promise<void> {
        const record = await this.findById(id);
        if (record) {
            record.softDelete();
            await this.repository.save(record);
        }
    }

    async getRecordHistory(id: string): Promise<HealthRecord[]> {
        return this.repository.createQueryBuilder('record')
            .where('record.id = :id', { id })
            .orderBy('record.version', 'DESC')
            .getMany();
    }
} 