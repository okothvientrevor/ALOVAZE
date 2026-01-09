# 📁 Complete Project Structure

```
ALOVAZE/
│
├── frontend/                          # React Frontend Application
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── assets/                   # Images, icons, fonts
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/               # Reusable components
│   │   │   ├── common/              # Generic components
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── Dropdown.jsx
│   │   │   │
│   │   │   ├── layout/              # Layout components
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── PageLayout.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   │
│   │   │   ├── auth/                # Authentication components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   ├── business/            # Business components
│   │   │   │   ├── BusinessCard.jsx
│   │   │   │   ├── BusinessProfile.jsx
│   │   │   │   ├── BusinessForm.jsx
│   │   │   │   ├── BusinessStats.jsx
│   │   │   │   ├── BusinessSearch.jsx
│   │   │   │   └── ClaimBusinessModal.jsx
│   │   │   │
│   │   │   ├── review/              # Review components
│   │   │   │   ├── ReviewCard.jsx
│   │   │   │   ├── ReviewForm.jsx
│   │   │   │   ├── ReviewList.jsx
│   │   │   │   ├── ReviewFilters.jsx
│   │   │   │   ├── RatingStars.jsx
│   │   │   │   ├── RatingDistribution.jsx
│   │   │   │   └── ReviewResponse.jsx
│   │   │   │
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   │   ├── AnalyticsChart.jsx
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   ├── RecentReviews.jsx
│   │   │   │   ├── InvitationManager.jsx
│   │   │   │   └── PerformanceMetrics.jsx
│   │   │   │
│   │   │   ├── admin/               # Admin components
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── UserManagement.jsx
│   │   │   │   ├── BusinessVerification.jsx
│   │   │   │   ├── ContentModeration.jsx
│   │   │   │   ├── ReportQueue.jsx
│   │   │   │   └── SystemSettings.jsx
│   │   │   │
│   │   │   └── shared/              # Shared feature components
│   │   │       ├── ImageUploader.jsx
│   │   │       ├── SearchBar.jsx
│   │   │       ├── FilterSidebar.jsx
│   │   │       ├── Pagination.jsx
│   │   │       ├── NotificationDropdown.jsx
│   │   │       └── CategorySelector.jsx
│   │   │
│   │   ├── pages/                    # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── BusinessSearchPage.jsx
│   │   │   ├── BusinessProfilePage.jsx
│   │   │   ├── WriteReviewPage.jsx
│   │   │   ├── UserProfilePage.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── NotFoundPage.jsx
│   │   │   └── AboutPage.jsx
│   │   │
│   │   ├── context/                  # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   ├── BusinessContext.jsx
│   │   │   ├── ReviewContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.js
│   │   │   ├── useReviews.js
│   │   │   ├── useBusiness.js
│   │   │   ├── useNotifications.js
│   │   │   ├── useDebounce.js
│   │   │   └── useInfiniteScroll.js
│   │   │
│   │   ├── services/                 # API services
│   │   │   ├── api.js               # Axios instance
│   │   │   ├── authService.js
│   │   │   ├── businessService.js
│   │   │   ├── reviewService.js
│   │   │   ├── userService.js
│   │   │   ├── categoryService.js
│   │   │   ├── notificationService.js
│   │   │   └── uploadService.js
│   │   │
│   │   ├── firebase/                 # Firebase configuration
│   │   │   ├── config.js
│   │   │   ├── auth.js
│   │   │   ├── firestore.js
│   │   │   └── storage.js
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── validators.js
│   │   │   ├── formatters.js
│   │   │   ├── helpers.js
│   │   │   ├── constants.js
│   │   │   └── ratingCalculator.js
│   │   │
│   │   ├── styles/                   # Global styles
│   │   │   ├── index.css
│   │   │   ├── tailwind.css
│   │   │   └── variables.css
│   │   │
│   │   ├── App.jsx                   # Main app component
│   │   ├── index.js                  # Entry point
│   │   └── routes.js                 # Route configuration
│   │
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Example env file
│   ├── .gitignore
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── README.md
│
├── backend/                          # Node.js Backend
│   ├── src/
│   │   ├── config/                  # Configuration files
│   │   │   ├── firebase.js
│   │   │   ├── database.js
│   │   │   ├── email.js
│   │   │   └── serviceAccountKey.json  # (gitignored)
│   │   │
│   │   ├── controllers/             # Route controllers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── businessController.js
│   │   │   ├── reviewController.js
│   │   │   ├── categoryController.js
│   │   │   ├── invitationController.js
│   │   │   ├── notificationController.js
│   │   │   ├── reportController.js
│   │   │   └── adminController.js
│   │   │
│   │   ├── middleware/              # Express middleware
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── adminAuth.js         # Admin role check
│   │   │   ├── validation.js        # Input validation
│   │   │   ├── errorHandler.js      # Error handling
│   │   │   ├── rateLimiter.js       # Rate limiting
│   │   │   └── upload.js            # File upload handling
│   │   │
│   │   ├── routes/                  # API routes
│   │   │   ├── index.js             # Route aggregator
│   │   │   ├── authRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── businessRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── invitationRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── adminRoutes.js
│   │   │
│   │   ├── services/                # Business logic
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── businessService.js
│   │   │   ├── reviewService.js
│   │   │   ├── ratingService.js     # Rating calculations
│   │   │   ├── emailService.js      # Email sending
│   │   │   ├── notificationService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── fraudDetectionService.js
│   │   │   └── invitationService.js
│   │   │
│   │   ├── models/                  # Data models (if using ORM)
│   │   │   ├── userModel.js
│   │   │   ├── businessModel.js
│   │   │   └── reviewModel.js
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── validators.js
│   │   │   ├── helpers.js
│   │   │   ├── logger.js
│   │   │   ├── constants.js
│   │   │   └── emailTemplates.js
│   │   │
│   │   ├── jobs/                    # Background jobs
│   │   │   ├── emailQueue.js
│   │   │   ├── analyticsAggregation.js
│   │   │   └── reminderScheduler.js
│   │   │
│   │   └── index.js                 # Server entry point
│   │
│   ├── tests/                       # Test files
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   │
│   ├── .env                         # Environment variables
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── firebase/                        # Firebase configuration
│   ├── firestore.rules             # Firestore security rules
│   ├── firestore.indexes.json      # Firestore indexes
│   ├── storage.rules               # Storage security rules
│   └── firebase.json               # Firebase project config
│
├── docs/                           # Documentation
│   ├── FIREBASE_SETUP.md
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── scripts/                        # Utility scripts
│   ├── seedDatabase.js            # Seed initial data
│   ├── createAdmin.js             # Create admin user
│   └── migrateData.js             # Data migration
│
├── .gitignore                     # Global gitignore
├── .firebaserc                    # Firebase project config
├── firebase.json                  # Firebase hosting config
├── README.md                      # Main readme
├── STEP_BY_STEP_GUIDE.md         # Development guide
└── package.json                   # Root package.json (if monorepo)
```

---

## 📝 File Naming Conventions

### React Components
- **PascalCase**: `ReviewCard.jsx`, `BusinessProfile.jsx`
- **Page components**: End with "Page" - `HomePage.jsx`
- **Context**: End with "Context" - `AuthContext.jsx`

### JavaScript/Node.js
- **camelCase**: `authService.js`, `ratingCalculator.js`
- **Routes**: End with "Routes" - `authRoutes.js`
- **Controllers**: End with "Controller" - `userController.js`

### Configuration Files
- **lowercase with dots**: `.env`, `firebase.json`
- **Config files**: `tailwind.config.js`

---

## 🎯 Key Directories Explained

### Frontend `/src/components/`
Organized by feature (auth, business, review) and purpose (common, layout)

### Frontend `/src/pages/`
One file per route/page in the application

### Frontend `/src/services/`
API communication layer using Axios

### Backend `/src/controllers/`
Handle HTTP requests and responses

### Backend `/src/services/`
Business logic and Firestore operations

### Backend `/src/middleware/`
Request processing (auth, validation, error handling)

---

## 🔐 Security Notes

**Never commit these files:**
- `.env` (use `.env.example` instead)
- `serviceAccountKey.json`
- `node_modules/`
- Build directories (`build/`, `dist/`)

---

## ✅ Next Steps

1. Create this structure as we build each feature
2. Start with core folders first (config, services, components)
3. Add additional folders as needed
4. Keep related files together
