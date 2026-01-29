import { z } from 'zod';

/**
 * Validation schemas for ANTIGRAVITY data models.
 */

// Daily Check schemas
export const DailyCheckSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    operationStatus: z.enum(['green', 'yellow', 'red']),
    contentStatus: z.enum(['fulfilled', 'at-risk', 'not-priority']),
    commercialAlignment: z.enum(['aligned', 'partial', 'misaligned']),
    hasBottleneck: z.boolean(),
    bottleneckDescription: z.string().max(140, 'Descrição do gargalo deve ter no máximo 140 caracteres').optional(),
    tomorrowTrend: z.enum(['better', 'same', 'worse']),
});

// Project schema
export const ProjectSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, 'Nome do projeto é obrigatório'),
    isAdvancing: z.boolean(),
    dependsOn: z.enum(['me', 'others']),
    nextStepClear: z.boolean(),
});

// Weekly Plan schema
export const WeeklyPlanSchema = z.object({
    weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de início deve estar no formato YYYY-MM-DD'),
    centerOfWeek: z.string().min(1, 'Centro da semana é obrigatório'),
    projects: z.array(ProjectSchema),
    content: z.object({
        theme: z.string(),
        purpose: z.enum(['grow', 'warm', 'sell']),
    }),
    commercial: z.object({
        focusClear: z.boolean(),
        hasActiveActions: z.boolean(),
    }),
});

// Metric Entry schema
export const MetricEntrySchema = z.object({
    metricId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
    value: z.number(),
    status: z.enum(['green', 'yellow', 'red']),
    addressed: z.boolean().optional(),
});

// Chat API Request schema
export const ChatRequestSchema = z.object({
    messages: z.array(
        z.object({
            role: z.enum(['user', 'assistant', 'system']),
            content: z.string().min(1, 'Mensagem não pode estar vazia'),
        })
    ),
    context: z.string().optional(),
});

// Reddit Scraping Request schema
export const RedditScrapeSchema = z.object({
    sort: z.enum(['hot', 'new', 'top', 'rising']).optional().default('hot'),
    limit: z.coerce.number().min(1).max(100).optional().default(25),
    timeframe: z.enum(['hour', 'day', 'week', 'month', 'year', 'all']).optional().default('day'),
});
