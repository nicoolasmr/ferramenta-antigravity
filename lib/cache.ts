/**
 * Generic in-memory cache with TTL (Time To Live).
 */

interface CacheItem<T> {
    data: T;
    expiresAt: number;
}

export class Cache<T> {
    private store = new Map<string, CacheItem<T>>();

    /**
     * Sets a value in the cache.
     * @param key Unique key for the cache item
     * @param data The data to cache
     * @param ttlMs Time to live in milliseconds
     */
    set(key: string, data: T, ttlMs: number): void {
        const expiresAt = Date.now() + ttlMs;
        this.store.set(key, { data, expiresAt });
    }

    /**
     * Gets a value from the cache.
     * Returns null if not found or expired.
     */
    get(key: string): T | null {
        const item = this.store.get(key);

        if (!item) return null;

        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }

        return item.data;
    }

    /**
     * Deletes a value from the cache.
     */
    delete(key: string): void {
        this.store.delete(key);
    }

    /**
     * Clears the entire cache.
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Prunes expired items from the cache.
     */
    prune(): void {
        const now = Date.now();
        for (const [key, item] of this.store.entries()) {
            if (now > item.expiresAt) {
                this.store.delete(key);
            }
        }
    }
}

// Export a singleton instance for shared usage if needed
export const globalCache = new Cache<any>();
