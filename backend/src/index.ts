import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import database connections
import { testConnection as testPostgreSQL } from './config/database';
import { testConnection as testRedis } from './config/redis';
import { testConnection as testElasticsearch, initializeIndices } from './config/elasticsearch';

// Import API routes
import apiRoutes from './routes';

// Initialize Express app
const app: Application = express();
const httpServer = createServer(app);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

// Hello World endpoint
app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to ALOVAZE Review Platform API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      reviews: '/api/reviews',
      health: '/health',
    },
  });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * Test all database connections
 */
async function testConnections(): Promise<boolean> {
  console.log('\n🔍 Testing database connections...\n');
  
  let allPassed = true;

  // Test PostgreSQL
  console.log('1️⃣  Testing PostgreSQL...');
  const pgSuccess = await testPostgreSQL();
  if (!pgSuccess) {
    console.error('   ❌ PostgreSQL connection failed');
    allPassed = false;
  }

  // Test Redis
  console.log('\n2️⃣  Testing Redis...');
  const redisSuccess = await testRedis();
  if (!redisSuccess) {
    console.error('   ❌ Redis connection failed');
    allPassed = false;
  }

  // Test Elasticsearch
  console.log('\n3️⃣  Testing Elasticsearch...');
  const esSuccess = await testElasticsearch();
  if (!esSuccess) {
    console.error('   ❌ Elasticsearch connection failed');
    allPassed = false;
  }

  // Initialize Elasticsearch indices if connection successful
  if (esSuccess) {
    console.log('\n4️⃣  Initializing Elasticsearch indices...');
    try {
      await initializeIndices();
      console.log('   ✅ Elasticsearch indices initialized');
    } catch (error) {
      console.error('   ❌ Failed to initialize Elasticsearch indices:', error);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('✅ All database connections successful!\n');
  } else {
    console.log('⚠️  Some database connections failed. Check the logs above.\n');
  }
  console.log('='.repeat(60) + '\n');

  return allPassed;
}

// Start server
const PORT = process.env.PORT || 4000;

async function startServer() {
  // Test all connections first
  await testConnections();

  httpServer.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════════════════╗
  ║                                                  ║
  ║   🚀 ALOVAZE Review Platform API                ║
  ║                                                  ║
  ║   Environment: ${process.env.NODE_ENV?.padEnd(31)}║
  ║   Port:        ${PORT.toString().padEnd(31)}║
  ║   URL:         http://localhost:${PORT}${' '.repeat(19)}║
  ║                                                  ║
  ║   Status:      ✅ Server is running             ║
  ║                                                  ║
  ╚══════════════════════════════════════════════════╝
  `);
  });
}

// Start the application
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export default app;
