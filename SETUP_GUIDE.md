# Setup Guide
## AI Shadow-Self Coach — Getting Started

This guide will help you set up the development environment and get the project running.

---

## Prerequisites

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Verify: `psql --version`

3. **Git**
   - Download from: https://git-scm.com/
   - Verify: `git --version`

### Optional (for mobile development)

4. **React Native CLI**
   - Install: `npm install -g react-native-cli`
   - Verify: `react-native --version`

5. **Python** (v3.8 or higher, for ML training)
   - Download from: https://www.python.org/downloads/
   - Verify: `python --version`

---

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env file with your configuration
# - Set database credentials
# - Add OpenAI API key
# - Set JWT secret

# Create PostgreSQL database
createdb shadow_coach

# Run migrations (when implemented)
# npm run migrate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### 2. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "consent_for_research": false
  }'
```

---

## Environment Variables

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shadow_coach
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# Safety
CRISIS_HOTLINE_US=988
CRISIS_TEXT_LINE=741741
```

---

## Database Setup

### Create Database

```bash
# Using psql
psql -U postgres
CREATE DATABASE shadow_coach;
\q

# Or using createdb command
createdb shadow_coach
```

### Run Migrations

Migrations will be implemented using Sequelize. For now, you can manually create tables or wait for migration scripts.

---

## Project Structure

```
shadow-coach-app/
├── docs/                    # Documentation
│   ├── SPECIFICATION.md
│   ├── API_CONTRACTS.md
│   ├── TRAINING_RECIPE.md
│   ├── UI_WIREFRAMES.md
│   └── SEED_DIALOGUES.json
│
├── backend/                  # Backend API
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   ├── .env.example
│   └── package.json
│
├── mobile/                  # Mobile app (to be created)
├── ml/                      # ML training (to be created)
└── README.md
```

---

## Next Steps

### Immediate (Week 1-2)

1. ✅ **Backend skeleton created** - API structure is ready
2. ⏳ **Set up database** - Create tables and run migrations
3. ⏳ **Test API endpoints** - Verify all routes work
4. ⏳ **Set up OpenAI integration** - Test LLM responses

### Short-term (Week 3-6)

1. **Mobile app setup** - React Native project structure
2. **Authentication flow** - Complete auth implementation
3. **Session management** - Full session lifecycle
4. **Safety classifier** - Basic risk detection

### Medium-term (Week 7-10)

1. **ML training** - Safety classifier training
2. **Journaling** - Full journal implementation
3. **Analytics** - Progress tracking
4. **Export functionality** - PDF/text export

---

## Development Commands

### Backend

```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Run migrations
npm run migrate

# Seed database
npm run seed
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d shadow_coach
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Getting Help

- Review `SPECIFICATION.md` for architecture details
- Check `API_CONTRACTS.md` for API documentation
- See `backend/README.md` for backend-specific docs

---

## What's Been Created

✅ **Backend API Skeleton**
- Express server setup
- Authentication routes & controllers
- Session management routes & controllers
- Journal routes & controllers
- Analytics routes & controllers
- Safety routes & controllers
- Database models (User, Session, Message)
- Middleware (auth, error handling)
- Services (conversation, safety)
- Response filtering utilities

⏳ **To Be Created**
- Mobile app structure
- ML training scripts
- Database migrations
- Tests
- Docker setup

---

**Ready to start development!** 🚀

