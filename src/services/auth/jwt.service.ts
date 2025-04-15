import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { UnauthorizedError } from '@/utils/errors';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'test-secret';
const JWT_EXPIRY: jwt.SignOptions['expiresIn'] = process.env.JWT_EXPIRY || '1h';
const REFRESH_TOKEN_EXPIRY: jwt.SignOptions['expiresIn'] = process.env.REFRESH_TOKEN_EXPIRY || '7d';

interface JwtPayload {
  clientId: string;
  type: 'access' | 'refresh';
  [key: string]: any;
}

export class JwtService {
  generateAccessToken(client: { clientId: string }): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRY };
    return jwt.sign(
      { clientId: client.clientId, type: 'access' } as JwtPayload,
      JWT_SECRET,
      options
    );
  }

  generateRefreshToken(client: { clientId: string }): string {
    const options: SignOptions = { expiresIn: REFRESH_TOKEN_EXPIRY };
    return jwt.sign(
      { clientId: client.clientId, type: 'refresh' } as JwtPayload,
      JWT_SECRET,
      options
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      if (decoded.type !== 'access') {
        throw new UnauthorizedError('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  }

  verifyRefreshToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid token type');
      }
      return decoded;
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
} 