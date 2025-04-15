import { jest } from '@jest/globals';
import request from 'supertest';
import { app } from '@/app';
import { ConsentService } from '@/services/consent/consent.service';
import { InvalidConsentError, ConsentExpiredError } from '@/utils/errors';

// Mock ConsentService
jest.mock('@/services/consent/consent.service');

describe('Consent Controller', () => {
  let mockConsentService: jest.Mocked<ConsentService>;

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
    mockConsentService = new ConsentService() as jest.Mocked<ConsentService>;
  });

  describe('POST /consents', () => {
    const validConsentRequest = {
      patientId: 'patient-123',
      purpose: 'CARE_MANAGEMENT',
      dateRange: {
        from: '2024-01-01',
        to: '2024-12-31'
      },
      permissions: ['VIEW', 'DOWNLOAD']
    };

    it('should create consent with valid data', async () => {
      // Arrange
      mockConsentService.createConsent.mockResolvedValue(mockConsent);

      // Act
      const response = await request(app)
        .post('/consents')
        .send(validConsentRequest);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockConsent);
      expect(mockConsentService.createConsent).toHaveBeenCalledWith(validConsentRequest);
    });

    it('should return 400 for invalid purpose', async () => {
      // Arrange
      const invalidRequest = {
        ...validConsentRequest,
        purpose: 'INVALID_PURPOSE'
      };

      mockConsentService.createConsent.mockRejectedValue(
        new InvalidConsentError('Invalid purpose')
      );

      // Act
      const response = await request(app)
        .post('/consents')
        .send(invalidRequest);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid date range', async () => {
      // Arrange
      const invalidRequest = {
        ...validConsentRequest,
        dateRange: {
          from: '2024-12-31',
          to: '2024-01-01'
        }
      };

      mockConsentService.createConsent.mockRejectedValue(
        new InvalidConsentError('Invalid date range')
      );

      // Act
      const response = await request(app)
        .post('/consents')
        .send(invalidRequest);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /consents/:id', () => {
    const consentId = 'consent-123';

    it('should return consent for valid ID', async () => {
      // Arrange
      mockConsentService.getConsent.mockResolvedValue(mockConsent);

      // Act
      const response = await request(app)
        .get(`/consents/${consentId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockConsent);
      expect(mockConsentService.getConsent).toHaveBeenCalledWith(consentId);
    });

    it('should return 404 for non-existent consent', async () => {
      // Arrange
      mockConsentService.getConsent.mockRejectedValue(
        new InvalidConsentError('Consent not found')
      );

      // Act
      const response = await request(app)
        .get('/consents/non-existent');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /consents/:id/validate', () => {
    const consentId = 'consent-123';

    it('should return 200 for valid consent', async () => {
      // Arrange
      mockConsentService.validateConsent.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post(`/consents/${consentId}/validate`);

      // Assert
      expect(response.status).toBe(200);
      expect(mockConsentService.validateConsent).toHaveBeenCalledWith(consentId);
    });

    it('should return 400 for expired consent', async () => {
      // Arrange
      mockConsentService.validateConsent.mockRejectedValue(
        new ConsentExpiredError('Consent has expired')
      );

      // Act
      const response = await request(app)
        .post(`/consents/${consentId}/validate`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /consents/:id/revoke', () => {
    const consentId = 'consent-123';

    it('should revoke consent successfully', async () => {
      // Arrange
      const revokedConsent = { ...mockConsent, status: 'REVOKED' };
      mockConsentService.revokeConsent.mockResolvedValue(revokedConsent);

      // Act
      const response = await request(app)
        .post(`/consents/${consentId}/revoke`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(revokedConsent);
      expect(mockConsentService.revokeConsent).toHaveBeenCalledWith(consentId);
    });

    it('should return 404 for non-existent consent', async () => {
      // Arrange
      mockConsentService.revokeConsent.mockRejectedValue(
        new InvalidConsentError('Consent not found')
      );

      // Act
      const response = await request(app)
        .post('/consents/non-existent/revoke');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for already revoked consent', async () => {
      // Arrange
      mockConsentService.revokeConsent.mockRejectedValue(
        new InvalidConsentError('Consent is already revoked')
      );

      // Act
      const response = await request(app)
        .post(`/consents/${consentId}/revoke`);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 