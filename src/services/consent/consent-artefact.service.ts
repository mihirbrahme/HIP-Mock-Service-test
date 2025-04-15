import { ConsentArtefact } from '../../infrastructure/database/entities/ConsentArtefact.entity';
import { ConsentRequest } from '../../infrastructure/database/entities/ConsentRequest.entity';
import { ConsentArtefactRepository } from '../../infrastructure/database/repositories/ConsentArtefact.repository';
import { ConsentRequestRepository } from '../../infrastructure/database/repositories/ConsentRequest.repository';
import { Logger } from '../logging/Logger';
import { v4 as uuidv4 } from 'uuid';
import { ConsentStatus } from '../../infrastructure/database/entities/enums/ConsentStatus';

export class ConsentArtefactService {
  private logger: Logger;
  private consentArtefactRepository: ConsentArtefactRepository;
  private consentRequestRepository: ConsentRequestRepository;

  constructor() {
    this.logger = new Logger('ConsentArtefactService');
    this.consentArtefactRepository = new ConsentArtefactRepository();
    this.consentRequestRepository = new ConsentRequestRepository();
  }

  async generateConsentArtefact(consentRequestId: string): Promise<ConsentArtefact> {
    try {
      // Get the consent request
      const consentRequest = await this.consentRequestRepository.findById(consentRequestId);
      
      if (!consentRequest) {
        throw new Error('Consent request not found');
      }

      if (consentRequest.status !== ConsentStatus.GRANTED) {
        throw new Error('Consent request must be granted to generate artefact');
      }

      // Generate unique artefact ID
      const artefactId = uuidv4();

      // Create consent artefact
      const consentArtefact = new ConsentArtefact();
      consentArtefact.id = artefactId;
      consentArtefact.consentRequestId = consentRequestId;
      consentArtefact.patientId = consentRequest.patientId;
      consentArtefact.hiuId = consentRequest.hiuId;
      consentArtefact.hipId = consentRequest.hipId;
      consentArtefact.careContexts = consentRequest.careContexts;
      consentArtefact.purpose = consentRequest.purpose;
      consentArtefact.hip = consentRequest.hip;
      consentArtefact.hiu = consentRequest.hiu;
      consentArtefact.requester = consentRequest.requester;
      consentArtefact.consentDetail = consentRequest.consentDetail;
      consentArtefact.signature = this.generateSignature(consentRequest);
      consentArtefact.expiryDate = this.calculateExpiryDate(consentRequest);
      consentArtefact.createdAt = new Date();
      consentArtefact.updatedAt = new Date();

      // Save the artefact
      const savedArtefact = await this.consentArtefactRepository.save(consentArtefact);

      this.logger.info(`Generated consent artefact: ${artefactId}`);

      return savedArtefact;
    } catch (error) {
      this.logger.error('Error generating consent artefact', { error });
      throw new Error('Failed to generate consent artefact');
    }
  }

  async validateConsentArtefact(artefactId: string): Promise<boolean> {
    try {
      const artefact = await this.consentArtefactRepository.findById(artefactId);
      
      if (!artefact) {
        return false;
      }

      // Check if artefact is expired
      if (artefact.expiryDate < new Date()) {
        return false;
      }

      // Verify signature
      const consentRequest = await this.consentRequestRepository.findById(artefact.consentRequestId);
      if (!consentRequest) {
        return false;
      }

      const expectedSignature = this.generateSignature(consentRequest);
      if (artefact.signature !== expectedSignature) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error validating consent artefact', { error });
      return false;
    }
  }

  async revokeConsentArtefact(artefactId: string): Promise<void> {
    try {
      const artefact = await this.consentArtefactRepository.findById(artefactId);
      
      if (!artefact) {
        throw new Error('Consent artefact not found');
      }

      // Update the consent request status
      const consentRequest = await this.consentRequestRepository.findById(artefact.consentRequestId);
      if (consentRequest) {
        consentRequest.status = ConsentStatus.REVOKED;
        await this.consentRequestRepository.save(consentRequest);
      }

      // Delete the artefact
      await this.consentArtefactRepository.delete(artefactId);

      this.logger.info(`Revoked consent artefact: ${artefactId}`);
    } catch (error) {
      this.logger.error('Error revoking consent artefact', { error });
      throw new Error('Failed to revoke consent artefact');
    }
  }

  private generateSignature(consentRequest: ConsentRequest): string {
    // In a real implementation, this would use proper cryptographic signing
    const signatureData = {
      consentRequestId: consentRequest.id,
      patientId: consentRequest.patientId,
      hiuId: consentRequest.hiuId,
      hipId: consentRequest.hipId,
      timestamp: new Date().toISOString()
    };
    return Buffer.from(JSON.stringify(signatureData)).toString('base64');
  }

  private calculateExpiryDate(consentRequest: ConsentRequest): Date {
    const expiryDate = new Date(consentRequest.createdAt);
    expiryDate.setDate(expiryDate.getDate() + consentRequest.consentDetail.consentExpiry);
    return expiryDate;
  }
} 