import { EntityRepository, Repository } from 'typeorm';
import { Patient } from '../entities/Patient.entity';
import { NotFoundError } from '../../../utils/errors';

@EntityRepository(Patient)
export class PatientRepository extends Repository<Patient> {
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
} 