"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.testConnection = exports.transaction = exports.pool = exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// PostgreSQL connection pool
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000'),
    connectionTimeoutMillis: 10000,
});
exports.pool = pool;
// Test connection on startup
pool.on('connect', () => {
    console.log('✅ PostgreSQL: Connected to database');
});
pool.on('error', (err) => {
    console.error('❌ PostgreSQL: Unexpected error on idle client', err);
    process.exit(-1);
});
/**
 * Execute a query with automatic connection management
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: result.rowCount });
        return result;
    }
    catch (error) {
        console.error('Database query error:', { text, error });
        throw error;
    }
};
exports.query = query;
/**
 * Get a client from the pool for transactions
 */
const getClient = async () => {
    return await pool.connect();
};
exports.getClient = getClient;
/**
 * Execute a transaction
 */
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
};
exports.transaction = transaction;
/**
 * Test database connection
 */
const testConnection = async () => {
    try {
        const result = await (0, exports.query)('SELECT NOW() as now');
        console.log('✅ Database connection test successful:', result.rows[0]);
        return true;
    }
    catch (error) {
        console.error('❌ Database connection test failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
/**
 * Close all connections
 */
const closePool = async () => {
    await pool.end();
    console.log('PostgreSQL pool has ended');
};
exports.closePool = closePool;
exports.default = pool;
//# sourceMappingURL=database.js.map