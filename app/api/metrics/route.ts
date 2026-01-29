import { storage } from '@/lib/storage';
import { logger } from '@/lib/logger';
import { errorResponse, successResponse, ApiErrorType } from '@/lib/api-utils';
import { MetricEntrySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/metrics
 * Returns metrics and entries.
 * Query params: ?metricId=xxx (optional)
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const metricId = searchParams.get('metricId');

        if (metricId) {
            const entries = storage.getMetricEntries().filter(e => e.metricId === metricId);
            return successResponse({ metricId, entries });
        }

        const metrics = storage.getAnchorMetrics();
        const entries = storage.getMetricEntries();

        return successResponse({ metrics, entries });
    } catch (error: any) {
        logger.error('Metrics GET API Error', { error: error.message });
        return errorResponse(ApiErrorType.SERVER, 'Falha ao buscar métricas');
    }
}

/**
 * POST /api/metrics
 * Saves a new metric entry.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validation = MetricEntrySchema.safeParse(body);

        if (!validation.success) {
            return errorResponse(ApiErrorType.VALIDATION, 'Dados da métrica inválidos', validation.error.format());
        }

        const entry = {
            ...validation.data,
            updatedAt: new Date().toISOString()
        };

        logger.info('Saving metric entry via API', { metricId: entry.metricId, date: entry.date });

        storage.saveMetricEntry(entry);

        return successResponse({
            message: 'Métrica salva com sucesso',
            entry
        });
    } catch (error: any) {
        logger.error('Metrics POST API Error', { error: error.message });
        return errorResponse(ApiErrorType.SERVER, 'Falha ao salvar métrica');
    }
}
