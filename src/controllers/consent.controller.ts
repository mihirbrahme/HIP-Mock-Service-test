import { Router, Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { authenticateRequest } from '../middleware/auth.middleware';
import { ConsentService } from '../services/consent/consent.service';
import { CreateConsentRequestDto } from '../dtos/consent/CreateConsentRequestDto';
import { UpdateConsentRequestDto } from '../dtos/consent/UpdateConsentRequestDto';
import { CreateConsentArtefactDto } from '../dtos/consent/ConsentArtefactDto';
import { ConsentStatus } from '../infrastructure/database/entities/enums/ConsentStatus';
import { getCustomRepository } from 'typeorm';
import { ConsentRequestRepository } from '../infrastructure/database/repositories/ConsentRequest.repository';
import { ConsentArtefactRepository } from '../infrastructure/database/repositories/ConsentArtefact.repository';
import { PatientRepository } from '../infrastructure/database/repositories/Patient.repository';

const router = Router();

// Initialize repositories and service
const consentRequestRepository = getCustomRepository(ConsentRequestRepository);
const consentArtefactRepository = getCustomRepository(ConsentArtefactRepository);
const patientRepository = getCustomRepository(PatientRepository);

const consentService = new ConsentService(
    consentRequestRepository,
    consentArtefactRepository,
    patientRepository
);

// Create consent request
router.post('/request', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createDto = new CreateConsentRequestDto();
    Object.assign(createDto, {
      patientId: req.body.patientId,
      requesterNid: req.body.requesterNid,
      purpose: req.body.purpose,
      hipId: req.body.hipId,
      hiuId: req.body.hiuId,
      expiryDate: req.body.expiryDate
    });

    const consentRequest = await consentService.createConsentRequest(createDto);
    res.status(201).json(consentRequest);
  } catch (error) {
    next(error);
  }
});

// Get consent request status
router.get('/request/:id', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const consentRequest = await consentService.getConsentRequest(req.params.id);
    if (!consentRequest) {
      throw new ValidationError('Consent request not found');
    }
    res.json(consentRequest);
  } catch (error) {
    next(error);
  }
});

// List patient's consent requests
router.get('/patient/:patientId/requests', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as ConsentStatus;
    const requests = await consentService.listPatientConsentRequests(req.params.patientId, status);
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

// Grant consent (create artefact)
router.post('/request/:id/grant', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createArtefactDto = new CreateConsentArtefactDto();
    Object.assign(createArtefactDto, {
      consentRequestId: req.params.id,
      signature: req.body.signature,
      accessMode: req.body.accessMode,
      dateRangeFrom: req.body.dateRangeFrom,
      dateRangeTo: req.body.dateRangeTo,
      frequency: req.body.frequency,
      dataCategories: req.body.dataCategories
    });

    const artefact = await consentService.createConsentArtefact(createArtefactDto);
    res.status(201).json(artefact);
  } catch (error) {
    next(error);
  }
});

// Get consent artefact
router.get('/artefact/:id', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artefact = await consentService.getConsentArtefact(req.params.id);
    if (!artefact) {
      throw new ValidationError('Consent artefact not found');
    }
    res.json(artefact);
  } catch (error) {
    next(error);
  }
});

// List patient's consent artefacts
router.get('/patient/:patientId/artefacts', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const artefacts = await consentService.listPatientConsentArtefacts(req.params.patientId);
    res.json(artefacts);
  } catch (error) {
    next(error);
  }
});

// Revoke consent
router.post('/artefact/:id/revoke', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await consentService.revokeConsent(req.params.id);
    res.status(200).json({
      message: 'Consent revoked successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Validate consent access
router.post('/artefact/:id/validate', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories)) {
      throw new ValidationError('Invalid categories provided');
    }

    const isValid = await consentService.validateConsentAccess(req.params.id, categories);
    if (isValid) {
      await consentService.recordConsentAccess(req.params.id);
    }

    res.json({ isValid });
  } catch (error) {
    next(error);
  }
});

export default router; 