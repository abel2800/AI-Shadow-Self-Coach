# Project Setup Script (PowerShell)
# Sets up the entire project

Write-Host "🚀 Setting up AI Shadow-Self Coach Project" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Node.js not found. Please install Node.js 18+" -ForegroundColor Yellow
    exit 1
}

# Check Python
Write-Host "2. Checking Python..." -ForegroundColor Yellow
if (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonVersion = python --version
    Write-Host "   ✅ Python: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Python 3 not found. Please install Python 3.8+" -ForegroundColor Yellow
}

# Setup Backend
Write-Host ""
Write-Host "3. Setting up Backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install
}
if (-not (Test-Path ".env")) {
    Write-Host "   Creating .env file..." -ForegroundColor Gray
    Copy-Item .env.example .env
    Write-Host "   ⚠️  Please edit backend/.env with your configuration" -ForegroundColor Yellow
}
Set-Location ..

# Setup Mobile
Write-Host ""
Write-Host "4. Setting up Mobile..." -ForegroundColor Yellow
Set-Location mobile
if (-not (Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install
}
if (-not (Test-Path ".env")) {
    Write-Host "   Creating .env file..." -ForegroundColor Gray
    Copy-Item .env.example .env
}
Set-Location ..

# Setup ML
Write-Host ""
Write-Host "5. Setting up ML..." -ForegroundColor Yellow
Set-Location ml
if (-not (Test-Path "venv")) {
    Write-Host "   Creating virtual environment..." -ForegroundColor Gray
    python -m venv venv
}
Write-Host "   Activating virtual environment..." -ForegroundColor Gray
& .\venv\Scripts\Activate.ps1
if (-not (Test-Path ".env")) {
    Write-Host "   Creating .env file..." -ForegroundColor Gray
    Copy-Item .env.example .env
}
Write-Host "   Installing dependencies..." -ForegroundColor Gray
pip install -r requirements.txt
Set-Location ..

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit backend/.env with database and API keys"
Write-Host "2. Create database: createdb ai"
Write-Host "3. Run: cd backend; npm run db:create-tables"
Write-Host "4. Start backend: cd backend; npm run dev"
Write-Host "5. Start mobile: cd mobile; npm start"

