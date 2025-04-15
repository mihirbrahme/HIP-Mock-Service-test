import { EntityRepository, Repository } from 'typeorm';
import { HealthRecordAccess, AccessType } from '../entities/HealthRecordAccess.entity';
import { NotFoundError } from '../../../utils/errors';

@EntityRepository(HealthRecordAccess)
export class HealthRecordAccessRepository extends Repository<HealthRecordAccess> {
    async logAccess(data: {
        healthRecordId: string;
        consentArtefactId: string;
        accessedBy: string;
        accessType: AccessType;
        purpose: string;
        metadata?: {
            ipAddress?: string;
            userAgent?: string;
            deviceId?: string;
        };
    }): Promise<HealthRecordAccess> {
        const access = this.create(data);
        return this.save(access);
    }

    async getAccessHistory(healthRecordId: string): Promise<HealthRecordAccess[]> {
        return this.find({
            where: { healthRecordId },
            relations: ['consentArtefact'],
            order: {
                accessedAt: 'DESC'
            }
        });
    }

    async validateAccess(healthRecordId: string, consentArtefactId: string): Promise<boolean> {
        const access = await this.findOne({
            where: {
                healthRecordId,
                consentArtefactId
            }
        });

        return !!access;
    }

    async getAccessDetails(id: string): Promise<HealthRecordAccess> {
        const access = await this.findOne({
            where: { id },
            relations: ['healthRecord', 'consentArtefact']
        });

        if (!access) {
            throw new NotFoundError(`Access record with ID ${id} not found`);
        }

        return access;
    }

    async getPatientAccessHistory(patientId: string): Promise<HealthRecordAccess[]> {
        return this.createQueryBuilder('access')
            .innerJoinAndSelect('access.healthRecord', 'record')
            .where('record.patientId = :patientId', { patientId })
            .orderBy('access.accessedAt', 'DESC')
            .getMany();
    }
} 