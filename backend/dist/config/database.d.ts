import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
declare const pool: Pool;
/**
 * Execute a query with automatic connection management
 */
export declare const query: <T extends QueryResultRow = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
/**
 * Get a client from the pool for transactions
 */
export declare const getClient: () => Promise<PoolClient>;
export { pool };
/**
 * Execute a transaction
 */
export declare const transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
/**
 * Test database connection
 */
export declare const testConnection: () => Promise<boolean>;
/**
 * Close all connections
 */
export declare const closePool: () => Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map