import { logger } from './logger';
// Type definitions for Antigravity data structures

export type OperationStatus = 'green' | 'yellow' | 'red';
export type ContentStatus = 'fulfilled' | 'at-risk' | 'not-priority';
export type CommercialAlignment = 'aligned' | 'partial' | 'misaligned';
export type TomorrowTrend = 'better' | 'same' | 'worse';
export type ContentPurpose = 'grow' | 'warm' | 'sell';
export type ProjectDependency = 'me' | 'others';

export interface DailyCheck {
    date: string;
    operationStatus: OperationStatus;
    contentStatus: ContentStatus;
    commercialAlignment: CommercialAlignment;
    hasBottleneck: boolean;
    bottleneckDescription?: string;
    tomorrowTrend: TomorrowTrend;
}

export interface Project {
    id: string;
    name: string;
    isAdvancing: boolean;
    dependsOn: ProjectDependency;
    nextStepClear: boolean;
}

export interface WeeklyPlan {
    weekStart: string;
    centerOfWeek: string;
    projects: Project[];
    content: {
        theme: string;
        purpose: ContentPurpose;
    };
    commercial: {
        focusClear: boolean;
        hasActiveActions: boolean;
    };
}

export interface ImpactLog {
    date: string;
    operation: string[];
    content: string[];
    commercial: string[];
    reflection: string;
}

export interface Alert {
    id: string;
    type: 'warning' | 'info' | 'caution';
    message: string;
    suggestion?: string;
    createdAt: string;
}

// Números Âncora types
export type MetricCategory = 'Operação' | 'Conteúdo' | 'Comercial';
export type MetricFrequency = 'daily' | 'weekly';
export type MetricDirection = 'higher_better' | 'lower_better';
export type MetricStatus = 'green' | 'yellow' | 'red';

export interface AnchorMetric {
    id: string;
    name: string;
    category: MetricCategory;
    frequency: MetricFrequency;
    direction: MetricDirection;
    unit: string;
    sourceNote: string;
    guardrails: {
        green: { min?: number; max?: number };
        yellow: { min?: number; max?: number };
        red: { min?: number; max?: number };
    };
    playbook: {
        actionIfYellow: string;
        actionIfRed: string;
    };
    isActive: boolean;
    createdAt: string;
}

export interface MetricEntry {
    metricId: string;
    date: string; // YYYY-MM-DD
    value: number;
    status: MetricStatus;
    addressed?: boolean;
    updatedAt: string;
}

// LocalStorage keys
export const STORAGE_KEYS = {
    DAILY_CHECKS: 'antigravity_daily_checks',
    WEEKLY_PLANS: 'antigravity_weekly_plans',
    IMPACT_LOGS: 'antigravity_impact_logs',
    DISMISSED_ALERTS: 'antigravity_dismissed_alerts',
    ANCHOR_METRICS: 'antigravity_anchor_metrics',
    METRIC_ENTRIES: 'antigravity_metric_entries',
    PREFERENCES: 'antigravity_preferences',
} as const;

// Storage utilities
export const storage = {
    get<T>(key: string): T | null {
        if (typeof window === 'undefined') return null;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error reading from localStorage: ${key}`, error);
            return null;
        }
    },

    set<T>(key: string, value: T): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error: any) {
            // Handle QuotaExceededError - Bug #8 from PLAN.md
            if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
                const { handleQuotaExceeded } = require('./error-handler');
                const recovered = handleQuotaExceeded(error);
                if (recovered) {
                    try {
                        localStorage.setItem(key, JSON.stringify(value));
                        return;
                    } catch (retryError) {
                        logger.error('localStorage retry failed after purge', { key });
                    }
                }
            }
            logger.error(`Error writing to localStorage: ${key}`, {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    },

    remove(key: string): void {
        if (typeof window === 'undefined') return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing from localStorage: ${key}`, error);
        }
    },

    // Get all daily checks
    getDailyChecks(): DailyCheck[] {
        return this.get<DailyCheck[]>(STORAGE_KEYS.DAILY_CHECKS) || [];
    },

    // Save daily check
    saveDailyCheck(check: DailyCheck): void {
        const checks = this.getDailyChecks();
        const existingIndex = checks.findIndex(c => c.date === check.date);

        if (existingIndex >= 0) {
            checks[existingIndex] = check;
        } else {
            checks.push(check);
        }

        // Keep only last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const filtered = checks.filter(c => new Date(c.date) >= ninetyDaysAgo);

        this.set(STORAGE_KEYS.DAILY_CHECKS, filtered);
    },

    // Get all weekly plans
    getWeeklyPlans(): WeeklyPlan[] {
        return this.get<WeeklyPlan[]>(STORAGE_KEYS.WEEKLY_PLANS) || [];
    },

    // Save weekly plan
    saveWeeklyPlan(plan: WeeklyPlan): void {
        const plans = this.getWeeklyPlans();
        const existingIndex = plans.findIndex(p => p.weekStart === plan.weekStart);

        if (existingIndex >= 0) {
            plans[existingIndex] = plan;
        } else {
            plans.push(plan);
        }

        // Keep only last 12 weeks
        const twelveWeeksAgo = new Date();
        twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);
        const filtered = plans.filter(p => new Date(p.weekStart) >= twelveWeeksAgo);

        this.set(STORAGE_KEYS.WEEKLY_PLANS, filtered);
    },

    // Get all impact logs
    getImpactLogs(): ImpactLog[] {
        return this.get<ImpactLog[]>(STORAGE_KEYS.IMPACT_LOGS) || [];
    },

    // Save impact log
    saveImpactLog(log: ImpactLog): void {
        const logs = this.getImpactLogs();
        const existingIndex = logs.findIndex(l => l.date === log.date);

        if (existingIndex >= 0) {
            logs[existingIndex] = log;
        } else {
            logs.push(log);
        }

        this.set(STORAGE_KEYS.IMPACT_LOGS, logs);
    },

    // Get dismissed alerts
    getDismissedAlerts(): string[] {
        return this.get<string[]>(STORAGE_KEYS.DISMISSED_ALERTS) || [];
    },

    // Dismiss alert
    dismissAlert(alertId: string): void {
        const dismissed = this.getDismissedAlerts();
        if (!dismissed.includes(alertId)) {
            dismissed.push(alertId);
            this.set(STORAGE_KEYS.DISMISSED_ALERTS, dismissed);
        }
    },

    // Get all anchor metrics
    getAnchorMetrics(): AnchorMetric[] {
        return this.get<AnchorMetric[]>(STORAGE_KEYS.ANCHOR_METRICS) || [];
    },

    // Save anchor metric
    saveAnchorMetric(metric: AnchorMetric): void {
        const metrics = this.getAnchorMetrics();
        const existingIndex = metrics.findIndex(m => m.id === metric.id);

        if (existingIndex >= 0) {
            metrics[existingIndex] = metric;
        } else {
            metrics.push(metric);
        }

        this.set(STORAGE_KEYS.ANCHOR_METRICS, metrics);
    },

    // Delete anchor metric
    deleteAnchorMetric(id: string): void {
        const metrics = this.getAnchorMetrics();
        const filtered = metrics.filter(m => m.id !== id);
        this.set(STORAGE_KEYS.ANCHOR_METRICS, filtered);

        // Also delete all entries for this metric
        const entries = this.getMetricEntries();
        const filteredEntries = entries.filter(e => e.metricId !== id);
        this.set(STORAGE_KEYS.METRIC_ENTRIES, filteredEntries);
    },

    // Get all metric entries
    getMetricEntries(): MetricEntry[] {
        return this.get<MetricEntry[]>(STORAGE_KEYS.METRIC_ENTRIES) || [];
    },

    // Save metric entry
    saveMetricEntry(entry: MetricEntry): void {
        const entries = this.getMetricEntries();
        const existingIndex = entries.findIndex(
            e => e.metricId === entry.metricId && e.date === entry.date
        );

        if (existingIndex >= 0) {
            entries[existingIndex] = entry;
        } else {
            entries.push(entry);
        }

        this.set(STORAGE_KEYS.METRIC_ENTRIES, entries);
    },

    // Get entries for a specific metric
    getEntriesForMetric(metricId: string, days?: number): MetricEntry[] {
        const entries = this.getMetricEntries();
        let filtered = entries.filter(e => e.metricId === metricId);

        if (days) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filtered = filtered.filter(e => new Date(e.date) >= cutoffDate);
        }

        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    // Get all entries for a specific date
    getEntriesForDate(date: string): MetricEntry[] {
        const entries = this.getMetricEntries();
        return entries.filter(e => e.date === date);
    },

    // Export all data
    exportData(): string {
        return JSON.stringify({
            dailyChecks: this.getDailyChecks(),
            weeklyPlans: this.getWeeklyPlans(),
            impactLogs: this.getImpactLogs(),
            anchorMetrics: this.getAnchorMetrics(),
            metricEntries: this.getMetricEntries(),
            exportedAt: new Date().toISOString(),
        }, null, 2);
    },

    // Import data
    importData(jsonString: string): boolean {
        try {
            const data = JSON.parse(jsonString);
            if (data.dailyChecks) this.set(STORAGE_KEYS.DAILY_CHECKS, data.dailyChecks);
            if (data.weeklyPlans) this.set(STORAGE_KEYS.WEEKLY_PLANS, data.weeklyPlans);
            if (data.impactLogs) this.set(STORAGE_KEYS.IMPACT_LOGS, data.impactLogs);
            if (data.anchorMetrics) this.set(STORAGE_KEYS.ANCHOR_METRICS, data.anchorMetrics);
            if (data.metricEntries) this.set(STORAGE_KEYS.METRIC_ENTRIES, data.metricEntries);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    },
    // Preferences
    getPreferences(): any {
        return this.get<any>(STORAGE_KEYS.PREFERENCES) || {};
    },

    savePreferences(prefs: any): void {
        this.set(STORAGE_KEYS.PREFERENCES, prefs);
    },
};
