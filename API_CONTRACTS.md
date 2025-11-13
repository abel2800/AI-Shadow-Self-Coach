# API Contracts — AI Shadow-Self Coach
## Complete API Specification

**Version:** 1.0  
**Base URL:** `https://api.shadowcoach.app/v1`  
**Authentication:** Bearer Token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Session Management](#session-management)
3. [Conversation](#conversation)
4. [Journaling](#journaling)
5. [Analytics](#analytics)
6. [Safety & Escalation](#safety--escalation)
7. [Data Models](#data-models)
8. [Error Handling](#error-handling)

---

## Authentication

### POST /auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123",
  "consent_for_research": false,
  "preferences": {
    "session_length": "medium",
    "notifications_enabled": true
  }
}
```

**Response (201 Created):**
```json
{
  "user_id": "usr_abc123",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid email or password
- `409 Conflict`: Email already registered

---

### POST /auth/login

Authenticate user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (200 OK):**
```json
{
  "user_id": "usr_abc123",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

### POST /auth/refresh

Refresh authentication token.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

---

## Session Management

### POST /session/start

Start a new coaching session.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "session_type": "check-in" | "gentle_deep" | "micro_practice",
  "mood_score": 5,
  "initial_message": "I've been feeling anxious about work lately.",
  "consent_for_deep_exploration": true
}
```

**Response (201 Created):**
```json
{
  "session_id": "sess_xyz789",
  "assistant_message": {
    "text": "That sounds heavy — it's okay to feel that way. Would you like to explore it together?",
    "intent": "validate",
    "risk_level": "none",
    "suggested_followup": null,
    "memory_delta": null,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "session_state": "active",
  "estimated_duration_minutes": 15
}
```

**Error Responses:**
- `400 Bad Request`: Invalid session type or missing required fields
- `401 Unauthorized`: Invalid or expired token

---

### POST /session/:id/message

Send a message in an active session and receive AI response.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "message_text": "I keep thinking I'm not good enough.",
  "timestamp": "2024-01-15T10:31:00Z"
}
```

**Response (200 OK):**
```json
{
  "assistant_message": {
    "text": "That feeling must be heavy — I'm sorry you're carrying that. Would you like to tell me about the last time that thought showed up? You can stop any time.",
    "intent": "validate",
    "risk_level": "none",
    "suggested_followup": "Would you like to explore this deeper?",
    "memory_delta": {
      "insights": ["User expresses recurring self-worth concerns"],
      "tags": ["self-worth", "anxiety"]
    },
    "timestamp": "2024-01-15T10:31:05Z"
  },
  "session_progress": {
    "step": 2,
    "total_steps": 7,
    "step_name": "Story Elicitation"
  },
  "session_state": "active"
}
```

**High-Risk Response Example:**
```json
{
  "assistant_message": {
    "text": "I'm concerned about what you've shared. Your safety matters. Are you safe right now?",
    "intent": "emergency",
    "risk_level": "high",
    "suggested_followup": null,
    "memory_delta": null,
    "timestamp": "2024-01-15T10:32:00Z"
  },
  "safety_escalation": {
    "triggered": true,
    "emergency_resources": {
      "crisis_hotline": "988",
      "crisis_text": "Text HOME to 741741",
      "local_resources": [
        {
          "name": "Local Crisis Center",
          "phone": "+1-555-123-4567"
        }
      ]
    },
    "requires_immediate_attention": true
  },
  "session_state": "paused"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid message or session not active
- `404 Not Found`: Session not found
- `401 Unauthorized`: Invalid or expired token

---

### POST /session/:id/pause

Pause an active session.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "session_id": "sess_xyz789",
  "session_state": "paused",
  "paused_at": "2024-01-15T10:35:00Z",
  "resume_token": "resume_abc123"
}
```

---

### POST /session/:id/resume

Resume a paused session.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "resume_token": "resume_abc123"
}
```

**Response (200 OK):**
```json
{
  "session_id": "sess_xyz789",
  "session_state": "active",
  "resumed_at": "2024-01-15T11:00:00Z",
  "assistant_message": {
    "text": "Welcome back. Where would you like to continue?",
    "intent": "validate",
    "risk_level": "none",
    "suggested_followup": null,
    "memory_delta": null,
    "timestamp": "2024-01-15T11:00:00Z"
  }
}
```

---

### POST /session/:id/end

End a session (active or paused).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "rating": 5,
  "feedback": "This session was really helpful."
}
```

**Response (200 OK):**
```json
{
  "session_id": "sess_xyz789",
  "session_state": "completed",
  "ended_at": "2024-01-15T10:45:00Z",
  "summary": {
    "text": "You explored feelings of self-worth and anxiety. We identified a pattern of negative self-talk and practiced self-compassion. You committed to trying a small experiment this week.",
    "insights": [
      "Recurring self-worth concerns",
      "Pattern of negative self-talk",
      "Willingness to explore deeper"
    ],
    "tags": ["self-worth", "anxiety", "self-compassion"],
    "experiment": "Try writing one thing you did well each day this week."
  },
  "duration_minutes": 15
}
```

---

### GET /session/:id/summary

Get session summary (for completed sessions).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "session_id": "sess_xyz789",
  "session_type": "gentle_deep",
  "started_at": "2024-01-15T10:30:00Z",
  "ended_at": "2024-01-15T10:45:00Z",
  "duration_minutes": 15,
  "summary": {
    "text": "You explored feelings of self-worth and anxiety. We identified a pattern of negative self-talk and practiced self-compassion. You committed to trying a small experiment this week.",
    "insights": [
      "Recurring self-worth concerns",
      "Pattern of negative self-talk",
      "Willingness to explore deeper"
    ],
    "tags": ["self-worth", "anxiety", "self-compassion"],
    "experiment": "Try writing one thing you did well each day this week."
  },
  "messages": [
    {
      "role": "user",
      "text": "I've been feeling anxious about work lately.",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant",
      "text": "That sounds heavy — it's okay to feel that way. Would you like to explore it together?",
      "intent": "validate",
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ],
  "highlights": [
    {
      "message_id": "msg_123",
      "text": "That feeling must be heavy — I'm sorry you're carrying that.",
      "highlighted_at": "2024-01-15T10:31:00Z"
    }
  ]
}
```

---

### GET /sessions

List user's sessions.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `session_type`: Filter by type (`check-in`, `gentle_deep`, `micro_practice`)
- `state`: Filter by state (`active`, `paused`, `completed`)
- `start_date`: Filter by start date (ISO 8601)
- `end_date`: Filter by end date (ISO 8601)

**Response (200 OK):**
```json
{
  "sessions": [
    {
      "session_id": "sess_xyz789",
      "session_type": "gentle_deep",
      "state": "completed",
      "started_at": "2024-01-15T10:30:00Z",
      "ended_at": "2024-01-15T10:45:00Z",
      "duration_minutes": 15,
      "summary_preview": "You explored feelings of self-worth...",
      "tags": ["self-worth", "anxiety"]
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

## Conversation

### POST /conversation/stream

Stream conversation responses (WebSocket alternative).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "session_id": "sess_xyz789",
  "message_text": "I keep thinking I'm not good enough.",
  "timestamp": "2024-01-15T10:31:00Z"
}
```

**Response (200 OK, Streaming):**
```
data: {"type": "chunk", "text": "That feeling", "chunk_id": 1}
data: {"type": "chunk", "text": " must be heavy", "chunk_id": 2}
data: {"type": "chunk", "text": " — I'm sorry", "chunk_id": 3}
data: {"type": "complete", "assistant_message": {...}, "session_progress": {...}}
```

---

## Journaling

### GET /journal/entries

List journal entries (session summaries).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)
- `tags`: Filter by tags (comma-separated)
- `start_date`: Filter by start date (ISO 8601)
- `end_date`: Filter by end date (ISO 8601)
- `search`: Full-text search query

**Response (200 OK):**
```json
{
  "entries": [
    {
      "session_id": "sess_xyz789",
      "session_type": "gentle_deep",
      "date": "2024-01-15T10:30:00Z",
      "summary": "You explored feelings of self-worth...",
      "tags": ["self-worth", "anxiety"],
      "insights": ["Recurring self-worth concerns"],
      "highlights": [
        {
          "text": "That feeling must be heavy — I'm sorry you're carrying that.",
          "timestamp": "2024-01-15T10:31:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

### GET /journal/entry/:session_id

Get detailed journal entry for a specific session.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "session_id": "sess_xyz789",
  "session_type": "gentle_deep",
  "date": "2024-01-15T10:30:00Z",
  "duration_minutes": 15,
  "summary": {
    "text": "You explored feelings of self-worth and anxiety...",
    "insights": ["Recurring self-worth concerns"],
    "tags": ["self-worth", "anxiety", "self-compassion"],
    "experiment": "Try writing one thing you did well each day this week."
  },
  "full_transcript": [
    {
      "role": "user",
      "text": "I've been feeling anxious about work lately.",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "role": "assistant",
      "text": "That sounds heavy — it's okay to feel that way. Would you like to explore it together?",
      "intent": "validate",
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ],
  "highlights": [
    {
      "message_id": "msg_123",
      "text": "That feeling must be heavy — I'm sorry you're carrying that.",
      "highlighted_at": "2024-01-15T10:31:00Z"
    }
  ]
}
```

---

### POST /journal/entry/:session_id/highlight

Add a highlight to a session.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "message_id": "msg_123",
  "note": "This really resonated with me"
}
```

**Response (200 OK):**
```json
{
  "highlight_id": "hl_abc123",
  "message_id": "msg_123",
  "text": "That feeling must be heavy — I'm sorry you're carrying that.",
  "note": "This really resonated with me",
  "highlighted_at": "2024-01-15T11:00:00Z"
}
```

---

### POST /journal/entry/:session_id/tags

Add or update tags for a session.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "tags": ["self-worth", "anxiety", "work"]
}
```

**Response (200 OK):**
```json
{
  "session_id": "sess_xyz789",
  "tags": ["self-worth", "anxiety", "work"],
  "updated_at": "2024-01-15T11:00:00Z"
}
```

---

### POST /journal/export

Export journal entries as PDF or text.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "format": "pdf" | "text" | "json",
  "session_ids": ["sess_xyz789", "sess_abc456"],
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "include_transcript": true,
  "include_highlights": true
}
```

**Response (202 Accepted):**
```json
{
  "export_id": "exp_xyz789",
  "status": "processing",
  "estimated_completion": "2024-01-15T11:05:00Z"
}
```

**Poll for completion:**
```
GET /journal/export/:export_id
```

**Response (200 OK, when complete):**
```json
{
  "export_id": "exp_xyz789",
  "status": "completed",
  "download_url": "https://api.shadowcoach.app/v1/journal/export/exp_xyz789/download",
  "expires_at": "2024-01-22T11:00:00Z",
  "file_size_bytes": 245760
}
```

---

### DELETE /journal/entry/:session_id

Delete a journal entry.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "session_id": "sess_xyz789",
  "deleted_at": "2024-01-15T11:00:00Z"
}
```

---

## Analytics

### POST /analytics/mood

Submit mood score.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "mood_score": 5,
  "timestamp": "2024-01-15T10:00:00Z",
  "notes": "Feeling anxious about work"
}
```

**Response (201 Created):**
```json
{
  "mood_id": "mood_abc123",
  "mood_score": 5,
  "timestamp": "2024-01-15T10:00:00Z",
  "created_at": "2024-01-15T10:00:05Z"
}
```

---

### GET /analytics/mood

Get mood history.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date`: Start date (ISO 8601, default: 30 days ago)
- `end_date`: End date (ISO 8601, default: now)
- `granularity`: `day` | `week` | `month` (default: `day`)

**Response (200 OK):**
```json
{
  "mood_scores": [
    {
      "date": "2024-01-15",
      "score": 5,
      "count": 1
    },
    {
      "date": "2024-01-14",
      "score": 6,
      "count": 1
    }
  ],
  "statistics": {
    "average": 5.5,
    "min": 3,
    "max": 8,
    "trend": "stable"
  }
}
```

---

### GET /analytics/insights

Get insights analytics.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `start_date`: Start date (ISO 8601, default: 30 days ago)
- `end_date`: End date (ISO 8601, default: now)

**Response (200 OK):**
```json
{
  "insight_frequency": {
    "total": 25,
    "by_week": [
      {
        "week": "2024-01-08",
        "count": 5
      },
      {
        "week": "2024-01-15",
        "count": 7
      }
    ]
  },
  "tag_distribution": [
    {
      "tag": "anxiety",
      "count": 10
    },
    {
      "tag": "self-worth",
      "count": 8
    }
  ],
  "session_types": {
    "check-in": 20,
    "gentle_deep": 5,
    "micro_practice": 10
  }
}
```

---

### GET /analytics/progress

Get overall progress summary.

**Request Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user_id": "usr_abc123",
  "period": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-31T23:59:59Z"
  },
  "summary": {
    "total_sessions": 35,
    "total_duration_minutes": 525,
    "average_mood": 5.5,
    "mood_trend": "improving",
    "insights_count": 25,
    "experiments_completed": 8
  },
  "trends": {
    "mood": "improving",
    "session_frequency": "stable",
    "engagement": "increasing"
  }
}
```

---

## Safety & Escalation

### POST /safety/check-in

Submit safety check-in (post-escalation follow-up).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "session_id": "sess_xyz789",
  "safety_status": "safe" | "unsure" | "needs_support",
  "message": "I'm feeling better now, thank you for checking in."
}
```

**Response (200 OK):**
```json
{
  "check_in_id": "check_abc123",
  "safety_status": "safe",
  "timestamp": "2024-01-15T12:00:00Z",
  "next_check_in": "2024-01-16T12:00:00Z"
}
```

---

### GET /safety/resources

Get crisis resources (geolocation-based).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `country`: ISO country code (optional, auto-detected from IP)
- `region`: Region/state code (optional)

**Response (200 OK):**
```json
{
  "resources": [
    {
      "type": "crisis_hotline",
      "name": "National Suicide Prevention Lifeline",
      "phone": "988",
      "available_24_7": true
    },
    {
      "type": "crisis_text",
      "name": "Crisis Text Line",
      "text": "Text HOME to 741741",
      "available_24_7": true
    },
    {
      "type": "local_center",
      "name": "Local Crisis Center",
      "phone": "+1-555-123-4567",
      "address": "123 Main St, City, State 12345",
      "available_24_7": true
    }
  ],
  "location": {
    "country": "US",
    "region": "CA"
  }
}
```

---

### POST /safety/referral

Request therapist referral (opt-in).

**Request Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "preferences": {
    "location": "San Francisco, CA",
    "insurance": "Blue Cross",
    "specialties": ["anxiety", "depression"],
    "availability": "evenings"
  },
  "consent_for_contact": true
}
```

**Response (200 OK):**
```json
{
  "referral_id": "ref_abc123",
  "status": "processing",
  "estimated_response": "2024-01-16T10:00:00Z"
}
```

---

## Data Models

### User Model

```json
{
  "user_id": "usr_abc123",
  "email": "user@example.com",
  "created_at": "2024-01-01T00:00:00Z",
  "preferences": {
    "session_length": "medium",
    "notifications_enabled": true,
    "consent_for_research": false
  },
  "safety_contact": {
    "name": "Emergency Contact",
    "phone": "+1-555-123-4567"
  }
}
```

### Session Model

```json
{
  "session_id": "sess_xyz789",
  "user_id": "usr_abc123",
  "session_type": "gentle_deep",
  "state": "active" | "paused" | "completed",
  "started_at": "2024-01-15T10:30:00Z",
  "ended_at": "2024-01-15T10:45:00Z",
  "duration_minutes": 15,
  "mood_score": 5,
  "summary": {
    "text": "...",
    "insights": ["..."],
    "tags": ["..."],
    "experiment": "..."
  }
}
```

### Message Model

```json
{
  "message_id": "msg_123",
  "session_id": "sess_xyz789",
  "role": "user" | "assistant",
  "text": "Message text",
  "intent": "validate" | "probe_story" | "probe_root" | "reframe" | "suggest_experiment" | "offer_mindfulness" | "safety_check" | "emergency" | "close" | "other",
  "sentiment": "very_negative" | "negative" | "neutral" | "positive",
  "risk_level": "none" | "low" | "medium" | "high",
  "timestamp": "2024-01-15T10:30:00Z",
  "metadata": {
    "suggested_followup": "...",
    "memory_delta": {...}
  }
}
```

### Assistant Message Response

```json
{
  "text": "Assistant response text",
  "intent": "validate",
  "risk_level": "none",
  "suggested_followup": "Would you like to explore this deeper?",
  "memory_delta": {
    "insights": ["..."],
    "tags": ["..."]
  },
  "timestamp": "2024-01-15T10:30:05Z"
}
```

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    },
    "request_id": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Error Codes

**Authentication Errors:**
- `AUTH_INVALID_TOKEN`: Invalid or expired token
- `AUTH_MISSING_TOKEN`: Missing authorization token
- `AUTH_INVALID_CREDENTIALS`: Invalid email or password

**Session Errors:**
- `SESSION_NOT_FOUND`: Session does not exist
- `SESSION_NOT_ACTIVE`: Session is not in active state
- `SESSION_INVALID_TYPE`: Invalid session type
- `SESSION_ALREADY_ENDED`: Session has already ended

**Validation Errors:**
- `VALIDATION_REQUIRED_FIELD`: Required field is missing
- `VALIDATION_INVALID_FORMAT`: Invalid field format
- `VALIDATION_OUT_OF_RANGE`: Value out of allowed range

**Rate Limiting:**
- `RATE_LIMIT_EXCEEDED`: Too many requests

**Server Errors:**
- `INTERNAL_ERROR`: Internal server error
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

**Safety Errors:**
- `SAFETY_HIGH_RISK`: High-risk content detected (triggers escalation)

---

## Rate Limiting

**Limits:**
- Authentication: 5 requests per minute
- Session messages: 30 requests per minute
- Analytics: 10 requests per minute
- Export: 5 requests per hour

**Headers:**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1642248000
```

---

## Webhooks (Post-MVP)

Webhooks for session events (optional, opt-in):

**Events:**
- `session.completed`
- `session.escalated`
- `safety.check_in_required`

**Payload:**
```json
{
  "event": "session.completed",
  "session_id": "sess_xyz789",
  "user_id": "usr_abc123",
  "timestamp": "2024-01-15T10:45:00Z",
  "data": {
    "session_type": "gentle_deep",
    "duration_minutes": 15
  }
}
```

---

**End of API Contracts Document**

cd dbcaa