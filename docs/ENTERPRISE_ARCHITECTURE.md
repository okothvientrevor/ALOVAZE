# 🏗️ Enterprise-Grade Architecture Specification

## Technology Stack (Production-Ready Hybrid Approach)

### Core Infrastructure
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Node.js (Express.js) + TypeScript
- **Primary Database**: PostgreSQL 14+ (with connection pooling via PgBouncer)
- **Real-time Engine**: Firestore or Socket.io (for live updates only)
- **Search Engine**: Elasticsearch 8+ (or Algolia for faster MVP)
- **Cache Layer**: Redis 6+ (sessions, rate limiting, computed data)
- **Message Queue**: Bull (Redis-based) for async tasks
- **Storage**: AWS S3 or Firebase Storage (images, files)
- **Authentication**: Firebase Auth or Auth0
- **CDN**: CloudFront or Cloudflare
- **Monitoring**: Sentry (errors) + DataDog/NewRelic (APM)

---

## Why This Hybrid Architecture?

### PostgreSQL (Primary Database)
**Use Cases:**
- ✅ Complex queries with JOINs
- ✅ ACID transactions (data integrity)
- ✅ Relational data (users, businesses, reviews)
- ✅ Advanced analytics and aggregations
- ✅ Mature ecosystem and tooling
- ✅ Full-text search capabilities (bonus)

**Data Stored:**
- Users, businesses, reviews, categories
- Relationships and foreign keys
- Transaction history
- Analytics aggregations

### Redis (Cache & Queue Layer)
**Use Cases:**
- ✅ Session storage (fast lookups)
- ✅ Rate limiting (per-user, per-IP)
- ✅ Caching expensive queries
- ✅ Job queue (Bull)
- ✅ Real-time counters
- ✅ Leaderboards/trending

**Data Stored:**
- Session tokens
- Cached business profiles (15 min TTL)
- Rate limit counters
- Job queue data
- Trending businesses (sorted sets)

### Elasticsearch (Search Engine)
**Use Cases:**
- ✅ Full-text search across reviews & businesses
- ✅ Autocomplete functionality
- ✅ Faceted filtering (category, rating, location)
- ✅ Relevance scoring
- ✅ Analytics aggregations
- ✅ Complex queries at scale

**Data Stored:**
- Indexed reviews (searchable)
- Indexed businesses (searchable)
- Synced from PostgreSQL via background jobs

### Firestore (Real-Time Only)
**Use Cases:**
- ✅ Live review feeds (last 24 hours)
- ✅ Real-time notifications
- ✅ Presence indicators
- ✅ Reduces PostgreSQL load for live features

**Data Stored:**
- Recent reviews (24h TTL)
- User notifications (30d TTL)
- Live business stats snapshots
- NOT the source of truth (PostgreSQL is)

---

## Database Schema (PostgreSQL)

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(100),
    profile_image_url TEXT,
    account_type VARCHAR(20) DEFAULT 'user', -- 'user', 'business', 'admin'
    phone_number VARCHAR(20),
    country_code VARCHAR(3),
    city VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    -- Denormalized stats (updated via triggers)
    total_reviews_count INTEGER DEFAULT 0,
    helpful_votes_received INTEGER DEFAULT 0,
    
    -- Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_account_type ON users(account_type);
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### 2. Businesses Table
```sql
CREATE TABLE businesses (
    business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    business_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    cover_image_url TEXT,
    description TEXT,
    website_url TEXT,
    
    -- Contact Info
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    address TEXT,
    country_code VARCHAR(3),
    city VARCHAR(100),
    
    -- Category
    primary_category_id INTEGER REFERENCES categories(category_id),
    
    -- Status
    is_verified BOOLEAN DEFAULT FALSE,
    is_claimed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    claimed_at TIMESTAMP,
    verified_at TIMESTAMP,
    
    -- Subscription
    subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'basic', 'premium'
    subscription_expires_at TIMESTAMP,
    
    -- Denormalized stats (updated via triggers/jobs)
    total_reviews_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    rating_1_star INTEGER DEFAULT 0,
    rating_2_star INTEGER DEFAULT 0,
    rating_3_star INTEGER DEFAULT 0,
    rating_4_star INTEGER DEFAULT 0,
    rating_5_star INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_response_time_hours DECIMAL(10,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Full-text search (PostgreSQL tsvector)
    search_vector TSVECTOR
);

-- Indexes for performance
CREATE INDEX idx_businesses_slug ON businesses(slug);
CREATE INDEX idx_businesses_category ON businesses(primary_category_id);
CREATE INDEX idx_businesses_rating ON businesses(average_rating DESC);
CREATE INDEX idx_businesses_verified ON businesses(is_verified);
CREATE INDEX idx_businesses_search ON businesses USING GIN(search_vector);
CREATE INDEX idx_businesses_location ON businesses(country_code, city);

-- Trigger to auto-update search vector
CREATE TRIGGER businesses_search_vector_update
BEFORE INSERT OR UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION
tsvector_update_trigger(search_vector, 'pg_catalog.english', 
    business_name, description);
```

#### 3. Reviews Table
```sql
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Review Content
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT NOT NULL,
    experience_level VARCHAR(20), -- 'excellent', 'good', 'average', 'poor', 'bad'
    
    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    purchase_date DATE,
    order_reference VARCHAR(100),
    
    -- Engagement
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'published', -- 'published', 'pending', 'flagged', 'removed'
    flag_reason TEXT,
    moderated_by UUID REFERENCES users(user_id),
    moderated_at TIMESTAMP,
    
    -- Business Response
    has_business_response BOOLEAN DEFAULT FALSE,
    
    -- Metadata (for fraud detection)
    source VARCHAR(20) DEFAULT 'website', -- 'website', 'invitation', 'widget', 'api'
    device_type VARCHAR(20),
    ip_address_hash VARCHAR(64), -- Hashed for privacy
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    
    -- One review per user per business
    UNIQUE(business_id, user_id)
);

-- Critical indexes for query performance
CREATE INDEX idx_reviews_business_created ON reviews(business_id, created_at DESC);
CREATE INDEX idx_reviews_user_created ON reviews(user_id, created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
CREATE INDEX idx_reviews_helpful ON reviews(helpful_count DESC);
CREATE INDEX idx_reviews_business_rating_created ON reviews(business_id, rating, created_at DESC);
```

#### 4. Review Images Table
```sql
CREATE TABLE review_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order SMALLINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);
```

#### 5. Business Responses Table
```sql
CREATE TABLE business_responses (
    response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID UNIQUE NOT NULL REFERENCES reviews(review_id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    responder_id UUID NOT NULL REFERENCES users(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_business_responses_business ON business_responses(business_id, created_at DESC);
CREATE INDEX idx_business_responses_review ON business_responses(review_id);
```

#### 6. Categories Table
```sql
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    description TEXT,
    parent_category_id INTEGER REFERENCES categories(category_id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    business_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
```

#### 7. Review Invitations Table
```sql
CREATE TABLE review_invitations (
    invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(business_id) ON DELETE CASCADE,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(100),
    order_reference VARCHAR(100),
    invitation_token VARCHAR(64) UNIQUE NOT NULL,
    
    status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'opened', 'completed', 'expired'
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    review_id UUID REFERENCES reviews(review_id),
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP
);

CREATE INDEX idx_invitations_business ON review_invitations(business_id, status);
CREATE INDEX idx_invitations_token ON review_invitations(invitation_token);
CREATE INDEX idx_invitations_status ON review_invitations(status, expires_at);
```

#### 8. Notifications Table
```sql
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- 'new_review', 'review_response', 'helpful_vote'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    related_entity_type VARCHAR(20), -- 'review', 'business', 'user'
    related_entity_id UUID,
    action_url TEXT,
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### 9. Reports Table
```sql
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(20) NOT NULL, -- 'review', 'business', 'user'
    target_id UUID NOT NULL,
    reported_by UUID NOT NULL REFERENCES users(user_id),
    
    reason VARCHAR(50) NOT NULL, -- 'spam', 'fake', 'inappropriate', 'offensive', 'other'
    description TEXT,
    
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewing', 'resolved', 'dismissed'
    priority VARCHAR(10) DEFAULT 'normal', -- 'low', 'normal', 'high', 'critical'
    
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    resolution VARCHAR(50), -- 'removed', 'no_action', 'warned', 'suspended'
    resolution_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status, priority);
CREATE INDEX idx_reports_type_target ON reports(report_type, target_id);
CREATE INDEX idx_reports_created ON reports(created_at DESC);
```

#### 10. Fraud Signals Table
```sql
CREATE TABLE fraud_signals (
    signal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    signal_type VARCHAR(50) NOT NULL, -- 'duplicate_ip', 'burst_reviews', 'similar_text'
    
    review_id UUID REFERENCES reviews(review_id),
    user_id UUID REFERENCES users(user_id),
    business_id UUID REFERENCES businesses(business_id),
    
    severity VARCHAR(10) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    confidence_score DECIMAL(5,2), -- 0.00 to 100.00
    details JSONB,
    
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_by UUID REFERENCES users(user_id),
    resolved_at TIMESTAMP,
    resolution_action VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fraud_signals_status ON fraud_signals(is_resolved, severity, created_at DESC);
CREATE INDEX idx_fraud_signals_review ON fraud_signals(review_id);
CREATE INDEX idx_fraud_signals_user ON fraud_signals(user_id);
```

---

## Complete architecture continues in the database schema files...

**See:**
- `/database/schemas/` - Individual table schemas
- `/database/migrations/` - Migration files
- `/docs/ARCHITECTURE.md` - Full system architecture
- `/docs/DATABASE_DESIGN.md` - Complete database design
- `/docs/REDIS_DESIGN.md` - Cache strategy
- `/docs/ELASTICSEARCH_DESIGN.md` - Search implementation
