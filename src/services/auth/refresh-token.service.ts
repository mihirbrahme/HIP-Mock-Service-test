import { v4 as uuidv4 } from 'uuid';
import { JwtService } from './jwt.service';
import { Logger } from '../logging/Logger';

interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
}

export class RefreshTokenService {
  private refreshTokens: Map<string, RefreshToken> = new Map();
  private logger: Logger;

  constructor(private jwtService: JwtService) {
    this.logger = new Logger('RefreshTokenService');
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = uuidv4();
    const token = this.jwtService.generateRefreshToken(userId, tokenId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const refreshToken: RefreshToken = {
      id: tokenId,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
      isRevoked: false
    };

    this.refreshTokens.set(tokenId, refreshToken);
    this.logger.info(`Generated refresh token for user ${userId}`);

    return token;
  }

  async validateRefreshToken(token: string): Promise<{ userId: string; tokenId: string } | null> {
    try {
      const decoded = this.jwtService.verifyRefreshToken(token);
      const storedToken = this.refreshTokens.get(decoded.tokenId);

      if (!storedToken) {
        this.logger.warn(`Refresh token not found: ${decoded.tokenId}`);
        return null;
      }

      if (storedToken.isRevoked) {
        this.logger.warn(`Refresh token revoked: ${decoded.tokenId}`);
        return null;
      }

      if (storedToken.expiresAt < new Date()) {
        this.logger.warn(`Refresh token expired: ${decoded.tokenId}`);
        return null;
      }

      return {
        userId: decoded.userId,
        tokenId: decoded.tokenId
      };
    } catch (error) {
      this.logger.error('Error validating refresh token', { error });
      return null;
    }
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    const token = this.refreshTokens.get(tokenId);
    if (token) {
      token.isRevoked = true;
      this.refreshTokens.set(tokenId, token);
      this.logger.info(`Revoked refresh token: ${tokenId}`);
    }
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    for (const [tokenId, token] of this.refreshTokens.entries()) {
      if (token.userId === userId && !token.isRevoked) {
        token.isRevoked = true;
        this.refreshTokens.set(tokenId, token);
      }
    }
    this.logger.info(`Revoked all refresh tokens for user ${userId}`);
  }

  // Cleanup expired tokens periodically
  cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [tokenId, token] of this.refreshTokens.entries()) {
      if (token.expiresAt < now || token.isRevoked) {
        this.refreshTokens.delete(tokenId);
      }
    }
    this.logger.info('Cleaned up expired refresh tokens');
  }
} 