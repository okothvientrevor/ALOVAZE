# 🐳 Docker in ALOVAZE - Complete Explanation

## What is Docker and Why Are We Using It?

### The Problem Docker Solves

**Without Docker:**
- ❌ You'd need to manually install PostgreSQL on your computer
- ❌ You'd need to manually install Redis on your computer
- ❌ You'd need to manually install Elasticsearch on your computer
- ❌ Each team member might have different versions
- ❌ "It works on my machine" problems
- ❌ Complex setup instructions for new developers
- ❌ Difficult to manage multiple versions

**With Docker:**
- ✅ One command starts everything: `docker-compose up -d`
- ✅ Everyone has the exact same versions
- ✅ Isolated from your system (won't interfere with other projects)
- ✅ Easy to start, stop, and reset
- ✅ Production-like environment on your laptop
- ✅ Easy onboarding for new team members

---

## 🎯 What Docker Does in This Project

### Think of Docker Like This:

**Docker = Virtual Machines, but Lightweight**

Instead of installing databases directly on your computer, Docker creates isolated "containers" that run the databases. Each container is like a mini-computer that only runs one service.

```
Your Computer (macOS)
├─ Docker Desktop (the engine)
│  ├─ Container 1: PostgreSQL Database
│  ├─ Container 2: Redis Cache
│  └─ Container 3: Elasticsearch Search Engine
│
├─ Your Code (runs normally on your Mac)
│  ├─ backend/ (connects to containers)
│  └─ frontend/ (connects to backend)
```

---

## 📦 What We're Running in Docker

### Container 1: PostgreSQL Database
**Purpose**: Store all your main data (users, reviews, companies)

```yaml
postgres:
  image: postgres:15-alpine      # Official PostgreSQL v15
  ports: "5432:5432"              # Access at localhost:5432
  environment:
    POSTGRES_DB: alovaze_db       # Database name
    POSTGRES_USER: alovaze_user   # Username
    POSTGRES_PASSWORD: alovaze_password  # Password
```

**What this does:**
- Downloads PostgreSQL version 15 (lightweight Alpine Linux version)
- Creates a database called `alovaze_db`
- Makes it accessible at `localhost:5432`
- Data persists even when you stop the container (saved in a volume)

**How your backend connects:**
```typescript
// backend/src/config/database.ts
const pool = new Pool({
  host: 'localhost',        // Container is accessible here
  port: 5432,               // Port we exposed
  database: 'alovaze_db',   // Database we created
  user: 'alovaze_user',     // User we created
  password: 'alovaze_password'
});
```

### Container 2: Redis Cache
**Purpose**: Fast caching and session storage

```yaml
redis:
  image: redis:7-alpine           # Official Redis v7
  ports: "6379:6379"              # Access at localhost:6379
  command: redis-server --appendonly yes  # Enable data persistence
```

**What this does:**
- Downloads Redis version 7
- Makes it accessible at `localhost:6379`
- Enables persistence (saves data to disk)

**How your backend connects:**
```typescript
// backend/src/config/database.ts
const redisClient = createClient({
  url: 'redis://localhost:6379'  // Container is accessible here
});
```

### Container 3: Elasticsearch
**Purpose**: Powerful full-text search engine

```yaml
elasticsearch:
  image: elasticsearch:8.11.0     # Official Elasticsearch v8.11
  ports: 
    - "9200:9200"                 # HTTP API
    - "9300:9300"                 # Transport (internal)
  environment:
    - discovery.type=single-node  # Single server mode
    - xpack.security.enabled=false # Disable security for dev
```

**What this does:**
- Downloads Elasticsearch 8.11
- Makes it accessible at `localhost:9200`
- Configured for single-node development

**How your backend connects:**
```typescript
// backend/src/config/database.ts
const esClient = new Client({
  node: 'http://localhost:9200'  // Container is accessible here
});
```

---

## 🔄 How It All Works Together

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Your Development Setup                │
└─────────────────────────────────────────────────────────┘

┌──────────────┐
│  Your Mac    │
│              │
│  Frontend    │──┐
│  (React)     │  │
│  Port 3000   │  │
└──────────────┘  │
                  │  HTTP Requests
┌──────────────┐  │
│  Your Mac    │  │
│              │◄─┘
│  Backend     │─────┐
│  (Node.js)   │     │
│  Port 4000   │     │
└──────────────┘     │
                     │  Database Queries
┌──────────────────────────────────────┐
│         Docker Desktop               │
│  ┌────────────────────────────────┐  │
│  │  Container: PostgreSQL         │  │
│  │  Port: 5432                    │◄─┤
│  │  Data: User, Reviews, etc.     │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Container: Redis              │  │
│  │  Port: 6379                    │◄─┤
│  │  Data: Cache, Sessions         │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  Container: Elasticsearch      │  │
│  │  Port: 9200                    │◄─┤
│  │  Data: Search Indexes          │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## 🚀 Common Docker Commands You'll Use

### Starting Everything

```bash
# Start all containers in background (-d = detached mode)
docker-compose up -d

# Output:
# Creating alovaze-postgres ... done
# Creating alovaze-redis ... done
# Creating alovaze-elasticsearch ... done
```

### Checking Status

```bash
# See which containers are running
docker-compose ps

# Output:
# NAME                    STATUS       PORTS
# alovaze-postgres        Up 2 min     0.0.0.0:5432->5432/tcp
# alovaze-redis           Up 2 min     0.0.0.0:6379->6379/tcp
# alovaze-elasticsearch   Up 2 min     0.0.0.0:9200->9200/tcp
```

### Viewing Logs

```bash
# See logs from all containers
docker-compose logs

# See logs from specific container
docker-compose logs postgres
docker-compose logs redis
docker-compose logs elasticsearch

# Follow logs in real-time (-f = follow)
docker-compose logs -f postgres
```

### Stopping Everything

```bash
# Stop all containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data in volumes)
docker-compose down

# Stop, remove containers, AND delete all data (nuclear option)
docker-compose down -v
```

### Restarting a Service

```bash
# Restart just PostgreSQL
docker-compose restart postgres

# Restart everything
docker-compose restart
```

### Accessing Containers Directly

```bash
# Open PostgreSQL shell
docker-compose exec postgres psql -U alovaze_user -d alovaze_db

# Open Redis CLI
docker-compose exec redis redis-cli

# Open bash shell inside container
docker-compose exec postgres bash
```

---

## 🔍 Understanding docker-compose.yml

Let's break down the file section by section:

```yaml
version: '3.9'  # Docker Compose file format version
```

### Service Definition

```yaml
services:
  postgres:                    # Service name (can be anything)
    image: postgres:15-alpine  # Docker image to use
    container_name: alovaze-postgres  # Friendly name
    restart: unless-stopped    # Auto-restart if crashes
    
    environment:               # Environment variables
      POSTGRES_DB: alovaze_db
      POSTGRES_USER: alovaze_user
      POSTGRES_PASSWORD: alovaze_password
    
    ports:                     # Port mapping
      - "5432:5432"           # host:container
    
    volumes:                   # Data persistence
      - postgres_data:/var/lib/postgresql/data
    
    healthcheck:               # Container health monitoring
      test: ["CMD-SHELL", "pg_isready -U alovaze_user -d alovaze_db"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**What each part does:**

- **image**: Which Docker image to download and run
- **container_name**: Easy-to-remember name for the container
- **restart**: What to do if container crashes
- **environment**: Configuration passed to the container
- **ports**: `"host_port:container_port"` - maps container port to your Mac
- **volumes**: Where to store data permanently
- **healthcheck**: How to check if container is working properly

### Volumes (Data Persistence)

```yaml
volumes:
  postgres_data:        # Named volume for PostgreSQL
    driver: local       # Store on local disk
  redis_data:           # Named volume for Redis
    driver: local
  elasticsearch_data:   # Named volume for Elasticsearch
    driver: local
```

**What this means:**
- Even if you delete containers, data is saved in volumes
- Located in Docker's storage area (usually `/var/lib/docker/volumes/`)
- Survives `docker-compose down` but not `docker-compose down -v`

### Networks

```yaml
networks:
  default:
    name: alovaze-network  # All containers share this network
```

**What this means:**
- All containers can talk to each other by service name
- Isolated from other Docker projects on your machine

---

## 🎓 Docker Workflow for Development

### Daily Development Flow

```bash
# Morning: Start your workday
docker-compose up -d          # Start all services
cd backend
npm run dev                   # Start backend
# In another terminal:
cd frontend
npm run dev                   # Start frontend

# During development:
docker-compose logs -f postgres  # Check database logs if needed

# Evening: End your workday
# (Optional) docker-compose stop  # Stop containers to free resources
# Your backend/frontend stop automatically when you close terminals
```

### Weekly/As-Needed Tasks

```bash
# Reset database (if you mess up data)
docker-compose down -v        # Delete all data
docker-compose up -d          # Recreate containers
cd backend
npx db-migrate up             # Re-run migrations

# Update Docker images (when new versions available)
docker-compose pull           # Download latest images
docker-compose up -d          # Recreate with new images

# Clean up Docker resources
docker system prune -a        # Remove unused images/containers
```

---

## 🐛 Troubleshooting Docker Issues

### Container Won't Start

```bash
# Check logs for errors
docker-compose logs postgres

# Common issues:
# 1. Port already in use
lsof -ti:5432 | xargs kill -9  # Kill process using port 5432

# 2. Corrupted data
docker-compose down -v         # Delete volumes
docker-compose up -d           # Fresh start

# 3. Out of disk space
docker system df               # Check disk usage
docker system prune -a         # Clean up
```

### Can't Connect to Database

```bash
# Verify container is running
docker-compose ps

# Should show "Up" status, not "Exited"

# Test connection from terminal
psql -h localhost -p 5432 -U alovaze_user -d alovaze_db

# If fails, check backend .env matches docker-compose.yml
```

### Elasticsearch Uses Too Much Memory

```yaml
# In docker-compose.yml, reduce memory:
environment:
  - "ES_JAVA_OPTS=-Xms256m -Xmx256m"  # Reduce from 512m to 256m
```

### Redis Data Not Persisting

```bash
# Check if appendonly mode is enabled
docker-compose exec redis redis-cli CONFIG GET appendonly
# Should return: "appendonly" "yes"

# If not, add to docker-compose.yml:
command: redis-server --appendonly yes
```

---

## 🎯 Why This Setup is Production-Like

### Development (What You're Doing)
```
Docker on Your Mac
├─ PostgreSQL in container
├─ Redis in container
└─ Elasticsearch in container
```

### Production (Where You'll Deploy)
```
Cloud Provider (AWS/DigitalOcean)
├─ PostgreSQL (RDS/Managed Database)
├─ Redis (ElastiCache/Managed Redis)
└─ Elasticsearch (Managed ES Cluster)
```

**Key Point**: Your backend code connects the same way in both environments! Just change connection strings in `.env`

---

## 📊 Docker vs. Traditional Installation

| Aspect | Traditional Install | Docker |
|--------|-------------------|---------|
| **Installation** | 30 min per service | 1 command |
| **Version Control** | Manual tracking | Defined in file |
| **Cleanup** | Complex uninstall | `docker-compose down` |
| **Multiple Projects** | Version conflicts | Isolated containers |
| **Team Consistency** | "Works on my machine" | Identical for everyone |
| **Production Similarity** | Different setup | Very similar |
| **Reset to Fresh State** | Reinstall everything | Delete volumes |

---

## 🚀 Advanced Docker Tips

### Running Multiple Versions

```bash
# This project
cd /Users/vientrevor/development/ALOVAZE
docker-compose up -d  # Uses ports 5432, 6379, 9200

# Another project
cd /Users/vientrevor/development/OTHER_PROJECT
# Change ports in docker-compose.yml to 5433, 6380, 9201
docker-compose up -d  # No conflicts!
```

### Docker GUI Tools

If you prefer visual tools:
- **Docker Desktop Dashboard**: Built-in GUI for managing containers
- **TablePlus**: Database GUI that works with Docker PostgreSQL
- **RedisInsight**: GUI for Redis
- **Elasticsearch Head**: GUI for Elasticsearch

### Performance Optimization

```yaml
# Limit container resources
postgres:
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

---

## ✅ Final Checklist: Understanding Docker

After reading this, you should understand:

- [ ] Docker runs databases in isolated containers
- [ ] `docker-compose up -d` starts everything
- [ ] `docker-compose ps` shows status
- [ ] `docker-compose logs` shows what's happening
- [ ] Containers are accessible at `localhost:PORT`
- [ ] Your backend connects to Docker containers
- [ ] Data persists in Docker volumes
- [ ] `docker-compose down -v` resets everything
- [ ] Same setup works for all team members
- [ ] Similar to production architecture

---

## 🎉 Summary

**Docker in this project is like having a magic box that:**
1. **Runs** PostgreSQL, Redis, and Elasticsearch
2. **Isolates** them from your computer
3. **Makes** them accessible at localhost
4. **Persists** your data even when stopped
5. **Resets** easily when you need a fresh start
6. **Ensures** everyone has the same environment

**You don't need to be a Docker expert!** Just know these commands:
- `docker-compose up -d` - Start
- `docker-compose ps` - Check status
- `docker-compose logs` - See logs
- `docker-compose down` - Stop

Everything else is automatic! 🚀

---

**Next Steps:**
1. Read `QUICK_START.md` and run `docker-compose up -d`
2. Test connections as shown in the guide
3. Start building your backend!

**Questions?** Check the Troubleshooting section above or Docker Desktop logs.
