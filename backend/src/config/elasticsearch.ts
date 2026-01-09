import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';

dotenv.config();

// Create Elasticsearch client
const client = new Client({
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
export const INDICES = {
  REVIEWS: `${process.env.ELASTICSEARCH_INDEX_PREFIX || 'alovaze_'}reviews`,
  BUSINESSES: `${process.env.ELASTICSEARCH_INDEX_PREFIX || 'alovaze_'}businesses`,
  USERS: `${process.env.ELASTICSEARCH_INDEX_PREFIX || 'alovaze_'}users`,
};

/**
 * Test Elasticsearch connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    const health = await client.cluster.health();
    console.log('✅ Elasticsearch connection test successful:', {
      cluster: health.cluster_name,
      status: health.status,
      nodes: health.number_of_nodes,
    });
    return true;
  } catch (error) {
    console.error('❌ Elasticsearch connection test failed:', error);
    return false;
  }
};

/**
 * Create index with mappings
 */
export const createIndex = async (
  index: string,
  mappings: any
): Promise<boolean> => {
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
  } catch (error) {
    console.error(`❌ Error creating index ${index}:`, error);
    return false;
  }
};

/**
 * Index a document
 */
export const indexDocument = async (
  index: string,
  id: string,
  document: any
): Promise<boolean> => {
  try {
    await client.index({
      index,
      id,
      document,
      refresh: 'true',
    });
    return true;
  } catch (error) {
    console.error('Error indexing document:', error);
    return false;
  }
};

/**
 * Update a document
 */
export const updateDocument = async (
  index: string,
  id: string,
  document: any
): Promise<boolean> => {
  try {
    await client.update({
      index,
      id,
      doc: document,
      refresh: 'true',
    });
    return true;
  } catch (error) {
    console.error('Error updating document:', error);
    return false;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  index: string,
  id: string
): Promise<boolean> => {
  try {
    await client.delete({
      index,
      id,
      refresh: 'true',
    });
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
};

/**
 * Search documents
 */
export const search = async (index: string, query: any): Promise<any> => {
  try {
    const result = await client.search({
      index,
      body: query,
    });
    return result;
  } catch (error) {
    console.error('Error searching documents:', error);
    return null;
  }
};

/**
 * Bulk operation
 */
export const bulk = async (operations: any[]): Promise<boolean> => {
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
  } catch (error) {
    console.error('Error in bulk operation:', error);
    return false;
  }
};

/**
 * Initialize all indices
 */
export const initializeIndices = async (): Promise<void> => {
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
    createIndex(INDICES.REVIEWS, reviewsMapping),
    createIndex(INDICES.BUSINESSES, businessesMapping),
    createIndex(INDICES.USERS, usersMapping),
  ]);

  console.log('✅ Elasticsearch indices initialized');
};

/**
 * Close Elasticsearch connection
 */
export const closeConnection = async (): Promise<void> => {
  await client.close();
  console.log('Elasticsearch connection closed');
};

export default client;
