import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConsentRequestRepository } from '../../infrastructure/database/repositories/ConsentRequest.repository';
import { ConsentArtefactRepository } from '../../infrastructure/database/repositories/ConsentArtefact.repository';
import { PatientRepository } from '../../infrastructure/database/repositories/Patient.repository';
import { ConsentRequest } from '../../infrastructure/database/entities/ConsentRequest.entity';
import { ConsentArtefact } from '../../infrastructure/database/entities/ConsentArtefact.entity';
import { CreateConsentRequestDto } from '../../dtos/consent/CreateConsentRequestDto';
import { UpdateConsentRequestDto } from '../../dtos/consent/UpdateConsentRequestDto';
import { CreateConsentArtefactDto, ConsentArtefactSummaryDto } from '../../dtos/consent/ConsentArtefactDto';
import { ConsentStatus } from '../../infrastructure/database/entities/enums/ConsentStatus';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { IConsentService } from './interfaces/IConsentService';

@Injectable()
export class ConsentService implements IConsentService {
    constructor(
        private readonly consentRequestRepository: ConsentRequestRepository,
        private readonly consentArtefactRepository: ConsentArtefactRepository,
        private readonly patientRepository: PatientRepository
    ) {}

    async createConsentRequest(dto: CreateConsentRequestDto): Promise<ConsentRequest> {
        const patient = await this.patientRepository.findById(dto.patientId);
        if (!patient) {
            throw new NotFoundError('Patient not found');
        }

        const request = await this.consentRequestRepository.createRequest({
            patientId: dto.patientId,
            requesterNid: dto.requesterNid,
            purpose: dto.purpose,
            hipId: dto.hipId,
            hiuId: dto.hiuId,
            expiryDate: new Date(dto.expiryDate),
            metadata: dto.metadata
        });

        return request;
    }

    async updateConsentRequest(id: string, dto: UpdateConsentRequestDto): Promise<ConsentRequest> {
        const request = await this.consentRequestRepository.findById(id);
        if (!request) {
            throw new NotFoundError('Consent request not found');
        }

        if (dto.status) {
            await this.consentRequestRepository.updateStatus(id, dto.status);
        }

        if (dto.purpose) {
            request.purpose = dto.purpose;
        }

        if (dto.metadata) {
            request.metadata = { ...request.metadata, ...dto.metadata };
        }

        return this.consentRequestRepository.save(request);
    }

    async getConsentRequest(id: string): Promise<ConsentRequest> {
        const request = await this.consentRequestRepository.findById(id);
        if (!request) {
            throw new NotFoundError('Consent request not found');
        }
        return request;
    }

    async listPatientConsentRequests(patientId: string, status?: ConsentStatus): Promise<ConsentRequest[]> {
        return this.consentRequestRepository.findByPatientId(patientId, status);
    }

    async createConsentArtefact(dto: CreateConsentArtefactDto): Promise<ConsentArtefact> {
        const request = await this.consentRequestRepository.findById(dto.consentRequestId);
        if (!request) {
            throw new NotFoundError('Consent request not found');
        }

        if (!request.canBeGranted()) {
            throw new ValidationError('Consent request cannot be granted');
        }

        const artefact = await this.consentArtefactRepository.createArtefact({
            consentRequest: request,
            signature: dto.signature,
            accessMode: dto.accessMode,
            dateRangeFrom: new Date(dto.dateRangeFrom),
            dateRangeTo: new Date(dto.dateRangeTo),
            frequency: dto.frequency,
            dataCategories: dto.dataCategories.map(category => ({
                category: category.category,
                description: category.description,
                hiTypes: category.hiTypes.map(hiType => ({
                    type: hiType.type,
                    version: hiType.version
                }))
            }))
        });

        // Update request status after creating artefact
        await this.consentRequestRepository.updateStatus(request.id, ConsentStatus.GRANTED);

        return artefact;
    }

    async getConsentArtefact(id: string): Promise<ConsentArtefact> {
        const artefact = await this.consentArtefactRepository.findById(id);
        if (!artefact) {
            throw new NotFoundError('Consent artefact not found');
        }
        return artefact;
    }

    async listPatientConsentArtefacts(patientId: string): Promise<ConsentArtefactSummaryDto[]> {
        const artefacts = await this.consentArtefactRepository.findValidByPatientId(patientId);
        
        return artefacts.map(artefact => ({
            id: artefact.id,
            consentRequestId: artefact.consentRequest.id,
            accessMode: artefact.accessMode,
            dateRangeFrom: artefact.dateRangeFrom.toISOString(),
            dateRangeTo: artefact.dateRangeTo.toISOString(),
            categories: artefact.dataCategories.map(dc => dc.category)
        }));
    }

    async revokeConsent(artefactId: string): Promise<void> {
        const artefact = await this.consentArtefactRepository.findById(artefactId);
        if (!artefact) {
            throw new NotFoundError('Consent artefact not found');
        }
        
        if (!artefact.isValid()) {
            throw new ValidationError('Consent artefact is already invalid');
        }

        await this.consentArtefactRepository.revokeArtefact(artefactId);
        await this.consentRequestRepository.updateStatus(
            artefact.consentRequest.id,
            ConsentStatus.REVOKED
        );
    }

    async validateConsentAccess(artefactId: string, categories: string[]): Promise<boolean> {
        const artefact = await this.consentArtefactRepository.findById(artefactId);
        if (!artefact) {
            throw new NotFoundError('Consent artefact not found');
        }

        if (!artefact.isValid()) {
            return false;
        }

        return categories.every(category => artefact.allowsAccessTo(category));
    }

    async recordConsentAccess(artefactId: string): Promise<void> {
        const artefact = await this.consentArtefactRepository.findById(artefactId);
        if (!artefact) {
            throw new NotFoundError('Consent artefact not found');
        }

        if (!artefact.isValid()) {
            throw new ValidationError('Consent artefact is no longer valid');
        }

        await this.consentArtefactRepository.updateAccessCount(artefactId);
    }
} 