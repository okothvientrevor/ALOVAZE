# 🛠️ ALOVAZE - Enterprise Implementation Guide

This guide provides detailed implementation instructions for each major feature of the Alovaze review platform.

---

## 📑 Table of Contents

1. [Database Schema & Migrations](#database-schema--migrations)
2. [Authentication System](#authentication-system)
3. [Review Management](#review-management)
4. [Search with Elasticsearch](#search-with-elasticsearch)
5. [Caching with Redis](#caching-with-redis)
6. [Real-time Updates with Firestore](#real-time-updates-with-firestore)
7. [Background Jobs with Bull](#background-jobs-with-bull)
8. [File Uploads to S3](#file-uploads-to-s3)
9. [Email Notifications](#email-notifications)
10. [Trust Score Algorithm](#trust-score-algorithm)
11. [Company Dashboard](#company-dashboard)
12. [GraphQL API](#graphql-api)

---

## 1. Database Schema & Migrations

### PostgreSQL Schema

The core schema includes:

**Users Table:**
\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  profile_image_url TEXT,
  role VARCHAR(20) DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
\`\`\`

**Companies Table:**
\`\`\`sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  industry VARCHAR(100),
  claimed BOOLEAN DEFAULT false,
  claimed_by_user_id UUID REFERENCES users(id),
  overall_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  trust_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_companies_domain ON companies(domain);
CREATE INDEX idx_companies_trust_score ON companies(trust_score DESC);
CREATE INDEX idx_companies_overall_rating ON companies(overall_rating DESC);
\`\`\`

**Reviews Table:**
\`\`\`sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  experience_date DATE,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_verified_purchase BOOLEAN DEFAULT false,
  moderation_status VARCHAR(20) DEFAULT 'pending',
  moderation_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_reviews_company ON reviews(company_id, created_at DESC);
CREATE INDEX idx_reviews_user ON reviews(user_id, created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(company_id, rating);
CREATE INDEX idx_reviews_moderation ON reviews(moderation_status);
\`\`\`

### Migration Workflow

1. **Create Migration:**
\`\`\`bash
npx db-migrate create add-feature-name --sql-file
\`\`\`

2. **Edit UP SQL file:** Add your schema changes

3. **Edit DOWN SQL file:** Add rollback logic

4. **Run Migration:**
\`\`\`bash
npx db-migrate up
\`\`\`

5. **Rollback if needed:**
\`\`\`bash
npx db-migrate down
\`\`\`

---

## 2. Authentication System

### JWT-Based Authentication

**Backend: `backend/src/services/authService.ts`**

\`\`\`typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pgPool } from '../config/database';

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '7d';

export class AuthService {
  async register(email: string, password: string, displayName: string) {
    // Validate input
    if (!email || !password || !displayName) {
      throw new Error('All fields are required');
    }
    
    // Check if user exists
    const existingUser = await pgPool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert user
    const result = await pgPool.query(
      \`INSERT INTO users (email, password_hash, display_name, role, is_verified)
       VALUES ($1, $2, $3, 'user', false)
       RETURNING id, email, display_name, role, is_verified, created_at\`,
      [email, passwordHash, displayName]
    );
    
    const user = result.rows[0];
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    return { user, token };
  }
  
  async login(email: string, password: string) {
    // Find user
    const result = await pgPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = result.rows[0];
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    
    // Remove password hash from response
    delete user.password_hash;
    
    return { user, token };
  }
  
  async verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
\`\`\`

**Frontend: `frontend/src/services/api.ts`**

\`\`\`typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

// Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: {email: string; password: string; displayName: string}) =>
    apiClient.post('/auth/register', data),
  
  login: (data: {email: string; password: string}) =>
    apiClient.post('/auth/login', data),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
};
\`\`\`

---

## 3. Review Management

### Create Review with Transaction

**Backend: `backend/src/services/reviewService.ts`**

\`\`\`typescript
import { pgPool, redisClient, esClient } from '../config/database';

export class ReviewService {
  async createReview(data: {
    companyId: string;
    userId: string;
    rating: number;
    title: string;
    content: string;
  }) {
    const client = await pgPool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert review
      const reviewResult = await client.query(
        \`INSERT INTO reviews (company_id, user_id, rating, title, content, moderation_status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *\`,
        [data.companyId, data.userId, data.rating, data.title, data.content]
      );
      
      const review = reviewResult.rows[0];
      
      // Update company stats
      await client.query(
        \`UPDATE companies
         SET total_reviews = total_reviews + 1,
             overall_rating = (
               SELECT AVG(rating)::numeric(3,2)
               FROM reviews
               WHERE company_id = $1 AND moderation_status = 'approved'
             ),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1\`,
        [data.companyId]
      );
      
      await client.query('COMMIT');
      
      // Invalidate cache
      await redisClient.del(\`company:\${data.companyId}:reviews\`);
      await redisClient.del(\`company:\${data.companyId}:stats\`);
      
      // Index in Elasticsearch
      await esClient.index({
        index: 'reviews',
        id: review.id,
        document: {
          company_id: review.company_id,
          user_id: review.user_id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          created_at: review.created_at,
        },
      });
      
      return review;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
\`\`\`

---

## 4. Search with Elasticsearch

### Index Configuration

\`\`\`typescript
// backend/src/config/elasticsearch.ts
import { esClient } from './database';

export async function initializeElasticsearchIndices() {
  // Create reviews index
  const reviewsIndexExists = await esClient.indices.exists({ index: 'reviews' });
  
  if (!reviewsIndexExists) {
    await esClient.indices.create({
      index: 'reviews',
      body: {
        settings: {
          number_of_shards: 2,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              custom_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'stop', 'snowball']
              }
            }
          }
        },
        mappings: {
          properties: {
            company_id: { type: 'keyword' },
            user_id: { type: 'keyword' },
            rating: { type: 'integer' },
            title: { 
              type: 'text', 
              analyzer: 'custom_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            content: { 
              type: 'text', 
              analyzer: 'custom_analyzer' 
            },
            created_at: { type: 'date' },
            is_verified_purchase: { type: 'boolean' },
            moderation_status: { type: 'keyword' }
          }
        }
      }
    });
  }
  
  // Create companies index
  const companiesIndexExists = await esClient.indices.exists({ index: 'companies' });
  
  if (!companiesIndexExists) {
    await esClient.indices.create({
      index: 'companies',
      body: {
        settings: {
          number_of_shards: 2,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              company_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'asciifolding', 'stop']
              }
            }
          }
        },
        mappings: {
          properties: {
            name: { 
              type: 'text', 
              analyzer: 'company_analyzer',
              fields: {
                keyword: { type: 'keyword' }
              }
            },
            domain: { type: 'keyword' },
            description: { type: 'text', analyzer: 'company_analyzer' },
            industry: { type: 'keyword' },
            overall_rating: { type: 'float' },
            total_reviews: { type: 'integer' },
            trust_score: { type: 'float' }
          }
        }
      }
    });
  }
}
\`\`\`

### Search Implementation

\`\`\`typescript
// backend/src/services/searchService.ts
import { esClient } from '../config/database';

export class SearchService {
  async searchReviews(query: {
    companyId?: string;
    searchTerm?: string;
    minRating?: number;
    maxRating?: number;
    verifiedOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { 
      companyId, 
      searchTerm, 
      minRating, 
      maxRating, 
      verifiedOnly, 
      page = 1, 
      limit = 20 
    } = query;
    
    const from = (page - 1) * limit;
    
    // Build query
    const mustClauses: any[] = [
      { term: { moderation_status: 'approved' } }
    ];
    
    if (companyId) {
      mustClauses.push({ term: { company_id: companyId } });
    }
    
    if (searchTerm) {
      mustClauses.push({
        multi_match: {
          query: searchTerm,
          fields: ['title^2', 'content'],
          fuzziness: 'AUTO'
        }
      });
    }
    
    if (minRating || maxRating) {
      mustClauses.push({
        range: {
          rating: {
            gte: minRating || 1,
            lte: maxRating || 5
          }
        }
      });
    }
    
    if (verifiedOnly) {
      mustClauses.push({ term: { is_verified_purchase: true } });
    }
    
    const result = await esClient.search({
      index: 'reviews',
      body: {
        from,
        size: limit,
        query: {
          bool: {
            must: mustClauses
          }
        },
        sort: [
          { created_at: 'desc' }
        ]
      }
    });
    
    return {
      reviews: result.hits.hits.map(hit => hit._source),
      total: result.hits.total,
      page,
      limit
    };
  }
  
  async searchCompanies(searchTerm: string, page = 1, limit = 20) {
    const from = (page - 1) * limit;
    
    const result = await esClient.search({
      index: 'companies',
      body: {
        from,
        size: limit,
        query: {
          multi_match: {
            query: searchTerm,
            fields: ['name^3', 'description', 'industry'],
            fuzziness: 'AUTO'
          }
        },
        sort: [
          { trust_score: 'desc' },
          { total_reviews: 'desc' }
        ]
      }
    });
    
    return {
      companies: result.hits.hits.map(hit => hit._source),
      total: result.hits.total,
      page,
      limit
    };
  }
}
\`\`\`

---

## 5. Caching with Redis

### Cache Strategy

\`\`\`typescript
// backend/src/services/cacheService.ts
import { redisClient } from '../config/database';

const CACHE_TTL = {
  COMPANY_PROFILE: 300,      // 5 minutes
  COMPANY_REVIEWS: 180,      // 3 minutes
  USER_PROFILE: 600,         // 10 minutes
  SEARCH_RESULTS: 120,       // 2 minutes
  TRUST_SCORE: 3600,         // 1 hour
};

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  async set(key: string, value: any, ttl: number): Promise<void> {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  }
  
  async del(pattern: string): Promise<void> {
    if (pattern.includes('*')) {
      // Delete by pattern
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // Delete single key
      await redisClient.del(pattern);
    }
  }
  
  async getCompanyReviews(companyId: string, page: number) {
    const key = \`company:\${companyId}:reviews:\${page}\`;
    return this.get(key);
  }
  
  async setCompanyReviews(companyId: string, page: number, reviews: any) {
    const key = \`company:\${companyId}:reviews:\${page}\`;
    await this.set(key, reviews, CACHE_TTL.COMPANY_REVIEWS);
  }
  
  async invalidateCompanyCache(companyId: string) {
    await this.del(\`company:\${companyId}:*\`);
  }
}
\`\`\`

---

## 6. Real-time Updates with Firestore

### Firestore Configuration

\`\`\`typescript
// backend/src/config/firebase.ts
import admin from 'firebase-admin';
import serviceAccount from '../../firebase-service-account.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

export const firestore = admin.firestore();
\`\`\`

### Real-time Notifications

\`\`\`typescript
// backend/src/services/notificationService.ts
import { firestore } from '../config/firebase';

export class NotificationService {
  async sendNotification(userId: string, data: {
    type: string;
    title: string;
    message: string;
    link?: string;
  }) {
    await firestore.collection('notifications').add({
      userId,
      ...data,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  
  async notifyNewReview(companyId: string, reviewId: string) {
    // Get company owner
    const company = await pgPool.query(
      'SELECT claimed_by_user_id FROM companies WHERE id = $1',
      [companyId]
    );
    
    if (company.rows[0]?.claimed_by_user_id) {
      await this.sendNotification(company.rows[0].claimed_by_user_id, {
        type: 'new_review',
        title: 'New Review',
        message: 'Your company received a new review',
        link: \`/company/\${companyId}/review/\${reviewId}\`,
      });
    }
  }
}
\`\`\`

**Frontend: Real-time Listener**

\`\`\`typescript
// frontend/src/hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const user = useAuthStore(state => state.user);
  
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotifications(notifs);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  return notifications;
}
\`\`\`

---

## 7. Background Jobs with Bull

### Job Queue Setup

\`\`\`typescript
// backend/src/jobs/queue.ts
import Bull from 'bull';

const REDIS_URL = \`redis://\${process.env.REDIS_HOST}:\${process.env.REDIS_PORT}\`;

export const emailQueue = new Bull('email', REDIS_URL);
export const moderationQueue = new Bull('moderation', REDIS_URL);
export const trustScoreQueue = new Bull('trust-score', REDIS_URL);

// Email job processor
emailQueue.process(async (job) => {
  const { to, subject, template, data } = job.data;
  // Send email using SendGrid/SES
  console.log(\`Sending email to \${to}: \${subject}\`);
});

// Moderation job processor
moderationQueue.process(async (job) => {
  const { reviewId } = job.data;
  // Run AI moderation
  console.log(\`Moderating review \${reviewId}\`);
});

// Trust score calculation
trustScoreQueue.process(async (job) => {
  const { companyId } = job.data;
  // Calculate trust score
  console.log(\`Calculating trust score for \${companyId}\`);
});
\`\`\`

### Adding Jobs

\`\`\`typescript
// backend/src/services/reviewService.ts
import { emailQueue, moderationQueue } from '../jobs/queue';

export class ReviewService {
  async createReview(data: any) {
    // ... create review logic ...
    
    // Add to moderation queue
    await moderationQueue.add({ reviewId: review.id }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });
    
    // Send email to company owner
    await emailQueue.add({
      to: companyOwnerEmail,
      subject: 'New Review Received',
      template: 'new-review',
      data: { reviewId: review.id, companyName: company.name },
    });
    
    return review;
  }
}
\`\`\`

---

## 8. File Uploads to S3

### Presigned URL Generation

\`\`\`typescript
// backend/src/services/uploadService.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export class UploadService {
  async generatePresignedUrl(fileName: string, fileType: string) {
    const key = \`reviews/\${Date.now()}-\${fileName}\`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });
    
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    const fileUrl = \`https://\${BUCKET_NAME}.s3.\${process.env.AWS_REGION}.amazonaws.com/\${key}\`;
    
    return { uploadUrl, fileUrl, key };
  }
}
\`\`\`

**Frontend: Upload Component**

\`\`\`typescript
// frontend/src/components/ImageUpload.tsx
import { useState } from 'react';
import axios from 'axios';
import { apiClient } from '../services/api';

export function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Get presigned URL
      const { data } = await apiClient.post('/uploads/presigned-url', {
        fileName: file.name,
        fileType: file.type,
      });
      
      // Upload directly to S3
      await axios.put(data.uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });
      
      // Save file URL
      onUpload(data.fileUrl);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <span>Uploading...</span>}
    </div>
  );
}
\`\`\`

---

## 9. Email Notifications

### SendGrid Integration

\`\`\`typescript
// backend/src/services/emailService.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export class EmailService {
  async sendWelcomeEmail(to: string, displayName: string) {
    const msg = {
      to,
      from: process.env.FROM_EMAIL!,
      subject: 'Welcome to Alovaze',
      text: \`Hi \${displayName}, welcome to Alovaze!\`,
      html: \`<strong>Hi \${displayName}, welcome to Alovaze!</strong>\`,
    };
    
    await sgMail.send(msg);
  }
  
  async sendReviewNotification(to: string, companyName: string, reviewId: string) {
    const msg = {
      to,
      from: process.env.FROM_EMAIL!,
      subject: \`New review for \${companyName}\`,
      html: \`<p>Your company received a new review. <a href="\${process.env.FRONTEND_URL}/review/\${reviewId}">View it here</a></p>\`,
    };
    
    await sgMail.send(msg);
  }
}
\`\`\`

---

## 10. Trust Score Algorithm

### Trust Score Calculation

\`\`\`typescript
// backend/src/services/trustScoreService.ts
import { pgPool } from '../config/database';

export class TrustScoreService {
  async calculateTrustScore(companyId: string): Promise<number> {
    const result = await pgPool.query(
      \`SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        COUNT(CASE WHEN is_verified_purchase THEN 1 END) as verified_count,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - MAX(created_at))) / 86400 as days_since_last_review
       FROM reviews
       WHERE company_id = $1 AND moderation_status = 'approved'\`,
      [companyId]
    );
    
    const { total_reviews, avg_rating, verified_count, days_since_last_review } = result.rows[0];
    
    // Trust score formula (0-100)
    const volumeScore = Math.min(total_reviews / 100, 1) * 30;
    const ratingScore = (avg_rating / 5) * 40;
    const verifiedScore = (verified_count / total_reviews) * 20;
    const recencyScore = Math.max(0, (1 - days_since_last_review / 365)) * 10;
    
    const trustScore = volumeScore + ratingScore + verifiedScore + recencyScore;
    
    // Update company
    await pgPool.query(
      'UPDATE companies SET trust_score = $1 WHERE id = $2',
      [trustScore, companyId]
    );
    
    return trustScore;
  }
}
\`\`\`

---

## 11. Company Dashboard

### Analytics Endpoint

\`\`\`typescript
// backend/src/controllers/companyController.ts
import { Request, Response } from 'express';
import { pgPool } from '../config/database';

export async function getCompanyAnalytics(req: Request, res: Response) {
  const { companyId } = req.params;
  const { startDate, endDate } = req.query;
  
  // Total stats
  const statsResult = await pgPool.query(
    \`SELECT 
      COUNT(*) as total_reviews,
      AVG(rating) as avg_rating,
      COUNT(CASE WHEN rating >= 4 THEN 1 END) as positive_reviews,
      COUNT(CASE WHEN rating <= 2 THEN 1 END) as negative_reviews
     FROM reviews
     WHERE company_id = $1 AND moderation_status = 'approved'
     AND created_at BETWEEN $2 AND $3\`,
    [companyId, startDate, endDate]
  );
  
  // Rating distribution
  const distributionResult = await pgPool.query(
    \`SELECT rating, COUNT(*) as count
     FROM reviews
     WHERE company_id = $1 AND moderation_status = 'approved'
     GROUP BY rating
     ORDER BY rating DESC\`,
    [companyId]
  );
  
  // Reviews over time
  const timelineResult = await pgPool.query(
    \`SELECT DATE(created_at) as date, COUNT(*) as count, AVG(rating) as avg_rating
     FROM reviews
     WHERE company_id = $1 AND moderation_status = 'approved'
     AND created_at BETWEEN $2 AND $3
     GROUP BY DATE(created_at)
     ORDER BY date\`,
    [companyId, startDate, endDate]
  );
  
  res.json({
    stats: statsResult.rows[0],
    distribution: distributionResult.rows,
    timeline: timelineResult.rows,
  });
}
\`\`\`

---

## 12. GraphQL API

### Apollo Server Setup

\`\`\`typescript
// backend/src/graphql/server.ts
import { ApolloServer } from 'apollo-server-express';
import { typeDefs } from './schemas';
import { resolvers } from './resolvers';

export const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    // Add user from JWT to context
    const token = req.headers.authorization?.split(' ')[1];
    // ... verify token ...
    return { user };
  },
});
\`\`\`

### Type Definitions

\`\`\`graphql
# backend/src/graphql/schemas/index.ts
type Query {
  company(id: ID!): Company
  reviews(companyId: ID!, page: Int, limit: Int): ReviewConnection
  me: User
}

type Mutation {
  createReview(input: CreateReviewInput!): Review
  updateReview(id: ID!, input: UpdateReviewInput!): Review
  deleteReview(id: ID!): Boolean
}

type Company {
  id: ID!
  name: String!
  domain: String!
  overallRating: Float!
  totalReviews: Int!
  trustScore: Float!
  reviews(page: Int, limit: Int): ReviewConnection
}

type Review {
  id: ID!
  rating: Int!
  title: String!
  content: String!
  user: User!
  company: Company!
  createdAt: String!
}
\`\`\`

---

## ✅ Next Steps

1. Implement each feature following these guidelines
2. Test thoroughly with unit and integration tests
3. Monitor performance and optimize as needed
4. Deploy to production with proper monitoring

**For more details, see:**
- `docs/ENTERPRISE_ARCHITECTURE.md` - System architecture
- `docs/ENTERPRISE_SETUP.md` - Infrastructure setup
- `STEP_BY_STEP_GUIDE.md` - Phase-by-phase development

**Happy coding! 🚀**
