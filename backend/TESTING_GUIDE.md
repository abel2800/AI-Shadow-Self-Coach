# Backend Testing Guide
## Step-by-Step Testing Instructions

This guide will help you test the backend API step by step.

---

## Prerequisites

1. **Node.js 18+** installed
2. **PostgreSQL** installed and running
3. **Database** `shadow_coach` created
4. **Environment variables** configured in `.env`

---

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

**Expected Output:**
- All packages installed successfully
- No errors

---

## Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings:
# - Database credentials
# - JWT secret
# - OpenAI API key (for LLM)
```

**Required Variables:**
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (generate a random string)
- `OPENAI_API_KEY` (get from https://platform.openai.com/)

---

## Step 3: Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE shadow_coach;
\q

# Or using createdb
createdb shadow_coach
```

---

## Step 4: Start Server

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

**If you see errors:**
- Check database connection settings in `.env`
- Ensure PostgreSQL is running
- Check if database exists

---

## Step 5: Test Health Endpoint

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

---

## Step 6: Test Authentication

### Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "consent_for_research": false
  }'
```

**Expected Response:**
```json
{
  "user_id": "usr_abc123",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-01-22T10:00:00.000Z"
}
```

**Save the token** for next requests!

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "user_id": "usr_abc123",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-01-22T10:00:00.000Z"
}
```

---

## Step 7: Test Session Management

### Start a Session

```bash
# Replace YOUR_TOKEN with the token from registration/login
curl -X POST http://localhost:3000/api/v1/session/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_type": "check-in",
    "mood_score": 5,
    "initial_message": "I've been feeling anxious about work lately.",
    "consent_for_deep_exploration": true
  }'
```

**Expected Response:**
```json
{
  "session_id": "sess_xyz789",
  "assistant_message": {
    "text": "That sounds heavy — it's okay to feel that way. Would you like to explore it together?",
    "intent": "validate",
    "risk_level": "none",
    "timestamp": "2024-01-15T10:30:05Z"
  },
  "session_state": "active",
  "estimated_duration_minutes": 5
}
```

**Save the session_id** for next requests!

### Send a Message

```bash
# Replace SESSION_ID and YOUR_TOKEN
curl -X POST http://localhost:3000/api/v1/session/SESSION_ID/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "I keep thinking I'm not good enough.",
    "timestamp": "2024-01-15T10:31:00Z"
  }'
```

**Expected Response:**
```json
{
  "assistant_message": {
    "text": "That feeling must be heavy — I'm sorry you're carrying that...",
    "intent": "validate",
    "risk_level": "none",
    "timestamp": "2024-01-15T10:31:05Z"
  },
  "session_state": "active"
}
```

---

## Step 8: Test Safety Detection

### Test High-Risk Detection

```bash
curl -X POST http://localhost:3000/api/v1/session/SESSION_ID/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message_text": "I want to kill myself.",
    "timestamp": "2024-01-15T10:32:00Z"
  }'
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
    },
    "requires_immediate_attention": true
  },
  "session_state": "paused"
}
```

**✅ Safety detection is working!**

---

## Step 9: Test Session Endpoints

### End Session

```bash
curl -X POST http://localhost:3000/api/v1/session/SESSION_ID/end \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "This session was really helpful."
  }'
```

### Get Session Summary

```bash
curl http://localhost:3000/api/v1/session/SESSION_ID/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Sessions

```bash
curl http://localhost:3000/api/v1/session?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 10: Test Journal Endpoints

### List Journal Entries

```bash
curl http://localhost:3000/api/v1/journal/entries?limit=20 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Journal Entry

```bash
curl http://localhost:3000/api/v1/journal/entry/SESSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 11: Test Analytics Endpoints

### Submit Mood Score

```bash
curl -X POST http://localhost:3000/api/v1/analytics/mood \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mood_score": 6,
    "timestamp": "2024-01-15T10:00:00Z"
  }'
```

### Get Mood History

```bash
curl http://localhost:3000/api/v1/analytics/mood \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 12: Test Safety Endpoints

### Get Crisis Resources

```bash
curl http://localhost:3000/api/v1/safety/resources?country=US \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Using REST Client (VS Code)

1. Install "REST Client" extension in VS Code
2. Open `test-api.http` file
3. Replace `{{token}}` and `{{session_id}}` with actual values
4. Click "Send Request" above each request

---

## Troubleshooting

### Database Connection Error

```
❌ Unable to connect to database
```

**Solution:**
- Check PostgreSQL is running: `pg_isready`
- Verify database credentials in `.env`
- Ensure database exists: `psql -l | grep shadow_coach`

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Not Found

```
Error: Cannot find module 'express'
```

**Solution:**
```bash
npm install
```

### Authentication Error

```
401 Unauthorized
```

**Solution:**
- Check token is valid
- Ensure token is in Authorization header: `Bearer YOUR_TOKEN`
- Token may have expired (default: 7 days)

---

## Next Steps

After successful testing:

1. ✅ Backend API is working
2. ⏭️ Move to mobile app development
3. ⏭️ Set up ML training pipeline
4. ⏭️ Implement database migrations

---

**Testing Complete!** 🎉

