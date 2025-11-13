#!/bin/bash
# Automated Backup Scheduler
# Schedule database backups using cron

BACKUP_SCRIPT="$(dirname "$0")/backup-database.js"
CRON_SCHEDULE="${1:-0 2 * * *}"  # Default: 2 AM daily

# Get absolute path
BACKUP_SCRIPT_ABS=$(cd "$(dirname "$0")" && pwd)/backup-database.js

echo "📅 Setting up automated backups..."
echo "Schedule: $CRON_SCHEDULE"
echo "Script: $BACKUP_SCRIPT_ABS"
echo ""

# Add to crontab
(crontab -l 2>/dev/null | grep -v "$BACKUP_SCRIPT_ABS"; echo "$CRON_SCHEDULE cd $(dirname "$BACKUP_SCRIPT_ABS") && node backup-database.js >> logs/backup.log 2>&1") | crontab -

echo "✅ Backup scheduled successfully!"
echo ""
echo "Current crontab:"
crontab -l | grep -E "(backup|BACKUP)" || echo "  (no backup entries found)"

