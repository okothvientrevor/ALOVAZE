# 🚀 API Endpoints Documentation

## 📋 Table of Contents
- [Authentication Endpoints](#authentication-endpoints)
- [Review Endpoints](#review-endpoints)
- [Response Formats](#response-formats)
- [Error Handling](#error-handling)
- [Testing with cURL](#testing-with-curl)

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "user"  // Optional: "user" (default) or "business_owner"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "email_verified": false,
      "is_verified_reviewer": false,
      "trust_score": 0,
      "total_reviews": 0,
      "created_at": "2024-01-07T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Validation error (weak password, missing fields)
- `409` - Email already registered
- `500` - Server error

---

### 2. Login User
**POST** `/api/auth/login`

Authenticate and login a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "trust_score": 85,
      "total_reviews": 12
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account banned or inactive
- `500` - Server error

---

### 3. Refresh Token
**POST** `/api/auth/refresh`

Refresh an expired access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token
- `403` - Account banned or inactive
- `500` - Server error

---

### 4. Get User Profile
**GET** `/api/auth/profile`

Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "profile_image_url": "https://...",
    "role": "user",
    "bio": "Tech enthusiast",
    "location": "New York, USA",
    "email_verified": true,
    "is_verified_reviewer": true,
    "total_reviews": 12,
    "helpful_votes_received": 45,
    "trust_score": 85,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401` - Unauthorized (missing or invalid token)
- `404` - User not found
- `500` - Server error

---

### 5. Logout User
**POST** `/api/auth/logout`

Logout the authenticated user (client-side token deletion).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 📝 Review Endpoints

### 1. Create Review
**POST** `/api/reviews`

Create a new review for a company.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "company_id": "uuid",
  "rating": 5,
  "title": "Excellent Service and Support",
  "content": "I had an amazing experience with this company. The customer service was outstanding, and the product quality exceeded my expectations. Highly recommended for anyone looking for reliable solutions.",
  "pros": "Great customer service, high quality products, fast delivery",
  "cons": "Slightly expensive, limited options",
  "experience_date": "2024-01-01"
}
```

**Validation Rules:**
- `rating`: 1-5 (required)
- `title`: 10-200 characters (required)
- `content`: 50-5000 characters (required)
- `pros`: max 1000 characters (optional)
- `cons`: max 1000 characters (optional)
- `experience_date`: must be in the past (optional)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "company_id": "uuid",
    "rating": 5,
    "title": "Excellent Service and Support",
    "content": "I had an amazing experience...",
    "pros": "Great customer service...",
    "cons": "Slightly expensive...",
    "status": "pending",
    "helpful_count": 0,
    "created_at": "2024-01-07T12:00:00.000Z",
    "user_name": "John Doe",
    "company_name": "Tech Corp"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Unauthorized
- `409` - User already reviewed this company
- `500` - Server error

---

### 2. Get Review by ID
**GET** `/api/reviews/:reviewId`

Get a specific review by its ID.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "company_id": "uuid",
    "rating": 5,
    "title": "Excellent Service",
    "content": "Great experience...",
    "helpful_count": 25,
    "status": "published",
    "created_at": "2024-01-07T12:00:00.000Z",
    "user_name": "John Doe",
    "user_image": "https://...",
    "is_verified_reviewer": true,
    "company_name": "Tech Corp",
    "company_logo": "https://..."
  }
}
```

**Error Responses:**
- `404` - Review not found
- `500` - Server error

---

### 3. Update Review
**PUT** `/api/reviews/:reviewId`

Update an existing review (owner only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body (all fields optional):**
```json
{
  "rating": 4,
  "title": "Updated Title",
  "content": "Updated content with at least 50 characters to meet requirements...",
  "pros": "Updated pros",
  "cons": "Updated cons"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "id": "uuid",
    "rating": 4,
    "title": "Updated Title",
    "edited": true,
    "updated_at": "2024-01-07T13:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Unauthorized
- `404` - Review not found or not owner
- `500` - Server error

---

### 4. Delete Review
**DELETE** `/api/reviews/:reviewId`

Delete a review (owner only).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Review not found or not owner
- `500` - Server error

---

### 5. Get Reviews by User
**GET** `/api/reviews/user/:userId`

Get all reviews created by a specific user.

**Query Parameters:**
- `limit` (optional): Number of reviews per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```
GET /api/reviews/user/uuid-123?limit=20&offset=0
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Great Company",
        "company_name": "Tech Corp",
        "company_logo": "https://...",
        "created_at": "2024-01-07T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 6. Get Reviews by Company
**GET** `/api/reviews/company/:companyId`

Get all reviews for a specific company.

**Query Parameters:**
- `limit` (optional): Number of reviews per page (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `sortBy` (optional): Sort order - `recent`, `helpful`, `rating` (default: recent)

**Example:**
```
GET /api/reviews/company/uuid-456?limit=20&offset=0&sortBy=helpful
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Excellent Service",
        "content": "Great experience...",
        "helpful_count": 45,
        "user_name": "John Doe",
        "user_image": "https://...",
        "is_verified_reviewer": true,
        "created_at": "2024-01-07T12:00:00.000Z"
      }
    ],
    "averageRating": 4.5,
    "pagination": {
      "total": 150,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

---

### 7. Vote on Review
**POST** `/api/reviews/:reviewId/vote`

Mark a review as helpful or not helpful.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "isHelpful": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Vote recorded successfully"
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

### 8. Get Company Review Statistics
**GET** `/api/reviews/company/:companyId/statistics`

Get statistical data about reviews for a company.

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "averageRating": 4.5,
    "ratingDistribution": {
      "5": 80,
      "4": 45,
      "3": 15,
      "2": 5,
      "1": 5
    }
  }
}
```

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": [ ... ]  // Optional: for validation errors
}
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

### Validation Errors
```json
{
  "success": false,
  "error": "Validation error",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

---

## 🧪 Testing with cURL

### Register User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create Review
```bash
curl -X POST http://localhost:4000/api/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "company_id": "COMPANY_UUID",
    "rating": 5,
    "title": "Excellent Service and Support Team",
    "content": "I had an amazing experience with this company. The customer service was outstanding and very responsive to all my needs.",
    "pros": "Great support, fast delivery",
    "cons": "Could be more affordable"
  }'
```

### Get Company Reviews
```bash
curl -X GET "http://localhost:4000/api/reviews/company/COMPANY_UUID?limit=10&sortBy=helpful"
```

---

## 🔒 Authentication Flow

1. **Register/Login** → Receive `accessToken` and `refreshToken`
2. **Store tokens** securely (e.g., httpOnly cookies, secure storage)
3. **Make requests** with `Authorization: Bearer <accessToken>` header
4. **Token expires** (15 minutes) → Use refresh token endpoint
5. **Refresh token** → Get new access token
6. **Logout** → Delete tokens from client storage

---

## 📝 Notes

- Access tokens expire after **15 minutes**
- Refresh tokens expire after **7 days**
- Passwords must meet security requirements
- Users can only review each company once
- Review content must be at least 50 characters
- All timestamps are in ISO 8601 format (UTC)

---

## 🚀 Next Steps

1. Test all endpoints with Postman or cURL
2. Integrate frontend authentication flow
3. Implement company management endpoints
4. Add admin moderation endpoints
5. Set up image upload for reviews
6. Configure email verification system

---

**Created:** January 2024  
**Version:** 1.0.0  
**API Base URL:** `http://localhost:4000/api`
