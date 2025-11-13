# Automated Backup Scheduler (PowerShell)
# Schedule database backups using Windows Task Scheduler

param(
    [string]$Schedule = "Daily",  # Daily, Weekly, Hourly
    [string]$Time = "02:00"       # HH:MM format
)

$BackupScript = Join-Path $PSScriptRoot "backup-database.js"
$TaskName = "ShadowCoach-DatabaseBackup"
$Description = "Automated database backup for AI Shadow-Self Coach"

Write-Host "📅 Setting up automated backups..." -ForegroundColor Cyan
Write-Host "Schedule: $Schedule" -ForegroundColor Yellow
Write-Host "Time: $Time" -ForegroundColor Yellow
Write-Host "Script: $BackupScript" -ForegroundColor Yellow
Write-Host ""

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "⚠️  Task already exists. Removing old task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create trigger based on schedule
$trigger = switch ($Schedule.ToLower()) {
    "daily" {
        $triggerTime = [DateTime]::ParseExact($Time, "HH:mm", $null)
        New-ScheduledTaskTrigger -Daily -At $triggerTime
    }
    "weekly" {
        $triggerTime = [DateTime]::ParseExact($Time, "HH:mm", $null)
        New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $triggerTime
    }
    "hourly" {
        New-ScheduledTaskTrigger -Once -At ([DateTime]::Now.AddHours(1)) -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 365)
    }
    default {
        Write-Host "❌ Invalid schedule. Use: Daily, Weekly, or Hourly" -ForegroundColor Red
        exit 1
    }
}

# Create action
$action = New-ScheduledTaskAction -Execute "node" -Argument "`"$BackupScript`"" -WorkingDirectory $PSScriptRoot

# Create settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register task
Register-ScheduledTask -TaskName $TaskName -Description $Description -Action $action -Trigger $trigger -Settings $settings -RunLevel Highest

Write-Host "✅ Backup scheduled successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Task details:"
Get-ScheduledTask -TaskName $TaskName | Format-List

