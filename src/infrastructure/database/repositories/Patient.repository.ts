import { EntityRepository, Repository } from 'typeorm';
import { Patient } from '../entities/Patient.entity';
import { NotFoundError } from '../../../utils/errors';
import { AppDataSource } from '../database.service';
import { Logger } from '../../../services/logging/Logger';
import { ConsentRequest } from '../entities/ConsentRequest.entity';
import { HealthRecord } from '../entities/HealthRecord.entity';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
    private consentRepository: Repository<ConsentRequest>;
    private healthRecordRepository: Repository<HealthRecord>;
    private logger: Logger;

    constructor() {
        super();
        this.consentRepository = AppDataSource.getRepository(ConsentRequest);
        this.healthRecordRepository = AppDataSource.getRepository(HealthRecord);
        this.logger = new Logger('PatientRepository');
    }

    async findById(id: string): Promise<Patient> {
        const patient = await this.findOne({ where: { id } });
        if (!patient) {
            throw new NotFoundError(`Patient with ID ${id} not found`);
        }
        return patient;
    }

    async findByAbhaNumber(abhaNumber: string): Promise<Patient> {
        const patient = await this.findOne({ where: { abhaNumber } });
        if (!patient) {
            throw new NotFoundError(`Patient with ABHA number ${abhaNumber} not found`);
        }
        return patient;
    }

    async createPatient(data: Partial<Patient>): Promise<Patient> {
        const patient = this.create(data);
        return this.save(patient);
    }

    async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
        const patient = await this.findById(id);
        Object.assign(patient, data);
        return this.save(patient);
    }

    async deletePatient(id: string): Promise<void> {
        const patient = await this.findById(id);
        await this.remove(patient);
    }

    async findAndCount(options: any): Promise<[Patient[], number]> {
        try {
            return await this.findAndCount(options);
        } catch (error) {
            this.logger.error('Error finding patients', { error });
            throw new Error('Failed to find patients');
        }
    }

    async getConsentCount(patientId: string): Promise<number> {
        try {
            return await this.consentRepository.count({
                where: { patientId }
            });
        } catch (error) {
            this.logger.error('Error getting consent count', { error });
            throw new Error('Failed to get consent count');
        }
    }

    async getHealthRecordCount(patientId: string): Promise<number> {
        try {
            return await this.healthRecordRepository.count({
                where: { patientId }
            });
        } catch (error) {
            this.logger.error('Error getting health record count', { error });
            throw new Error('Failed to get health record count');
        }
    }

    async getLastUpdated(patientId: string): Promise<Date> {
        try {
            const patient = await this.findOne({
                where: { id: patientId },
                select: ['updatedAt']
            });

            if (!patient) {
                throw new Error('Patient not found');
            }

            return patient.updatedAt;
        } catch (error) {
            this.logger.error('Error getting last updated timestamp', { error });
            throw new Error('Failed to get last updated timestamp');
        }
    }

    async save(patient: Patient): Promise<Patient> {
        try {
            return await this.save(patient);
        } catch (error) {
            this.logger.error('Error saving patient', { error });
            throw new Error('Failed to save patient');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.delete(id);
        } catch (error) {
            this.logger.error('Error deleting patient', { error });
            throw new Error('Failed to delete patient');
        }
    }
} 