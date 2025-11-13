/**
 * Run Migrations Script
 * Alternative migration runner using Sequelize directly
 */

require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs').promises;

const sequelize = new Sequelize(
  process.env.DB_NAME || 'shadow_coach',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

async function runMigrations() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Create SequelizeMeta table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) NOT NULL PRIMARY KEY
      );
    `);

    // Get all migration files
    const migrationsPath = path.join(__dirname, '../src/migrations');
    const files = await fs.readdir(migrationsPath);
    const migrationFiles = files
      .filter(file => file.endsWith('.js') && file !== '.sequelizerc')
      .sort();

    console.log(`📦 Found ${migrationFiles.length} migration files`);

    // Get already executed migrations
    const [executed] = await sequelize.query(
      'SELECT name FROM "SequelizeMeta" ORDER BY name'
    );
    const executedNames = executed.map(row => row.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (executedNames.includes(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Running migration: ${file}`);
      const migration = require(path.join(migrationsPath, file));

      if (migration.up) {
        await migration.up(sequelize.getQueryInterface(), Sequelize);
        await sequelize.query(
          `INSERT INTO "SequelizeMeta" (name) VALUES ('${file}')`
        );
        console.log(`✅ Completed: ${file}`);
      } else {
        console.log(`⚠️  Warning: ${file} has no 'up' function`);
      }
    }

    console.log('✅ All migrations completed!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.original) {
      console.error('   Original error:', error.original.message);
    }
    process.exit(1);
  }
}

runMigrations();

