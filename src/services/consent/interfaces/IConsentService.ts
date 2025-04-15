import { ConsentRequest } from '../../../infrastructure/database/entities/ConsentRequest.entity';
import { ConsentArtefact } from '../../../infrastructure/database/entities/ConsentArtefact.entity';
import { CreateConsentRequestDto } from '../../../dtos/consent/CreateConsentRequestDto';
import { UpdateConsentRequestDto } from '../../../dtos/consent/UpdateConsentRequestDto';
import { CreateConsentArtefactDto, ConsentArtefactSummaryDto } from '../../../dtos/consent/ConsentArtefactDto';
import { ConsentStatus } from '../../../infrastructure/database/entities/enums/ConsentStatus';
import { HealthRecordType } from '../../infrastructure/database/entities/HealthRecord.entity';

export interface IConsentService {
    /**
     * Validates if there is a valid consent for accessing health records
     * @param patientId The patient ID
     * @param careContextId The care context ID
     * @param recordType The type of health record
     * @returns true if valid consent exists, false otherwise
     */
    validateConsent(
        patientId: string,
        careContextId: string,
        recordType: HealthRecordType
    ): Promise<boolean>;

    /**
     * Creates a new consent request
     */
    createConsentRequest(dto: CreateConsentRequestDto): Promise<ConsentRequest>;

    /**
     * Updates an existing consent request
     */
    updateConsentRequest(id: string, dto: UpdateConsentRequestDto): Promise<ConsentRequest>;

    /**
     * Retrieves a consent request by ID
     */
    getConsentRequest(id: string): Promise<ConsentRequest>;

    /**
     * Lists all consent requests for a patient
     */
    listPatientConsentRequests(patientId: string, status?: ConsentStatus): Promise<ConsentRequest[]>;

    /**
     * Creates a consent artefact for an approved request
     */
    createConsentArtefact(dto: CreateConsentArtefactDto): Promise<ConsentArtefact>;

    /**
     * Retrieves a consent artefact by ID
     */
    getConsentArtefact(id: string): Promise<ConsentArtefact>;

    /**
     * Lists all valid consent artefacts for a patient
     */
    listPatientConsentArtefacts(patientId: string): Promise<ConsentArtefactSummaryDto[]>;

    /**
     * Revokes a consent artefact
     */
    revokeConsent(artefactId: string): Promise<void>;

    /**
     * Checks if a consent artefact allows access to specific data categories
     */
    validateConsentAccess(artefactId: string, categories: string[]): Promise<boolean>;

    /**
     * Records an access event for a consent artefact
     */
    recordConsentAccess(artefactId: string): Promise<void>;
} 