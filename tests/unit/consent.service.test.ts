import { jest } from '@jest/globals';
import { ConsentService } from '@/services/consent/consent.service';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { NotificationService } from '@/services/notification/notification.service';
import { InvalidConsentError, ConsentExpiredError } from '@/utils/errors';

// Mock dependencies
jest.mock('@/infrastructure/database/database.service');
jest.mock('@/services/notification/notification.service');

describe('ConsentService', () => {
  let consentService: ConsentService;
  let dbService: jest.Mocked<DatabaseService>;
  let notificationService: jest.Mocked<NotificationService>;

  const mockConsent = {
    id: 'consent-123',
    patientId: 'patient-123',
    purpose: 'CARE_MANAGEMENT',
    dateRange: {
      from: new Date('2024-01-01'),
      to: new Date('2024-12-31')
    },
    permissions: ['VIEW', 'DOWNLOAD'],
    status: 'ACTIVE'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dbService = new DatabaseService() as jest.Mocked<DatabaseService>;
    notificationService = new NotificationService() as jest.Mocked<NotificationService>;
    consentService = new ConsentService(dbService, notificationService);
  });

  describe('createConsent', () => {
    const consentRequest = {
      patientId: 'patient-123',
      purpose: 'CARE_MANAGEMENT',
      dateRange: {
        from: new Date('2024-01-01'),
        to: new Date('2024-12-31')
      },
      permissions: ['VIEW', 'DOWNLOAD']
    };

    it('should create consent with valid data', async () => {
      // Arrange
      dbService.create = jest.fn().mockResolvedValue(mockConsent);
      notificationService.sendConsentNotification = jest.fn().mockResolvedValue(true);

      // Act
      const result = await consentService.createConsent(consentRequest);

      // Assert
      expect(dbService.create).toHaveBeenCalledWith('consents', expect.objectContaining({
        patientId: consentRequest.patientId,
        purpose: consentRequest.purpose,
        status: 'ACTIVE'
      }));
      expect(notificationService.sendConsentNotification).toHaveBeenCalled();
      expect(result).toEqual(mockConsent);
    });

    it('should throw error for invalid purpose', async () => {
      // Arrange
      const invalidRequest = {
        ...consentRequest,
        purpose: 'INVALID_PURPOSE'
      };

      // Act & Assert
      await expect(consentService.createConsent(invalidRequest))
        .rejects
        .toThrow(InvalidConsentError);
    });

    it('should throw error for invalid date range', async () => {
      // Arrange
      const invalidRequest = {
        ...consentRequest,
        dateRange: {
          from: new Date('2024-12-31'),
          to: new Date('2024-01-01')
        }
      };

      // Act & Assert
      await expect(consentService.createConsent(invalidRequest))
        .rejects
        .toThrow(InvalidConsentError);
    });
  });

  describe('validateConsent', () => {
    const consentId = 'consent-123';

    it('should return true for valid active consent', async () => {
      // Arrange
      dbService.findOne = jest.fn().mockResolvedValue(mockConsent);

      // Act
      const result = await consentService.validateConsent(consentId);

      // Assert
      expect(result).toBe(true);
      expect(dbService.findOne).toHaveBeenCalledWith('consents', { id: consentId });
    });

    it('should throw error for expired consent', async () => {
      // Arrange
      const expiredConsent = {
        ...mockConsent,
        dateRange: {
          from: new Date('2023-01-01'),
          to: new Date('2023-12-31')
        }
      };
      dbService.findOne = jest.fn().mockResolvedValue(expiredConsent);

      // Act & Assert
      await expect(consentService.validateConsent(consentId))
        .rejects
        .toThrow(ConsentExpiredError);
    });

    it('should throw error for revoked consent', async () => {
      // Arrange
      const revokedConsent = {
        ...mockConsent,
        status: 'REVOKED'
      };
      dbService.findOne = jest.fn().mockResolvedValue(revokedConsent);

      // Act & Assert
      await expect(consentService.validateConsent(consentId))
        .rejects
        .toThrow(InvalidConsentError);
    });
  });

  describe('revokeConsent', () => {
    const consentId = 'consent-123';

    it('should successfully revoke active consent', async () => {
      // Arrange
      dbService.findOne = jest.fn().mockResolvedValue(mockConsent);
      dbService.update = jest.fn().mockResolvedValue({ ...mockConsent, status: 'REVOKED' });
      notificationService.sendConsentNotification = jest.fn().mockResolvedValue(true);

      // Act
      const result = await consentService.revokeConsent(consentId);

      // Assert
      expect(dbService.update).toHaveBeenCalledWith(
        'consents',
        { id: consentId },
        { status: 'REVOKED' }
      );
      expect(notificationService.sendConsentNotification).toHaveBeenCalled();
      expect(result.status).toBe('REVOKED');
    });

    it('should throw error when revoking non-existent consent', async () => {
      // Arrange
      dbService.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(consentService.revokeConsent(consentId))
        .rejects
        .toThrow(InvalidConsentError);
    });

    it('should throw error when revoking already revoked consent', async () => {
      // Arrange
      const revokedConsent = {
        ...mockConsent,
        status: 'REVOKED'
      };
      dbService.findOne = jest.fn().mockResolvedValue(revokedConsent);

      // Act & Assert
      await expect(consentService.revokeConsent(consentId))
        .rejects
        .toThrow(InvalidConsentError);
    });
  });
}); 