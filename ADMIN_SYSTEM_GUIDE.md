# 🛡️ ALOVAZE Admin System - Complete Guide

## Overview

The ALOVAZE platform includes a comprehensive admin system that allows administrators to:
- **Moderate** users, companies, and reviews
- **Manage** trending companies and featured content
- **Monitor** platform health and statistics
- **Control** recommendations and user experience
- **Track** all admin actions for compliance

---

## 📋 Admin Roles & Permissions

### Role Types

1. **Super Admin** (`is_super_admin: true`)
   - Full access to all features
   - Can manage other admins
   - Access to financial data
   - Can export sensitive data

2. **Admin** (`role: 'admin'`)
   - Customizable permissions
   - Specific access based on `admin_permissions` table

3. **Moderator** (`role: 'moderator'`)
   - Limited to content moderation
   - Cannot access financials or settings

### Granular Permissions

Each admin can have specific permissions:

```typescript
interface AdminPermissions {
  can_moderate_reviews: boolean;      // Approve/remove reviews
  can_moderate_users: boolean;        // Ban/verify users
  can_moderate_companies: boolean;    // Suspend/activate companies
  can_verify_companies: boolean;      // Grant verification badges
  can_feature_content: boolean;       // Feature reviews/companies
  can_manage_trending: boolean;       // Add/remove trending companies
  can_award_badges: boolean;          // Grant achievement badges
  can_view_analytics: boolean;        // Access dashboards/reports
  can_manage_admins: boolean;         // Create/edit other admins
  can_access_financials: boolean;     // View revenue/payments
  can_export_data: boolean;           // Export user/company data
  can_manage_settings: boolean;       // Platform configuration
}
```

---

## 🎯 Core Admin Features

### 1. Trending Companies Management

**Purpose:** Curate and display trending companies on the homepage

**Table:** `trending_companies`

**Key Features:**
- Set display position (ranking)
- Categorize by industry
- Schedule start/end dates
- Track who added/removed
- Show on homepage or category pages

**Usage Example:**
```sql
-- Add a trending company
INSERT INTO trending_companies (
  company_id,
  position,
  category,
  trending_reason,
  added_by_admin_id,
  show_on_homepage
) VALUES (
  'company-uuid',
  1,  -- Top position
  'tech',
  'Exceptional growth in Q4 2025',
  'admin-uuid',
  TRUE
);

-- Get all active trending companies
SELECT 
  tc.*,
  c.name,
  c.average_rating,
  c.total_reviews
FROM trending_companies tc
JOIN companies c ON tc.company_id = c.id
WHERE tc.is_active = TRUE
ORDER BY tc.position ASC;
```

### 2. Company Recommendations System

**Purpose:** Generate automated and manual company recommendations

**Table:** `company_recommendations`

**Recommendation Types:**
- `trending` - Currently trending
- `top_rated` - Highest rated (4.5+ stars)
- `new_popular` - New but gaining traction
- `category_best` - Best in specific industry
- `most_reviewed` - Most reviewed companies
- `rising_star` - Fastest growing
- `editor_choice` - Admin selected

**Algorithm:**
```sql
-- Calculate trending score for a company
SELECT calculate_trending_score('company-uuid');

-- Get top recommendations
SELECT 
  cr.*,
  c.name,
  c.average_rating,
  c.total_reviews
FROM company_recommendations cr
JOIN companies c ON cr.company_id = c.id
WHERE cr.is_active = TRUE
  AND cr.valid_from <= NOW()
  AND (cr.valid_until IS NULL OR cr.valid_until >= NOW())
ORDER BY cr.final_rank ASC
LIMIT 10;
```

### 3. Moderation Queue

**Purpose:** Centralized queue for all items requiring moderation

**Table:** `moderation_queue`

**Item Types:**
- `review` - Flagged reviews
- `company` - Suspicious companies
- `user` - Reported users
- `flag` - User-submitted flags

**Priority Levels:**
- `urgent` - Immediate attention (e.g., illegal content)
- `high` - Important (e.g., spam)
- `normal` - Regular moderation
- `low` - Minor issues

**Workflow:**
```sql
-- Add item to moderation queue
INSERT INTO moderation_queue (
  item_type,
  item_id,
  priority,
  reason,
  auto_flagged
) VALUES (
  'review',
  'review-uuid',
  'high',
  'Possible spam content detected by AI',
  TRUE
);

-- Assign to admin
UPDATE moderation_queue
SET 
  assigned_to_admin_id = 'admin-uuid',
  assigned_at = NOW(),
  status = 'in_review'
WHERE id = 'queue-item-uuid';

-- Resolve issue
UPDATE moderation_queue
SET 
  status = 'resolved',
  resolved_by_admin_id = 'admin-uuid',
  resolved_at = NOW(),
  resolution_notes = 'Review removed for violating guidelines',
  action_taken = 'review_removed'
WHERE id = 'queue-item-uuid';
```

### 4. Admin Actions Audit Log

**Purpose:** Track ALL admin actions for compliance and security

**Table:** `admin_actions`

**Tracked Actions:**
- User moderation (ban, unban, verify)
- Review moderation (remove, approve, flag)
- Company moderation (verify, suspend, feature)
- Trending management (add, remove)
- Badge awards
- Settings changes

**Example:**
```sql
-- Log an admin action
INSERT INTO admin_actions (
  admin_user_id,
  action_type,
  action_description,
  target_company_id,
  reason,
  metadata,
  ip_address,
  user_agent
) VALUES (
  'admin-uuid',
  'company_featured',
  'Featured company on homepage',
  'company-uuid',
  'Outstanding customer service and reviews',
  '{"previous_status": "normal", "new_status": "featured"}',
  '192.168.1.1',
  'Mozilla/5.0...'
);

-- Get admin activity report
SELECT 
  aa.*,
  u.full_name as admin_name,
  c.name as company_name
FROM admin_actions aa
LEFT JOIN users u ON aa.admin_user_id = u.id
LEFT JOIN companies c ON aa.target_company_id = c.id
WHERE aa.created_at >= NOW() - INTERVAL '30 days'
ORDER BY aa.created_at DESC;
```

### 5. Platform Statistics Dashboard

**Purpose:** Real-time metrics for platform health

**Table:** `platform_statistics`

**Metrics Tracked:**
- User growth (total, new, active, verified)
- Company metrics (total, new, verified, claimed)
- Review metrics (total, new, pending, flagged)
- Rating distribution (1-5 stars)
- Engagement (votes, flags, responses)
- Traffic (page views, unique visitors)

**Aggregation:**
```sql
-- Store daily statistics
INSERT INTO platform_statistics (
  stat_date,
  total_users,
  new_users,
  total_reviews,
  new_reviews,
  average_rating
) VALUES (
  CURRENT_DATE,
  (SELECT COUNT(*) FROM users),
  (SELECT COUNT(*) FROM users WHERE created_at::DATE = CURRENT_DATE),
  (SELECT COUNT(*) FROM reviews),
  (SELECT COUNT(*) FROM reviews WHERE created_at::DATE = CURRENT_DATE),
  (SELECT AVG(rating) FROM reviews)
);

-- Get statistics for date range
SELECT 
  stat_date,
  SUM(new_users) as total_new_users,
  SUM(new_reviews) as total_new_reviews,
  AVG(average_rating) as avg_rating
FROM platform_statistics
WHERE stat_date BETWEEN '2026-01-01' AND '2026-01-31'
GROUP BY stat_date
ORDER BY stat_date;
```

### 6. Featured Reviews

**Purpose:** Highlight exceptional reviews on homepage

**Table:** `featured_reviews`

**Features:**
- Position-based ordering
- Show on homepage and/or company page
- Track who featured and why
- Active/inactive status

### 7. System Alerts

**Purpose:** Critical notifications for admins

**Table:** `system_alerts`

**Alert Types:**
- `security` - Security issues
- `performance` - Performance problems
- `spam_detected` - Spam activity
- `unusual_activity` - Suspicious behavior
- `system_error` - Application errors
- `quota_exceeded` - Limits reached
- `payment_failed` - Payment issues

**Severity Levels:**
- `critical` - Immediate action required
- `error` - Important issue
- `warning` - Potential problem
- `info` - Informational

---

## 🔧 Admin API Endpoints (To Be Built)

### Authentication & Permissions

```
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/permissions
GET    /api/admin/me
```

### User Moderation

```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id/ban
PUT    /api/admin/users/:id/unban
PUT    /api/admin/users/:id/verify
DELETE /api/admin/users/:id
```

### Company Moderation

```
GET    /api/admin/companies
GET    /api/admin/companies/:id
PUT    /api/admin/companies/:id/verify
PUT    /api/admin/companies/:id/suspend
PUT    /api/admin/companies/:id/activate
PUT    /api/admin/companies/:id/feature
```

### Review Moderation

```
GET    /api/admin/reviews/flagged
GET    /api/admin/reviews/:id
PUT    /api/admin/reviews/:id/approve
PUT    /api/admin/reviews/:id/remove
PUT    /api/admin/reviews/:id/feature
```

### Trending & Recommendations

```
GET    /api/admin/trending
POST   /api/admin/trending
PUT    /api/admin/trending/:id
DELETE /api/admin/trending/:id

GET    /api/admin/recommendations
POST   /api/admin/recommendations
PUT    /api/admin/recommendations/:id
```

### Moderation Queue

```
GET    /api/admin/moderation-queue
GET    /api/admin/moderation-queue/stats
PUT    /api/admin/moderation-queue/:id/assign
PUT    /api/admin/moderation-queue/:id/resolve
```

### Analytics & Reports

```
GET    /api/admin/dashboard
GET    /api/admin/stats/users
GET    /api/admin/stats/companies
GET    /api/admin/stats/reviews
GET    /api/admin/stats/engagement
GET    /api/admin/reports/daily
GET    /api/admin/reports/monthly
POST   /api/admin/reports/export
```

### Audit Log

```
GET    /api/admin/audit-log
GET    /api/admin/audit-log/:adminId
```

---

## 📊 Admin Dashboard Features

### Key Metrics Widgets

1. **User Statistics**
   - Total users
   - New users (today/week/month)
   - Active users
   - Verified users
   - Growth chart

2. **Review Statistics**
   - Total reviews
   - New reviews (today/week/month)
   - Pending moderation
   - Flagged reviews
   - Average rating trend

3. **Company Statistics**
   - Total companies
   - Verified companies
   - Claimed companies
   - Pending verification

4. **Moderation Queue**
   - Items pending
   - Items by priority
   - Items by type
   - Average resolution time

5. **Trending Chart**
   - Top trending companies
   - Growth trajectories
   - Category breakdown

6. **Recent Activity**
   - Recent admin actions
   - Recent flags
   - Recent alerts

---

## 🚀 How to Use the Admin System

### 1. Create an Admin User

```sql
-- Create admin user
INSERT INTO users (
  email,
  password_hash,
  full_name,
  role,
  email_verified,
  is_active
) VALUES (
  'admin@example.com',
  '$2b$10$...',  -- Properly hashed password
  'Admin Name',
  'admin',
  TRUE,
  TRUE
)
RETURNING id;

-- Grant permissions
INSERT INTO admin_permissions (
  admin_user_id,
  is_super_admin,
  can_moderate_reviews,
  can_moderate_users,
  can_moderate_companies,
  can_view_analytics
) VALUES (
  'admin-uuid',
  TRUE,  -- Super admin
  TRUE,
  TRUE,
  TRUE,
  TRUE
);
```

### 2. Add Trending Companies

```sql
-- Add a trending company
INSERT INTO trending_companies (
  company_id,
  position,
  category,
  trending_reason,
  added_by_admin_id,
  show_on_homepage,
  start_date,
  end_date
) VALUES (
  'company-uuid',
  1,
  'tech',
  'Fastest growing tech company in Q4',
  'admin-uuid',
  TRUE,
  NOW(),
  NOW() + INTERVAL '30 days'
);
```

### 3. Moderate Flagged Content

```sql
-- Get pending moderation items
SELECT * FROM moderation_queue
WHERE status = 'pending'
ORDER BY priority DESC, created_at ASC
LIMIT 50;

-- Take action
UPDATE reviews
SET status = 'removed'
WHERE id = 'review-uuid';

-- Log action
INSERT INTO admin_actions (
  admin_user_id,
  action_type,
  action_description,
  target_review_id,
  reason
) VALUES (
  'admin-uuid',
  'review_removed',
  'Removed review for policy violation',
  'review-uuid',
  'Contains offensive language'
);
```

### 4. Generate Reports

```sql
-- Daily activity report
SELECT 
  stat_date,
  new_users,
  new_companies,
  new_reviews,
  average_rating
FROM platform_statistics
WHERE stat_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY stat_date DESC;

-- Admin activity summary
SELECT 
  u.full_name,
  aa.action_type,
  COUNT(*) as action_count
FROM admin_actions aa
JOIN users u ON aa.admin_user_id = u.id
WHERE aa.created_at >= NOW() - INTERVAL '7 days'
GROUP BY u.full_name, aa.action_type
ORDER BY action_count DESC;
```

---

## 🔒 Security & Compliance

### Audit Trail

- **Every admin action is logged** in `admin_actions` table
- Includes IP address and user agent
- Metadata field stores before/after states
- Immutable records (no updates, only inserts)

### Access Control

- Role-based permissions (admin, moderator)
- Granular permission flags
- Can be revoked at any time
- Logged who granted permissions

### Data Privacy

- Admin access to user data is logged
- Export operations require `can_export_data` permission
- Personal data exports are tracked

---

## 📈 Reporting & Analytics

### Available Reports

1. **User Growth Report**
   - Daily/weekly/monthly sign-ups
   - Activation rate
   - Retention metrics

2. **Review Activity Report**
   - Reviews per day
   - Rating distribution
   - Response rates

3. **Moderation Report**
   - Flags per category
   - Resolution time
   - Admin workload

4. **Company Report**
   - New companies
   - Verification rate
   - Claim rate

---

## 🎯 Best Practices

### For Admins

1. **Always provide a reason** when moderating content
2. **Use trending features** to highlight quality companies
3. **Monitor the moderation queue** daily
4. **Review admin actions** weekly for compliance
5. **Update platform statistics** daily (can be automated)

### For Development

1. **Log all admin actions** - no exceptions
2. **Check permissions** before allowing actions
3. **Validate input** from admin forms
4. **Rate limit** admin actions to prevent abuse
5. **Send notifications** for critical alerts

---

## 🔄 Next Steps

1. **Build Admin API endpoints** (Express + TypeScript)
2. **Create admin frontend** (React dashboard)
3. **Implement authentication** (JWT with admin role)
4. **Add real-time notifications** (WebSocket for alerts)
5. **Create reporting tools** (Charts and exports)
6. **Set up automated statistics** (Cron jobs)

---

## 📞 Quick Reference

### Database Tables

| Table | Purpose |
|-------|---------|
| `admin_actions` | Audit log of all admin actions |
| `trending_companies` | Curated trending companies list |
| `featured_reviews` | Highlighted reviews |
| `platform_statistics` | Daily/hourly metrics |
| `moderation_queue` | Items needing review |
| `company_recommendations` | Recommendation engine |
| `system_alerts` | Critical notifications |
| `admin_permissions` | Access control |
| `admin_dashboard_widgets` | Dashboard customization |

### Key Functions

- `calculate_trending_score(company_id)` - Get trending score
- `get_platform_stats(start_date, end_date)` - Get metrics

---

**Your admin system is now ready!** 🎉

All database tables have been created and are ready for API integration.
