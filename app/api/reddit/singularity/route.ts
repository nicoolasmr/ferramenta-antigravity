import { redditClient, RedditPost } from '@/lib/reddit-client';
import { logger } from '@/lib/logger';
import { globalCache } from '@/lib/cache';
import { errorResponse, successResponse, ApiErrorType } from '@/lib/api-utils';
import { RedditScrapeSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'reddit_r_singularity';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/reddit/singularity
 * Fetches latest posts from r/Singularity with caching.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // Parse and validate query params
        const params = {
            sort: searchParams.get('sort') || 'hot',
            limit: searchParams.get('limit') || '25',
            timeframe: searchParams.get('timeframe') || 'day',
        };

        const validation = RedditScrapeSchema.safeParse(params);
        if (!validation.success) {
            return errorResponse(ApiErrorType.VALIDATION, 'Parâmetros de busca inválidos', validation.error.format());
        }

        const { sort, limit, timeframe } = validation.data;
        const cacheKey = `${CACHE_KEY}_${sort}_${limit}_${timeframe}`;

        // Check cache
        const cachedData = globalCache.get(cacheKey);
        if (cachedData) {
            logger.info('Returning cached Reddit posts', { cacheKey });
            return successResponse({
                posts: cachedData,
                cached: true,
                fetchedAt: new Date().toISOString()
            });
        }

        // Fetch from Reddit
        logger.info('Fetching fresh Reddit posts', { sort, limit });
        const posts = await redditClient.fetchSubreddit('Singularity', { sort, limit, timeframe } as any);

        // Update cache
        globalCache.set(cacheKey, posts, CACHE_TTL);

        return successResponse({
            posts,
            cached: false,
            fetchedAt: new Date().toISOString()
        });

    } catch (error: any) {
        logger.error('Reddit API Route Error', {
            error: error.message
        });

        if (error.message === 'REDDIT_RATE_LIMIT') {
            return errorResponse(ApiErrorType.RATE_LIMIT, 'O Reddit está limitando nossas requisições. Tente novamente em 1 minuto.');
        }

        return errorResponse(
            ApiErrorType.EXTERNAL_API,
            'Falha ao buscar posts do Reddit',
            error.message
        );
    }
}
