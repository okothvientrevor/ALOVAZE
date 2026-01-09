# 🔥 Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: **ALOVAZE**
4. Enable Google Analytics (recommended)
5. Select or create an Analytics account
6. Click "Create project"

---

## Step 2: Enable Required Services

### Authentication
1. In Firebase Console, go to **Build → Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - ✅ Email/Password
   - ✅ Google
   - (Optional) Facebook, Twitter, etc.

### Firestore Database
1. Go to **Build → Firestore Database**
2. Click "Create database"
3. Select **Production mode** (we'll add security rules later)
4. Choose location: `us-central1` (or closest to your users)
5. Click "Enable"

### Storage
1. Go to **Build → Storage**
2. Click "Get started"
3. Start in **Production mode**
4. Choose same location as Firestore
5. Click "Done"

### Hosting
1. Go to **Build → Hosting**
2. Click "Get started"
3. Follow the setup steps (we'll deploy later)

---

## Step 3: Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click the **Web icon (</>)** 
4. Register app:
   - App nickname: `ALOVAZE Web`
   - ✅ Also set up Firebase Hosting
5. Copy the configuration object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

**Save this configuration! You'll need it in the next step.**

---

## Step 4: Download Service Account Key (Backend)

1. In Project Settings, go to **Service accounts** tab
2. Click "Generate new private key"
3. Click "Generate key" (downloads JSON file)
4. **IMPORTANT**: Keep this file secure! Never commit to Git
5. Rename it to `serviceAccountKey.json`
6. Place it in `/backend/src/config/` (create folder if needed)

---

## Step 5: Install Firebase CLI

```bash
# Install globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd /Users/vientrevor/development/ALOVAZE
firebase init
```

When prompted, select:
- ✅ Firestore
- ✅ Hosting
- ✅ Storage

---

## Step 6: Environment Variables

### Frontend (.env)
Create `/frontend/.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
Create `/backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"

# Or use service account file path
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/serviceAccountKey.json

# Email Service (optional for now)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

---

## Step 7: Firestore Initial Setup

### Create Collections
In Firestore Console, create these collections (add one dummy document to each, then delete it):

1. `users`
2. `businesses`
3. `reviews`
4. `categories`
5. `reviewInvitations`
6. `reports`
7. `notifications`
8. `adminLogs`
9. `analytics`

### Create Indexes
Go to **Firestore → Indexes** tab and create:

1. Collection: `reviews`
   - Fields: `businessId` (Ascending), `createdAt` (Descending)
   
2. Collection: `reviews`
   - Fields: `userId` (Ascending), `createdAt` (Descending)
   
3. Collection: `reviews`
   - Fields: `businessId` (Ascending), `status` (Ascending), `createdAt` (Descending)

4. Collection: `notifications`
   - Fields: `userId` (Ascending), `read` (Ascending), `createdAt` (Descending)

---

## Step 8: Storage Rules

In Storage → Rules, paste this:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Business logos and covers
    match /businesses/{businessId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024 // 10MB limit
                   && request.resource.contentType.matches('image/.*');
    }
    
    // Review images
    match /reviews/{reviewId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## Step 9: Firestore Security Rules

We'll deploy these with the Firebase CLI later. For now, keep the database in test mode.

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email + Google)
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Hosting enabled
- [ ] Firebase config copied
- [ ] Service account key downloaded
- [ ] Firebase CLI installed and logged in
- [ ] Environment variables configured
- [ ] Firestore collections created
- [ ] Composite indexes created
- [ ] Storage rules deployed

---

## 🎉 Next Step

Once all items are checked, proceed to **STEP 2** in the main guide: Frontend Setup

---

## 🆘 Troubleshooting

### Issue: Firebase CLI not found
```bash
npm install -g firebase-tools
```

### Issue: Permission denied on Firebase login
Run with sudo (Mac/Linux):
```bash
sudo npm install -g firebase-tools
```

### Issue: Can't deploy rules
Make sure you've initialized Firebase in your project:
```bash
firebase init
```

### Issue: Environment variables not loading
- Check `.env` file location
- Restart development server
- Check for typos in variable names
