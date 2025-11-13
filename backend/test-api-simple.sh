#!/bin/bash

# Simple API Test Script
# Tests all endpoints with proper token handling

BASE_URL="http://localhost:3000/api/v1"
EMAIL="test@example.com"
PASSWORD="password123"

echo "🧪 Testing Shadow Coach Backend API"
echo "===================================="
echo ""

# 1. Health Check
echo "1. Testing Health Check..."
curl -s http://localhost:3000/health | jq .
echo ""

# 2. Register User
echo "2. Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"consent_for_research\":false}")

echo "$REGISTER_RESPONSE" | jq .
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo "Token: ${TOKEN:0:50}..."
echo ""

# 3. Login
echo "3. Logging In..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN_RESPONSE" | jq .
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
echo "Token: ${TOKEN:0:50}..."
echo ""

# 4. Start Session
echo "4. Starting Session..."
SESSION_RESPONSE=$(curl -s -X POST "$BASE_URL/session/start" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"session_type\":\"check-in\",\"mood_score\":5,\"initial_message\":\"I've been feeling anxious about work lately.\",\"consent_for_deep_exploration\":true}")

echo "$SESSION_RESPONSE" | jq .
SESSION_ID=$(echo "$SESSION_RESPONSE" | jq -r '.session_id')
echo "Session ID: $SESSION_ID"
echo ""

# 5. Send Message
echo "5. Sending Message..."
MESSAGE_RESPONSE=$(curl -s -X POST "$BASE_URL/session/$SESSION_ID/message" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message_text\":\"I keep thinking I'm not good enough.\",\"timestamp\":\"2024-01-15T10:31:00Z\"}")

echo "$MESSAGE_RESPONSE" | jq .
echo ""

# 6. Test Safety Detection
echo "6. Testing Safety Detection (High Risk)..."
SAFETY_RESPONSE=$(curl -s -X POST "$BASE_URL/session/$SESSION_ID/message" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message_text\":\"I want to kill myself.\",\"timestamp\":\"2024-01-15T10:32:00Z\"}")

echo "$SAFETY_RESPONSE" | jq .
echo ""

echo "✅ All tests completed!"

