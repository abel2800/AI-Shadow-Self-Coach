# Complete ML Training Pipeline (PowerShell)
# Expands dialogues, validates, and trains models

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

Write-Host "🚀 ML Training Pipeline" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

# Configuration
$TARGET_DIALOGUES = 500
$SEED_FILE = Join-Path $PROJECT_ROOT "SEED_DIALOGUES.json"
$EXPANDED_FILE = Join-Path $PROJECT_ROOT "data\SEED_DIALOGUES_EXPANDED.json"
$DATA_DIR = Join-Path $PROJECT_ROOT "data"

# Create data directory
if (-not (Test-Path $DATA_DIR)) {
    New-Item -ItemType Directory -Path $DATA_DIR | Out-Null
}

# Step 1: Expand dialogues
Write-Host ""
Write-Host "📝 Step 1: Expanding dialogues..." -ForegroundColor Yellow
python "$SCRIPT_DIR\tools\expand_seed_dialogues.py" `
  --input $SEED_FILE `
  --output $EXPANDED_FILE `
  --target $TARGET_DIALOGUES `
  --validate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dialogue expansion failed" -ForegroundColor Red
    exit 1
}

# Step 2: Validate
Write-Host ""
Write-Host "✅ Step 2: Validating dialogues..." -ForegroundColor Yellow
python "$SCRIPT_DIR\tools\validate_dialogues.py" `
  --input $EXPANDED_FILE

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Validation failed" -ForegroundColor Red
    exit 1
}

# Step 3: Train safety classifier
Write-Host ""
Write-Host "🛡️  Step 3: Training safety classifier..." -ForegroundColor Yellow
python "$SCRIPT_DIR\train_safety_classifier.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Safety classifier training failed" -ForegroundColor Red
    exit 1
}

# Step 4: Train intent classifier
Write-Host ""
Write-Host "🎯 Step 4: Training intent classifier..." -ForegroundColor Yellow
python "$SCRIPT_DIR\train_intent_classifier.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Intent classifier training failed" -ForegroundColor Red
    exit 1
}

# Step 5: Prepare persona model data
Write-Host ""
Write-Host "💬 Step 5: Preparing persona model training data..." -ForegroundColor Yellow
python "$SCRIPT_DIR\train_persona_model.py"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Persona model preparation failed" -ForegroundColor Red
    exit 1
}

# Step 6: Analyze results
Write-Host ""
Write-Host "📊 Step 6: Analyzing training results..." -ForegroundColor Yellow
python "$SCRIPT_DIR\analyze_training_results.py"

# Step 7: Test model inference
Write-Host ""
Write-Host "🧪 Step 7: Testing model inference..." -ForegroundColor Yellow
python "$SCRIPT_DIR\test_model_inference.py"

Write-Host ""
Write-Host "✅ Training pipeline complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review model performance (see analysis above)"
Write-Host "   2. Export to ONNX: python export_to_onnx.py"
Write-Host "   3. Deploy models to backend"
Write-Host "   4. Test in staging environment"

