export interface HealthRecordMetadata {
  source?: string;
  facility?: string;
  department?: string;
  practitioner?: string;
  deviceId?: string;
  tags?: string[];
  consentArtefactId: string;
} 