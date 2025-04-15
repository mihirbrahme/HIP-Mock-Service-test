import { UnauthorizedError } from '@/utils/errors';
import { JwtService } from './jwt.service';
import { DatabaseService } from '@/infrastructure/database/database.service';

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Credentials {
  clientId: string;
  clientSecret: string;
}

export class AuthService {
  private jwtService: JwtService;
  private dbService: DatabaseService;

  constructor() {
    this.jwtService = new JwtService();
    this.dbService = new DatabaseService();
  }

  async generateToken(credentials: Credentials): Promise<TokenResponse> {
    // Validate credentials
    const client = await this.dbService.findOne('clients', {
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret
    });

    if (!client || !client.active) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.jwtService.generateAccessToken(client);
    const refreshToken = this.jwtService.generateRefreshToken(client);

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour
    };
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      const decoded = this.jwtService.verifyAccessToken(token);
      const client = await this.dbService.findOne('clients', { clientId: decoded.clientId });
      return !!client?.active;
    } catch {
      return false;
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const decoded = this.jwtService.verifyRefreshToken(refreshToken);
      const client = await this.dbService.findOne('clients', { clientId: decoded.clientId });

      if (!client?.active) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const accessToken = this.jwtService.generateAccessToken(client);
      const newRefreshToken = this.jwtService.generateRefreshToken(client);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600
      };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}