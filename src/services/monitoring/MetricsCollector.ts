import { MetricsCollector } from './types/MetricsCollector';

interface MetricValue {
    value: number;
    tags?: Record<string, string>;
    timestamp: number;
}

interface MetricData {
    counters: Map<string, MetricValue>;
    gauges: Map<string, MetricValue>;
    timings: Map<string, MetricValue[]>;
}

export class InMemoryMetricsCollector implements MetricsCollector {
    private metrics: MetricData;
    private static instance: InMemoryMetricsCollector;

    private constructor() {
        this.metrics = {
            counters: new Map(),
            gauges: new Map(),
            timings: new Map()
        };
    }

    public static getInstance(): InMemoryMetricsCollector {
        if (!InMemoryMetricsCollector.instance) {
            InMemoryMetricsCollector.instance = new InMemoryMetricsCollector();
        }
        return InMemoryMetricsCollector.instance;
    }

    public incrementCounter(name: string, value: number = 1, tags?: Record<string, string>): void {
        const existing = this.metrics.counters.get(name);
        const newValue = (existing?.value || 0) + value;
        
        this.metrics.counters.set(name, {
            value: newValue,
            tags,
            timestamp: Date.now()
        });
    }

    public recordGauge(name: string, value: number, tags?: Record<string, string>): void {
        this.metrics.gauges.set(name, {
            value,
            tags,
            timestamp: Date.now()
        });
    }

    public recordTiming(name: string, value: number, tags?: Record<string, string>): void {
        const timings = this.metrics.timings.get(name) || [];
        timings.push({
            value,
            tags,
            timestamp: Date.now()
        });
        this.metrics.timings.set(name, timings);
    }

    public async getMetrics(): Promise<Record<string, unknown>> {
        const result: Record<string, unknown> = {
            counters: Object.fromEntries(this.metrics.counters),
            gauges: Object.fromEntries(this.metrics.gauges),
            timings: Object.fromEntries(this.metrics.timings),
            timestamp: Date.now()
        };

        return result;
    }

    /**
     * Reset all metrics (mainly for testing purposes)
     */
    public reset(): void {
        this.metrics = {
            counters: new Map(),
            gauges: new Map(),
            timings: new Map()
        };
    }
} 