# Production Model Deployment Script (PowerShell)

param(
    [Parameter(Mandatory=$true)]
    [string]$ModelType,
    
    [Parameter(Mandatory=$true)]
    [string]$ModelVersion,
    
    [string]$Environment = "production"
)

Write-Host "🚀 Deploying model to $Environment..." -ForegroundColor Cyan
Write-Host "   Type: $ModelType" -ForegroundColor Yellow
Write-Host "   Version: $ModelVersion" -ForegroundColor Yellow
Write-Host ""

# Validate model exists
$ModelPath = "models\$ModelType\$ModelVersion"
if (-not (Test-Path $ModelPath)) {
    Write-Host "❌ Model not found: $ModelPath" -ForegroundColor Red
    exit 1
}

# Run health checks
Write-Host "🔍 Running health checks..." -ForegroundColor Cyan
python -c @"
from utils.model_registry import ModelRegistry
registry = ModelRegistry()
info = registry.get_model_info('$ModelType', '$ModelVersion')
if not info:
    print('❌ Model not registered')
    exit(1)
print('✅ Model registered')
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Health check failed" -ForegroundColor Red
    exit 1
}

# Deploy model
Write-Host "📦 Deploying model..." -ForegroundColor Cyan
python -c @"
from utils.model_registry import ModelRegistry
registry = ModelRegistry()
registry.deploy_model('$ModelType', '$ModelVersion', '$Environment')
print('✅ Model deployed to $Environment')
"@

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

# Verify deployment
Write-Host "✅ Verifying deployment..." -ForegroundColor Cyan
$DeployedVersion = python -c @"
from utils.model_registry import ModelRegistry
registry = ModelRegistry()
print(registry.get_deployed_version('$ModelType', '$Environment'))
"@

if ($DeployedVersion -ne $ModelVersion) {
    Write-Host "❌ Deployment verification failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Model deployed successfully!" -ForegroundColor Green
Write-Host "   Type: $ModelType" -ForegroundColor Yellow
Write-Host "   Version: $ModelVersion" -ForegroundColor Yellow
Write-Host "   Environment: $Environment" -ForegroundColor Yellow

