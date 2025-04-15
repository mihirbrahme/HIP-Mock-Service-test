import { HealthRecordType } from './HealthRecordType';
import { RecordStatus } from './RecordStatus';

export interface HealthRecord {
  id: string;
  patientId: string;
  careContextId: string;
  recordType: HealthRecordType;
  data: Record<string, unknown>;
  metadata: {
    source: string;
    provider: string;
    date: Date;
    version: string;
    [key: string]: unknown;
  };
  status: RecordStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
} 