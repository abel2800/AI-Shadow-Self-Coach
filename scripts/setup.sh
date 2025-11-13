#!/bin/bash

# Project Setup Script
# Sets up the entire project

echo "🚀 Setting up AI Shadow-Self Coach Project"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check Python
echo "2. Checking Python..."
if command -v python3 &> /dev/null; then
    echo -e "${GREEN}✅ Python: $(python3 --version)${NC}"
else
    echo -e "${YELLOW}⚠️  Python 3 not found. Please install Python 3.8+${NC}"
fi

# Setup Backend
echo ""
echo "3. Setting up Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
    echo -e "${YELLOW}   ⚠️  Please edit backend/.env with your configuration${NC}"
fi
cd ..

# Setup Mobile
echo ""
echo "4. Setting up Mobile..."
cd mobile
if [ ! -d "node_modules" ]; then
    echo "   Installing dependencies..."
    npm install
fi
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
fi
cd ..

# Setup ML
echo ""
echo "5. Setting up ML..."
cd ml
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi
echo "   Activating virtual environment..."
source venv/bin/activate
if [ ! -f ".env" ]; then
    echo "   Creating .env file..."
    cp .env.example .env
fi
echo "   Installing dependencies..."
pip install -r requirements.txt
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with database and API keys"
echo "2. Create database: createdb ai"
echo "3. Run: cd backend && npm run db:create-tables"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start mobile: cd mobile && npm start"

