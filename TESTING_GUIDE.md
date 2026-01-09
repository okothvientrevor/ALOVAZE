# 🧪 Quick Start Testing Guide

## Prerequisites
✅ Docker containers running (PostgreSQL, Redis, Elasticsearch)  
✅ Database migrations completed  
✅ Backend server running

---

## 🚀 Step 1: Start the Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ PostgreSQL: Connected
✅ Redis: Connected  
✅ Elasticsearch: Connected
🚀 Server running on http://localhost:4000
```

---

## 🧪 Step 2: Test Health Check

```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-07T...",
  "uptime": 5.123,
  "environment": "development"
}
```

---

## 👤 Step 3: Register a User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe"
  }'
```

**Save the `accessToken` from the response!**

Expected response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🔑 Step 4: Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 📝 Step 5: Create a Test Company (Manual SQL)

Before testing reviews, we need a company. Run this in your PostgreSQL:

```bash
# Connect to database
docker exec -it alovaze-postgres psql -U alovaze_user -d alovaze_db

# Insert test company
INSERT INTO companies (company_name, industry, website_url, description)
VALUES ('Tech Corp', 'Technology', 'https://techcorp.com', 'Leading tech company')
RETURNING id;

# Copy the returned UUID
```

Or use a SQL client and save the company ID.

---

## ⭐ Step 6: Create a Review

```bash
# Replace YOUR_TOKEN with your accessToken
# Replace COMPANY_UUID with the company ID from step 5

curl -X POST http://localhost:4000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "company_id": "COMPANY_UUID",
    "rating": 5,
    "title": "Excellent Service and Professional Team",
    "content": "I had an amazing experience with this company. The customer service was outstanding, very professional and responsive. They went above and beyond to meet my expectations and delivered quality results.",
    "pros": "Great customer service, high quality products, fast delivery",
    "cons": "Slightly expensive compared to competitors"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "review-uuid",
    "rating": 5,
    "title": "Excellent Service...",
    "status": "pending",
    "created_at": "2024-01-07T..."
  }
}
```

---

## 📖 Step 7: Get Reviews

### Get review by ID
```bash
curl http://localhost:4000/api/reviews/REVIEW_UUID
```

### Get company reviews
```bash
curl "http://localhost:4000/api/reviews/company/COMPANY_UUID?limit=10&sortBy=recent"
```

### Get user reviews
```bash
curl "http://localhost:4000/api/reviews/user/USER_UUID?limit=10"
```

---

## 👍 Step 8: Vote on Review

```bash
curl -X POST http://localhost:4000/api/reviews/REVIEW_UUID/vote \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "isHelpful": true
  }'
```

---

## 📊 Step 9: Get Statistics

```bash
curl http://localhost:4000/api/reviews/company/COMPANY_UUID/statistics
```

Expected response:
```json
{
  "success": true,
  "data": {
    "total": 1,
    "averageRating": 5.0,
    "ratingDistribution": {
      "5": 1,
      "4": 0,
      "3": 0,
      "2": 0,
      "1": 0
    }
  }
}
```

---

## 🎯 Alternative: Use Postman

### Import Collection
1. Open Postman
2. Click **Import**
3. Select `ALOVAZE_API.postman_collection.json`
4. Collection will auto-save tokens after login!

### Test Flow
1. **Register User** - Auto-saves token
2. **Create Review** - Uses saved token
3. **Get Reviews** - Public endpoint
4. **Vote on Review** - Uses saved token

---

## ✅ Expected Test Results

### ✓ Authentication Works
- [x] Can register new users
- [x] Can login existing users
- [x] Tokens are returned
- [x] Can access protected routes with token
- [x] Cannot access without token (401 error)

### ✓ Reviews Work
- [x] Can create reviews (authenticated)
- [x] Can read reviews (public)
- [x] Can update own reviews
- [x] Can delete own reviews
- [x] Can vote on reviews
- [x] Can see statistics

### ✓ Validation Works
- [x] Weak passwords rejected
- [x] Short content rejected
- [x] Invalid ratings rejected
- [x] Duplicate reviews blocked

---

## 🐛 Common Issues

### Issue: "Email already registered"
**Solution:** Use a different email or login instead

### Issue: "Invalid credentials"
**Solution:** Check email and password are correct

### Issue: "Unauthorized"
**Solution:** Add Authorization header with Bearer token

### Issue: "Validation error"
**Solution:** Check field requirements in API_DOCUMENTATION.md

### Issue: "Review not found"
**Solution:** Verify the review UUID is correct

### Issue: "Cannot review same company twice"
**Solution:** Expected behavior - one review per user per company

---

## 📝 Test Checklist

- [ ] Server starts without errors
- [ ] Health check returns 200
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Receive access and refresh tokens
- [ ] Can access protected route with token
- [ ] Cannot access protected route without token
- [ ] Can create a company (manual SQL)
- [ ] Can create a review
- [ ] Can read reviews
- [ ] Can update own review
- [ ] Can delete own review
- [ ] Can vote on review
- [ ] Can get statistics
- [ ] Password validation works
- [ ] Review validation works

---

## 🎉 Success Criteria

If all the above works, your API is **fully functional** and ready for:
- Frontend integration
- Production deployment
- Additional feature development

---

## 📚 Next Steps

1. ✅ **Test all endpoints** (use this guide)
2. 📖 **Read API_DOCUMENTATION.md** for complete details
3. 🎨 **Build frontend** to consume these APIs
4. 🚀 **Deploy to production** when ready

---

**Happy Testing! 🚀**
