import { AppDataSource } from '../data-source';
import { ConsentDetail } from '../entities/ConsentDetail.entity';
import { ConsentArtefact } from '../entities/ConsentArtefact.entity';
import { ConsentStatus } from '../entities/enums/ConsentStatus';
import { FindOneOptions, MoreThan, FindOptionsWhere } from 'typeorm';

export class ConsentRepository {
    private consentDetailRepository = AppDataSource.getRepository(ConsentDetail);
    private consentArtefactRepository = AppDataSource.getRepository(ConsentArtefact);

    /**
     * Creates a new consent detail record
     */
    async createConsentDetail(consentDetail: Partial<ConsentDetail>): Promise<ConsentDetail> {
        const newConsentDetail = this.consentDetailRepository.create(consentDetail);
        return this.consentDetailRepository.save(newConsentDetail);
    }

    /**
     * Creates a new consent artefact
     */
    async createConsentArtefact(consentArtefact: Partial<ConsentArtefact>): Promise<ConsentArtefact> {
        const newConsentArtefact = this.consentArtefactRepository.create(consentArtefact);
        return this.consentArtefactRepository.save(newConsentArtefact);
    }

    /**
     * Retrieves a consent detail by ID
     */
    async getConsentDetailById(id: string): Promise<ConsentDetail | null> {
        return this.consentDetailRepository.findOne({
            where: { id } as FindOptionsWhere<ConsentDetail>,
            relations: ['consentArtefacts']
        });
    }

    /**
     * Retrieves a consent artefact by ID
     */
    async getConsentArtefactById(id: string): Promise<ConsentArtefact | null> {
        return this.consentArtefactRepository.findOne({
            where: { id } as FindOptionsWhere<ConsentArtefact>,
            relations: ['consentDetail']
        });
    }

    /**
     * Retrieves all consents for a patient
     */
    async getConsentsByPatientId(patientId: string): Promise<ConsentDetail[]> {
        return this.consentDetailRepository.find({
            where: { patientId } as FindOptionsWhere<ConsentDetail>,
            relations: ['consentArtefacts'],
            order: { createdAt: 'DESC' } as any
        });
    }

    /**
     * Updates a consent detail
     */
    async updateConsentDetail(id: string, updateData: Partial<ConsentDetail>): Promise<ConsentDetail | null> {
        const consentDetail = await this.getConsentDetailById(id);
        if (!consentDetail) {
            return null;
        }

        Object.assign(consentDetail, updateData);
        return this.consentDetailRepository.save(consentDetail);
    }

    /**
     * Updates a consent artefact
     */
    async updateConsentArtefact(id: string, updateData: Partial<ConsentArtefact>): Promise<ConsentArtefact | null> {
        const consentArtefact = await this.getConsentArtefactById(id);
        if (!consentArtefact) {
            return null;
        }

        Object.assign(consentArtefact, updateData);
        return this.consentArtefactRepository.save(consentArtefact);
    }

    /**
     * Changes the status of a consent detail
     */
    async changeConsentStatus(id: string, status: ConsentStatus): Promise<ConsentDetail | null> {
        return this.updateConsentDetail(id, { status } as Partial<ConsentDetail>);
    }

    /**
     * Deletes a consent detail and its associated artefacts
     */
    async deleteConsentDetail(id: string): Promise<void> {
        const consentDetail = await this.getConsentDetailById(id);
        if (consentDetail) {
            await this.consentDetailRepository.remove(consentDetail);
        }
    }

    /**
     * Deletes a consent artefact
     */
    async deleteConsentArtefact(id: string): Promise<void> {
        const consentArtefact = await this.getConsentArtefactById(id);
        if (consentArtefact) {
            await this.consentArtefactRepository.remove(consentArtefact);
        }
    }

    /**
     * Validates if a consent is active and valid
     */
    async validateConsent(patientId: string, careContextId: string, purpose: string): Promise<boolean> {
        const now = new Date();
        const consent = await this.consentDetailRepository.findOne({
            where: {
                patientId,
                careContextId,
                purpose,
                status: ConsentStatus.GRANTED,
                expiryDate: MoreThan(now)
            } as FindOptionsWhere<ConsentDetail>
        });

        return !!consent;
    }

    /**
     * Gets the consent history for a patient
     */
    async getConsentHistory(patientId: string): Promise<ConsentDetail[]> {
        return this.consentDetailRepository.find({
            where: { patientId } as FindOptionsWhere<ConsentDetail>,
            relations: ['consentArtefacts'],
            order: { createdAt: 'DESC' } as any
        });
    }
} 