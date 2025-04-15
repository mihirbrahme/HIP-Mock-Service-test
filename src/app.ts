import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { BaseError } from './utils/errors';
import authRoutes from './controllers/auth.controller';
import patientRoutes from './controllers/patient.controller';
import consentRoutes from './controllers/consent.controller';
import monitoringRoutes from './controllers/monitoring.controller';
import healthRecordRoutes from './routes/health-record.routes';
import { requestContextMiddleware } from './middleware/requestContext.middleware';
import { requestLoggingMiddleware } from './middleware/requestLogging.middleware';
import { Logger } from './services/logging/Logger';
import { errorHandler } from './middleware/error.middleware';

const app: Express = express();
const logger = new Logger({ name: 'HIP-Mock-System' });

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request context and logging middleware
app.use(requestContextMiddleware);
app.use(requestLoggingMiddleware(logger));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/consents', consentRoutes);
app.use('/monitoring', monitoringRoutes);
app.use('/api/health-records', healthRecordRoutes);

// Error handling middleware
app.use(errorHandler);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof BaseError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  logger.warn('Route not found', {
    path: req.path,
    method: req.method
  });

  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`
  });
});

export default app; 