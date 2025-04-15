import { IHealthRecordService } from './interfaces/IHealthRecordService';
import { CreateHealthRecordDto } from '../../dtos/health-record/CreateHealthRecordDto';
import { UpdateHealthRecordDto } from '../../dtos/health-record/UpdateHealthRecordDto';
import { QueryHealthRecordDto } from '../../dtos/health-record/QueryHealthRecordDto';
import { LogHealthRecordAccessDto } from '../../dtos/health-record/LogHealthRecordAccessDto';
import { HealthRecordResponseDto } from '../../dtos/health-record/HealthRecordResponseDto';
import { HealthRecordRepository } from '../../infrastructure/database/repositories/HealthRecord.repository';
import { HealthRecord } from '../../infrastructure/database/entities/HealthRecord.entity';
import { HealthRecordType } from './types/HealthRecordType';
import { RecordStatus } from '../../infrastructure/database/entities/HealthRecord.entity';
import { IConsentService } from '../consent/interfaces/IConsentService';
import { IPatientService } from '../patient/interfaces/IPatientService';
import { ILoggingService } from '../logging/interfaces/ILoggingService';
import { encryptData, decryptData } from '../../utils/encryption';
import { HealthRecordAccess } from '../../infrastructure/database/entities/HealthRecordAccess.entity';

export class HealthRecordService implements IHealthRecordService {
  constructor(
    private readonly healthRecordRepository: HealthRecordRepository,
    private readonly consentService: IConsentService,
    private readonly patientService: IPatientService,
    private readonly loggingService: ILoggingService
  ) {}

  /**
   * Creates a new health record
   */
  async createRecord(dto: CreateHealthRecordDto): Promise<Record<string, unknown>> {
    // Validate patient exists
    const patient = await this.patientService.getPatientById(dto.patientId);
    if (!patient) {
      throw new Error('Patient not found');
    }

    // Validate care context exists
    const careContext = await this.patientService.getCareContextById(dto.careContextId);
    if (!careContext) {
      throw new Error('Care context not found');
    }

    // Validate consent
    const hasConsent = await this.consentService.validateConsent(
      dto.patientId,
      dto.careContextId,
      dto.recordType
    );
    if (!hasConsent) {
      throw new Error('Consent not found or expired');
    }

    // Encrypt sensitive data
    const dataStr = JSON.stringify(dto.data);
    const encryptedData = encryptData(dataStr);

    // Create record
    const record = await this.healthRecordRepository.create({
      patientId: dto.patientId,
      careContextId: dto.careContextId,
      recordType: dto.recordType,
      data: encryptedData as unknown as Record<string, unknown>,
      metadata: dto.metadata || {},
      status: RecordStatus.ACTIVE,
      version: '1'
    });

    // Log action
    await this.loggingService.log({
      level: 'INFO',
      message: 'Health record created',
      source: 'HealthRecordService',
      metadata: {
        recordId: record.id,
        patientId: dto.patientId,
        careContextId: dto.careContextId,
        recordType: dto.recordType
      }
    });

    return this.toRecord(record);
  }

  /**
   * Retrieves a health record by ID
   */
  async getRecordById(id: string): Promise<Record<string, unknown> | null> {
    const record = await this.healthRecordRepository.findById(id);
    if (!record) {
      return null;
    }

    // Validate consent
    const hasConsent = await this.consentService.validateConsent(
      record.patientId,
      record.careContextId,
      record.recordType
    );
    if (!hasConsent) {
      throw new Error('No valid consent found');
    }

    return this.toRecord(record);
  }

  /**
   * Retrieves health records for a patient
   */
  async getRecordsByPatientId(
    patientId: string,
    filters?: {
      recordType?: HealthRecordType;
      status?: RecordStatus;
      fromDate?: Date;
      toDate?: Date;
    }
  ): Promise<Record<string, unknown>[]> {
    const records = await this.healthRecordRepository.findByPatientId(patientId, filters);
    return records.map(record => this.toRecord(record));
  }

  /**
   * Updates a health record
   */
  async updateRecord(id: string, dto: UpdateHealthRecordDto): Promise<Record<string, unknown>> {
    const record = await this.healthRecordRepository.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }

    // Validate consent
    const hasConsent = await this.consentService.validateConsent(
      record.patientId,
      record.careContextId,
      record.recordType
    );
    if (!hasConsent) {
      throw new Error('No valid consent found');
    }

    // Encrypt updated data
    const dataStr = JSON.stringify(dto.data);
    const encryptedData = encryptData(dataStr);

    const updatedRecord = await this.healthRecordRepository.update(id, {
      data: encryptedData as unknown as Record<string, unknown>,
      metadata: dto.metadata || record.metadata,
      version: (parseInt(record.version || '1', 10) + 1).toString()
    });

    if (!updatedRecord) {
      throw new Error('Failed to update record');
    }

    // Log action
    await this.loggingService.log({
      level: 'INFO',
      message: 'Health record updated',
      source: 'HealthRecordService',
      metadata: {
        recordId: id,
        patientId: record.patientId,
        careContextId: record.careContextId
      }
    });

    return this.toRecord(updatedRecord);
  }

  /**
   * Deletes a health record
   */
  async deleteRecord(id: string): Promise<void> {
    const record = await this.healthRecordRepository.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }

    await this.healthRecordRepository.deleteRecord(id);

    // Log action
    await this.loggingService.log({
      level: 'INFO',
      message: 'Health record deleted',
      source: 'HealthRecordService',
      metadata: {
        recordId: id,
        patientId: record.patientId,
        careContextId: record.careContextId
      }
    });
  }

  /**
   * Changes the status of a health record
   */
  async changeRecordStatus(id: string, status: RecordStatus): Promise<void> {
    const record = await this.healthRecordRepository.findById(id);
    if (!record) {
      throw new Error('Record not found');
    }

    await this.healthRecordRepository.changeStatus(id, status);

    // Log action
    await this.loggingService.log({
      level: 'INFO',
      message: 'Health record status changed',
      source: 'HealthRecordService',
      metadata: {
        recordId: id,
        patientId: record.patientId,
        careContextId: record.careContextId,
        newStatus: status
      }
    });
  }

  /**
   * Gets the version history of a health record
   */
  async getRecordHistory(id: string): Promise<Record<string, unknown>[]> {
    const history = await this.healthRecordRepository.getRecordHistory(id);
    return history.map(record => this.toRecord(record));
  }

  /**
   * Sanitizes a health record by decrypting sensitive data
   */
  private toRecord(healthRecord: HealthRecord): Record<string, unknown> {
    const decryptedDataStr = decryptData(healthRecord.data as string);
    const decryptedData = JSON.parse(decryptedDataStr) as Record<string, unknown>;
    return {
      id: healthRecord.id,
      patientId: healthRecord.patientId,
      careContextId: healthRecord.careContextId,
      recordType: healthRecord.recordType,
      data: decryptedData,
      metadata: healthRecord.metadata || {},
      status: healthRecord.status,
      version: healthRecord.version || '1',
      createdAt: healthRecord.createdAt,
      updatedAt: healthRecord.updatedAt,
      patient: healthRecord.patient,
      careContext: healthRecord.careContext,
      accessLogs: healthRecord.accessLogs
    };
  }

  async createHealthRecord(dto: CreateHealthRecordDto): Promise<HealthRecordResponseDto> {
    const record = await this.createRecord(dto);
    return this.mapToResponseDto(record);
  }

  async updateHealthRecord(id: string, dto: UpdateHealthRecordDto): Promise<HealthRecordResponseDto> {
    const record = await this.updateRecord(id, dto);
    return this.mapToResponseDto(record);
  }

  async getHealthRecord(id: string): Promise<HealthRecordResponseDto> {
    const record = await this.getRecordById(id);
    if (!record) {
      throw new Error('Health record not found');
    }
    return this.mapToResponseDto(record);
  }

  async listHealthRecords(query: QueryHealthRecordDto): Promise<HealthRecordResponseDto[]> {
    const records = await this.getRecordsByPatientId(query.patientId, {
      recordType: query.recordType,
      status: query.status,
      fromDate: query.fromDate,
      toDate: query.toDate
    });
    return records.map(record => this.mapToResponseDto(record));
  }

  async archiveHealthRecord(id: string): Promise<void> {
    await this.changeRecordStatus(id, RecordStatus.ARCHIVED);
  }

  async logHealthRecordAccess(dto: LogHealthRecordAccessDto): Promise<void> {
    const record = await this.healthRecordRepository.findById(dto.recordId);
    if (!record) {
      throw new Error('Health record not found');
    }

    await this.loggingService.log({
      level: 'INFO',
      message: 'Health record accessed',
      source: 'HealthRecordService',
      metadata: {
        recordId: dto.recordId,
        userId: dto.userId,
        purpose: dto.purpose
      }
    });
  }

  async getHealthRecordAccessHistory(id: string): Promise<HealthRecordAccess[]> {
    const record = await this.healthRecordRepository.findById(id);
    if (!record) {
      throw new Error('Health record not found');
    }
    return record.accessLogs;
  }

  async getHealthRecordHistory(id: string): Promise<HealthRecordResponseDto[]> {
    const history = await this.getRecordHistory(id);
    return history.map(record => this.mapToResponseDto(record));
  }

  private mapToResponseDto(record: Record<string, unknown>): HealthRecordResponseDto {
    const data = record.data as Record<string, unknown>;
    return {
      id: record.id as string,
      patientId: record.patientId as string,
      careContextId: record.careContextId as string,
      recordType: record.recordType as HealthRecordType,
      data: data,
      metadata: record.metadata as Record<string, unknown>,
      status: record.status as RecordStatus,
      version: record.version as string,
      createdAt: record.createdAt as Date,
      updatedAt: record.updatedAt as Date
    };
  }
} 