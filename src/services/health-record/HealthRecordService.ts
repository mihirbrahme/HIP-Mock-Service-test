import { IHealthRecordService } from './interfaces/IHealthRecordService';
import { HealthRecord } from './types/HealthRecord';
import { HealthRecordType } from './types/HealthRecordType';
import { RecordStatus } from './types/RecordStatus';
import { v4 as uuidv4 } from 'uuid';

export class HealthRecordService implements IHealthRecordService {
  private records: Map<string, HealthRecord> = new Map();

  async createRecord(
    patientId: string,
    careContextId: string,
    recordType: HealthRecordType,
    data: Record<string, unknown>,
    metadata: Record<string, unknown>
  ): Promise<HealthRecord> {
    const now = new Date();
    const record: HealthRecord = {
      id: uuidv4(),
      patientId,
      careContextId,
      recordType,
      data,
      metadata: {
        source: 'MOCK_SYSTEM',
        provider: 'MOCK_PROVIDER',
        date: now,
        version: '1.0',
        ...metadata
      },
      status: RecordStatus.ACTIVE,
      version: 1,
      createdAt: now,
      updatedAt: now
    };

    this.records.set(record.id, record);
    return record;
  }

  async getRecordById(id: string): Promise<HealthRecord | null> {
    return this.records.get(id) || null;
  }

  async getRecordsByPatientId(
    patientId: string,
    filters?: {
      recordType?: HealthRecordType;
      status?: RecordStatus;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<HealthRecord[]> {
    let records = Array.from(this.records.values())
      .filter(record => record.patientId === patientId);

    if (filters) {
      if (filters.recordType) {
        records = records.filter(record => record.recordType === filters.recordType);
      }
      if (filters.status) {
        records = records.filter(record => record.status === filters.status);
      }
      if (filters.startDate) {
        records = records.filter(record => record.createdAt >= filters.startDate!);
      }
      if (filters.endDate) {
        records = records.filter(record => record.createdAt <= filters.endDate!);
      }
    }

    return records;
  }

  async updateRecord(
    id: string,
    updates: Partial<Omit<HealthRecord, 'id' | 'patientId' | 'careContextId' | 'createdAt'>>
  ): Promise<HealthRecord> {
    const record = this.records.get(id);
    if (!record) {
      throw new Error('Record not found');
    }

    const updatedRecord: HealthRecord = {
      ...record,
      ...updates,
      updatedAt: new Date(),
      version: record.version + 1
    };

    this.records.set(id, updatedRecord);
    return updatedRecord;
  }

  async deleteRecord(id: string): Promise<void> {
    if (!this.records.has(id)) {
      throw new Error('Record not found');
    }
    this.records.delete(id);
  }

  async changeRecordStatus(id: string, status: RecordStatus): Promise<HealthRecord> {
    return this.updateRecord(id, { status });
  }

  async getRecordHistory(id: string): Promise<HealthRecord[]> {
    // In a real implementation, this would return the version history
    // For mock purposes, we'll just return the current record
    const record = this.records.get(id);
    return record ? [record] : [];
  }
} 