import app from './app';
import { Logger } from './services/logging/Logger';
import { HealthCheckService } from './services/monitoring/HealthCheckService';

const PORT = process.env.PORT || 3000;
const logger = new Logger({ name: 'HIP-Mock-System' });
const healthCheckService = HealthCheckService.getInstance();

// Perform initial health check
healthCheckService.checkHealth()
    .then(health => {
        if (health.status === 'unhealthy') {
            logger.error('System is unhealthy during startup', health as unknown as Record<string, unknown>);
            process.exit(1);
        }

        if (health.status === 'degraded') {
            logger.warn('System is in degraded state during startup', health as unknown as Record<string, unknown>);
        }

        // Start the server if health check passes
        const server = app.listen(PORT, () => {
            logger.info('Server started successfully', {
                port: PORT,
                nodeEnv: process.env.NODE_ENV || 'development',
                healthStatus: health.status
            });
        });

        // Handle server errors
        server.on('error', (error: Error) => {
            logger.error('Server error occurred', {
                error: error.message,
                stack: error.stack
            });
            process.exit(1);
        });

        // Handle process termination
        const shutdown = () => {
            logger.info('Shutting down server...');
            server.close(() => {
                logger.info('Server shutdown complete');
                process.exit(0);
            });

            // Force shutdown after 10 seconds
            setTimeout(() => {
                logger.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    })
    .catch(error => {
        logger.error('Failed to perform initial health check', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }); 