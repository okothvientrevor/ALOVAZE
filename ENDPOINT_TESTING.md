# Endpoint Testing Guide

## ✅ Server Status
- **Server Running**: Yes (PID: 84691)
- **Port**: 4000
- **Base URL**: `http://localhost:4000`

## 📍 Correct Endpoint URLs

### Authentication Endpoints

#### 1. Register User
```bash
POST http://localhost:4000/api/auth/register
```

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "Test123!@#",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }'
```

#### 2. Login
```bash
POST http://localhost:4000/api/auth/login
```

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

#### 3. Get Profile (Requires Authentication)
```bash
GET http://localhost:4000/api/auth/profile
```

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**cURL Command:**
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 4. Refresh Token
```bash
POST http://localhost:4000/api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

#### 5. Logout (Requires Authentication)
```bash
POST http://localhost:4000/api/auth/logout
```

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Review Endpoints

#### 1. Create Review (Requires Authentication)
```bash
POST http://localhost:4000/api/reviews
```

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "companyId": "123e4567-e89b-12d3-a456-426614174000",
  "rating": 5,
  "title": "Great Company!",
  "content": "I had an excellent experience with this company.",
  "recommend": true
}
```

#### 2. Get Reviews
```bash
GET http://localhost:4000/api/reviews?companyId=123e4567-e89b-12d3-a456-426614174000&page=1&limit=10
```

#### 3. Get Single Review
```bash
GET http://localhost:4000/api/reviews/:reviewId
```

#### 4. Update Review (Requires Authentication)
```bash
PUT http://localhost:4000/api/reviews/:reviewId
```

#### 5. Delete Review (Requires Authentication)
```bash
DELETE http://localhost:4000/api/reviews/:reviewId
```

#### 6. Vote on Review (Requires Authentication)
```bash
POST http://localhost:4000/api/reviews/:reviewId/vote
```

**Request Body:**
```json
{
  "voteType": "helpful"
}
```

### Health Check Endpoints

#### 1. Server Health
```bash
GET http://localhost:4000/health
```

**cURL Command:**
```bash
curl http://localhost:4000/health
```

#### 2. API Health
```bash
GET http://localhost:4000/api/health
```

**cURL Command:**
```bash
curl http://localhost:4000/api/health
```

#### 3. Root Endpoint
```bash
GET http://localhost:4000/
```

**cURL Command:**
```bash
curl http://localhost:4000/
```

## 🐛 Common Issues

### 1. "Route not found" Error

**Problem**: Using wrong base URL
- ❌ Wrong: `http://localhost:4000/auth/register`
- ✅ Correct: `http://localhost:4000/api/auth/register`

**Solution**: Always prefix with `/api`

### 2. Connection Refused

**Problem**: Server not running

**Check:**
```bash
lsof -ti:4000
```

**Solution**: Start the server
```bash
cd backend
npm run dev
```

### 3. 401 Unauthorized

**Problem**: Missing or invalid token

**Solution**: 
1. Login to get access token
2. Add to Authorization header: `Bearer YOUR_TOKEN`

### 4. 400 Bad Request

**Problem**: Invalid request body or missing required fields

**Solution**: Check validation rules in `src/middleware/validation.middleware.ts`

## 🧪 Quick Test Sequence

1. **Check server is running:**
```bash
curl http://localhost:4000/health
```

2. **Test registration:**
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }'
```

3. **Test login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

4. **Save the access token from login response**

5. **Test authenticated endpoint:**
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📱 Using Postman

1. Import the collection: `ALOVAZE_API.postman_collection.json`
2. Set base URL variable: `{{baseUrl}}` = `http://localhost:4000`
3. After login, save the token to environment variable
4. Use `{{token}}` in Authorization headers

## 🔍 Debugging Tips

### View Server Logs
```bash
# If running with npm run dev
# Check the terminal where server is running
```

### Check Routes are Loaded
Look for this in server logs:
```
🚀 Server is running on port 4000
📍 http://localhost:4000
🔍 Testing database connections...
```

### Test Each Service
```bash
# PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/alovaze

# Redis
redis-cli ping

# Elasticsearch
curl http://localhost:9200
```

## 📊 Expected Responses

### Successful Registration (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 3600
    }
  }
}
```

### Successful Login (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "...",
      "expiresIn": 3600
    }
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Error description"
}
```

## 🎯 Summary

- **Base URL**: `http://localhost:4000`
- **API Prefix**: `/api`
- **Auth Endpoints**: `/api/auth/*`
- **Review Endpoints**: `/api/reviews/*`
- **Always use**: `http://localhost:4000/api/...`
