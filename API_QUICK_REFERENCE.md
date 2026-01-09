# 📋 API Quick Reference Card

## 🔗 Base URL
```
http://localhost:4000
```

---

## 🔐 Authentication Endpoints

### Register
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

### Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}
```

### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer <accessToken>
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <accessToken>
```

---

## 📝 Review Endpoints

### Create Review
```bash
POST /api/reviews
Authorization: Bearer <accessToken>
{
  "company_id": "uuid",
  "rating": 5,
  "title": "Excellent Service",
  "content": "I had an amazing experience...",
  "pros": "Great support",
  "cons": "Slightly expensive"
}
```

### Get Review by ID
```bash
GET /api/reviews/:reviewId
```

### Update Review
```bash
PUT /api/reviews/:reviewId
Authorization: Bearer <accessToken>
{
  "rating": 4,
  "title": "Updated title",
  "content": "Updated content..."
}
```

### Delete Review
```bash
DELETE /api/reviews/:reviewId
Authorization: Bearer <accessToken>
```

### Get User Reviews
```bash
GET /api/reviews/user/:userId?limit=10&offset=0
```

### Get Company Reviews
```bash
GET /api/reviews/company/:companyId?limit=10&sortBy=recent
# sortBy: recent | helpful | rating
```

### Vote on Review
```bash
POST /api/reviews/:reviewId/vote
Authorization: Bearer <accessToken>
{
  "isHelpful": true
}
```

### Get Statistics
```bash
GET /api/reviews/company/:companyId/statistics
```

---

## 📊 Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable message"
}
```

---

## 🔑 HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation) |
| 401 | Unauthorized (auth required) |
| 403 | Forbidden (no permission) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |

---

## 🛡️ Authentication Header

```
Authorization: Bearer <your_access_token_here>
```

---

## ⏱️ Token Expiry

- Access Token: **15 minutes**
- Refresh Token: **7 days**

---

## ✅ Validation Rules

### Password
- Min 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character

### Review
- Title: 10-200 chars
- Content: 50-5000 chars
- Rating: 1-5
- One review per company per user

---

## 🧪 Testing Tools

### Postman
Import: `ALOVAZE_API.postman_collection.json`

### cURL
See: `API_DOCUMENTATION.md`

### Documentation
See: `TESTING_GUIDE.md`

---

## 🚀 Quick Start

```bash
# 1. Start server
cd backend && npm run dev

# 2. Health check
curl http://localhost:4000/health

# 3. Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123!","full_name":"Test User"}'

# 4. Save token and use for protected routes
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| API_DOCUMENTATION.md | Complete reference |
| TESTING_GUIDE.md | Testing walkthrough |
| API_IMPLEMENTATION_COMPLETE.md | Features & details |
| ARCHITECTURE_DIAGRAM.md | System diagrams |

---

**Print this for quick reference! 📄**
