import { EntityRepository, Repository, FindOneOptions } from 'typeorm';
import { CareContext } from '../entities/CareContext.entity';
import { Patient } from '../entities/Patient.entity';
import { NotFoundError } from '../../../utils/errors';

@EntityRepository(CareContext)
export class CareContextRepository extends Repository<CareContext> {
    async createCareContext(
        patient: Patient,
        referenceNumber: string,
        display: string,
        metadata?: Record<string, unknown>
    ): Promise<CareContext> {
        const careContext = new CareContext();
        careContext.patient = patient;
        careContext.referenceNumber = referenceNumber;
        careContext.display = display;
        if (metadata) {
            careContext.metadata = metadata;
        }
        return this.save(careContext);
    }

    async findByReferenceNumber(referenceNumber: string): Promise<CareContext> {
        const careContext = await this.findOne({ 
            where: { referenceNumber },
            relations: ['patient']
        } as FindOneOptions<CareContext>);

        if (!careContext) {
            throw new NotFoundError(`CareContext with reference number ${referenceNumber} not found`);
        }

        return careContext;
    }

    async updateCareContext(
        id: string,
        display?: string,
        metadata?: Record<string, unknown>
    ): Promise<CareContext> {
        const careContext = await this.findOne({ where: { id } } as FindOneOptions<CareContext>);
        if (!careContext) {
            throw new NotFoundError(`CareContext with id ${id} not found`);
        }

        if (display) careContext.display = display;
        if (metadata) careContext.metadata = metadata;

        return this.save(careContext);
    }

    async deleteCareContext(id: string): Promise<void> {
        const careContext = await this.findOne({ where: { id } } as FindOneOptions<CareContext>);
        if (!careContext) {
            throw new NotFoundError(`CareContext with id ${id} not found`);
        }

        await this.remove(careContext);
    }
} 