# Backend Scripts
## Utility Scripts for Development and Operations

This directory contains utility scripts for database management, testing, and development tasks.

---

## 🗄️ Database Scripts

### Reset Database
**⚠️ WARNING: This will DROP ALL TABLES!**

```bash
npm run db:reset
```

Drops all tables and recreates them by running migrations. Use with caution - this will delete all data!

---

### Seed Test Data
Populates the database with test data for development.

```bash
npm run seed:test
```

Creates:
- 3 test users (test@example.com, user1@example.com, user2@example.com)
- Test sessions for each user
- Test messages for each session
- Test mood entries
- Test consent records

**Test Accounts:**
- Email: `test@example.com`, Password: `password123`
- Email: `user1@example.com`, Password: `password123`
- Email: `user2@example.com`, Password: `password123`

---

### Backup Database
```bash
npm run backup
```

Creates a backup of the database. See `DATABASE_BACKUP_README.md` for details.

---

### Restore Database
```bash
npm run restore
```

Restores database from a backup file.

---

### Backup Management
```bash
# List all backups
npm run backup:list

# Cleanup old backups
npm run backup:cleanup

# Verify backup integrity
npm run backup:verify
```

---

## 🏥 Health & Validation

### Health Check
Checks system health (database, environment, dependencies).

```bash
npm run health
```

Checks:
- ✅ Database connection
- ✅ Environment variables
- ✅ Configuration validity
- ✅ Required dependencies

---

### Validate Environment
Validates that all required environment variables are set.

```bash
npm run validate:env
```

---

## 📚 Documentation

### Generate API Docs
Generates API documentation information.

```bash
npm run docs:generate
```

Note: Interactive API docs are available at `http://localhost:3000/api-docs` when the server is running.

---

## 🧪 Testing

### Run Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Specific test suites
npm run test:services
npm run test:controllers
npm run test:integration
npm run test:utils

# With coverage
npm run test:coverage
```

---

## 🔄 Migrations

### Run Migrations
```bash
# Run all pending migrations
npm run migrate

# Undo last migration
npm run migrate:undo

# Check migration status
npm run migrate:status

# Create new migration
npm run migrate:create migration-name
```

---

## 📋 Script Reference

| Script | Command | Description |
|--------|---------|-------------|
| Reset DB | `npm run db:reset` | Drop and recreate all tables |
| Seed Test Data | `npm run seed:test` | Populate with test data |
| Health Check | `npm run health` | Check system health |
| Validate Env | `npm run validate:env` | Validate environment variables |
| Backup DB | `npm run backup` | Create database backup |
| Restore DB | `npm run restore` | Restore from backup |
| Generate Docs | `npm run docs:generate` | Generate API documentation |
| Test Coverage | `npm run test:coverage` | Run tests with coverage |

---

## 🚨 Important Notes

### Database Reset
- **⚠️ WARNING:** `db:reset` will delete ALL data
- Always backup before resetting
- Only use in development environments

### Test Data
- Test data is for development only
- Do not use test accounts in production
- Test passwords are intentionally simple

### Backups
- Backups are stored in `backend/backups/`
- Automatic cleanup removes backups older than 30 days
- Always verify backups before deleting originals

---

## 🔧 Custom Scripts

To create a new script:

1. Create file in `backend/scripts/`
2. Add script command to `package.json`
3. Document in this README

Example:
```javascript
#!/usr/bin/env node
// Your script code here
```

---

**All scripts are ready to use!** 🎯

