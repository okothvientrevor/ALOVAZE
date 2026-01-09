import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'alovaze:',
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

// Event handlers
redis.on('connect', () => {
  console.log('✅ Redis: Connected to server');
});

redis.on('ready', () => {
  console.log('✅ Redis: Client is ready');
});

redis.on('error', (err: Error) => {
  console.error('❌ Redis: Connection error:', err);
});

redis.on('close', () => {
  console.log('⚠️  Redis: Connection closed');
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconnecting...');
});

/**
 * Cache helper functions
 */

/**
 * Get value from cache
 */
export const get = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key);
  } catch (error) {
    console.error('Redis GET error:', error);
    return null;
  }
};

/**
 * Set value in cache with optional TTL (in seconds)
 */
export const set = async (
  key: string,
  value: string,
  ttl?: number
): Promise<'OK' | null> => {
  try {
    if (ttl) {
      return await redis.setex(key, ttl, value);
    }
    return await redis.set(key, value);
  } catch (error) {
    console.error('Redis SET error:', error);
    return null;
  }
};

/**
 * Delete key(s) from cache
 */
export const del = async (...keys: string[]): Promise<number> => {
  try {
    return await redis.del(...keys);
  } catch (error) {
    console.error('Redis DEL error:', error);
    return 0;
  }
};

/**
 * Check if key exists
 */
export const exists = async (key: string): Promise<boolean> => {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.error('Redis EXISTS error:', error);
    return false;
  }
};

/**
 * Set expiration on a key
 */
export const expire = async (key: string, seconds: number): Promise<boolean> => {
  try {
    const result = await redis.expire(key, seconds);
    return result === 1;
  } catch (error) {
    console.error('Redis EXPIRE error:', error);
    return false;
  }
};

/**
 * Increment a counter
 */
export const incr = async (key: string): Promise<number> => {
  try {
    return await redis.incr(key);
  } catch (error) {
    console.error('Redis INCR error:', error);
    return 0;
  }
};

/**
 * Get object from cache (JSON)
 */
export const getObject = async <T = any>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('Redis getObject error:', error);
    return null;
  }
};

/**
 * Set object in cache (JSON) with optional TTL
 */
export const setObject = async <T = any>(
  key: string,
  value: T,
  ttl?: number
): Promise<'OK' | null> => {
  try {
    const serialized = JSON.stringify(value);
    return await set(key, serialized, ttl);
  } catch (error) {
    console.error('Redis setObject error:', error);
    return null;
  }
};

/**
 * Test Redis connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await redis.ping();
    console.log('✅ Redis connection test successful:', result);
    return result === 'PONG';
  } catch (error) {
    console.error('❌ Redis connection test failed:', error);
    return false;
  }
};

/**
 * Close Redis connection
 */
export const closeConnection = async (): Promise<void> => {
  await redis.quit();
  console.log('Redis connection closed');
};

export default redis;
