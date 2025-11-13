# Database Backup & Disaster Recovery
## Complete Backup and Recovery System

This guide explains how to backup, restore, and recover the PostgreSQL database for the AI Shadow-Self Coach application.

---

## 🎯 Overview

The backup system provides:
- **Automated backups** - Scheduled daily/hourly backups
- **Manual backups** - On-demand backup creation
- **Point-in-time recovery** - Restore to specific backup
- **Backup management** - List, verify, and clean up backups
- **Disaster recovery** - Complete recovery procedures

---

## 📦 Backup Scripts

### 1. Create Backup

```bash
# Manual backup
node scripts/backup-database.js

# With compression
COMPRESS_BACKUP=true node scripts/backup-database.js

# Custom backup directory
BACKUP_DIR=/path/to/backups node scripts/backup-database.js
```

**Output:**
- SQL dump file: `backup-shadow_coach-2024-01-01T00-00-00-000Z.sql`
- Metadata file: `backup-shadow_coach-2024-01-01T00-00-00-000Z.json`
- Compressed (optional): `backup-shadow_coach-2024-01-01T00-00-00-000Z.sql.gz`

### 2. Restore Backup

```bash
# List available backups
node scripts/restore-database.js

# Restore specific backup
FORCE_RESTORE=true node scripts/restore-database.js backup-shadow_coach-2024-01-01T00-00-00-000Z.sql

# Restore compressed backup
FORCE_RESTORE=true node scripts/restore-database.js backup-shadow_coach-2024-01-01T00-00-00-000Z.sql.gz
```

**⚠️ Warning:** Restore will overwrite existing data!

### 3. Backup Manager

```bash
# List all backups
node scripts/backup-manager.js list

# Clean up backups older than 30 days
node scripts/backup-manager.js cleanup 30

# Verify backup integrity
node scripts/backup-manager.js verify backup-shadow_coach-2024-01-01T00-00-00-000Z.sql
```

---

## ⏰ Automated Backups

### Linux/macOS (Cron)

```bash
# Schedule daily backups at 2 AM
chmod +x scripts/schedule-backups.sh
./scripts/schedule-backups.sh "0 2 * * *"

# Schedule hourly backups
./scripts/schedule-backups.sh "0 * * * *"

# View scheduled backups
crontab -l
```

### Windows (Task Scheduler)

```powershell
# Schedule daily backups at 2 AM
.\scripts\schedule-backups.ps1 -Schedule Daily -Time "02:00"

# Schedule weekly backups (Monday at 2 AM)
.\scripts\schedule-backups.ps1 -Schedule Weekly -Time "02:00"

# Schedule hourly backups
.\scripts\schedule-backups.ps1 -Schedule Hourly
```

---

## 🔧 Configuration

### Environment Variables

```env
# Backup directory (default: backend/backups)
BACKUP_DIR=/path/to/backups

# Compress backups (default: false)
COMPRESS_BACKUP=true

# Database connection (from .env)
DB_NAME=shadow_coach
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Backup Retention

Set retention policy in your backup cleanup schedule:

```bash
# Keep backups for 30 days
node scripts/backup-manager.js cleanup 30

# Keep backups for 90 days
node scripts/backup-manager.js cleanup 90
```

---

## 🚨 Disaster Recovery Procedures

### Scenario 1: Database Corruption

**Symptoms:**
- Database connection errors
- Data integrity errors
- Application crashes

**Recovery Steps:**

1. **Stop the application**
   ```bash
   # Stop API server
   pm2 stop shadow-coach-api
   # or
   docker-compose down
   ```

2. **Identify last good backup**
   ```bash
   node scripts/backup-manager.js list
   ```

3. **Restore from backup**
   ```bash
   FORCE_RESTORE=true node scripts/restore-database.js backup-<timestamp>.sql
   ```

4. **Verify restoration**
   ```bash
   # Check database
   psql -h localhost -U postgres -d shadow_coach -c "SELECT COUNT(*) FROM users;"
   ```

5. **Restart application**
   ```bash
   pm2 start shadow-coach-api
   # or
   docker-compose up -d
   ```

### Scenario 2: Accidental Data Deletion

**Symptoms:**
- Missing records
- User reports data loss

**Recovery Steps:**

1. **Stop writes to database**
   ```bash
   # Stop API or set to read-only mode
   ```

2. **Identify backup before deletion**
   ```bash
   node scripts/backup-manager.js list
   # Find backup from before deletion
   ```

3. **Create current backup (safety)**
   ```bash
   node scripts/backup-database.js
   ```

4. **Restore from backup**
   ```bash
   FORCE_RESTORE=true node scripts/restore-database.js backup-<before-deletion>.sql
   ```

5. **Verify and resume**
   ```bash
   # Verify data restored
   # Resume normal operations
   ```

### Scenario 3: Complete Server Failure

**Symptoms:**
- Server unavailable
- Database server down
- Complete data loss

**Recovery Steps:**

1. **Set up new server**
   ```bash
   # Install PostgreSQL
   # Install Node.js
   # Clone repository
   ```

2. **Restore database**
   ```bash
   # Copy backup file to new server
   # Restore database
   FORCE_RESTORE=true node scripts/restore-database.js backup-<latest>.sql
   ```

3. **Configure application**
   ```bash
   # Set up .env file
   # Run migrations (if needed)
   npm run migrate
   ```

4. **Verify and start**
   ```bash
   # Verify database
   # Start application
   npm start
   ```

---

## 📊 Backup Best Practices

### 1. Backup Frequency

- **Production:** Daily backups (minimum)
- **Staging:** Daily backups
- **Development:** On-demand backups

### 2. Backup Storage

- **Local:** Keep recent backups locally
- **Remote:** Store backups in cloud storage (S3, Azure Blob, etc.)
- **Offsite:** Keep backups in different geographic location

### 3. Backup Verification

- **Regular verification:** Weekly integrity checks
- **Test restores:** Monthly restore tests
- **Documentation:** Keep recovery procedures documented

### 4. Backup Retention

- **Daily backups:** Keep for 30 days
- **Weekly backups:** Keep for 12 weeks
- **Monthly backups:** Keep for 12 months

### 5. Security

- **Encrypt backups:** Use encryption for sensitive data
- **Secure storage:** Protect backup files with proper permissions
- **Access control:** Limit who can access backups

---

## 🔐 Backup Security

### Encrypt Backups

```bash
# Create encrypted backup
node scripts/backup-database.js | gpg --encrypt --recipient backup@shadow-coach.com > backup-encrypted.gpg

# Decrypt and restore
gpg --decrypt backup-encrypted.gpg | psql -h localhost -U postgres -d shadow_coach
```

### Secure Storage

```bash
# Set backup directory permissions
chmod 700 backups/
chown postgres:postgres backups/

# Use secure cloud storage
aws s3 cp backup.sql s3://shadow-coach-backups/ --encryption aws:kms
```

---

## ☁️ Cloud Backup Integration

### AWS S3

```bash
# Upload backup to S3
aws s3 cp backup.sql s3://shadow-coach-backups/$(date +%Y-%m-%d)/backup.sql

# Download from S3
aws s3 cp s3://shadow-coach-backups/2024-01-01/backup.sql ./backup.sql
```

### Azure Blob Storage

```bash
# Upload backup
az storage blob upload --container-name backups --name backup.sql --file backup.sql

# Download backup
az storage blob download --container-name backups --name backup.sql --file backup.sql
```

### Google Cloud Storage

```bash
# Upload backup
gsutil cp backup.sql gs://shadow-coach-backups/

# Download backup
gsutil cp gs://shadow-coach-backups/backup.sql ./backup.sql
```

---

## 📈 Monitoring

### Backup Status

Check backup logs:
```bash
# View backup log
tail -f logs/backup.log

# Check last backup
ls -lh backups/ | tail -5
```

### Backup Alerts

Set up alerts for:
- Failed backups
- Missing backups
- Backup size anomalies
- Storage space issues

---

## 🧪 Testing Recovery

### Monthly Recovery Test

1. **Create test environment**
   ```bash
   # Set up test database
   createdb shadow_coach_test
   ```

2. **Restore backup**
   ```bash
   FORCE_RESTORE=true DB_NAME=shadow_coach_test node scripts/restore-database.js backup-<latest>.sql
   ```

3. **Verify data**
   ```bash
   # Check data integrity
   # Verify record counts
   # Test application
   ```

4. **Document results**
   - Record test date
   - Note any issues
   - Update procedures if needed

---

## 📝 Backup Checklist

### Daily
- [ ] Verify backup completed successfully
- [ ] Check backup file size
- [ ] Verify backup in storage

### Weekly
- [ ] Verify backup integrity
- [ ] Check backup retention
- [ ] Review backup logs

### Monthly
- [ ] Test restore procedure
- [ ] Review backup strategy
- [ ] Update documentation

### Quarterly
- [ ] Review disaster recovery plan
- [ ] Test complete recovery
- [ ] Update backup procedures

---

## 🐛 Troubleshooting

### Backup Fails

**Error:** `pg_dump: connection to database failed`

**Solution:**
- Check database connection settings
- Verify database is running
- Check network connectivity
- Verify credentials

### Restore Fails

**Error:** `psql: FATAL: database does not exist`

**Solution:**
```bash
# Create database first
createdb -h localhost -U postgres shadow_coach
# Then restore
```

### Backup Too Large

**Solution:**
- Enable compression: `COMPRESS_BACKUP=true`
- Use incremental backups
- Archive old backups

### Insufficient Storage

**Solution:**
- Clean up old backups
- Increase storage
- Use cloud storage
- Compress backups

---

## 📚 Resources

- [PostgreSQL Backup Documentation](https://www.postgresql.org/docs/current/backup.html)
- [pg_dump Manual](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Disaster Recovery Planning](https://www.postgresql.org/docs/current/backup-dump.html)

---

**Backup system is ready!** 🎯

For questions, see backup scripts in `backend/scripts/` or check the recovery procedures above.

