# Run complete dialogue expansion workflow (PowerShell)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $ScriptDir)

Write-Host "🚀 Starting Dialogue Expansion Workflow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Configuration
$TargetCount = 500
$SeedFile = Join-Path $ProjectRoot "SEED_DIALOGUES.json"
$ExpandedFile = Join-Path $ProjectRoot "data\SEED_DIALOGUES_EXPANDED.json"
$ValidatedFile = Join-Path $ProjectRoot "data\SEED_DIALOGUES_VALIDATED.json"

# Create data directory
$DataDir = Join-Path $ProjectRoot "data"
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

# Step 1: Expand dialogues
Write-Host ""
Write-Host "📝 Step 1: Expanding dialogues to $TargetCount..." -ForegroundColor Yellow
python "$ScriptDir\expand_seed_dialogues.py" `
  --input "$SeedFile" `
  --output "$ExpandedFile" `
  --target $TargetCount `
  --validate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Expansion failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Validate expanded dialogues
Write-Host ""
Write-Host "✅ Step 2: Validating expanded dialogues..." -ForegroundColor Yellow
python "$ScriptDir\validate_dialogues.py" `
  --input "$ExpandedFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Expansion complete!" -ForegroundColor Green
    Write-Host "   Output: $ExpandedFile" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Review expanded dialogues"
    Write-Host "   2. Run clinician review"
    Write-Host "   3. Use for model training"
} else {
    Write-Host ""
    Write-Host "❌ Validation failed. Please review errors above." -ForegroundColor Red
    exit 1
}

