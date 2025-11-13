# Quick Start Guide
## Testing the Backend API

Follow these steps to test the backend API.

---

## Step 1: Install Dependencies ✅

```bash
cd backend
npm install
```

**Status:** ✅ Completed - Dependencies installed

---

## Step 2: Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# Minimum required:
# - DB_PASSWORD (your PostgreSQL password)
# - JWT_SECRET (any random string)
# - OPENAI_API_KEY (get from https://platform.openai.com/)
```

**For quick testing, you can use these minimal settings:**

```env
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=shadow_coach
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=test_secret_key_change_in_production
JWT_EXPIRES_IN=7d

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

CRISIS_HOTLINE_US=988
CRISIS_TEXT_LINE=741741
```

---

## Step 3: Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE shadow_coach;
\q

# Or using createdb (if available)
createdb shadow_coach
```

**Note:** For now, we'll test without database migrations. The models will create tables automatically on first use (if using Sequelize sync).

---

## Step 4: Start the Server

```bash
npm run dev
```

**Expected Output:**
```
✅ Database connection established successfully.
🚀 Server running on port 3000
📝 Environment: development
🔗 API Base URL: http://localhost:3000/api/v1
```

**If you see database connection errors:**
- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Ensure database exists: `psql -l | grep shadow_coach`

---

## Step 5: Test Health Endpoint

Open a new terminal and run:

```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "environment": "development"
}
```

**✅ If you see this, the server is working!**

---

## Step 6: Test Authentication

### Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\",\"consent_for_research\":false}"
```

**Expected Response:**
```json
{
  "user_id": "usr_abc123",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-01-22T10:00:00.000Z"
}
```

**Save the token!** You'll need it for authenticated requests.

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

---

## Step 7: Test Session Endpoints

### Start a Session

```bash
# Replace YOUR_TOKEN with the token from registration
curl -X POST http://localhost:3000/api/v1/session/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"session_type\":\"check-in\",\"mood_score\":5,\"initial_message\":\"I've been feeling anxious about work lately.\",\"consent_for_deep_exploration\":true}"
```

**Save the session_id from the response!**

### Send a Message

```bash
# Replace SESSION_ID and YOUR_TOKEN
curl -X POST http://localhost:3000/api/v1/session/SESSION_ID/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message_text\":\"I keep thinking I'm not good enough.\",\"timestamp\":\"2024-01-15T10:31:00Z\"}"
```

---

## Step 8: Test Safety Detection

### Test High-Risk Detection

```bash
curl -X POST http://localhost:3000/api/v1/session/SESSION_ID/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message_text\":\"I want to kill myself.\",\"timestamp\":\"2024-01-15T10:32:00Z\"}"
```

**Expected Response:**
```json
{
  "assistant_message": {
    "text": "I'm concerned about what you've shared. Your safety matters. Are you safe right now?",
    "intent": "emergency",
    "risk_level": "high"
  },
  "safety_escalation": {
    "triggered": true,
    "emergency_resources": {
      "crisis_hotline": "988",
      "crisis_text": "741741"
    }
  },
  "session_state": "paused"
}
```

**✅ If you see this, safety detection is working!**

---

## Using REST Client (VS Code)

1. Install "REST Client" extension in VS Code
2. Open `test-api.http` file
3. Replace `{{token}}` and `{{session_id}}` with actual values
4. Click "Send Request" above each request

---

## Troubleshooting

### Database Connection Error

**Error:** `❌ Unable to connect to database`

**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Verify credentials in `.env`
3. Ensure database exists: `psql -l | grep shadow_coach`

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change PORT in .env
```

### Module Not Found

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
npm install
```

---

## Next Steps

After successful testing:

1. ✅ Backend API is working
2. ⏭️ Create database migrations
3. ⏭️ Move to mobile app development
4. ⏭️ Set up ML training pipeline

---

**Ready to test!** 🚀

