# Backend API Test Results

**Date:** 2024  
**Status:** Testing in Progress

---

## ✅ Test Results

### 1. Health Check
- **Endpoint:** `GET /health`
- **Status:** ✅ PASSED
- **Response:** `{"status":"ok","timestamp":"...","environment":"development"}`

### 2. User Registration
- **Endpoint:** `POST /api/v1/auth/register`
- **Status:** Testing...

### 3. User Login
- **Endpoint:** `POST /api/v1/auth/login`
- **Status:** Pending...

### 4. Session Management
- **Endpoint:** `POST /api/v1/session/start`
- **Status:** Pending...

### 5. Safety Detection
- **Endpoint:** `POST /api/v1/session/:id/message` (with high-risk content)
- **Status:** Pending...

---

## Test Commands

### Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

### Start Session
```bash
curl -X POST http://localhost:3000/api/v1/session/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"session_type\":\"check-in\",\"mood_score\":5,\"initial_message\":\"I've been feeling anxious.\"}"
```

---

## Notes

- Server is running on port 3000
- Database connection is working
- Tables are created successfully

