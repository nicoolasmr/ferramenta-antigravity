import { storage } from '@/lib/storage';
import { logger } from '@/lib/logger';
import { errorResponse, successResponse, ApiErrorType } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export
 * Exports application data in JSON format.
 * Future: Add CSV/Excel support as planned.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format') || 'json';

        logger.info('Data export requested', { format });

        const data = storage.exportData();

        if (format === 'json') {
            return new Response(data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="antigravity_export_${new Date().toISOString().split('T')[0]}.json"`
                }
            });
        }

        // CSV/Excel support will be added in Phase 6/Testing or specialized integration
        // For now, return JSON success for other formats as placeholder if they hit this
        return successResponse({
            message: `O formato ${format} será implementado em breve. Por enquanto, use JSON.`,
            data: JSON.parse(data)
        });

    } catch (error: any) {
        logger.error('Export API Error', { error: error.message });
        return errorResponse(ApiErrorType.SERVER, 'Falha ao exportar dados');
    }
}
