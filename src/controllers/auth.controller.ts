import { Router, Request, Response, NextFunction } from 'express';
import { AuthService, Credentials } from '../services/auth/auth.service';
import { ValidationError } from '../utils/errors';

const router = Router();
const authService = new AuthService();

// Middleware to validate credentials
const validateCredentials = (req: Request, res: Response, next: NextFunction) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    throw new ValidationError('Client ID and Client Secret are required');
  }
  next();
};

// Generate token
router.post('/token', validateCredentials, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const credentials: Credentials = {
      clientId: req.body.clientId,
      clientSecret: req.body.clientSecret
    };
    const token = await authService.generateToken(credentials);
    res.json(token);
  } catch (error) {
    next(error);
  }
});

// Validate token
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new ValidationError('Token is required');
    }
    const isValid = await authService.validateToken(token);
    res.json({ valid: isValid });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }
    const token = await authService.refreshToken(refreshToken);
    res.json(token);
  } catch (error) {
    next(error);
  }
});

export default router; 