/**
 * Interface representing a health check result
 */
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy' | 'degraded';
    details: Record<string, unknown>;
    timestamp: number;
}

/**
 * Interface for a health check function
 */
type HealthCheck = () => Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded';
    details?: Record<string, unknown>;
}>;

/**
 * Service for monitoring system health
 */
export class HealthCheckService {
    private static instance: HealthCheckService;
    private healthChecks: Map<string, HealthCheck>;

    private constructor() {
        this.healthChecks = new Map();
        this.registerDefaultHealthChecks();
    }

    public static getInstance(): HealthCheckService {
        if (!HealthCheckService.instance) {
            HealthCheckService.instance = new HealthCheckService();
        }
        return HealthCheckService.instance;
    }

    /**
     * Register a new health check
     */
    public registerHealthCheck(name: string, check: HealthCheck): void {
        this.healthChecks.set(name, check);
    }

    /**
     * Run all registered health checks
     */
    public async checkHealth(): Promise<HealthCheckResult> {
        const details: Record<string, unknown> = {};
        let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';

        for (const [name, check] of this.healthChecks) {
            try {
                const result = await check();
                details[name] = result;

                if (result.status === 'unhealthy') {
                    overallStatus = 'unhealthy';
                } else if (result.status === 'degraded' && overallStatus === 'healthy') {
                    overallStatus = 'degraded';
                }
            } catch (error) {
                details[name] = {
                    status: 'unhealthy',
                    error: error instanceof Error ? error.message : 'Unknown error'
                };
                overallStatus = 'unhealthy';
            }
        }

        return {
            status: overallStatus,
            details,
            timestamp: Date.now()
        };
    }

    /**
     * Register default health checks
     */
    private registerDefaultHealthChecks(): void {
        // Memory usage check
        this.registerHealthCheck('memory', async () => {
            const used = process.memoryUsage();
            const heapUsedPercentage = (used.heapUsed / used.heapTotal) * 100;

            return {
                status: heapUsedPercentage > 90 ? 'degraded' : 'healthy',
                details: {
                    heapUsed: used.heapUsed,
                    heapTotal: used.heapTotal,
                    heapUsedPercentage
                }
            };
        });

        // Event loop lag check
        this.registerHealthCheck('eventLoop', async () => {
            const start = Date.now();
            await new Promise(resolve => setImmediate(resolve));
            const lag = Date.now() - start;

            return {
                status: lag > 100 ? 'degraded' : 'healthy',
                details: { lag }
            };
        });
    }
} 