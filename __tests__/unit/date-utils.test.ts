/**
 * Unit tests for lib/date-utils.ts
 * Testing date formatting and manipulation
 */

import { formatDate, getWeekStart, getCurrentWeekStart, isDateToday, getTodayISO, getRelativeTime } from '@/lib/date-utils';

describe('date-utils', () => {
    describe('formatDate', () => {
        it('should format date in PT-BR format', () => {
            const date = new Date('2026-01-29T12:00:00Z');
            const formatted = formatDate(date);

            // Should be in format like "29 de janeiro de 2026"
            expect(formatted).toContain('janeiro');
            expect(formatted).toContain('2026');
        });

        it('should handle string dates', () => {
            const formatted = formatDate('2026-01-29');
            expect(formatted).toBeDefined();
            expect(typeof formatted).toBe('string');
        });

        it('should support custom format strings', () => {
            const formatted = formatDate('2026-01-29', 'dd/MM/yyyy');
            expect(formatted).toBe('29/01/2026');
        });
    });

    describe('getWeekStart', () => {
        it('should return Monday of week in ISO format', () => {
            const date = new Date('2026-01-29'); // Thursday
            const weekStart = getWeekStart(date);

            // Should be Monday (26th) in ISO format
            expect(weekStart).toBe('2026-01-26');
        });

        it('should handle string dates', () => {
            const weekStart = getWeekStart('2026-01-29');
            expect(weekStart).toBe('2026-01-26');
        });
    });

    describe('getCurrentWeekStart', () => {
        it('should return current week Monday in ISO format', () => {
            const weekStart = getCurrentWeekStart();

            // Should be a valid ISO date string
            expect(weekStart).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });

    describe('isDateToday', () => {
        it('should return true for today\'s date', () => {
            const today = getTodayISO();
            expect(isDateToday(today)).toBe(true);
        });

        it('should return false for yesterday', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];

            expect(isDateToday(yesterdayString)).toBe(false);
        });
    });

    describe('getTodayISO', () => {
        it('should return today in ISO format', () => {
            const today = getTodayISO();

            // Should match YYYY-MM-DD format
            expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

            // Should be today's date
            const now = new Date();
            const expected = now.toISOString().split('T')[0];
            expect(today).toBe(expected);
        });
    });

    describe('getRelativeTime', () => {
        it('should return "agora mesmo" for recent dates', () => {
            const now = new Date();
            const recent = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
            const result = getRelativeTime(recent.toISOString());

            expect(result).toBe('agora mesmo');
        });

        it('should return hours for dates within 24h', () => {
            const now = new Date();
            const hoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
            const result = getRelativeTime(hoursAgo.toISOString());

            expect(result).toContain('h');
        });

        it('should return "ontem" for yesterday', () => {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 25 * 60 * 60 * 1000); // 25 hours ago
            const result = getRelativeTime(yesterday.toISOString());

            expect(result).toBe('ontem');
        });
    });
});
