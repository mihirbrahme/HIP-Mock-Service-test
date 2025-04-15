import { Injectable } from '@nestjs/common';
import { Logger } from '../logging/Logger';
import { PatientRepository } from '../../infrastructure/database/repositories/Patient.repository';
import { CreatePatientDto } from '../../dtos/patient/CreatePatientDto';
import { UpdatePatientDto } from '../../dtos/patient/UpdatePatientDto';
import { SearchPatientDto } from '../../dtos/patient/SearchPatientDto';
import { Patient } from '../../infrastructure/database/entities/Patient.entity';
import { CareContext } from '../../infrastructure/database/entities/CareContext.entity';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { AbhaService } from '../abha/abha.service';

@Injectable()
export class PatientService {
    private readonly logger: Logger;
    private readonly patientRepository: PatientRepository;
    private readonly abhaService: AbhaService;

    constructor() {
        this.logger = new Logger({ name: 'PatientService' });
        this.patientRepository = new PatientRepository();
        this.abhaService = new AbhaService();
    }

    /**
     * Register a new patient
     * @param data Patient registration data
     * @returns Created patient
     * @throws ValidationError if ABHA number is invalid
     */
    async registerPatient(data: CreatePatientDto): Promise<Patient> {
        try {
            // Verify ABHA number
            const isValidAbha = await this.abhaService.verifyAbhaNumber(data.abhaNumber);
            if (!isValidAbha) {
                throw new ValidationError('Invalid or already registered ABHA number');
            }

            // Create patient record
            const patient = await this.patientRepository.createPatient({
                abhaNumber: data.abhaNumber,
                name: data.name,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                contact: {
                    phone: data.phone,
                    email: data.email,
                    address: data.address
                }
            });

            this.logger.info('Patient registered successfully', { 
                patientId: patient.id,
                abhaNumber: patient.abhaNumber 
            });

            return patient;
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            this.logger.error('Error registering patient', { error, data });
            throw error;
        }
    }

    /**
     * Update patient information
     * @param id Patient ID
     * @param data Update data
     * @returns Updated patient
     * @throws NotFoundError if patient not found
     */
    async updatePatient(id: string, data: UpdatePatientDto): Promise<Patient> {
        try {
            const patient = await this.patientRepository.findById(id);
            if (!patient) {
                throw new NotFoundError('Patient not found');
            }

            const updatedPatient = await this.patientRepository.updatePatient(id, {
                name: data.name,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                contact: {
                    phone: data.phone,
                    email: data.email,
                    address: data.address
                }
            });

            this.logger.info('Patient updated successfully', { patientId: id });
            return updatedPatient;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            this.logger.error('Error updating patient', { error, id, data });
            throw error;
        }
    }

    /**
     * Get patient by ID
     * @param id Patient ID
     * @returns Patient if found
     * @throws NotFoundError if patient not found
     */
    async getPatient(id: string): Promise<Patient> {
        const patient = await this.patientRepository.findById(id);
        if (!patient) {
            throw new NotFoundError('Patient not found');
        }
        return patient;
    }

    /**
     * Search patients based on criteria
     * @param searchParams Search parameters
     * @returns Array of matching patients
     */
    async searchPatients(searchParams: SearchPatientDto): Promise<Patient[]> {
        return this.patientRepository.search(searchParams);
    }

    /**
     * Add care context to patient
     * @param patientId Patient ID
     * @param careContextData Care context data
     * @returns Created care context
     * @throws NotFoundError if patient not found
     */
    async addCareContext(patientId: string, careContextData: Partial<CareContext>): Promise<CareContext> {
        try {
            const patient = await this.getPatient(patientId);
            const careContext = await this.patientRepository.addCareContext(patient.id, careContextData);
            
            this.logger.info('Care context added successfully', {
                patientId,
                careContextId: careContext.id
            });

            return careContext;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            this.logger.error('Error adding care context', { error, patientId, careContextData });
            throw error;
        }
    }

    /**
     * Get all care contexts for a patient
     * @param patientId Patient ID
     * @returns Array of care contexts
     * @throws NotFoundError if patient not found
     */
    async getCareContexts(patientId: string): Promise<CareContext[]> {
        await this.getPatient(patientId); // Verify patient exists
        return this.patientRepository.getCareContexts(patientId);
    }

    /**
     * Link patient's ABHA number with health ID
     * @param patientId Patient ID
     * @param healthId Health ID to link
     * @returns Updated patient
     * @throws NotFoundError if patient not found
     * @throws ValidationError if linking fails
     */
    async linkHealthId(patientId: string, healthId: string): Promise<Patient> {
        try {
            const patient = await this.getPatient(patientId);
            
            // Link with ABDM Gateway
            const isLinked = await this.abhaService.linkHealthId(patient.abhaNumber, healthId);
            if (!isLinked) {
                throw new ValidationError('Failed to link health ID');
            }

            // Update patient record
            const updatedPatient = await this.patientRepository.updatePatient(patientId, {
                healthId
            });

            this.logger.info('Health ID linked successfully', {
                patientId,
                healthId
            });

            return updatedPatient;
        } catch (error) {
            if (error instanceof NotFoundError || error instanceof ValidationError) {
                throw error;
            }
            this.logger.error('Error linking health ID', { error, patientId, healthId });
            throw error;
        }
    }

    /**
     * Delete patient record
     * @param id Patient ID
     * @returns true if deleted
     * @throws NotFoundError if patient not found
     */
    async deletePatient(id: string): Promise<boolean> {
        const patient = await this.patientRepository.findById(id);
        if (!patient) {
            throw new NotFoundError('Patient not found');
        }

        const deleted = await this.patientRepository.deletePatient(id);
        if (deleted) {
            this.logger.info('Patient deleted successfully', { patientId: id });
        }

        return deleted;
    }
} 