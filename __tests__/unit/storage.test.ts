/**
 * Unit tests for lib/storage.ts
 * Testing localStorage wrapper and data persistence
 */

import { storage, STORAGE_KEYS, DailyCheck, AnchorMetric, MetricEntry } from '@/lib/storage';

describe('storage utilities', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('get and set', () => {
        it('should store and retrieve data correctly', () => {
            const testData = { foo: 'bar', num: 42 };
            storage.set('test_key', testData);

            expect(localStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(testData));

            // Mock the return value
            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(testData));
            const retrieved = storage.get('test_key');

            expect(localStorage.getItem).toHaveBeenCalledWith('test_key');
            expect(retrieved).toEqual(testData);
        });

        it('should return null for non-existent keys', () => {
            (localStorage.getItem as jest.Mock).mockReturnValue(null);
            const result = storage.get('non_existent');
            expect(result).toBeNull();
        });

        it('should handle JSON parse errors gracefully', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            (localStorage.getItem as jest.Mock).mockReturnValue('invalid json {');

            const result = storage.get('bad_data');

            expect(result).toBeNull();
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('saveDailyCheck', () => {
        it('should save a new daily check', () => {
            const check: DailyCheck = {
                date: '2026-01-29',
                operationStatus: 'green',
                contentStatus: 'fulfilled',
                commercialAlignment: 'aligned',
                hasBottleneck: false,
                tomorrowTrend: 'better'
            };

            (localStorage.getItem as jest.Mock).mockReturnValue(null);
            storage.saveDailyCheck(check);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.DAILY_CHECKS,
                JSON.stringify([check])
            );
        });

        it('should update existing daily check for same date', () => {
            const existingCheck: DailyCheck = {
                date: '2026-01-29',
                operationStatus: 'yellow',
                contentStatus: 'at-risk',
                commercialAlignment: 'partial',
                hasBottleneck: true,
                bottleneckDescription: 'Old issue',
                tomorrowTrend: 'same'
            };

            const updatedCheck: DailyCheck = {
                date: '2026-01-29',
                operationStatus: 'green',
                contentStatus: 'fulfilled',
                commercialAlignment: 'aligned',
                hasBottleneck: false,
                tomorrowTrend: 'better'
            };

            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([existingCheck]));
            storage.saveDailyCheck(updatedCheck);

            const savedData = JSON.parse((localStorage.setItem as jest.Mock).mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0]).toEqual(updatedCheck);
        });

        it('should keep only last 90 days of checks', () => {
            const oldCheck: DailyCheck = {
                date: '2025-10-01', // More than 90 days ago
                operationStatus: 'green',
                contentStatus: 'fulfilled',
                commercialAlignment: 'aligned',
                hasBottleneck: false,
                tomorrowTrend: 'better'
            };

            const recentCheck: DailyCheck = {
                date: '2026-01-29',
                operationStatus: 'green',
                contentStatus: 'fulfilled',
                commercialAlignment: 'aligned',
                hasBottleneck: false,
                tomorrowTrend: 'better'
            };

            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify([oldCheck]));
            storage.saveDailyCheck(recentCheck);

            const savedData = JSON.parse((localStorage.setItem as jest.Mock).mock.calls[0][1]);
            expect(savedData).toHaveLength(1);
            expect(savedData[0].date).toBe('2026-01-29');
        });
    });

    describe('saveAnchorMetric', () => {
        it('should save a new metric', () => {
            const metric: AnchorMetric = {
                id: 'test-metric-1',
                name: 'Test Metric',
                category: 'Operação',
                frequency: 'daily',
                direction: 'higher_better',
                unit: 'units',
                sourceNote: 'Test source',
                guardrails: {
                    green: { min: 80 },
                    yellow: { min: 50, max: 79 },
                    red: { max: 49 }
                },
                playbook: {
                    actionIfYellow: 'Monitor closely',
                    actionIfRed: 'Take action'
                },
                isActive: true,
                createdAt: '2026-01-29T00:00:00Z'
            };

            (localStorage.getItem as jest.Mock).mockReturnValue(null);
            storage.saveAnchorMetric(metric);

            expect(localStorage.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.ANCHOR_METRICS,
                JSON.stringify([metric])
            );
        });
    });

    describe('getEntriesForMetric', () => {
        it('should filter entries by metric ID', () => {
            const entries: MetricEntry[] = [
                { metricId: 'metric-1', date: '2026-01-29', value: 100, status: 'green', updatedAt: '2026-01-29T12:00:00Z' },
                { metricId: 'metric-2', date: '2026-01-29', value: 50, status: 'yellow', updatedAt: '2026-01-29T12:00:00Z' },
                { metricId: 'metric-1', date: '2026-01-28', value: 90, status: 'green', updatedAt: '2026-01-28T12:00:00Z' },
            ];

            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(entries));
            const result = storage.getEntriesForMetric('metric-1');

            expect(result).toHaveLength(2);
            expect(result.every(e => e.metricId === 'metric-1')).toBe(true);
        });

        it('should sort entries by date descending', () => {
            const entries: MetricEntry[] = [
                { metricId: 'metric-1', date: '2026-01-27', value: 80, status: 'green', updatedAt: '2026-01-27T12:00:00Z' },
                { metricId: 'metric-1', date: '2026-01-29', value: 100, status: 'green', updatedAt: '2026-01-29T12:00:00Z' },
                { metricId: 'metric-1', date: '2026-01-28', value: 90, status: 'green', updatedAt: '2026-01-28T12:00:00Z' },
            ];

            (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(entries));
            const result = storage.getEntriesForMetric('metric-1');

            expect(result[0].date).toBe('2026-01-29');
            expect(result[1].date).toBe('2026-01-28');
            expect(result[2].date).toBe('2026-01-27');
        });
    });

    describe('exportData and importData', () => {
        it('should export all data as JSON', () => {
            const mockChecks = [{ date: '2026-01-29', operationStatus: 'green' }];
            const mockMetrics = [{ id: 'metric-1', name: 'Test' }];

            (localStorage.getItem as jest.Mock)
                .mockReturnValueOnce(JSON.stringify(mockChecks))
                .mockReturnValueOnce(null) // weekly plans
                .mockReturnValueOnce(null) // impact logs
                .mockReturnValueOnce(JSON.stringify(mockMetrics))
                .mockReturnValueOnce(null); // metric entries

            const exported = storage.exportData();
            const parsed = JSON.parse(exported);

            expect(parsed.dailyChecks).toEqual(mockChecks);
            expect(parsed.anchorMetrics).toEqual(mockMetrics);
            expect(parsed.exportedAt).toBeDefined();
        });

        it('should import data successfully', () => {
            const importData = {
                dailyChecks: [{ date: '2026-01-29' }],
                anchorMetrics: [{ id: 'metric-1' }],
            };

            const result = storage.importData(JSON.stringify(importData));

            expect(result).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith(
                STORAGE_KEYS.DAILY_CHECKS,
                JSON.stringify(importData.dailyChecks)
            );
        });

        it('should handle import errors gracefully', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const result = storage.importData('invalid json');

            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });
});
