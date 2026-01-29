import { logger } from './logger';
import { withRetry } from './error-handler';

export interface RedditPost {
    id: string;
    title: string;
    author: string;
    url: string;
    score: number;
    num_comments: number;
    created_utc: number;
    selftext: string;
    thumbnail: string;
    permalink: string;
    is_video: boolean;
    over_18: boolean;
}

/**
 * Client for fetching data from Reddit's public JSON API.
 */
export const redditClient = {
    /**
     * Fetches posts from a specific subreddit.
     */
    async fetchSubreddit(subreddit: string, options: {
        sort?: 'hot' | 'new' | 'top' | 'rising';
        limit?: number;
        timeframe?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
    } = {}): Promise<RedditPost[]> {
        const { sort = 'hot', limit = 25, timeframe = 'day' } = options;

        // Sort 'top' requires a timeframe parameter
        const tParam = sort === 'top' ? `&t=${timeframe}` : '';
        const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}${tParam}`;

        logger.info(`Fetching Reddit posts from r/${subreddit}`, { sort, limit, timeframe });

        try {
            const data = await withRetry(
                async () => {
                    const response = await fetch(url, {
                        headers: {
                            'User-Agent': 'AntigravityApp/0.1.0' // Reddit requires a custom User-Agent
                        }
                    });

                    if (!response.ok) {
                        if (response.status === 429) {
                            throw new Error('REDDIT_RATE_LIMIT');
                        }
                        throw new Error(`REDDIT_API_ERROR: ${response.status}`);
                    }

                    return response.json();
                },
                {
                    maxRetries: 2,
                    delayMs: 2000,
                    backoff: 'exponential',
                    context: `Reddit fetch r/${subreddit}`
                }
            );

            // Parse Reddit's obscure JSON structure
            const posts = data.data.children.map((child: any) => {
                const p = child.data;
                return {
                    id: p.id,
                    title: p.title,
                    author: p.author,
                    url: p.url,
                    score: p.score,
                    num_comments: p.num_comments,
                    created_utc: p.created_utc,
                    selftext: p.selftext,
                    thumbnail: p.thumbnail,
                    permalink: p.permalink,
                    is_video: p.is_video,
                    over_18: p.over_18,
                };
            });

            logger.info(`Successfully fetched ${posts.length} posts from r/${subreddit}`);
            return posts;
        } catch (error: any) {
            logger.error(`Failed to fetch Reddit posts for r/${subreddit}`, {
                error: error.message
            });
            throw error;
        }
    }
};
