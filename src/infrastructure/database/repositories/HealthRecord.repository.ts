import { EntityRepository, Repository } from 'typeorm';
import { HealthRecord } from '../entities/HealthRecord.entity';
import { HealthRecordType } from '../entities/enums/HealthRecordType';
import { RecordStatus } from '../entities/enums/RecordStatus';
import { NotFoundError } from '../../../utils/errors';

@EntityRepository(HealthRecord)
export class HealthRecordRepository extends Repository<HealthRecord> {
    async createHealthRecord(data: Partial<HealthRecord>): Promise<HealthRecord> {
        const record = this.create(data);
        return this.save(record);
    }

    async findById(id: string): Promise<HealthRecord> {
        const record = await this.findOne({
            where: { id },
            relations: ['patient', 'careContext']
        });

        if (!record) {
            throw new NotFoundError(`Health record with ID ${id} not found`);
        }

        return record;
    }

    async findByPatientId(
        patientId: string,
        options?: {
            recordType?: HealthRecordType;
            status?: RecordStatus;
            fromDate?: Date;
            toDate?: Date;
        }
    ): Promise<HealthRecord[]> {
        const query = this.createQueryBuilder('record')
            .leftJoinAndSelect('record.careContext', 'careContext')
            .where('record.patientId = :patientId', { patientId });

        if (options?.recordType) {
            query.andWhere('record.recordType = :recordType', { recordType: options.recordType });
        }

        if (options?.status) {
            query.andWhere('record.status = :status', { status: options.status });
        }

        if (options?.fromDate) {
            query.andWhere('record.createdAt >= :fromDate', { fromDate: options.fromDate });
        }

        if (options?.toDate) {
            query.andWhere('record.createdAt <= :toDate', { toDate: options.toDate });
        }

        return query.getMany();
    }

    async findByCareContextId(careContextId: string): Promise<HealthRecord[]> {
        return this.find({
            where: { careContextId },
            relations: ['patient', 'careContext']
        });
    }

    async updateHealthRecord(id: string, data: Partial<HealthRecord>): Promise<HealthRecord> {
        const record = await this.findById(id);
        Object.assign(record, data);
        return this.save(record);
    }

    async archiveRecord(id: string): Promise<void> {
        const record = await this.findById(id);
        record.archive();
        await this.save(record);
    }

    async deleteRecord(id: string): Promise<void> {
        const record = await this.findById(id);
        record.softDelete();
        await this.save(record);
    }

    async getRecordHistory(id: string): Promise<HealthRecord[]> {
        return this.createQueryBuilder('record')
            .where('record.id = :id', { id })
            .orderBy('record.version', 'DESC')
            .getMany();
    }
} 