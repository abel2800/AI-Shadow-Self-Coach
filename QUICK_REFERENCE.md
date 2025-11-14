# Quick Reference Guide
## AI Shadow-Self Coach — Common Commands & Tasks

**Quick access to frequently used commands and workflows.**

---

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
npm run validate:env    # Check environment setup
npm run health          # Verify system health
npm run db:create-tables
npm run seed:test       # Optional: add test data
npm run dev
```

### Mobile
```bash
cd mobile
npm install
cd ios && pod install && cd ..  # iOS only
npm start
# Then: npm run ios or npm run android
```

### ML Tools
```bash
cd ml
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🗄️ Database Commands

### Setup
```bash
npm run db:create-tables    # Create all tables
npm run migrate             # Run migrations
npm run seed:test           # Add test data
```

### Management
```bash
npm run db:reset            # ⚠️ Reset database (dev only)
npm run backup              # Create backup
npm run restore             # Restore from backup
npm run backup:list         # List backups
npm run backup:cleanup      # Cleanup old backups
```

### Migrations
```bash
npm run migrate             # Run pending migrations
npm run migrate:undo        # Undo last migration
npm run migrate:status      # Check migration status
npm run migrate:create name # Create new migration
```

---

## 🧪 Testing

### Backend Tests
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage
npm run test:services       # Service tests only
npm run test:controllers    # Controller tests only
npm run test:integration    # Integration tests only
npm run test:utils          # Utility tests only
```

### Mobile Tests
```bash
npm test                    # Unit tests
npm run test:e2e            # E2E tests (Detox)
npm run test:e2e:ios        # iOS E2E tests
npm run test:e2e:android    # Android E2E tests
```

---

## 🔧 Development

### Backend
```bash
npm run dev                 # Start with nodemon
npm start                   # Start production server
npm run lint                # Lint code
npm run validate:env        # Validate environment
npm run health              # System health check
```

### Mobile
```bash
npm start                   # Start Metro bundler
npm run ios                 # Run on iOS
npm run android             # Run on Android
npm run lint                # Lint code
```

---

## 📊 Data & ML Tools

### Expand Dialogues
```bash
cd ml/tools
python expand_seed_dialogues.py \
  --input ../../SEED_DIALOGUES.json \
  --output ../../data/SEED_DIALOGUES_EXPANDED.json \
  --target 500 \
  --validate
```

### Validate Dialogues
```bash
python validate_dialogues.py \
  --input ../../data/SEED_DIALOGUES_EXPANDED.json
```

### Generate Synthetic Data
```bash
python generate_synthetic_data.py \
  --count 200 \
  --output ../../data/synthetic_batch1.json
```

### Label Data
```bash
python labeling_tool.py \
  --input ../../data/dialogues.json \
  --output ../../data/labels.json
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shadow_coach
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shadow_coach
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# Server
PORT=3000
NODE_ENV=development

# Sentry (optional)
ENABLE_SENTRY=false
SENTRY_DSN=

# Vector Store (optional)
ENABLE_VECTOR_STORE=true
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=
```

### Mobile (.env)
```env
API_BASE_URL=http://localhost:3000/api/v1
```

---

## 📚 API Endpoints

### Authentication
```bash
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Sessions
```bash
POST /api/v1/session/start
POST /api/v1/session/:id/message
POST /api/v1/session/:id/end
GET  /api/v1/session
```

### Journal
```bash
GET  /api/v1/journal
GET  /api/v1/journal/:id
POST /api/v1/journal/:id/export
```

### Analytics
```bash
GET /api/v1/analytics/mood
GET /api/v1/analytics/insights
GET /api/v1/analytics/progress
```

### Consent
```bash
GET  /api/v1/consent
POST /api/v1/consent
GET  /api/v1/consent/history
POST /api/v1/consent/revoke
```

### Health
```bash
GET /health
GET /health/detailed
```

**Full API docs:** `http://localhost:3000/api-docs`

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
npm run health              # Check system health
npm run validate:env        # Verify environment
psql -U postgres -d shadow_coach  # Test connection
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000              # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>              # macOS/Linux
taskkill /PID <PID> /F     # Windows
```

### Migration Issues
```bash
npm run migrate:status      # Check status
npm run migrate:undo        # Undo last migration
npm run db:reset            # ⚠️ Reset (dev only)
```

### Test Failures
```bash
npm run test:coverage       # See coverage
npm run test:watch          # Debug in watch mode
```

---

## 📁 Important Files

### Configuration
- `backend/.env` - Backend environment variables
- `backend/src/config/environment.js` - Environment config
- `mobile/.env` - Mobile environment variables

### Documentation
- `SPECIFICATION.md` - Technical specification
- `API_CONTRACTS.md` - API documentation
- `DEVELOPER_ONBOARDING.md` - Developer guide
- `PROJECT_STATUS.md` - Project status
- `README.md` - Project overview

### Data
- `SEED_DIALOGUES.json` - Seed training data
- `backend/backups/` - Database backups
- `ml/data/` - Training data

---

## 🔄 Common Workflows

### Starting Fresh
```bash
# Backend
cd backend
npm install
npm run validate:env
npm run db:create-tables
npm run seed:test
npm run dev

# Mobile (new terminal)
cd mobile
npm install
npm start
# Then: npm run ios or npm run android
```

### Adding a New Feature
```bash
# 1. Create migration
npm run migrate:create add-feature-name

# 2. Update model
# Edit backend/src/models/

# 3. Create service
# Edit backend/src/services/

# 4. Create controller
# Edit backend/src/controllers/

# 5. Add routes
# Edit backend/src/routes/

# 6. Write tests
npm run test:watch

# 7. Run migration
npm run migrate
```

### Deploying Changes
```bash
# 1. Run tests
npm test

# 2. Check health
npm run health

# 3. Create backup
npm run backup

# 4. Run migrations
npm run migrate

# 5. Deploy
# (Follow DEPLOYMENT_GUIDE.md)
```

---

## 🎯 Test Accounts

After running `npm run seed:test`:

- **Email:** `test@example.com`  
  **Password:** `password123`

- **Email:** `user1@example.com`  
  **Password:** `password123`

- **Email:** `user2@example.com`  
  **Password:** `password123`

---

## 📞 Getting Help

### Documentation
- Check `DEVELOPER_ONBOARDING.md` for setup
- Check `API_CONTRACTS.md` for API details
- Check `PROJECT_STATUS.md` for current status

### Scripts
- `backend/scripts/README.md` - Script documentation
- `ml/tools/README.md` - ML tools documentation

### Health Checks
```bash
npm run health              # System health
npm run validate:env        # Environment check
```

---

## ⚡ Quick Tips

1. **Always validate environment** before starting: `npm run validate:env`
2. **Check health** if something's not working: `npm run health`
3. **Use test data** for development: `npm run seed:test`
4. **Run tests** before committing: `npm test`
5. **Check API docs** at `http://localhost:3000/api-docs`

---

**Keep this guide handy for quick reference!** 📖

