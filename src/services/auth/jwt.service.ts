import jwt from 'jsonwebtoken';
import { Logger } from '../logging/Logger';

interface JwtPayload {
  userId: string;
  tokenId?: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private logger: Logger;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '30d';
    this.logger = new Logger('JwtService');
  }

  generateAccessToken(userId: string): string {
    const payload: JwtPayload = { userId };
    return jwt.sign(payload, this.secret, {
      expiresIn: this.accessTokenExpiry
    });
  }

  generateRefreshToken(userId: string, tokenId: string): string {
    const payload: JwtPayload = { userId, tokenId };
    return jwt.sign(payload, this.secret, {
      expiresIn: this.refreshTokenExpiry
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      this.logger.error('Error verifying access token', { error });
      throw new Error('Invalid access token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.secret) as JwtPayload;
    } catch (error) {
      this.logger.error('Error verifying refresh token', { error });
      throw new Error('Invalid refresh token');
    }
  }
} 