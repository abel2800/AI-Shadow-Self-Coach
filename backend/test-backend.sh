#!/bin/bash

# Backend Testing Script
# This script helps test the backend API setup

echo "🧪 Testing Shadow Coach Backend API"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "1. Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

# Check if npm is installed
echo "2. Checking npm installation..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm installed: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# Check if .env file exists
echo "3. Checking environment configuration..."
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env file found${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Check if node_modules exists
echo "4. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencies not installed. Installing...${NC}"
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
fi

# Check if PostgreSQL is accessible
echo "5. Checking database connection..."
if command -v psql &> /dev/null; then
    echo -e "${GREEN}✅ PostgreSQL client found${NC}"
    echo -e "${YELLOW}⚠️  Please ensure PostgreSQL is running and database 'shadow_coach' exists${NC}"
else
    echo -e "${YELLOW}⚠️  PostgreSQL client not found. Please install PostgreSQL${NC}"
fi

# Test server startup
echo ""
echo "6. Testing server startup..."
echo -e "${YELLOW}Starting server in background...${NC}"

# Start server in background
node server.js &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Check if server is running
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✅ Server started (PID: $SERVER_PID)${NC}"
    
    # Test health endpoint
    echo ""
    echo "7. Testing health endpoint..."
    sleep 2
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
    
    if [ ! -z "$HEALTH_RESPONSE" ]; then
        echo -e "${GREEN}✅ Health endpoint responding${NC}"
        echo "Response: $HEALTH_RESPONSE"
    else
        echo -e "${RED}❌ Health endpoint not responding${NC}"
    fi
    
    # Stop server
    echo ""
    echo "Stopping server..."
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null
    echo -e "${GREEN}✅ Server stopped${NC}"
else
    echo -e "${RED}❌ Server failed to start${NC}"
    exit 1
fi

echo ""
echo "===================================="
echo -e "${GREEN}✅ Backend setup test completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Create database: createdb shadow_coach"
echo "3. Run: npm run dev"
echo "4. Test API endpoints with curl or Postman"
