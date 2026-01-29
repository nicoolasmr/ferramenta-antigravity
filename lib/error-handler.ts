import { logger } from './logger';

/**
 * Generic retry logic for asynchronous operations.
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: {
        maxRetries: number;
        delayMs: number;
        backoff: 'linear' | 'exponential';
        context?: string;
    }
): Promise<T> {
    const { maxRetries, delayMs, backoff, context = 'default' } = options;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            const delay = backoff === 'exponential' ? delayMs * Math.pow(2, attempt - 1) : delayMs;

            logger.warn(`Retry attempt ${attempt}/${maxRetries} for ${context}`, {
                error: error instanceof Error ? error.message : String(error),
                nextAttemptIn: `${delay}ms`,
            });

            if (attempt === maxRetries) break;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    logger.error(`Operation failed after ${maxRetries} attempts: ${context}`, {
        error: lastError instanceof Error ? lastError.message : String(lastError),
    });
    throw lastError;
}

/**
 * Handles localStorage QuotaExceededError by purging old data.
 * This is a critical fix identified in PLAN.md.
 */
export function handleQuotaExceeded(error: unknown) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
        logger.critical('localStorage quota exceeded. Attempting to purge old data...', {
            originalError: error.message,
        });

        // Strategy: Purge oldest items from STORAGE_KEYS.DAILY_CHECKS
        try {
            const DAILY_CHECKS_KEY = 'antigravity_daily_checks';
            const items = localStorage.getItem(DAILY_CHECKS_KEY);

            if (items) {
                const parsedItems = JSON.parse(items);
                if (Array.isArray(parsedItems) && parsedItems.length > 30) {
                    // Keep only last 30 days instead of 90
                    const reduced = parsedItems.slice(-30);
                    localStorage.setItem(DAILY_CHECKS_KEY, JSON.stringify(reduced));
                    logger.info('Successfully purged old daily checks to free space.');
                    return true;
                }
            }
        } catch (purgeError) {
            logger.error('Failed to purge localStorage during quota recovery', {
                error: purgeError instanceof Error ? purgeError.message : String(purgeError),
            });
        }
    }
    return false;
}
