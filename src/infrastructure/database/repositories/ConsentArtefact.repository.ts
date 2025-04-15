import { EntityRepository, Repository, FindOneOptions, Between } from 'typeorm';
import { ConsentArtefact } from '../entities/ConsentArtefact.entity';
import { ConsentRequest } from '../entities/ConsentRequest.entity';
import { AccessMode } from '../entities/ConsentArtefact.entity';
import { NotFoundError } from '../../../utils/errors';

interface CreateArtefactParams {
    consentRequest: ConsentRequest;
    signature: string;
    accessMode: AccessMode;
    dateRangeFrom: Date;
    dateRangeTo: Date;
    frequency?: {
        unit: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
        value: number;
        repeats: number;
    };
    dataCategories: Array<{
        category: string;
        description: string;
        hiTypes: string[];
    }>;
}

@EntityRepository(ConsentArtefact)
export class ConsentArtefactRepository extends Repository<ConsentArtefact> {
    /**
     * Creates a new consent artefact
     */
    async createArtefact(params: CreateArtefactParams): Promise<ConsentArtefact> {
        const artefact = new ConsentArtefact();
        artefact.consentRequest = params.consentRequest;
        artefact.signature = params.signature;
        artefact.accessMode = params.accessMode;
        artefact.dateRangeFrom = params.dateRangeFrom;
        artefact.dateRangeTo = params.dateRangeTo;
        if (params.frequency) {
            artefact.frequency = params.frequency;
        }
        artefact.dataCategories = params.dataCategories;

        return this.save(artefact);
    }

    /**
     * Finds a consent artefact by its ID
     */
    async findById(id: string): Promise<ConsentArtefact | undefined> {
        return this.findOne({ where: { id } });
    }

    /**
     * Finds a consent artefact by request ID
     */
    async findByRequestId(requestId: string): Promise<ConsentArtefact> {
        const artefact = await this.findOne({
            where: { requestId },
            relations: ['consentRequest', 'consentRequest.patient']
        } as FindOneOptions<ConsentArtefact>);

        if (!artefact) {
            throw new NotFoundError(`Consent artefact for request ${requestId} not found`);
        }

        return artefact;
    }

    /**
     * Finds all valid consent artefacts for a patient
     */
    async findValidByPatientId(patientId: string): Promise<ConsentArtefact[]> {
        return this.createQueryBuilder('artefact')
            .innerJoin('artefact.consentRequest', 'request')
            .where('request.patientId = :patientId', { patientId })
            .andWhere('request.status = :status', { status: 'GRANTED' })
            .andWhere('artefact.dateRangeFrom <= :now', { now: new Date() })
            .andWhere('artefact.dateRangeTo >= :now', { now: new Date() })
            .getMany();
    }

    /**
     * Finds all consent artefacts that match specific data categories
     */
    async findByDataCategories(categories: string[]): Promise<ConsentArtefact[]> {
        const now = new Date();
        return this.createQueryBuilder('artefact')
            .innerJoinAndSelect('artefact.consentRequest', 'request')
            .where('artefact.dateRangeFrom <= :now', { now })
            .andWhere('artefact.dateRangeTo >= :now', { now })
            .andWhere(`artefact.dataCategories @> ANY (ARRAY[:...categories]::jsonb[])`, 
                { categories: categories.map(c => JSON.stringify({ category: c })) })
            .getMany();
    }

    /**
     * Updates the access frequency tracking for an artefact
     */
    async updateAccessCount(id: string): Promise<void> {
        // Implementation would track access counts
        // For now, we'll just update the last accessed timestamp
        await this.update(id, { updatedAt: new Date() });
    }

    /**
     * Revokes a consent artefact by setting its end date to now
     */
    async revokeArtefact(id: string): Promise<void> {
        await this.update(id, { dateRangeTo: new Date() });
    }
} 