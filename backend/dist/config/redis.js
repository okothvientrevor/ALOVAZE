"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.testConnection = exports.setObject = exports.getObject = exports.incr = exports.expire = exports.exists = exports.del = exports.set = exports.get = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create Redis client
const redis = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'alovaze:',
    retryStrategy: (times) => {
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
redis.on('error', (err) => {
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
const get = async (key) => {
    try {
        return await redis.get(key);
    }
    catch (error) {
        console.error('Redis GET error:', error);
        return null;
    }
};
exports.get = get;
/**
 * Set value in cache with optional TTL (in seconds)
 */
const set = async (key, value, ttl) => {
    try {
        if (ttl) {
            return await redis.setex(key, ttl, value);
        }
        return await redis.set(key, value);
    }
    catch (error) {
        console.error('Redis SET error:', error);
        return null;
    }
};
exports.set = set;
/**
 * Delete key(s) from cache
 */
const del = async (...keys) => {
    try {
        return await redis.del(...keys);
    }
    catch (error) {
        console.error('Redis DEL error:', error);
        return 0;
    }
};
exports.del = del;
/**
 * Check if key exists
 */
const exists = async (key) => {
    try {
        const result = await redis.exists(key);
        return result === 1;
    }
    catch (error) {
        console.error('Redis EXISTS error:', error);
        return false;
    }
};
exports.exists = exists;
/**
 * Set expiration on a key
 */
const expire = async (key, seconds) => {
    try {
        const result = await redis.expire(key, seconds);
        return result === 1;
    }
    catch (error) {
        console.error('Redis EXPIRE error:', error);
        return false;
    }
};
exports.expire = expire;
/**
 * Increment a counter
 */
const incr = async (key) => {
    try {
        return await redis.incr(key);
    }
    catch (error) {
        console.error('Redis INCR error:', error);
        return 0;
    }
};
exports.incr = incr;
/**
 * Get object from cache (JSON)
 */
const getObject = async (key) => {
    try {
        const data = await redis.get(key);
        if (!data)
            return null;
        return JSON.parse(data);
    }
    catch (error) {
        console.error('Redis getObject error:', error);
        return null;
    }
};
exports.getObject = getObject;
/**
 * Set object in cache (JSON) with optional TTL
 */
const setObject = async (key, value, ttl) => {
    try {
        const serialized = JSON.stringify(value);
        return await (0, exports.set)(key, serialized, ttl);
    }
    catch (error) {
        console.error('Redis setObject error:', error);
        return null;
    }
};
exports.setObject = setObject;
/**
 * Test Redis connection
 */
const testConnection = async () => {
    try {
        const result = await redis.ping();
        console.log('✅ Redis connection test successful:', result);
        return result === 'PONG';
    }
    catch (error) {
        console.error('❌ Redis connection test failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
/**
 * Close Redis connection
 */
const closeConnection = async () => {
    await redis.quit();
    console.log('Redis connection closed');
};
exports.closeConnection = closeConnection;
exports.default = redis;
//# sourceMappingURL=redis.js.map