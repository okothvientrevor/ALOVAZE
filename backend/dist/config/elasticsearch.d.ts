import { Client } from '@elastic/elasticsearch';
declare const client: Client;
/**
 * Index names
 */
export declare const INDICES: {
    REVIEWS: string;
    BUSINESSES: string;
    USERS: string;
};
/**
 * Test Elasticsearch connection
 */
export declare const testConnection: () => Promise<boolean>;
/**
 * Create index with mappings
 */
export declare const createIndex: (index: string, mappings: any) => Promise<boolean>;
/**
 * Index a document
 */
export declare const indexDocument: (index: string, id: string, document: any) => Promise<boolean>;
/**
 * Update a document
 */
export declare const updateDocument: (index: string, id: string, document: any) => Promise<boolean>;
/**
 * Delete a document
 */
export declare const deleteDocument: (index: string, id: string) => Promise<boolean>;
/**
 * Search documents
 */
export declare const search: (index: string, query: any) => Promise<any>;
/**
 * Bulk operation
 */
export declare const bulk: (operations: any[]) => Promise<boolean>;
/**
 * Initialize all indices
 */
export declare const initializeIndices: () => Promise<void>;
/**
 * Close Elasticsearch connection
 */
export declare const closeConnection: () => Promise<void>;
export default client;
//# sourceMappingURL=elasticsearch.d.ts.map