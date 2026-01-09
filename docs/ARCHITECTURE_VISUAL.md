# 🏗️ ALOVAZE Architecture - Visual Guide

## 🎯 The Big Picture: How Everything Fits Together

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                               │
│                     (Chrome, Safari, Firefox)                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + TypeScript)                     │
│                        Runs on Port 3000                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  Login Page  │  │ Company Page │  │  Dashboard   │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ API Calls (REST/GraphQL)
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                       │
│                        Runs on Port 4000                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │ Auth Service │  │Review Service│  │Search Service│             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
            ↓                   ↓                    ↓
    ┌───────────────┐   ┌──────────────┐   ┌──────────────┐
    │   PostgreSQL  │   │    Redis     │   │Elasticsearch │
    │  (Port 5432)  │   │ (Port 6379)  │   │ (Port 9200)  │
    │  Main Data    │   │    Cache     │   │    Search    │
    └───────────────┘   └──────────────┘   └──────────────┘
           ↓                    ↓                    ↓
    ┌──────────────────────────────────────────────────────┐
    │          DOCKER CONTAINERS (Isolated)                │
    └──────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow: What Happens When a User Writes a Review

### Step-by-Step Journey of a Review

```
1. USER TYPES REVIEW
   │
   │ React Form Component
   │
   ↓

2. FRONTEND VALIDATES
   │
   │ Check: rating (1-5), title, content
   │
   ↓

3. SEND TO BACKEND
   │
   │ POST /api/reviews
   │ Headers: { Authorization: "Bearer JWT_TOKEN" }
   │ Body: { companyId, rating, title, content }
   │
   ↓

4. BACKEND RECEIVES
   │
   │ Express Route → Controller
   │
   ↓

5. AUTHENTICATE USER
   │
   │ JWT Middleware verifies token
   │ Extracts userId from token
   │
   ↓

6. SAVE TO POSTGRESQL
   │
   │ BEGIN TRANSACTION
   │ ├─ INSERT INTO reviews (...)
   │ ├─ UPDATE companies SET total_reviews = total_reviews + 1
   │ ├─ UPDATE companies SET avg_rating = (SELECT AVG(rating)...)
   │ COMMIT TRANSACTION
   │
   ↓

7. CACHE IN REDIS
   │
   │ INVALIDATE cache key: "company:{id}:reviews"
   │ SET new cached data with 5 min TTL
   │
   ↓

8. INDEX IN ELASTICSEARCH
   │
   │ POST /reviews/_doc/{reviewId}
   │ { rating, title, content, companyId, userId, createdAt }
   │
   ↓

9. REAL-TIME UPDATE (Optional)
   │
   │ Add to Firestore: /liveReviews/{reviewId}
   │ Triggers real-time listeners in frontend
   │
   ↓

10. BACKGROUND JOBS
    │
    │ Add to Bull Queue:
    │ ├─ Send email to company owner
    │ ├─ Run fraud detection check
    │ └─ Update trust score
    │
    ↓

11. RESPONSE TO FRONTEND
    │
    │ 201 Created
    │ { reviewId, status: "pending", message: "Review submitted" }
    │
    ↓

12. FRONTEND UPDATES UI
    │
    │ Show success toast
    │ Redirect to company page
    │ Review appears in list (real-time or after refresh)
```

---

## 🗄️ Database Architecture: Where Data Lives

### PostgreSQL: The Main Database

```
┌────────────────────────────────────────────────────────┐
│                    PostgreSQL                          │
│                                                        │
│  ┌──────────────┐      ┌──────────────┐             │
│  │    users     │──┐   │  companies   │             │
│  │              │  │   │              │             │
│  │ id           │  │   │ id           │             │
│  │ email        │  │   │ name         │             │
│  │ password_hash│  │   │ domain       │             │
│  │ display_name │  │   │ avg_rating   │             │
│  └──────────────┘  │   │ total_reviews│             │
│                    │   └──────────────┘             │
│                    │          ↑                       │
│                    │          │ foreign key          │
│                    │          │                       │
│  ┌─────────────────▼──────────┴─────┐               │
│  │          reviews                  │               │
│  │                                   │               │
│  │  id                               │               │
│  │  user_id ────→ users.id           │               │
│  │  company_id ──→ companies.id      │               │
│  │  rating (1-5)                     │               │
│  │  title                            │               │
│  │  content                          │               │
│  │  created_at                       │               │
│  │  helpful_count                    │               │
│  │  moderation_status                │               │
│  └───────────────────────────────────┘               │
│                                                        │
│  ┌──────────────┐      ┌──────────────┐             │
│  │   review     │      │ business     │             │
│  │  responses   │      │ analytics    │             │
│  └──────────────┘      └──────────────┘             │
└────────────────────────────────────────────────────────┘

WHY PostgreSQL?
✓ ACID transactions (data integrity)
✓ Complex joins and queries
✓ Proven reliability
✓ Great for relational data
```

### Redis: The Speed Layer

```
┌────────────────────────────────────────────────────────┐
│                       Redis                             │
│                  (In-Memory Cache)                      │
│                                                         │
│  Key-Value Store:                                       │
│                                                         │
│  company:123:reviews → [array of reviews]               │
│  │ TTL: 5 minutes                                       │
│  │                                                       │
│  company:123:stats → { avgRating, totalReviews }       │
│  │ TTL: 10 minutes                                      │
│  │                                                       │
│  session:abc123 → { userId, role, expiresAt }          │
│  │ TTL: 24 hours                                        │
│  │                                                       │
│  rate_limit:user:456 → 5                               │
│  │ TTL: 1 hour (max 10 reviews per hour)               │
│                                                         │
│  Queue: email_queue                                     │
│  ├─ Job 1: Send welcome email                          │
│  ├─ Job 2: Review notification                         │
│  └─ Job 3: Weekly digest                               │
└────────────────────────────────────────────────────────┘

WHY Redis?
✓ Lightning fast (in-memory)
✓ Perfect for caching
✓ Great for sessions
✓ Built-in TTL (auto-expiry)
✓ Pub/Sub for real-time
```

### Elasticsearch: The Search Engine

```
┌────────────────────────────────────────────────────────┐
│                   Elasticsearch                         │
│                  (Search & Analytics)                   │
│                                                         │
│  Index: reviews                                         │
│  ├─ Document 1:                                         │
│  │  {                                                   │
│  │    reviewId: "abc123",                              │
│  │    companyId: "xyz789",                             │
│  │    rating: 5,                                        │
│  │    title: "Amazing service!",                       │
│  │    content: "I absolutely loved...",                │
│  │    createdAt: "2026-01-07",                         │
│  │    isVerifiedPurchase: true                         │
│  │  }                                                   │
│  │                                                      │
│  ├─ Document 2: { ... }                                │
│  └─ Document 3: { ... }                                │
│                                                         │
│  Index: companies                                       │
│  ├─ Document 1:                                         │
│  │  {                                                   │
│  │    companyId: "xyz789",                             │
│  │    name: "Acme Corp",                               │
│  │    description: "Leading tech company...",          │
│  │    avgRating: 4.5,                                  │
│  │    totalReviews: 1250                               │
│  │  }                                                   │
│  └─ ...                                                 │
└────────────────────────────────────────────────────────┘

WHY Elasticsearch?
✓ Full-text search ("amazing service")
✓ Fuzzy matching (typo tolerance)
✓ Faceted filtering (rating, date)
✓ Autocomplete
✓ Analytics aggregations
```

### Firestore: The Real-Time Layer

```
┌────────────────────────────────────────────────────────┐
│                     Firestore                           │
│                 (Real-Time Database)                    │
│                                                         │
│  Collection: notifications/{userId}/items               │
│  ├─ {                                                   │
│  │    type: "new_review",                              │
│  │    title: "New 5-star review!",                     │
│  │    read: false,                                      │
│  │    createdAt: Timestamp,                            │
│  │    link: "/company/xyz/review/abc"                  │
│  │  }  ← Frontend listens to this in real-time!       │
│  └─ ...                                                 │
│                                                         │
│  Collection: liveReviews (TTL: 24 hours)               │
│  ├─ Last 100 reviews for real-time feed                │
│  └─ Auto-deleted after 24 hours                        │
└────────────────────────────────────────────────────────┘

WHY Firestore?
✓ Real-time listeners (no polling)
✓ Offline support
✓ Automatic synchronization
✓ No WebSocket management needed
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                   USER REGISTRATION                      │
└─────────────────────────────────────────────────────────┘

1. User fills form:
   { email: "user@example.com", password: "secret123" }
        ↓
2. Frontend validates:
   ✓ Email format
   ✓ Password length (8+ chars)
        ↓
3. POST /api/auth/register
        ↓
4. Backend:
   ├─ Check if email exists
   ├─ Hash password (bcrypt, 12 rounds)
   ├─ INSERT INTO users (email, password_hash, ...)
   ├─ Generate JWT token
   │  { userId, email, role, exp: 7 days }
   └─ Sign with JWT_SECRET
        ↓
5. Response:
   { user: {...}, token: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." }
        ↓
6. Frontend:
   ├─ Save token to localStorage
   ├─ Set Authorization header for future requests
   └─ Redirect to dashboard

┌─────────────────────────────────────────────────────────┐
│                     AUTHENTICATED REQUEST                │
└─────────────────────────────────────────────────────────┘

Every API request:
   Headers: { Authorization: "Bearer eyJhbGciOiJ..." }
        ↓
   Middleware checks:
   ├─ Extract token from header
   ├─ Verify signature with JWT_SECRET
   ├─ Check expiration
   ├─ Extract userId from payload
   └─ Attach to req.user
        ↓
   Controller has access to:
   req.user = { userId, email, role }
```

---

## 📊 Caching Strategy: When to Use What

```
┌──────────────────────────────────────────────────────────┐
│                  CACHING DECISION TREE                    │
└──────────────────────────────────────────────────────────┘

Request Arrives
     │
     ├─ Is it static data (categories, config)?
     │       └─ Cache in Redis for 1 hour
     │
     ├─ Is it user-specific (profile, notifications)?
     │       └─ Cache in Redis for 10 minutes
     │
     ├─ Is it frequently accessed (popular companies)?
     │       └─ Cache in Redis for 5 minutes
     │
     ├─ Is it search results?
     │       └─ Cache in Redis for 2 minutes
     │
     ├─ Is it real-time (notifications)?
     │       └─ Use Firestore (no cache)
     │
     └─ Is it analytics (aggregations)?
             └─ Cache in Redis for 1 hour


CACHE KEY PATTERN:
━━━━━━━━━━━━━━━━━
company:123:reviews:page:1    → Review list
company:123:stats             → Company statistics
user:456:profile              → User profile
search:query:coffee:page:1    → Search results
category:tech:companies       → Category businesses


CACHE INVALIDATION:
━━━━━━━━━━━━━━━━━━━
When review created:
  └─ Delete: company:{id}:reviews:*
  └─ Delete: company:{id}:stats
  
When company updated:
  └─ Delete: company:{id}:*
  
When user profile updated:
  └─ Delete: user:{id}:profile
```

---

## 🔄 Background Jobs Flow

```
┌──────────────────────────────────────────────────────────┐
│                   BULL JOB QUEUES                         │
└──────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   REDIS         │
                    │  (Job Storage)  │
                    └─────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐     ┌─────▼──────┐    ┌─────▼──────┐
   │  Email   │     │ Moderation │    │ Analytics  │
   │  Queue   │     │   Queue    │    │   Queue    │
   └──────────┘     └────────────┘    └────────────┘
        │                  │                  │
   ┌────▼─────────┐   ┌───▼─────────┐   ┌───▼─────────┐
   │ Job Processor│   │Job Processor│   │Job Processor│
   │ (Worker 1)   │   │ (Worker 2)  │   │ (Worker 3)  │
   └──────────────┘   └─────────────┘   └─────────────┘


EXAMPLE: New Review Created
     │
     ├─ Add to Email Queue
     │  └─ Job: { to, subject, template, data }
     │  └─ Priority: High
     │  └─ Retry: 3 attempts
     │
     ├─ Add to Moderation Queue
     │  └─ Job: { reviewId }
     │  └─ Priority: Medium
     │  └─ Check for spam/abuse
     │
     └─ Add to Analytics Queue
        └─ Job: { companyId }
        └─ Priority: Low
        └─ Update trust score
```

---

## 🎯 Request Lifecycle: Complete Journey

```
USER SEARCHES FOR "coffee shops"
        ↓
┌───────────────────────────────────────────────────┐
│ 1. FRONTEND (React)                               │
│    User types in search box                       │
│    Debounced input (wait 300ms after typing)      │
│    Call: GET /api/search?q=coffee+shops           │
└───────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────┐
│ 2. BACKEND (Express)                              │
│    Route: /api/search                             │
│    Middleware: Rate limit check                   │
│    Controller: SearchController.search()          │
└───────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────┐
│ 3. CHECK REDIS CACHE                              │
│    Key: search:coffee+shops:page:1                │
│    Found? → Return cached results (fast!)         │
│    Not found? → Continue to Elasticsearch         │
└───────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────┐
│ 4. QUERY ELASTICSEARCH                            │
│    POST /companies/_search                        │
│    {                                              │
│      query: {                                     │
│        multi_match: {                             │
│          query: "coffee shops",                   │
│          fields: ["name^2", "description"]        │
│        }                                          │
│      }                                            │
│    }                                              │
│    Returns: [ {company1}, {company2}, ... ]      │
└───────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────┐
│ 5. ENRICH WITH POSTGRESQL DATA                    │
│    For each company from ES:                      │
│    SELECT * FROM companies WHERE id IN (...)      │
│    Get full company details, ratings, etc.        │
└───────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────┐
│ 6. CACHE IN REDIS                                 │
│    SET search:coffee+shops:page:1                 │
│    Value: [enriched results]                      │
│    TTL: 2 minutes                                 │
└───────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────┐
│ 7. RETURN TO FRONTEND                             │
│    Response: { companies: [...], total: 42 }     │
│    Status: 200 OK                                 │
└───────────────────────────────────────────────────┘
        ↓
┌───────────────────────────────────────────────────┐
│ 8. FRONTEND RENDERS                               │
│    Map over companies array                       │
│    Render CompanyCard for each                    │
│    Show pagination (total: 42, page: 1)           │
└───────────────────────────────────────────────────┘
```

---

## 🏗️ File Structure: Where Code Lives

```
ALOVAZE/
│
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  │  ├─ database.ts      → PostgreSQL, Redis, ES clients
│  │  │  └─ firebase.ts      → Firestore setup
│  │  │
│  │  ├─ controllers/
│  │  │  ├─ authController.ts     → Login, register, logout
│  │  │  ├─ reviewController.ts   → Review CRUD
│  │  │  ├─ companyController.ts  → Company CRUD
│  │  │  └─ searchController.ts   → Search logic
│  │  │
│  │  ├─ services/
│  │  │  ├─ authService.ts        → Business logic for auth
│  │  │  ├─ reviewService.ts      → Business logic for reviews
│  │  │  ├─ cacheService.ts       → Redis caching
│  │  │  └─ emailService.ts       → SendGrid integration
│  │  │
│  │  ├─ middleware/
│  │  │  ├─ auth.ts              → JWT verification
│  │  │  ├─ rateLimit.ts         → Rate limiting
│  │  │  └─ errorHandler.ts      → Global error handling
│  │  │
│  │  ├─ models/
│  │  │  └─ types.ts             → TypeScript interfaces
│  │  │
│  │  ├─ routes/
│  │  │  ├─ authRoutes.ts        → /api/auth/*
│  │  │  ├─ reviewRoutes.ts      → /api/reviews/*
│  │  │  └─ companyRoutes.ts     → /api/companies/*
│  │  │
│  │  ├─ jobs/
│  │  │  ├─ emailQueue.ts        → Email job processor
│  │  │  └─ moderationQueue.ts   → Review moderation
│  │  │
│  │  └─ server.ts               → Express app entry point
│  │
│  ├─ migrations/                → Database schema changes
│  ├─ .env                       → Environment variables
│  └─ package.json
│
├─ frontend/
│  └─ src/
│     ├─ components/
│     │  ├─ ReviewCard.tsx       → Display single review
│     │  ├─ StarRating.tsx       → Star rating UI
│     │  └─ CompanyCard.tsx      → Display company
│     │
│     ├─ pages/
│     │  ├─ HomePage.tsx         → Landing page
│     │  ├─ CompanyPage.tsx      → Company details
│     │  └─ LoginPage.tsx        → Authentication
│     │
│     ├─ services/
│     │  └─ api.ts               → Axios client
│     │
│     ├─ store/
│     │  └─ authStore.ts         → Zustand state
│     │
│     └─ App.tsx                 → Router setup
│
└─ docker-compose.yml            → Infrastructure definition
```

---

## 🎓 Key Concepts Summary

### 1. **Separation of Concerns**
- **Frontend**: What users see and interact with
- **Backend**: Business logic and data processing
- **Database**: Where data is stored permanently
- **Cache**: Where data is stored temporarily for speed
- **Search**: Where data is indexed for fast searching

### 2. **Data Flow Direction**
```
User → Frontend → Backend → Database → Backend → Frontend → User
                      ↓
                    Cache (optional shortcut)
```

### 3. **Why Multiple Databases?**
- **PostgreSQL**: Best for structured, relational data
- **Redis**: Best for temporary, fast-access data
- **Elasticsearch**: Best for search and text analysis
- **Firestore**: Best for real-time synchronization

Each database excels at different tasks!

### 4. **Scalability Built-In**
Every component can be scaled independently:
- Add more backend servers (load balancer)
- Add more PostgreSQL replicas (read scaling)
- Add more Redis nodes (cache cluster)
- Add more Elasticsearch nodes (search cluster)

---

## 🚀 What Makes This "Enterprise-Grade"?

✅ **Production-ready architecture** - Used by real companies  
✅ **Horizontal scaling** - Can handle millions of users  
✅ **Data integrity** - PostgreSQL ACID transactions  
✅ **Performance** - Multi-layer caching strategy  
✅ **Search quality** - Elasticsearch full-text search  
✅ **Real-time** - Firestore live updates  
✅ **Reliability** - Background jobs with retry logic  
✅ **Security** - JWT auth, rate limiting, input validation  
✅ **Monitoring** - Health checks, logging, error tracking  
✅ **Maintainability** - TypeScript, clean architecture  

---

**Next Steps:**
1. Review this diagram when confused about how things connect
2. Refer back when implementing features
3. Use as reference for explaining the system to others

**Questions?** Check specific guides:
- `docs/DOCKER_EXPLAINED.md` - Docker details
- `docs/ENTERPRISE_ARCHITECTURE.md` - Technical specs
- `IMPLEMENTATION_GUIDE.md` - Code examples
