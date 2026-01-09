"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeConnection = exports.initializeIndices = exports.bulk = exports.search = exports.deleteDocument = exports.updateDocument = exports.indexDocument = exports.createIndex = exports.testConnection = exports.INDICES = void 0;
const elasticsearch_1 = require("@elastic/elasticsearch");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Create Elasticsearch client
const client = new elasticsearch_1.Client({
    node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',
    auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD
        ? {
            username: process.env.ELASTICSEARCH_USERNAME,
            password: process.env.ELASTICSEARCH_PASSWORD,
        }
        : undefined,
    maxRetries: 5,
    requestTimeout: 60000,
    sniffOnStart: false,
});
/**
 * Index names
 */
exports.INDICES = {
    REVIEWS: `${process.env.ELASTICSEARCH_INDEX_PREFIX || 'alovaze_'}reviews`,
    BUSINESSES: `${process.env.ELASTICSEARCH_INDEX_PREFIX || 'alovaze_'}businesses`,
    USERS: `${process.env.ELASTICSEARCH_INDEX_PREFIX || 'alovaze_'}users`,
};
/**
 * Test Elasticsearch connection
 */
const testConnection = async () => {
    try {
        const health = await client.cluster.health();
        console.log('✅ Elasticsearch connection test successful:', {
            cluster: health.cluster_name,
            status: health.status,
            nodes: health.number_of_nodes,
        });
        return true;
    }
    catch (error) {
        console.error('❌ Elasticsearch connection test failed:', error);
        return false;
    }
};
exports.testConnection = testConnection;
/**
 * Create index with mappings
 */
const createIndex = async (index, mappings) => {
    try {
        const exists = await client.indices.exists({ index });
        if (exists) {
            console.log(`Index ${index} already exists`);
            return true;
        }
        await client.indices.create({
            index,
            mappings,
            settings: {
                number_of_shards: 1,
                number_of_replicas: 1,
                analysis: {
                    analyzer: {
                        autocomplete: {
                            type: 'custom',
                            tokenizer: 'autocomplete',
                            filter: ['lowercase'],
                        },
                        autocomplete_search: {
                            type: 'custom',
                            tokenizer: 'lowercase',
                        },
                    },
                    tokenizer: {
                        autocomplete: {
                            type: 'edge_ngram',
                            min_gram: 2,
                            max_gram: 10,
                            token_chars: ['letter', 'digit'],
                        },
                    },
                },
            },
        });
        console.log(`✅ Created index: ${index}`);
        return true;
    }
    catch (error) {
        console.error(`❌ Error creating index ${index}:`, error);
        return false;
    }
};
exports.createIndex = createIndex;
/**
 * Index a document
 */
const indexDocument = async (index, id, document) => {
    try {
        await client.index({
            index,
            id,
            document,
            refresh: 'true',
        });
        return true;
    }
    catch (error) {
        console.error('Error indexing document:', error);
        return false;
    }
};
exports.indexDocument = indexDocument;
/**
 * Update a document
 */
const updateDocument = async (index, id, document) => {
    try {
        await client.update({
            index,
            id,
            doc: document,
            refresh: 'true',
        });
        return true;
    }
    catch (error) {
        console.error('Error updating document:', error);
        return false;
    }
};
exports.updateDocument = updateDocument;
/**
 * Delete a document
 */
const deleteDocument = async (index, id) => {
    try {
        await client.delete({
            index,
            id,
            refresh: 'true',
        });
        return true;
    }
    catch (error) {
        console.error('Error deleting document:', error);
        return false;
    }
};
exports.deleteDocument = deleteDocument;
/**
 * Search documents
 */
const search = async (index, query) => {
    try {
        const result = await client.search({
            index,
            body: query,
        });
        return result;
    }
    catch (error) {
        console.error('Error searching documents:', error);
        return null;
    }
};
exports.search = search;
/**
 * Bulk operation
 */
const bulk = async (operations) => {
    try {
        const response = await client.bulk({
            operations,
            refresh: 'true',
        });
        if (response.errors) {
            console.error('Bulk operation had errors');
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Error in bulk operation:', error);
        return false;
    }
};
exports.bulk = bulk;
/**
 * Initialize all indices
 */
const initializeIndices = async () => {
    console.log('🔄 Initializing Elasticsearch indices...');
    // Reviews index mapping
    const reviewsMapping = {
        properties: {
            id: { type: 'keyword' },
            business_id: { type: 'keyword' },
            user_id: { type: 'keyword' },
            rating: { type: 'integer' },
            title: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
            },
            content: { type: 'text' },
            verified: { type: 'boolean' },
            helpful_count: { type: 'integer' },
            created_at: { type: 'date' },
            updated_at: { type: 'date' },
        },
    };
    // Businesses index mapping
    const businessesMapping = {
        properties: {
            id: { type: 'keyword' },
            name: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
            },
            domain: { type: 'keyword' },
            industry: { type: 'keyword' },
            description: { type: 'text' },
            average_rating: { type: 'float' },
            total_reviews: { type: 'integer' },
            created_at: { type: 'date' },
        },
    };
    // Users index mapping
    const usersMapping = {
        properties: {
            id: { type: 'keyword' },
            name: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'autocomplete_search',
            },
            email: { type: 'keyword' },
            total_reviews: { type: 'integer' },
            created_at: { type: 'date' },
        },
    };
    await Promise.all([
        (0, exports.createIndex)(exports.INDICES.REVIEWS, reviewsMapping),
        (0, exports.createIndex)(exports.INDICES.BUSINESSES, businessesMapping),
        (0, exports.createIndex)(exports.INDICES.USERS, usersMapping),
    ]);
    console.log('✅ Elasticsearch indices initialized');
};
exports.initializeIndices = initializeIndices;
/**
 * Close Elasticsearch connection
 */
const closeConnection = async () => {
    await client.close();
    console.log('Elasticsearch connection closed');
};
exports.closeConnection = closeConnection;
exports.default = client;
//# sourceMappingURL=elasticsearch.js.map