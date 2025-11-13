# 🚀 Quick Start Guide - Complete Project

**Get the entire project running in 10 minutes!**

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed and running
- ✅ Python 3.8+ installed (for ML)
- ✅ OpenAI API key (for conversation service)

---

## Step 1: Backend Setup (3 minutes)

```bash
cd backend

# Install dependencies
npm install

# Create .env file (already created, just update values)
# Edit .env:
# - DB_PASSWORD=1992 (already set)
# - DB_NAME=ai (already set)
# - OPENAI_API_KEY=your_key_here

# Create database (if not exists)
createdb ai

# Create tables
npm run db:create-tables

# Start server
npm run dev
```

**✅ Backend running on http://localhost:3000**

---

## Step 2: Test Backend (2 minutes)

```bash
# Health check
curl http://localhost:3000/health

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**✅ Backend tested and working**

---

## Step 3: Mobile Setup (3 minutes)

```bash
cd mobile

# Install dependencies
npm install

# For iOS (Mac only)
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# In another terminal, run on device
npm run ios      # iOS
npm run android  # Android
```

**✅ Mobile app ready**

---

## Step 4: ML Setup (2 minutes)

```bash
cd ml

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env
# Edit .env with OPENAI_API_KEY
```

**✅ ML training ready**

---

## 🎯 What You Can Do Now

### Backend
- ✅ Register and login users
- ✅ Create sessions
- ✅ Send messages (needs OpenAI key)
- ✅ View journal entries
- ✅ Track analytics

### Mobile
- ✅ Complete onboarding flow
- ✅ Daily check-ins
- ✅ Start sessions
- ✅ View journal
- ✅ See analytics

### ML
- ✅ Prepare training data
- ✅ Train safety classifier
- ✅ Fine-tune persona model
- ✅ Evaluate models

---

## 📝 Configuration Checklist

- [ ] Backend `.env` configured
- [ ] Database created (`ai`)
- [ ] Tables created
- [ ] OpenAI API key added
- [ ] Mobile dependencies installed
- [ ] ML virtual environment created

---

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database exists
- Check `.env` configuration

### Mobile won't build
- Run `npm install` in mobile directory
- For iOS: Run `pod install` in ios directory
- Check React Native CLI is installed

### ML scripts fail
- Activate virtual environment
- Install requirements: `pip install -r requirements.txt`
- Check Python version (3.8+)

---

## 🎉 Success!

If all steps completed:
- ✅ Backend API is running
- ✅ Database is connected
- ✅ Mobile app structure is ready
- ✅ ML training scripts are ready

**You're ready to continue development!** 🚀

---

## Next Steps

1. Add OpenAI API key and test conversation service
2. Test mobile app on device/emulator
3. Expand training data
4. Train ML models
5. Continue with remaining features

---

**Everything is set up and ready!** 🎊

