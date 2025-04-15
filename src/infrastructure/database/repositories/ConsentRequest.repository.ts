import { EntityRepository, Repository, FindOneOptions, Between, LessThan, MoreThan } from 'typeorm';
import { ConsentRequest } from '../entities/ConsentRequest.entity';
import { Patient } from '../entities/Patient.entity';
import { ConsentStatus } from '../../../types/consent';
import { NotFoundError, ValidationError } from '../../../utils/errors';

@EntityRepository(ConsentRequest)
export class ConsentRequestRepository extends Repository<ConsentRequest> {
    /**
     * Creates a new consent request
     */
    async createConsentRequest(
        patient: Patient,
        requesterNid: string,
        purpose: string,
        hipId: string,
        hiuId: string,
        expiryDate: Date,
        metadata?: Record<string, unknown>
    ): Promise<ConsentRequest> {
        const consentRequest = new ConsentRequest();
        consentRequest.patient = patient;
        consentRequest.requesterNid = requesterNid;
        consentRequest.purpose = purpose;
        consentRequest.hipId = hipId;
        consentRequest.hiuId = hiuId;
        consentRequest.expiryDate = expiryDate;
        consentRequest.status = ConsentStatus.REQUESTED;

        return this.save(consentRequest);
    }

    /**
     * Finds a consent request by its ID
     */
    async findById(id: string): Promise<ConsentRequest> {
        const request = await this.findOne({
            where: { id },
            relations: ['patient']
        } as FindOneOptions<ConsentRequest>);

        if (!request) {
            throw new NotFoundError(`Consent request with ID ${id} not found`);
        }

        return request;
    }

    /**
     * Updates the status of a consent request
     */
    async updateStatus(id: string, status: ConsentStatus): Promise<ConsentRequest> {
        const consentRequest = await this.findById(id);
        
        if (status === ConsentStatus.GRANTED && !consentRequest.canBeGranted()) {
            throw new Error('Consent request cannot be granted');
        }

        if (status === ConsentStatus.REVOKED && !consentRequest.canBeRevoked()) {
            throw new Error('Consent request cannot be revoked');
        }

        consentRequest.status = status;
        return this.save(consentRequest);
    }

    /**
     * Finds all consent requests for a patient
     */
    async findByPatientId(patientId: string, status?: ConsentStatus): Promise<ConsentRequest[]> {
        const options: FindOneOptions<ConsentRequest> = {
            where: { patient: { id: patientId } },
            relations: ['patient']
        };

        if (status) {
            options.where = { ...options.where, status };
        }

        return this.find(options);
    }

    /**
     * Finds active consent requests for a HIP
     */
    async findActiveByHipId(hipId: string): Promise<ConsentRequest[]> {
        const currentDate = new Date();
        return this.find({
            where: {
                hipId,
                status: ConsentStatus.GRANTED,
                expiryDate: MoreThan(currentDate),
                revokedAt: null
            },
            relations: ['patient']
        });
    }

    /**
     * Finds expired consent requests that need to be processed
     */
    async findExpiredRequests(): Promise<ConsentRequest[]> {
        const now = new Date();
        return this.find({
            where: {
                status: ConsentStatus.GRANTED,
                expiryDate: Between(new Date('1970-01-01'), now)
            },
            relations: ['consentArtefact']
        });
    }

    /**
     * Deletes a consent request
     */
    async deleteConsentRequest(id: string): Promise<void> {
        const consentRequest = await this.findById(id);
        
        if (consentRequest.status === ConsentStatus.GRANTED) {
            throw new Error('Cannot delete an approved consent request');
        }

        await this.remove(consentRequest);
    }

    async createRequest(data: {
        patientId: string;
        requesterNid: string;
        purpose: string;
        hipId: string;
        hiuId: string;
        expiryDate: Date;
        metadata?: {
            department?: string;
            doctorId?: string;
            speciality?: string;
            careContextReference?: string;
        };
    }): Promise<ConsentRequest> {
        const request = this.create({
            patientId: data.patientId,
            requesterNid: data.requesterNid,
            purpose: data.purpose,
            hipId: data.hipId,
            hiuId: data.hiuId,
            expiryDate: data.expiryDate,
            metadata: data.metadata,
            status: ConsentStatus.REQUESTED
        });

        return this.save(request);
    }

    async updateStatus(id: string, status: ConsentStatus): Promise<void> {
} 