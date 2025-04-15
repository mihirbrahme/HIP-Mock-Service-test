import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { PatientService } from '../../src/services/patient/patient.service';
import { DatabaseService } from '../../src/infrastructure/database/database.service';
import { AbdmGatewayService } from '../../src/services/abdm/abdm-gateway.service';
import { NotFoundError, ValidationError } from '../../src/utils/errors';

jest.mock('../../src/infrastructure/database/database.service');
jest.mock('../../src/services/abdm/abdm-gateway.service');

describe('PatientService', () => {
  let patientService: PatientService;
  let dbService: jest.Mocked<DatabaseService>;
  let abdmGatewayService: jest.Mocked<AbdmGatewayService>;

  beforeEach(() => {
    dbService = new DatabaseService() as jest.Mocked<DatabaseService>;
    abdmGatewayService = new AbdmGatewayService() as jest.Mocked<AbdmGatewayService>;
    patientService = new PatientService(dbService, abdmGatewayService);
  });

  describe('registerPatient', () => {
    test('should register new patient successfully', async () => {
      // Arrange
      const patientData = {
        abhaNumber: 'ABHA123456789',
        name: 'John Doe',
        gender: 'M',
        yearOfBirth: 1990,
        phoneNumber: '9876543210'
      };
      const mockAbdmResponse = {
        success: true,
        patient: {
          id: 'abdm_123',
          healthId: 'ABHA123456789'
        }
      };
      const mockDbPatient = {
        id: 'db_123',
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      abdmGatewayService.verifyAbhaNumber.mockResolvedValue(mockAbdmResponse);
      dbService.create.mockResolvedValue(mockDbPatient);

      // Act
      const result = await patientService.registerPatient(patientData);

      // Assert
      expect(result).toEqual(mockDbPatient);
      expect(abdmGatewayService.verifyAbhaNumber).toHaveBeenCalledWith(patientData.abhaNumber);
      expect(dbService.create).toHaveBeenCalledWith('patients', patientData);
    });

    test('should throw error for invalid ABHA number', async () => {
      // Arrange
      const patientData = {
        abhaNumber: 'INVALID123',
        name: 'John Doe',
        gender: 'M',
        yearOfBirth: 1990,
        phoneNumber: '9876543210'
      };

      abdmGatewayService.verifyAbhaNumber.mockRejectedValue(new Error('Invalid ABHA number'));

      // Act & Assert
      await expect(patientService.registerPatient(patientData))
        .rejects
        .toThrow(ValidationError);
    });

    test('should throw error for duplicate registration', async () => {
      // Arrange
      const patientData = {
        abhaNumber: 'ABHA123456789',
        name: 'John Doe',
        gender: 'M',
        yearOfBirth: 1990,
        phoneNumber: '9876543210'
      };
      const mockAbdmResponse = {
        success: true,
        patient: {
          id: 'abdm_123',
          healthId: 'ABHA123456789'
        }
      };

      abdmGatewayService.verifyAbhaNumber.mockResolvedValue(mockAbdmResponse);
      dbService.create.mockRejectedValue(new Error('Duplicate entry'));

      // Act & Assert
      await expect(patientService.registerPatient(patientData))
        .rejects
        .toThrow(ValidationError);
    });
  });

  describe('getPatientByAbhaNumber', () => {
    test('should return patient for valid ABHA number', async () => {
      // Arrange
      const abhaNumber = 'ABHA123456789';
      const mockPatient = {
        id: 'db_123',
        abhaNumber,
        name: 'John Doe',
        gender: 'M',
        yearOfBirth: 1990,
        phoneNumber: '9876543210',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      dbService.findOne.mockResolvedValue(mockPatient);

      // Act
      const result = await patientService.getPatientByAbhaNumber(abhaNumber);

      // Assert
      expect(result).toEqual(mockPatient);
      expect(dbService.findOne).toHaveBeenCalledWith('patients', { abhaNumber });
    });

    test('should throw error for non-existent patient', async () => {
      // Arrange
      const abhaNumber = 'NONEXISTENT123';

      dbService.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(patientService.getPatientByAbhaNumber(abhaNumber))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('updatePatient', () => {
    test('should update patient successfully', async () => {
      // Arrange
      const abhaNumber = 'ABHA123456789';
      const updateData = {
        phoneNumber: '9876543211',
        address: 'New Address'
      };
      const mockUpdatedPatient = {
        id: 'db_123',
        abhaNumber,
        name: 'John Doe',
        gender: 'M',
        yearOfBirth: 1990,
        phoneNumber: '9876543211',
        address: 'New Address',
        updatedAt: new Date()
      };

      dbService.update.mockResolvedValue(mockUpdatedPatient);

      // Act
      const result = await patientService.updatePatient(abhaNumber, updateData);

      // Assert
      expect(result).toEqual(mockUpdatedPatient);
      expect(dbService.update).toHaveBeenCalledWith('patients', { abhaNumber }, updateData);
    });

    test('should throw error for non-existent patient during update', async () => {
      // Arrange
      const abhaNumber = 'NONEXISTENT123';
      const updateData = {
        phoneNumber: '9876543211'
      };

      dbService.update.mockResolvedValue(null);

      // Act & Assert
      await expect(patientService.updatePatient(abhaNumber, updateData))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('searchPatients', () => {
    test('should return matching patients', async () => {
      // Arrange
      const searchCriteria = {
        name: 'John',
        gender: 'M'
      };
      const mockPatients = [
        {
          id: 'db_123',
          abhaNumber: 'ABHA123456789',
          name: 'John Doe',
          gender: 'M',
          yearOfBirth: 1990,
          phoneNumber: '9876543210'
        },
        {
          id: 'db_124',
          abhaNumber: 'ABHA123456790',
          name: 'John Smith',
          gender: 'M',
          yearOfBirth: 1992,
          phoneNumber: '9876543211'
        }
      ];

      dbService.find.mockResolvedValue(mockPatients);

      // Act
      const result = await patientService.searchPatients(searchCriteria);

      // Assert
      expect(result).toEqual(mockPatients);
      expect(dbService.find).toHaveBeenCalledWith('patients', searchCriteria);
    });

    test('should return empty array when no matches found', async () => {
      // Arrange
      const searchCriteria = {
        name: 'NonExistent'
      };

      dbService.find.mockResolvedValue([]);

      // Act
      const result = await patientService.searchPatients(searchCriteria);

      // Assert
      expect(result).toEqual([]);
      expect(dbService.find).toHaveBeenCalledWith('patients', searchCriteria);
    });
  });
}); 