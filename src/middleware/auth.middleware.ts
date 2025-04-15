import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/auth/jwt.service';

const jwtService = new JwtService();

export const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = await jwtService.verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}; 