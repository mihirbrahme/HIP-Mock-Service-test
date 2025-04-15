/**
 * Interface for collecting and managing application metrics
 */
export interface MetricsCollector {
    /**
     * Increment a counter metric
     * @param name The name of the metric
     * @param value The value to increment by (default: 1)
     * @param tags Additional tags/labels for the metric
     */
    incrementCounter(name: string, value?: number, tags?: Record<string, string>): void;

    /**
     * Record a gauge metric value
     * @param name The name of the metric
     * @param value The current value
     * @param tags Additional tags/labels for the metric
     */
    recordGauge(name: string, value: number, tags?: Record<string, string>): void;

    /**
     * Record a timing/histogram metric
     * @param name The name of the metric
     * @param value The timing value in milliseconds
     * @param tags Additional tags/labels for the metric
     */
    recordTiming(name: string, value: number, tags?: Record<string, string>): void;

    /**
     * Get the current metrics snapshot
     * @returns A record of all current metric values
     */
    getMetrics(): Promise<Record<string, unknown>>;
} 