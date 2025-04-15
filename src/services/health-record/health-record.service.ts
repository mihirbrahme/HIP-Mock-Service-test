import { Injectable } from '@nestjs/common';
import { HealthRecordRepository } from '../../infrastructure/database/repositories/HealthRecord.repository';
import { HealthRecordAccessRepository } from '../../infrastructure/database/repositories/HealthRecordAccess.repository';
import { PatientRepository } from '../../infrastructure/database/repositories/Patient.repository';
import { CareContextRepository } from '../../infrastructure/database/repositories/CareContext.repository';
import { ConsentService } from '../consent/consent.service';
import { CreateHealthRecordDto } from '../../dtos/health-record/CreateHealthRecordDto';
import { UpdateHealthRecordDto } from '../../dtos/health-record/UpdateHealthRecordDto';
import { QueryHealthRecordDto } from '../../dtos/health-record/QueryHealthRecordDto';
import { LogHealthRecordAccessDto } from '../../dtos/health-record/LogHealthRecordAccessDto';
import { HealthRecordResponseDto } from '../../dtos/health-record/HealthRecordResponseDto';
import { RecordStatus } from '../../infrastructure/database/entities/enums/RecordStatus';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { IHealthRecordService } from './interfaces/IHealthRecordService';
import { HealthRecordAccess } from '../../infrastructure/database/entities/HealthRecordAccess.entity';
import { HealthRecord } from '../types/HealthRecord';
import { HealthRecordType } from '../types/HealthRecordType';
import { HealthRecordMetadata } from '../types/HealthRecordMetadata';

@Injectable()
export class HealthRecordService implements IHealthRecordService {
    constructor(
        private readonly healthRecordRepository: HealthRecordRepository,
        private readonly healthRecordAccessRepository: HealthRecordAccessRepository,
        private readonly patientRepository: PatientRepository,
        private readonly careContextRepository: CareContextRepository,
        private readonly consentService: ConsentService
    ) {}

    async createHealthRecord(dto: CreateHealthRecordDto): Promise<HealthRecordResponseDto> {
        const patient = await this.patientRepository.findById(dto.patientId);
        if (!patient) {
            throw new NotFoundError('Patient not found');
        }

        const careContext = await this.careContextRepository.findOne({
            where: { id: dto.careContextId }
        });
        if (!careContext) {
            throw new NotFoundError('Care context not found');
        }

        const hasConsent = await this.consentService.hasValidConsent(
            dto.patientId,
            dto.careContextId
        );
        if (!hasConsent) {
            throw new ValidationError('Patient has not granted consent for this care context');
        }

        const healthRecord = await this.healthRecordRepository.create({
            patientId: dto.patientId,
            careContextId: dto.careContextId,
            recordType: dto.recordType,
            data: dto.data,
            metadata: dto.metadata || {},
            status: RecordStatus.ACTIVE,
            version: 1
        });

        return new HealthRecordResponseDto(healthRecord);
    }

    async updateHealthRecord(id: string, dto: UpdateHealthRecordDto): Promise<HealthRecordResponseDto> {
        const healthRecord = await this.healthRecordRepository.findOne({
            where: { id }
        });
        if (!healthRecord) {
            throw new NotFoundError('Health record not found');
        }

        const consentArtefactId = healthRecord.metadata?.consentArtefactId;
        if (!consentArtefactId) {
            throw new ValidationError('No consent artefact ID found in health record metadata');
        }

        const hasConsent = await this.consentService.validateConsentAccess(
            consentArtefactId,
            [healthRecord.recordType]
        );
        if (!hasConsent) {
            throw new ValidationError('Patient has not granted consent for this care context');
        }

        const updatedRecord = await this.healthRecordRepository.save({
            ...healthRecord,
            data: dto.data,
            metadata: dto.metadata || healthRecord.metadata,
            version: healthRecord.version + 1
        });

        return new HealthRecordResponseDto(updatedRecord);
    }

    async getHealthRecord(id: string): Promise<HealthRecordResponseDto> {
        const healthRecord = await this.healthRecordRepository.findOne({
            where: { id }
        });
        if (!healthRecord) {
            throw new NotFoundError('Health record not found');
        }

        const consentArtefactId = healthRecord.metadata?.consentArtefactId;
        if (!consentArtefactId) {
            throw new ValidationError('No consent artefact ID found in health record metadata');
        }

        const hasConsent = await this.consentService.validateConsentAccess(
            consentArtefactId,
            [healthRecord.recordType]
        );
        if (!hasConsent) {
            throw new ValidationError('Patient has not granted consent for this care context');
        }

        return new HealthRecordResponseDto(healthRecord);
    }

    async listHealthRecords(query: QueryHealthRecordDto): Promise<HealthRecordResponseDto[]> {
        const records = await this.healthRecordRepository.findByPatientId(
            query.patientId,
            {
                recordType: query.recordType,
                status: query.status,
                fromDate: query.fromDate,
                toDate: query.toDate
            }
        );

        return records.map(record => new HealthRecordResponseDto({
            id: record.id,
            patientId: record.patientId,
            careContextId: record.careContextId,
            recordType: record.recordType,
            data: record.data,
            metadata: record.metadata,
            status: record.status,
            version: record.version,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }

    async archiveHealthRecord(id: string): Promise<void> {
        const record = await this.healthRecordRepository.findById(id);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        if (!record.isAccessible()) {
            throw new ValidationError('Health record is not accessible');
        }

        await this.healthRecordRepository.updateHealthRecord(id, {
            status: RecordStatus.ARCHIVED
        });
    }

    async logHealthRecordAccess(dto: LogHealthRecordAccessDto): Promise<void> {
        const record = await this.healthRecordRepository.findById(dto.healthRecordId);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        if (!record.isAccessible()) {
            throw new ValidationError('Health record is not accessible');
        }

        const hasAccess = await this.consentService.validateConsentAccess(
            dto.consentArtefactId,
            [record.recordType]
        );

        if (!hasAccess) {
            throw new ValidationError('Access not authorized');
        }

        await this.healthRecordAccessRepository.logAccess({
            healthRecordId: dto.healthRecordId,
            consentArtefactId: dto.consentArtefactId,
            accessedBy: dto.accessedBy,
            accessType: dto.accessType,
            purpose: dto.purpose,
            metadata: dto.metadata
        });

        await this.consentService.recordConsentAccess(dto.consentArtefactId);
    }

    async getHealthRecordAccessHistory(id: string): Promise<HealthRecordAccess[]> {
        const record = await this.healthRecordRepository.findById(id);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        return this.healthRecordAccessRepository.getAccessHistory(id);
    }

    async getHealthRecordHistory(id: string): Promise<HealthRecordResponseDto[]> {
        const record = await this.healthRecordRepository.findById(id);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        const history = await this.healthRecordRepository.getRecordHistory(id);
        return history.map(record => new HealthRecordResponseDto({
            id: record.id,
            patientId: record.patientId,
            careContextId: record.careContextId,
            recordType: record.recordType,
            data: record.data,
            metadata: record.metadata,
            status: record.status,
            version: record.version,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }

    async createHealthRecordFromDto(dto: CreateHealthRecordDto): Promise<HealthRecordResponseDto> {
        const patient = await this.patientRepository.findById(dto.patientId);
        if (!patient) {
            throw new NotFoundError('Patient not found');
        }

        const careContext = await this.careContextRepository.findOne({
            where: { id: dto.careContextId }
        });
        if (!careContext) {
            throw new NotFoundError('Care context not found');
        }

        const hasConsent = await this.consentService.hasValidConsent(
            dto.patientId,
            dto.careContextId
        );
        if (!hasConsent) {
            throw new ValidationError('Patient has not granted consent for this care context');
        }

        const healthRecord = await this.healthRecordRepository.create({
            patientId: dto.patientId,
            careContextId: dto.careContextId,
            recordType: dto.recordType,
            data: dto.data,
            metadata: dto.metadata || {},
            status: RecordStatus.ACTIVE,
            version: 1
        });

        return new HealthRecordResponseDto(healthRecord);
    }

    async updateHealthRecordFromDto(id: string, dto: UpdateHealthRecordDto): Promise<HealthRecordResponseDto> {
        const healthRecord = await this.healthRecordRepository.findOne({
            where: { id }
        });
        if (!healthRecord) {
            throw new NotFoundError('Health record not found');
        }

        const consentArtefactId = healthRecord.metadata?.consentArtefactId;
        if (!consentArtefactId) {
            throw new ValidationError('No consent artefact ID found in health record metadata');
        }

        const hasConsent = await this.consentService.validateConsentAccess(
            consentArtefactId,
            [healthRecord.recordType]
        );
        if (!hasConsent) {
            throw new ValidationError('Patient has not granted consent for this care context');
        }

        const updatedRecord = await this.healthRecordRepository.save({
            ...healthRecord,
            data: dto.data,
            metadata: dto.metadata || healthRecord.metadata,
            version: healthRecord.version + 1
        });

        return new HealthRecordResponseDto(updatedRecord);
    }

    async getHealthRecordFromDto(id: string): Promise<HealthRecordResponseDto> {
        const healthRecord = await this.healthRecordRepository.findOne({
            where: { id }
        });
        if (!healthRecord) {
            throw new NotFoundError('Health record not found');
        }

        const consentArtefactId = healthRecord.metadata?.consentArtefactId;
        if (!consentArtefactId) {
            throw new ValidationError('No consent artefact ID found in health record metadata');
        }

        const hasConsent = await this.consentService.validateConsentAccess(
            consentArtefactId,
            [healthRecord.recordType]
        );
        if (!hasConsent) {
            throw new ValidationError('Patient has not granted consent for this care context');
        }

        return new HealthRecordResponseDto(healthRecord);
    }

    async listHealthRecordsFromDto(query: QueryHealthRecordDto): Promise<HealthRecordResponseDto[]> {
        const records = await this.healthRecordRepository.findByPatientId(
            query.patientId,
            {
                recordType: query.recordType,
                status: query.status,
                fromDate: query.fromDate,
                toDate: query.toDate
            }
        );

        return records.map(record => new HealthRecordResponseDto({
            id: record.id,
            patientId: record.patientId,
            careContextId: record.careContextId,
            recordType: record.recordType,
            data: record.data,
            metadata: record.metadata,
            status: record.status,
            version: record.version,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }

    async archiveHealthRecordFromDto(id: string): Promise<void> {
        const record = await this.healthRecordRepository.findById(id);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        if (!record.isAccessible()) {
            throw new ValidationError('Health record is not accessible');
        }

        await this.healthRecordRepository.updateHealthRecord(id, {
            status: RecordStatus.ARCHIVED
        });
    }

    async logHealthRecordAccessFromDto(dto: LogHealthRecordAccessDto): Promise<void> {
        const record = await this.healthRecordRepository.findById(dto.healthRecordId);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        if (!record.isAccessible()) {
            throw new ValidationError('Health record is not accessible');
        }

        const hasAccess = await this.consentService.validateConsentAccess(
            dto.consentArtefactId,
            [record.recordType]
        );

        if (!hasAccess) {
            throw new ValidationError('Access not authorized');
        }

        await this.healthRecordAccessRepository.logAccess({
            healthRecordId: dto.healthRecordId,
            consentArtefactId: dto.consentArtefactId,
            accessedBy: dto.accessedBy,
            accessType: dto.accessType,
            purpose: dto.purpose,
            metadata: dto.metadata
        });

        await this.consentService.recordConsentAccess(dto.consentArtefactId);
    }

    async getHealthRecordAccessHistoryFromDto(id: string): Promise<HealthRecordAccess[]> {
        const record = await this.healthRecordRepository.findById(id);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        return this.healthRecordAccessRepository.getAccessHistory(id);
    }

    async getHealthRecordHistoryFromDto(id: string): Promise<HealthRecordResponseDto[]> {
        const record = await this.healthRecordRepository.findById(id);
        if (!record) {
            throw new NotFoundError('Health record not found');
        }

        const history = await this.healthRecordRepository.getRecordHistory(id);
        return history.map(record => new HealthRecordResponseDto({
            id: record.id,
            patientId: record.patientId,
            careContextId: record.careContextId,
            recordType: record.recordType,
            data: record.data,
            metadata: record.metadata,
            status: record.status,
            version: record.version,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        }));
    }
} 