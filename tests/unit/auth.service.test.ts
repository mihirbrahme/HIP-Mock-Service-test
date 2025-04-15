import { jest } from '@jest/globals';
import { AuthService } from '@/services/auth/auth.service';
import { JwtService } from '@/services/auth/jwt.service';
import { DatabaseService } from '@/infrastructure/database/database.service';
import { UnauthorizedError } from '@/utils/errors';

// Mock dependencies
jest.mock('@/services/auth/jwt.service');
jest.mock('@/infrastructure/database/database.service');

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let dbService: jest.Mocked<DatabaseService>;

  const mockToken = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: 3600
  };

  const mockClient = {
    id: 'client-123',
    clientId: 'test-client',
    active: true
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create fresh instances for each test
    jwtService = new JwtService() as jest.Mocked<JwtService>;
    dbService = new DatabaseService() as jest.Mocked<DatabaseService>;
    authService = new AuthService(jwtService, dbService);
  });

  describe('generateToken', () => {
    const credentials = {
      clientId: 'test-client',
      clientSecret: 'test-secret'
    };

    it('should generate tokens for valid credentials', async () => {
      // Arrange
      dbService.findOne = jest.fn().mockResolvedValue(mockClient);
      jwtService.generateToken = jest.fn().mockResolvedValue(mockToken);

      // Act
      const result = await authService.generateToken(credentials);

      // Assert
      expect(dbService.findOne).toHaveBeenCalledWith('clients', { clientId: credentials.clientId });
      expect(jwtService.generateToken).toHaveBeenCalledWith({ sub: mockClient.id });
      expect(result).toEqual(mockToken);
    });

    it('should throw UnauthorizedError for invalid client', async () => {
      // Arrange
      dbService.findOne = jest.fn().mockResolvedValue(null);

      // Act & Assert
      await expect(authService.generateToken(credentials))
        .rejects
        .toThrow(new UnauthorizedError('Invalid credentials or inactive client'));
    });

    it('should throw UnauthorizedError for inactive client', async () => {
      // Arrange
      dbService.findOne = jest.fn().mockResolvedValue({ ...mockClient, active: false });

      // Act & Assert
      await expect(authService.generateToken(credentials))
        .rejects
        .toThrow(new UnauthorizedError('Invalid credentials or inactive client'));
    });
  });

  describe('validateToken', () => {
    const token = 'valid-token';

    it('should return true for valid token', async () => {
      // Arrange
      jwtService.verifyToken = jest.fn().mockResolvedValue({ sub: 'user-123' });

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result).toBe(true);
      expect(jwtService.verifyToken).toHaveBeenCalledWith(token);
    });

    it('should return false for invalid token', async () => {
      // Arrange
      jwtService.verifyToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result).toBe(false);
      expect(jwtService.verifyToken).toHaveBeenCalledWith(token);
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';

    it('should generate new tokens for valid refresh token', async () => {
      // Arrange
      jwtService.verifyToken = jest.fn().mockResolvedValue({
        sub: 'user-123',
        type: 'refresh'
      });
      jwtService.generateToken = jest.fn().mockResolvedValue(mockToken);

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(jwtService.verifyToken).toHaveBeenCalledWith(refreshToken);
      expect(jwtService.generateToken).toHaveBeenCalledWith({ sub: 'user-123' });
      expect(result).toEqual(mockToken);
    });

    it('should throw UnauthorizedError for invalid token type', async () => {
      // Arrange
      jwtService.verifyToken = jest.fn().mockResolvedValue({
        sub: 'user-123',
        type: 'access'
      });

      // Act & Assert
      await expect(authService.refreshToken(refreshToken))
        .rejects
        .toThrow(new UnauthorizedError('Invalid token type'));
    });

    it('should throw UnauthorizedError for invalid refresh token', async () => {
      // Arrange
      jwtService.verifyToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

      // Act & Assert
      await expect(authService.refreshToken(refreshToken))
        .rejects
        .toThrow(new UnauthorizedError('Invalid refresh token'));
    });
  });
}); 