/**
 * Simple In-Memory Cache Utility
 * 
 * Used for temporary caching of expensive calculations (Scoring, Discovery).
 */

interface CacheEntry<T> {
    value: T;
    expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

export class CacheService {
    /**
     * Get value from cache or fetch and store it.
     */
    static async getOrSet<T>(key: string, ttlSeconds: number, fetcher: () => Promise<T>): Promise<T> {
        const now = Date.now();
        const entry = cache.get(key);

        if (entry && entry.expiry > now) {
            return entry.value;
        }

        const value = await fetcher();
        cache.set(key, {
            value,
            expiry: now + ttlSeconds * 1000
        });

        return value;
    }

    /**
     * Invalidate cache for a specific key.
     */
    static invalidate(key: string): void {
        cache.delete(key);
    }

    /**
     * Clear all cache.
     */
    static clear(): void {
        cache.clear();
    }
}
