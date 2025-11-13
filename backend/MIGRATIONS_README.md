# Database Migrations Guide

This project uses Sequelize migrations for database schema management.

## Migration Files

All migration files are located in `backend/src/migrations/`:

1. `20241112000001-create-users.js` - Creates users table
2. `20241112000002-create-sessions.js` - Creates sessions table
3. `20241112000003-create-messages.js` - Creates messages table
4. `20241112000004-create-moods.js` - Creates moods table
5. `20241112000005-add-updated-at-trigger.js` - Adds auto-update triggers

## Running Migrations

### Using Sequelize CLI (Recommended)

```bash
cd backend
npm run migrate
```

### Using Custom Script

```bash
cd backend
node scripts/run-migrations.js
```

### Check Migration Status

```bash
npm run migrate:status
```

### Undo Last Migration

```bash
npm run migrate:undo
```

## Creating New Migrations

### Using Sequelize CLI

```bash
npm run migrate:create -- create-new-table
```

This will create a new migration file in `src/migrations/` with a timestamp prefix.

## Migration Structure

Each migration file exports two functions:

```javascript
module.exports = {
  async up(queryInterface, Sequelize) {
    // Migration logic - runs when migrating up
  },
  async down(queryInterface, Sequelize) {
    // Rollback logic - runs when migrating down
  }
};
```

## Best Practices

1. **Always test migrations** on a development database first
2. **Never modify existing migrations** - create new ones instead
3. **Include rollback logic** in the `down` function
4. **Use transactions** for complex migrations
5. **Name migrations descriptively** - use clear, action-oriented names

## Migration Order

Migrations run in alphabetical order based on filename. The timestamp prefix ensures correct ordering:

- `20241112000001-*` runs before `20241112000002-*`
- Always use timestamp format: `YYYYMMDDHHMMSS-description.js`

## Troubleshooting

### Migration Already Executed

If a migration fails partway through, you may need to manually remove it from `SequelizeMeta`:

```sql
DELETE FROM "SequelizeMeta" WHERE name = 'migration-file-name.js';
```

### Rollback All Migrations

```bash
# Undo all migrations (run multiple times)
npm run migrate:undo
```

### Reset Database

```bash
# Drop all tables and re-run migrations
# WARNING: This will delete all data!
npm run migrate:undo:all
npm run migrate
```

## Environment Variables

Migrations use the same database configuration as the application:

- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port

## Notes

- Migrations are tracked in the `SequelizeMeta` table
- Each migration should be idempotent (safe to run multiple times)
- Use `IF NOT EXISTS` clauses where possible
- Test both `up` and `down` functions

