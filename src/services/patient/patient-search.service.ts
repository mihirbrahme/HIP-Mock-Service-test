import { Patient } from '../../infrastructure/database/entities/Patient.entity';
import { Logger } from '../logging/Logger';
import { PatientRepository } from '../../infrastructure/database/repositories/Patient.repository';

interface SearchCriteria {
  name?: string;
  abhaId?: string;
  gender?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  email?: string;
  address?: string;
  limit?: number;
  offset?: number;
}

interface SearchResult {
  patients: Patient[];
  total: number;
  page: number;
  limit: number;
}

export class PatientSearchService {
  private logger: Logger;
  private patientRepository: PatientRepository;

  constructor() {
    this.logger = new Logger('PatientSearchService');
    this.patientRepository = new PatientRepository();
  }

  async searchPatients(criteria: SearchCriteria): Promise<SearchResult> {
    try {
      const { name, abhaId, gender, dateOfBirth, phoneNumber, email, address, limit = 10, offset = 0 } = criteria;

      // Build query conditions
      const conditions: any = {};
      
      if (name) {
        conditions.name = { $regex: name, $options: 'i' };
      }
      
      if (abhaId) {
        conditions.abhaId = abhaId;
      }
      
      if (gender) {
        conditions.gender = gender;
      }
      
      if (dateOfBirth) {
        conditions.dateOfBirth = dateOfBirth;
      }
      
      if (phoneNumber) {
        conditions.phoneNumber = phoneNumber;
      }
      
      if (email) {
        conditions.email = email;
      }
      
      if (address) {
        conditions.address = { $regex: address, $options: 'i' };
      }

      // Execute search with pagination
      const [patients, total] = await this.patientRepository.findAndCount({
        where: conditions,
        skip: offset,
        take: limit,
        order: {
          createdAt: 'DESC'
        }
      });

      this.logger.info(`Found ${total} patients matching search criteria`);

      return {
        patients,
        total,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      this.logger.error('Error searching patients', { error });
      throw new Error('Failed to search patients');
    }
  }

  async getPatientSummary(patientId: string): Promise<{
    patient: Patient;
    consentCount: number;
    healthRecordCount: number;
    lastUpdated: Date;
  }> {
    try {
      const patient = await this.patientRepository.findOne({ where: { id: patientId } });
      
      if (!patient) {
        throw new Error('Patient not found');
      }

      // Get consent count
      const consentCount = await this.patientRepository.getConsentCount(patientId);
      
      // Get health record count
      const healthRecordCount = await this.patientRepository.getHealthRecordCount(patientId);
      
      // Get last updated timestamp
      const lastUpdated = await this.patientRepository.getLastUpdated(patientId);

      return {
        patient,
        consentCount,
        healthRecordCount,
        lastUpdated
      };
    } catch (error) {
      this.logger.error('Error getting patient summary', { error });
      throw new Error('Failed to get patient summary');
    }
  }
} 