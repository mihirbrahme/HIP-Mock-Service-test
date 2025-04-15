import { jest } from '@jest/globals';
import request from 'supertest';
import { app } from '@/app';
import { AuthService } from '@/services/auth/auth.service';
import { UnauthorizedError } from '@/utils/errors';

// Mock AuthService
jest.mock('@/services/auth/auth.service');

describe('Auth Controller', () => {
  let mockAuthService: jest.Mocked<AuthService>;

  const mockToken = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService = new AuthService() as jest.Mocked<AuthService>;
  });

  describe('POST /auth/token', () => {
    const validCredentials = {
      clientId: 'test-client',
      clientSecret: 'test-secret'
    };

    it('should return tokens for valid credentials', async () => {
      // Arrange
      mockAuthService.generateToken.mockResolvedValue(mockToken);

      // Act
      const response = await request(app)
        .post('/auth/token')
        .send(validCredentials);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockToken);
      expect(mockAuthService.generateToken).toHaveBeenCalledWith(validCredentials);
    });

    it('should return 401 for invalid credentials', async () => {
      // Arrange
      mockAuthService.generateToken.mockRejectedValue(
        new UnauthorizedError('Invalid credentials')
      );

      // Act
      const response = await request(app)
        .post('/auth/token')
        .send(validCredentials);

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing credentials', async () => {
      // Act
      const response = await request(app)
        .post('/auth/token')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/token/validate', () => {
    const validToken = 'valid-token';

    it('should return 200 for valid token', async () => {
      // Arrange
      mockAuthService.validateToken.mockResolvedValue(true);

      // Act
      const response = await request(app)
        .post('/auth/token/validate')
        .set('Authorization', `Bearer ${validToken}`);

      // Assert
      expect(response.status).toBe(200);
      expect(mockAuthService.validateToken).toHaveBeenCalledWith(validToken);
    });

    it('should return 401 for invalid token', async () => {
      // Arrange
      mockAuthService.validateToken.mockResolvedValue(false);

      // Act
      const response = await request(app)
        .post('/auth/token/validate')
        .set('Authorization', 'Bearer invalid-token');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing token', async () => {
      // Act
      const response = await request(app)
        .post('/auth/token/validate');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/token/refresh', () => {
    const validRefreshToken = 'valid-refresh-token';

    it('should return new tokens for valid refresh token', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(mockToken);

      // Act
      const response = await request(app)
        .post('/auth/token/refresh')
        .send({ refreshToken: validRefreshToken });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockToken);
      expect(mockAuthService.refreshToken).toHaveBeenCalledWith(validRefreshToken);
    });

    it('should return 401 for invalid refresh token', async () => {
      // Arrange
      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedError('Invalid refresh token')
      );

      // Act
      const response = await request(app)
        .post('/auth/token/refresh')
        .send({ refreshToken: 'invalid-token' });

      // Assert
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing refresh token', async () => {
      // Act
      const response = await request(app)
        .post('/auth/token/refresh')
        .send({});

      // Assert
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 