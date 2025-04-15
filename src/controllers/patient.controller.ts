import { Router, Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import { authenticateRequest } from '../middleware/auth.middleware';
import { PatientService } from '../services/patient/patient.service';
import { PatientSearchService } from '../services/patient/patient-search.service';
import { Logger } from '../services/logging/Logger';
import { SearchPatientDto } from '../dtos/patient/SearchPatientDto';

const router = Router();

// Get patient by ABHA ID
router.get('/:abhaId', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Mock patient data for testing
    const patient = {
      abhaId: req.params.abhaId,
      name: 'Test Patient',
      gender: 'M',
      yearOfBirth: 1990,
      phoneNumber: '+91-1234567890'
    };
    res.json(patient);
  } catch (error) {
    next(error);
  }
});

// Search patients
router.post('/search', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, phoneNumber, yearOfBirth } = req.body;
    if (!name && !phoneNumber && !yearOfBirth) {
      throw new ValidationError('At least one search parameter is required');
    }

    // Mock search results for testing
    const patients = [
      {
        abhaId: 'ABHA-001',
        name: 'Test Patient 1',
        gender: 'M',
        yearOfBirth: 1990,
        phoneNumber: '+91-1234567890'
      },
      {
        abhaId: 'ABHA-002',
        name: 'Test Patient 2',
        gender: 'F',
        yearOfBirth: 1992,
        phoneNumber: '+91-9876543210'
      }
    ];
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

// Link care context
router.post('/:abhaId/link', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { careContexts } = req.body;
    if (!careContexts || !Array.isArray(careContexts) || careContexts.length === 0) {
      throw new ValidationError('Valid care contexts are required');
    }

    // Mock response for testing
    res.json({
      status: 'success',
      message: 'Care contexts linked successfully',
      linkedContexts: careContexts
    });
  } catch (error) {
    next(error);
  }
});

// Get linked care contexts
router.get('/:abhaId/links', authenticateRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Mock linked care contexts for testing
    const linkedContexts = [
      {
        referenceNumber: 'REF-001',
        display: 'Consultation - 01/01/2023',
        type: 'OPConsultation'
      },
      {
        referenceNumber: 'REF-002',
        display: 'Lab Report - 02/01/2023',
        type: 'DiagnosticReport'
      }
    ];
    res.json(linkedContexts);
  } catch (error) {
    next(error);
  }
});

export default router; 