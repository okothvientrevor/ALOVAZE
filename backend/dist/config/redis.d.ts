import Redis from 'ioredis';
declare const redis: Redis;
/**
 * Cache helper functions
 */
/**
 * Get value from cache
 */
export declare const get: (key: string) => Promise<string | null>;
/**
 * Set value in cache with optional TTL (in seconds)
 */
export declare const set: (key: string, value: string, ttl?: number) => Promise<"OK" | null>;
/**
 * Delete key(s) from cache
 */
export declare const del: (...keys: string[]) => Promise<number>;
/**
 * Check if key exists
 */
export declare const exists: (key: string) => Promise<boolean>;
/**
 * Set expiration on a key
 */
export declare const expire: (key: string, seconds: number) => Promise<boolean>;
/**
 * Increment a counter
 */
export declare const incr: (key: string) => Promise<number>;
/**
 * Get object from cache (JSON)
 */
export declare const getObject: <T = any>(key: string) => Promise<T | null>;
/**
 * Set object in cache (JSON) with optional TTL
 */
export declare const setObject: <T = any>(key: string, value: T, ttl?: number) => Promise<"OK" | null>;
/**
 * Test Redis connection
 */
export declare const testConnection: () => Promise<boolean>;
/**
 * Close Redis connection
 */
export declare const closeConnection: () => Promise<void>;
export default redis;
//# sourceMappingURL=redis.d.ts.map