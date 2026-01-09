#!/bin/bash

# ALOVAZE Platform - Quick Setup Script
# This script automates the initial project setup

echo "🚀 ALOVAZE Platform Setup Script"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version) found${NC}"

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
    echo -e "${GREEN}✅ Firebase CLI installed${NC}"
else
    echo -e "${GREEN}✅ Firebase CLI $(firebase --version) found${NC}"
fi

echo ""
echo "🎯 Step 1: Setting up Frontend (React)"
echo "======================================="

# Create frontend React app
if [ ! -d "frontend" ]; then
    echo "Creating React application..."
    npx create-react-app frontend
    cd frontend
    
    # Install frontend dependencies
    echo "Installing frontend dependencies..."
    npm install firebase react-router-dom axios react-hook-form react-toastify react-icons date-fns recharts
    npm install -D tailwindcss postcss autoprefixer
    
    # Initialize Tailwind
    npx tailwindcss init -p
    
    cd ..
    echo -e "${GREEN}✅ Frontend setup complete${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend directory already exists. Skipping...${NC}"
fi

echo ""
echo "🎯 Step 2: Setting up Backend (Node.js + Express)"
echo "=================================================="

# Create backend directory
if [ ! -d "backend" ]; then
    mkdir -p backend/src/{config,controllers,middleware,routes,services,utils,jobs}
    cd backend
    
    # Initialize npm
    npm init -y
    
    # Install backend dependencies
    echo "Installing backend dependencies..."
    npm install express cors dotenv firebase-admin helmet express-rate-limit nodemailer express-validator
    npm install -D nodemon
    
    # Update package.json scripts
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = {
      'start': 'node src/index.js',
      'dev': 'nodemon src/index.js',
      'test': 'echo \"Error: no test specified\" && exit 1'
    };
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "
    
    cd ..
    echo -e "${GREEN}✅ Backend setup complete${NC}"
else
    echo -e "${YELLOW}⚠️  Backend directory already exists. Skipping...${NC}"
fi

echo ""
echo "🎯 Step 3: Firebase Configuration"
echo "=================================="

echo -e "${YELLOW}⚠️  Please complete the following Firebase setup steps:${NC}"
echo "1. Go to https://console.firebase.google.com/"
echo "2. Create a new Firebase project"
echo "3. Enable Authentication (Email/Password, Google)"
echo "4. Create Firestore database"
echo "5. Enable Storage"
echo "6. Enable Hosting"
echo ""
echo "Then run: firebase login"
echo "Then run: firebase init"
echo ""

echo ""
echo "🎯 Step 4: Environment Variables"
echo "================================="

echo "Creating .env files from examples..."

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env 2>/dev/null || echo "Create frontend/.env manually from .env.example"
    echo -e "${YELLOW}⚠️  Please update frontend/.env with your Firebase config${NC}"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env 2>/dev/null || echo "Create backend/.env manually from .env.example"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your Firebase config${NC}"
fi

echo ""
echo "================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "================================="
echo ""
echo "📚 Next Steps:"
echo "1. Complete Firebase setup (see docs/FIREBASE_SETUP.md)"
echo "2. Update .env files with your Firebase credentials"
echo "3. Run 'cd frontend && npm start' to start frontend"
echo "4. Run 'cd backend && npm run dev' to start backend"
echo ""
echo "📖 Read STEP_BY_STEP_GUIDE.md for detailed instructions"
echo ""
echo "🎉 Happy coding!"
