import { Request, Response, NextFunction } from 'express';
import { getRequestContext, getRequestDuration } from './requestContext.middleware';
import { InMemoryMetricsCollector } from '../services/monitoring/MetricsCollector';

// Fields to redact from request/response logging
const SENSITIVE_FIELDS = [
    'password',
    'token',
    'authorization',
    'apiKey',
    'secret',
    'creditCard',
    'pan',
    'cvv',
    'ssn',
    'aadhar'
];

/**
 * Redact sensitive information from an object
 */
function redactSensitiveData(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
            result[key] = redactSensitiveData(value as Record<string, unknown>);
        } else if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            result[key] = '***REDACTED***';
        } else {
            result[key] = value;
        }
    }

    return result;
}

/**
 * Middleware for structured HTTP request logging
 */
export function requestLoggingMiddleware(logger: any) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const startTime = Date.now();
        const context = getRequestContext();
        const metricsCollector = InMemoryMetricsCollector.getInstance();

        // Log request
        const requestLog = {
            type: 'request',
            method: req.method,
            url: req.url,
            headers: redactSensitiveData({ ...req.headers }),
            query: redactSensitiveData({ ...req.query }),
            body: req.body ? redactSensitiveData({ ...req.body }) : undefined,
            requestId: context?.requestId,
            correlationId: context?.correlationId,
            userId: context?.userId
        };

        logger.info('Incoming request', requestLog);

        // Capture original response methods
        const originalJson = res.json;
        const originalSend = res.send;

        // Override response methods to log response
        res.json = function(body: any): Response {
            const responseTime = getRequestDuration() ?? Date.now() - startTime;
            const responseLog = {
                type: 'response',
                statusCode: res.statusCode,
                headers: redactSensitiveData({ ...res.getHeaders() }),
                body: redactSensitiveData(body),
                responseTime,
                requestId: context?.requestId,
                correlationId: context?.correlationId,
                userId: context?.userId
            };

            logger.info('Outgoing response', responseLog);

            // Record metrics
            metricsCollector.recordTiming('http.response.time', responseTime, {
                method: req.method,
                path: req.path,
                status: res.statusCode.toString()
            });

            metricsCollector.incrementCounter('http.requests.total', 1, {
                method: req.method,
                path: req.path,
                status: res.statusCode.toString()
            });

            return originalJson.call(this, body);
        };

        res.send = function(body: any): Response {
            const responseTime = getRequestDuration() ?? Date.now() - startTime;
            const responseLog = {
                type: 'response',
                statusCode: res.statusCode,
                headers: redactSensitiveData({ ...res.getHeaders() }),
                body: typeof body === 'object' ? redactSensitiveData(body) : body,
                responseTime,
                requestId: context?.requestId,
                correlationId: context?.correlationId,
                userId: context?.userId
            };

            logger.info('Outgoing response', responseLog);

            // Record metrics
            metricsCollector.recordTiming('http.response.time', responseTime, {
                method: req.method,
                path: req.path,
                status: res.statusCode.toString()
            });

            metricsCollector.incrementCounter('http.requests.total', 1, {
                method: req.method,
                path: req.path,
                status: res.statusCode.toString()
            });

            return originalSend.call(this, body);
        };

        next();
    };
} 