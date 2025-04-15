import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';
import { authenticateRequest } from '../middleware/auth.middleware';
import { apiRateLimiter } from '../middleware/rate-limiter.middleware';

const router = Router();
const patientController = new PatientController();

// Apply rate limiting to all patient endpoints
router.use(apiRateLimiter);

// Apply authentication to all patient endpoints
router.use(authenticateRequest);

// Patient CRUD endpoints
router.post('/', (req, res) => patientController.createPatient(req, res));
router.get('/:id', (req, res) => patientController.getPatient(req, res));
router.put('/:id', (req, res) => patientController.updatePatient(req, res));
router.delete('/:id', (req, res) => patientController.deletePatient(req, res));

// Search and summary endpoints
router.get('/', (req, res) => patientController.searchPatients(req, res));
router.get('/:id/summary', (req, res) => patientController.getPatientSummary(req, res));

export default router; 