# Quick Reference Guide

Quick commands and references for common tasks in AI Shadow-Self Coach.

## Backend

### Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure environment
npm run validate:env
npm run db:create-tables
npm run dev
```

### Database
```bash
npm run migrate              # Run migrations
npm run migrate:status       # Check migration status
npm run migrate:undo         # Undo last migration
npm run db:reset             # Reset database (dev only)
npm run backup               # Backup database
npm run restore              # Restore database
```

### Testing
```bash
npm test                     # Run all tests
npm run test:integration     # Integration tests
npm run test:coverage        # With coverage
npm run health               # Basic health check
npm run health:full          # Comprehensive health check
```

### Admin
```bash
npm run admin:create         # Create admin user
```

### API Documentation
```bash
npm run docs:generate        # Generate API docs
# View at: http://localhost:3000/api-docs
```

## ML Training

### Setup
```bash
cd ml
python -m venv venv
source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
python check_training_ready.py
```

### Training
```bash
# Complete pipeline
./run_training_pipeline.sh   # or .ps1 on Windows

# Individual steps
python tools/expand_seed_dialogues.py --input ../SEED_DIALOGUES.json --output ../data/SEED_DIALOGUES_EXPANDED.json --target 500
python train_safety_classifier.py
python train_intent_classifier.py
python train_persona_model.py
```

### Analysis & Testing
```bash
python analyze_training_results.py    # Analyze results
python test_model_inference.py        # Test inference
python validate_trained_models.py     # Validate models
python compare_models.py              # Compare versions
python export_to_onnx.py              # Export to ONNX
```

## Mobile App

### Setup
```bash
cd mobile
npm install
# Configure .env
npm start
```

## Common API Endpoints

### Authentication
```bash
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Sessions
```bash
POST   /api/v1/session              # Create session
GET    /api/v1/session/:id          # Get session
POST   /api/v1/session/:id/message  # Send message
POST   /api/v1/session/:id/complete # Complete session
```

### Journal
```bash
GET    /api/v1/journal/entries      # List entries
GET    /api/v1/journal/entry/:id    # Get entry
POST   /api/v1/journal/export       # Export entries
GET    /api/v1/journal/export/:id/status  # Export status
GET    /api/v1/journal/export/:id/download # Download
```

### Analytics
```bash
GET /api/v1/analytics/progress      # Progress summary
GET /api/v1/analytics/mood-history  # Mood history
GET /api/v1/analytics/insights      # Insights
```

### Safety
```bash
POST /api/v1/safety/check-in        # Safety check-in
GET  /api/v1/safety/resources       # Crisis resources
POST /api/v1/safety/referral        # Request referral
GET  /api/v1/safety/referral/:id    # Referral status
```

### Beta Testing
```bash
POST /api/v1/beta/enroll            # Enroll in beta
GET  /api/v1/beta/status            # Beta status
POST /api/v1/beta/feedback          # Submit feedback
GET  /api/v1/beta/feedback          # Feedback history
```

### Admin (requires admin privileges)
```bash
GET  /api/v1/admin/stats            # System statistics
GET  /api/v1/admin/beta-feedback    # Beta feedback list
PUT  /api/v1/admin/beta-feedback/:id # Update feedback
GET  /api/v1/admin/safety/stats     # Safety statistics
GET  /api/v1/admin/users/activity   # User activity
```

## Environment Variables

### Required
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/shadowcoach
JWT_SECRET=your-secret-key-here
```

### Optional
```bash
OPENAI_API_KEY=sk-...               # For AI responses
SENTRY_DSN=https://...              # Error tracking
USE_ML_SAFETY_CLASSIFIER=true      # Enable ML models
MODELS_DIR=./ml/models              # ML models path
NODE_ENV=production                 # Environment
PORT=3000                           # Server port
```

## Troubleshooting

### Database Connection Issues
```bash
# Check connection
npm run health:full

# Verify .env file
npm run validate:env

# Check PostgreSQL is running
# Windows: services.msc
# macOS/Linux: sudo systemctl status postgresql
```

### ML Model Issues
```bash
# Check training readiness
python ml/check_training_ready.py

# Validate trained models
python ml/validate_trained_models.py

# Test inference
python ml/test_model_inference.py
```

### Port Already in Use
```bash
# Find process
lsof -i :3000              # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>              # macOS/Linux
taskkill /PID <PID> /F     # Windows
```

## File Structure

```
ai-shadow-self-coach/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── migrations/   # Database migrations
│   └── scripts/          # Utility scripts
├── mobile/               # React Native app
│   └── src/
├── ml/                   # ML training
│   ├── tools/            # Training tools
│   └── models/           # Trained models
├── docs/                 # Documentation
└── data/                 # Training data
```

## Useful Links

- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **GitHub**: https://github.com/abel2800/AI-Shadow-Self-Coach

## Getting Help

1. Check documentation in `docs/` folder
2. Review `README.md` for detailed guides
3. Check `PROJECT_STATUS.md` for current status
4. Review error logs in `backend/logs/`
5. Run health checks: `npm run health:full`

---

**Last Updated:** November 2024

