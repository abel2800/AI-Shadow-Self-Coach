# ✅ Database Setup Complete!

The database tables have been created successfully in the `ai` database.

---

## 📊 Created Tables

1. **users** - User accounts and preferences
   - id (UUID, Primary Key)
   - email (Unique)
   - password (Hashed)
   - preferences (JSONB)
   - consent_for_research (Boolean)
   - safety_contact (JSONB)
   - is_active (Boolean)
   - created_at, updated_at (Timestamps)

2. **sessions** - Coaching sessions
   - id (UUID, Primary Key)
   - user_id (Foreign Key → users)
   - session_type (check-in, gentle_deep, micro_practice)
   - state (active, paused, completed)
   - mood_score (1-10)
   - summary (JSONB)
   - started_at, ended_at (Timestamps)
   - duration_minutes (Integer)

3. **messages** - Conversation messages
   - id (UUID, Primary Key)
   - session_id (Foreign Key → sessions)
   - role (user, assistant)
   - text (Text)
   - intent (validate, probe_story, probe_root, reframe, etc.)
   - sentiment (very_negative, negative, neutral, positive)
   - risk_level (none, low, medium, high)
   - metadata (JSONB)
   - timestamp, created_at, updated_at (Timestamps)

---

## 📊 Created Indexes

For better query performance:
- `idx_sessions_user_id` - Fast user session lookups
- `idx_sessions_state` - Fast session state filtering
- `idx_sessions_started_at` - Fast date range queries
- `idx_messages_session_id` - Fast message lookups by session
- `idx_messages_timestamp` - Fast message ordering
- `idx_messages_risk_level` - Fast risk level filtering

---

## 🔄 Automatic Triggers

Created triggers to automatically update `updated_at` timestamp:
- `update_users_updated_at`
- `update_sessions_updated_at`
- `update_messages_updated_at`

---

## 🚀 Next Steps

1. **Start the server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Test authentication:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
   ```

---

## 📝 Database Configuration

- **Database Name:** `ai`
- **Host:** `localhost`
- **Port:** `5432`
- **User:** `postgres`
- **Password:** `1992` (configured in .env)

---

## 🔧 Available Scripts

- `npm run db:create-tables` - Create tables using SQL
- `npm run db:sync` - Sync tables using Sequelize models

---

**Database is ready!** 🎉

