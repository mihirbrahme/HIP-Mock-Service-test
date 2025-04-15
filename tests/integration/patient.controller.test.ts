import { jest } from '@jest/globals';
import request from 'supertest';
import { app } from '@/app';
import { PatientService } from '@/services/patient/patient.service';
import { NotFoundError, ValidationError } from '@/utils/errors';

// Mock PatientService
jest.mock('@/services/patient/patient.service');

describe('Patient Controller', () => {
  let mockPatientService: jest.Mocked<PatientService>;

  const mockPatient = {
    id: 'patient-123',
    abhaNumber: 'ABHA-123',
    name: 'John Doe',
    gender: 'M',
    yearOfBirth: 1990,
    phoneNumber: '9876543210',
    address: {
      line: '123 Health St',
      district: 'Health District',
      state: 'Health State',
      pincode: '123456'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPatientService = new PatientService() as jest.Mocked<PatientService>;
  });

  describe('POST /patients', () => {
    const validPatientData = {
      abhaNumber: 'ABHA-123',
      name: 'John Doe',
      gender: 'M',
      yearOfBirth: 1990,
      phoneNumber: '9876543210',
      address: {
        line: '123 Health St',
        district: 'Health District',
        state: 'Health State',
        pincode: '123456'
      }
    };

    it('should create patient with valid data', async () => {
      // Arrange
      mockPatientService.createPatient.mockResolvedValue(mockPatient);

      // Act
      const response = await request(app)
        .post('/patients')
        .send(validPatientData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockPatient);
      expect(mockPatientService.createPatient).toHaveBeenCalledWith(validPatientData);
    });

    it('should return 400 for invalid patient data', async () => {
      // Arrange
      const invalidData = {
        ...validPatientData,
        gender: 'INVALID'
      };

      mockPatientService.createPatient.mockRejectedValue(
        new ValidationError('Invalid gender')
      );

      // Act
      const response = await request(app)
        .post('/patients')
        .send(invalidData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for duplicate ABHA number', async () => {
      // Arrange
      mockPatientService.createPatient.mockRejectedValue(
        new ValidationError('ABHA number already exists')
      );

      // Act
      const response = await request(app)
        .post('/patients')
        .send(validPatientData);

      // Assert
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /patients/:id', () => {
    const patientId = 'patient-123';

    it('should return patient for valid ID', async () => {
      // Arrange
      mockPatientService.getPatient.mockResolvedValue(mockPatient);

      // Act
      const response = await request(app)
        .get(`/patients/${patientId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPatient);
      expect(mockPatientService.getPatient).toHaveBeenCalledWith(patientId);
    });

    it('should return 404 for non-existent patient', async () => {
      // Arrange
      mockPatientService.getPatient.mockRejectedValue(
        new NotFoundError('Patient not found')
      );

      // Act
      const response = await request(app)
        .get('/patients/non-existent');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /patients/search', () => {
    it('should return patients when searching by ABHA', async () => {
      // Arrange
      const searchQuery = { abhaNumber: 'ABHA-123' };
      mockPatientService.searchPatients.mockResolvedValue([mockPatient]);

      // Act
      const response = await request(app)
        .get('/patients/search')
        .query(searchQuery);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockPatient]);
      expect(mockPatientService.searchPatients).toHaveBeenCalledWith(searchQuery);
    });

    it('should return patients when searching by phone', async () => {
      // Arrange
      const searchQuery = { phoneNumber: '9876543210' };
      mockPatientService.searchPatients.mockResolvedValue([mockPatient]);

      // Act
      const response = await request(app)
        .get('/patients/search')
        .query(searchQuery);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockPatient]);
      expect(mockPatientService.searchPatients).toHaveBeenCalledWith(searchQuery);
    });

    it('should return 400 for invalid search criteria', async () => {
      // Act
      const response = await request(app)
        .get('/patients/search')
        .query({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /patients/:id', () => {
    const patientId = 'patient-123';
    const updateData = {
      address: {
        line: '456 New Health St',
        district: 'New Health District',
        state: 'New Health State',
        pincode: '654321'
      }
    };

    it('should update patient with valid data', async () => {
      // Arrange
      const updatedPatient = { ...mockPatient, ...updateData };
      mockPatientService.updatePatient.mockResolvedValue(updatedPatient);

      // Act
      const response = await request(app)
        .put(`/patients/${patientId}`)
        .send(updateData);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPatient);
      expect(mockPatientService.updatePatient).toHaveBeenCalledWith(patientId, updateData);
    });

    it('should return 404 for non-existent patient', async () => {
      // Arrange
      mockPatientService.updatePatient.mockRejectedValue(
        new NotFoundError('Patient not found')
      );

      // Act
      const response = await request(app)
        .put('/patients/non-existent')
        .send(updateData);

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid update data', async () => {
      // Arrange
      const invalidData = {
        yearOfBirth: 'invalid'
      };

      mockPatientService.updatePatient.mockRejectedValue(
        new ValidationError('Invalid year of birth')
      );

      // Act
      const response = await request(app)
        .put(`/patients/${patientId}`)
        .send(invalidData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 