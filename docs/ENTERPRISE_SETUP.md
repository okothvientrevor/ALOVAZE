# 🚀 Enterprise Setup Guide - Production Architecture

## Infrastructure Requirements

### Required Services
1. **PostgreSQL 14+** - Primary database
2. **Redis 6+** - Cache & job queue
3. **Elasticsearch 8+** or Algolia - Search engine
4. **Node.js 18+** - Application runtime
5. **Docker & Docker Compose** - Container orchestration (recommended)

### Optional Services
6. **AWS S3** or Firebase Storage - File storage
7. **Firebase Auth** or Auth0 - Authentication
8. **DataDog** or New Relic - Monitoring
9. **Sentry** - Error tracking

---

## Quick Start with Docker Compose

### Step 1: Create Docker Compose File

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    container_name: alovaze-postgres
    environment:
      POSTGRES_DB: alovaze
      POSTGRES_USER: alovaze_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U alovaze_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache & Queue
  redis:
    image: redis:6-alpine
    container_name: alovaze-redis
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes --requirepass your_redis_password
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Elasticsearch
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: alovaze-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:9200/_cluster/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5

  # PgAdmin (Database Management UI - Optional)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: alovaze-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@alovaze.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

  # Redis Commander (Redis UI - Optional)
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: alovaze-redis-commander
    environment:
      - REDIS_HOSTS=local:redis:6379:0:your_redis_password
    ports:
      - "8081:8081"
    depends_on:
      - redis

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

### Step 2: Start Infrastructure

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: deletes data)
docker-compose down -v
```

### Step 3: Verify Services

```bash
# Test PostgreSQL
docker exec -it alovaze-postgres psql -U alovaze_user -d alovaze -c "SELECT version();"

# Test Redis
docker exec -it alovaze-redis redis-cli -a your_redis_password ping

# Test Elasticsearch
curl http://localhost:9200/_cluster/health?pretty

# Access UIs
# PgAdmin: http://localhost:5050
# Redis Commander: http://localhost:8081
# Elasticsearch: http://localhost:9200
```

---

## Manual Installation (Without Docker)

### 1. Install PostgreSQL

#### macOS (Homebrew)
```bash
brew install postgresql@14
brew services start postgresql@14

# Create database and user
createdb alovaze
psql alovaze -c "CREATE USER alovaze_user WITH PASSWORD 'your_password';"
psql alovaze -c "GRANT ALL PRIVILEGES ON DATABASE alovaze TO alovaze_user;"
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql-14 postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres createdb alovaze
sudo -u postgres psql -c "CREATE USER alovaze_user WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE alovaze TO alovaze_user;"
```

### 2. Install Redis

#### macOS
```bash
brew install redis
brew services start redis

# Set password
redis-cli CONFIG SET requirepass "your_redis_password"
```

#### Ubuntu/Debian
```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis

# Edit /etc/redis/redis.conf
# Set: requirepass your_redis_password
sudo systemctl restart redis
```

### 3. Install Elasticsearch

#### macOS
```bash
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full

# Start service
brew services start elasticsearch-full
```

#### Ubuntu/Debian
```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo gpg --dearmor -o /usr/share/keyrings/elasticsearch-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/elasticsearch-keyring.gpg] https://artifacts.elastic.co/packages/8.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update
sudo apt install elasticsearch

# Configure for single-node
sudo nano /etc/elasticsearch/elasticsearch.yml
# Add: discovery.type: single-node

sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
```

### 4. Verify Installations

```bash
# PostgreSQL
psql -U alovaze_user -d alovaze -c "SELECT version();"

# Redis
redis-cli -a your_redis_password ping

# Elasticsearch
curl http://localhost:9200
```

---

## Database Setup

### Step 1: Run Migrations

```bash
cd /Users/vientrevor/development/ALOVAZE

# Install migration tool
npm install -g node-pg-migrate

# Create migrations directory
mkdir -p database/migrations

# Run migrations (after we create them)
npm run migrate:up

# Or manually
psql -U alovaze_user -d alovaze -f database/migrations/001_initial_schema.sql
```

### Step 2: Seed Initial Data

```bash
# Run seed script
npm run seed

# Or manually
psql -U alovaze_user -d alovaze -f database/seeds/categories.sql
```

---

## Environment Configuration

### Backend .env
```env
# Server
NODE_ENV=development
PORT=5000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alovaze
DB_USER=alovaze_user
DB_PASSWORD=your_secure_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_INDEX_PREFIX=alovaze

# OR Algolia (alternative to Elasticsearch)
# ALGOLIA_APP_ID=your_app_id
# ALGOLIA_API_KEY=your_api_key
# ALGOLIA_SEARCH_KEY=your_search_key

# Authentication (Firebase or Auth0)
# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# OR Auth0
# AUTH0_DOMAIN=your_domain.auth0.com
# AUTH0_CLIENT_ID=your_client_id
# AUTH0_CLIENT_SECRET=your_client_secret

# AWS S3 (for file storage)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=alovaze-uploads

# OR Firebase Storage
# FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com

# JWT
JWT_SECRET=your_super_secret_key_min_64_characters_for_production_security
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Service (SendGrid, Mailgun, or SMTP)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_api_key
EMAIL_FROM=noreply@alovaze.com
EMAIL_FROM_NAME=ALOVAZE

# OR SMTP
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your_email@gmail.com
# SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_key

# Feature Flags
ENABLE_REAL_TIME=true
ENABLE_ELASTICSEARCH=true
ENABLE_FRAUD_DETECTION=true
```

### Frontend .env
```env
# API
REACT_APP_API_URL=http://localhost:5000/api/v1

# Authentication (Firebase or Auth0)
# Firebase
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# OR Auth0
# REACT_APP_AUTH0_DOMAIN=your_domain.auth0.com
# REACT_APP_AUTH0_CLIENT_ID=your_client_id

# App Config
REACT_APP_NAME=ALOVAZE
REACT_APP_ENV=development

# Feature Flags
REACT_APP_ENABLE_REAL_TIME=true
REACT_APP_ENABLE_ANALYTICS=true

# Monitoring
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

---

## Next Steps

1. ✅ Infrastructure running (PostgreSQL, Redis, Elasticsearch)
2. ⏭️ Create database migrations
3. ⏭️ Set up backend TypeScript project
4. ⏭️ Set up frontend React TypeScript project
5. ⏭️ Implement authentication
6. ⏭️ Build API endpoints
7. ⏭️ Integrate search
8. ⏭️ Add background jobs

**Continue to:** `docs/DATABASE_MIGRATIONS.md`
