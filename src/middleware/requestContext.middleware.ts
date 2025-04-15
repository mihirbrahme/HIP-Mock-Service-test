import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AsyncLocalStorage } from 'async_hooks';

interface RequestContext {
    requestId: string;
    correlationId: string;
    startTime: number;
    userId?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Middleware to create and store request context
 */
export function requestContextMiddleware(req: Request, res: Response, next: NextFunction): void {
    const requestId = uuidv4();
    const correlationId = req.headers['x-correlation-id'] as string || requestId;
    const userId = req.headers['x-user-id'] as string;

    const context: RequestContext = {
        requestId,
        correlationId,
        startTime: Date.now(),
        userId
    };

    // Add request ID to response headers
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-correlation-id', correlationId);

    // Store context in AsyncLocalStorage
    requestContextStorage.run(context, () => {
        next();
    });
}

/**
 * Get the current request context
 */
export function getRequestContext(): RequestContext | undefined {
    return requestContextStorage.getStore();
}

/**
 * Get the current request ID
 */
export function getRequestId(): string | undefined {
    return getRequestContext()?.requestId;
}

/**
 * Get the current correlation ID
 */
export function getCorrelationId(): string | undefined {
    return getRequestContext()?.correlationId;
}

/**
 * Get the current user ID
 */
export function getUserId(): string | undefined {
    return getRequestContext()?.userId;
}

/**
 * Calculate request duration in milliseconds
 */
export function getRequestDuration(): number | undefined {
    const context = getRequestContext();
    return context ? Date.now() - context.startTime : undefined;
} 