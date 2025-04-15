import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { DatabaseService } from '../../infrastructure/database/database.service';
import { IPatientRepository } from './IPatientRepository';
import { Patient } from '../../entities/Patient';
import { CareContext } from '../../entities/CareContext';
import { CreatePatientDto } from '../../dtos/patient/CreatePatientDto';
import { UpdatePatientDto } from '../../dtos/patient/UpdatePatientDto';
import { SearchPatientDto } from '../../dtos/patient/SearchPatientDto';
import { Logger } from '../../services/logging/Logger';
import { AbhaService } from '../../services/abha/abha.service';

export class PatientRepository implements IPatientRepository {
    private readonly patientRepository: Repository<Patient>;
    private readonly careContextRepository: Repository<CareContext>;
    private readonly logger: Logger;
    private readonly abhaService: AbhaService;

    constructor() {
        const dbService = DatabaseService.getInstance();
        this.patientRepository = dbService.getRepository(Patient);
        this.careContextRepository = dbService.getRepository(CareContext);
        this.logger = new Logger({ name: 'PatientRepository' });
        this.abhaService = new AbhaService(); // Assuming we have an ABHA service for verification
    }

    async create(data: CreatePatientDto): Promise<Patient> {
        try {
            const isValid = await this.verifyAbhaNumber(data.abhaNumber);
            if (!isValid) {
                throw new Error('Invalid or already registered ABHA number');
            }

            const patient = this.patientRepository.create(data);
            const savedPatient = await this.patientRepository.save(patient);
            
            this.logger.info('Patient created successfully', { patientId: savedPatient.id });
            return savedPatient;
        } catch (error) {
            this.logger.error('Error creating patient', { error, data });
            throw error;
        }
    }

    async findById(id: string): Promise<Patient | null> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { id },
                relations: ['careContexts']
            });
            return patient;
        } catch (error) {
            this.logger.error('Error finding patient by ID', { error, id });
            throw error;
        }
    }

    async findByAbhaNumber(abhaNumber: string): Promise<Patient | null> {
        try {
            const patient = await this.patientRepository.findOne({
                where: { abhaNumber },
                relations: ['careContexts']
            });
            return patient;
        } catch (error) {
            this.logger.error('Error finding patient by ABHA number', { error, abhaNumber });
            throw error;
        }
    }

    async update(id: string, data: UpdatePatientDto): Promise<Patient> {
        try {
            const patient = await this.findById(id);
            if (!patient) {
                throw new Error('Patient not found');
            }

            Object.assign(patient, data);
            const updatedPatient = await this.patientRepository.save(patient);
            
            this.logger.info('Patient updated successfully', { patientId: id });
            return updatedPatient;
        } catch (error) {
            this.logger.error('Error updating patient', { error, id, data });
            throw error;
        }
    }

    async search(searchParams: SearchPatientDto): Promise<Patient[]> {
        try {
            const where: FindOptionsWhere<Patient> = {};

            if (searchParams.name) {
                where.name = ILike(`%${searchParams.name}%`);
            }
            if (searchParams.abhaNumber) {
                where.abhaNumber = searchParams.abhaNumber;
            }
            if (searchParams.gender) {
                where.gender = searchParams.gender;
            }
            if (searchParams.dateOfBirth) {
                where.dateOfBirth = searchParams.dateOfBirth;
            }

            // Handle contact fields
            if (searchParams.phone || searchParams.email || 
                searchParams.district || searchParams.state || searchParams.pincode) {
                where.contact = {};
                
                if (searchParams.phone) {
                    where.contact = { ...where.contact, phone: ILike(`%${searchParams.phone}%`) };
                }
                if (searchParams.email) {
                    where.contact = { ...where.contact, email: ILike(`%${searchParams.email}%`) };
                }
                if (searchParams.district || searchParams.state || searchParams.pincode) {
                    where.contact = {
                        ...where.contact,
                        address: {}
                    };
                    if (searchParams.district) {
                        where.contact.address = { 
                            ...where.contact.address,
                            district: ILike(`%${searchParams.district}%`)
                        };
                    }
                    if (searchParams.state) {
                        where.contact.address = {
                            ...where.contact.address,
                            state: ILike(`%${searchParams.state}%`)
                        };
                    }
                    if (searchParams.pincode) {
                        where.contact.address = {
                            ...where.contact.address,
                            pincode: searchParams.pincode
                        };
                    }
                }
            }

            const patients = await this.patientRepository.find({
                where,
                relations: ['careContexts']
            });

            return patients;
        } catch (error) {
            this.logger.error('Error searching patients', { error, searchParams });
            throw error;
        }
    }

    async addCareContext(patientId: string, careContext: Partial<CareContext>): Promise<CareContext> {
        try {
            const patient = await this.findById(patientId);
            if (!patient) {
                throw new Error('Patient not found');
            }

            const newCareContext = this.careContextRepository.create({
                ...careContext,
                patientId
            });

            const savedCareContext = await this.careContextRepository.save(newCareContext);
            this.logger.info('Care context added successfully', { 
                patientId,
                careContextId: savedCareContext.id 
            });

            return savedCareContext;
        } catch (error) {
            this.logger.error('Error adding care context', { error, patientId, careContext });
            throw error;
        }
    }

    async getCareContexts(patientId: string): Promise<CareContext[]> {
        try {
            const careContexts = await this.careContextRepository.find({
                where: { patientId },
                order: { createdAt: 'DESC' }
            });
            return careContexts;
        } catch (error) {
            this.logger.error('Error getting care contexts', { error, patientId });
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await this.patientRepository.delete(id);
            const deleted = result.affected === 1;
            
            if (deleted) {
                this.logger.info('Patient deleted successfully', { patientId: id });
            } else {
                this.logger.warn('Patient not found for deletion', { patientId: id });
            }

            return deleted;
        } catch (error) {
            this.logger.error('Error deleting patient', { error, id });
            throw error;
        }
    }

    async verifyAbhaNumber(abhaNumber: string): Promise<boolean> {
        try {
            // First check if ABHA number is already registered
            const existingPatient = await this.findByAbhaNumber(abhaNumber);
            if (existingPatient) {
                return false;
            }

            // Then verify with ABHA service
            const isValid = await this.abhaService.verifyAbhaNumber(abhaNumber);
            return isValid;
        } catch (error) {
            this.logger.error('Error verifying ABHA number', { error, abhaNumber });
            throw error;
        }
    }
} 