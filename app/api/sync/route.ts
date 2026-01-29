import { syncEngine } from '@/lib/sync';
import { logger } from '@/lib/logger';
import { errorResponse, successResponse, ApiErrorType } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/sync
 * Returns basic sync status (mocked for now as we don't have last sync stored)
 */
export async function GET() {
    return successResponse({
        lastSync: new Date().toISOString(),
        status: 'ready'
    });
}

/**
 * POST /api/sync
 * Triggers a manual sync process.
 */
export async function POST(req: Request) {
    try {
        const { userId, direction = 'both' } = await req.json();

        if (!userId) {
            return errorResponse(ApiErrorType.VALIDATION, 'userId é obrigatório');
        }

        logger.info('Manual sync triggered via API', { userId, direction });

        if (direction === 'push' || direction === 'both') {
            await syncEngine.pushLocalToRemote(userId);
        }

        if (direction === 'pull' || direction === 'both') {
            await syncEngine.pullRemoteToLocal(userId);
        }

        logger.info('Manual sync completed successfully', { userId });

        return successResponse({
            message: 'Sincronização concluída com sucesso',
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        logger.error('Sync API Error', {
            error: error instanceof Error ? error.message : String(error)
        });

        return errorResponse(
            ApiErrorType.SERVER,
            'Falha ao processar sincronização manual',
            error instanceof Error ? error.message : String(error)
        );
    }
}
