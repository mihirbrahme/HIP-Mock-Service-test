import { Router, Request, Response } from 'express';
import { HealthCheckService } from '../services/monitoring/HealthCheckService';
import { InMemoryMetricsCollector } from '../services/monitoring/MetricsCollector';

const router = Router();
const healthCheckService = HealthCheckService.getInstance();
const metricsCollector = InMemoryMetricsCollector.getInstance();

/**
 * @route GET /health
 * @desc Get system health status
 * @access Public
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = await healthCheckService.checkHealth();
        const status = health.status === 'healthy' ? 200 :
            health.status === 'degraded' ? 503 : 500;

        res.status(status).json(health);
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now()
        });
    }
});

/**
 * @route GET /metrics
 * @desc Get system metrics
 * @access Private
 */
router.get('/metrics', async (req: Request, res: Response) => {
    try {
        const metrics = await metricsCollector.getMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router; 