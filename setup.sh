#!/bin/bash

# Spotify Clone Setup Script
# This script sets up both backend and frontend for development and production

set -e

echo "🎵 Spotify Clone - Setup Script"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
  echo -e "${YELLOW}Checking prerequisites...${NC}"
  
  if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Node.js $(node -v)${NC}"
  
  if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git not found${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ Git installed${NC}"
  
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
  fi
  echo -e "${GREEN}✓ npm $(npm -v)${NC}"
}

# Setup backend
setup_backend() {
  echo ""
  echo -e "${YELLOW}Setting up Backend...${NC}"
  
  if [ ! -d "backend" ]; then
    echo -e "${RED}✗ Backend folder not found${NC}"
    exit 1
  fi
  
  cd backend
  
  if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env from template${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your credentials:${NC}"
    echo "   - SPOTIFY_CLIENT_ID"
    echo "   - SPOTIFY_CLIENT_SECRET"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
  else
    echo -e "${GREEN}✓ .env file exists${NC}"
  fi
  
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
  else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
  fi
  
  cd ..
}

# Setup frontend
setup_frontend() {
  echo ""
  echo -e "${YELLOW}Setting up Frontend...${NC}"
  
  if [ ! -d "frontend" ]; then
    echo -e "${RED}✗ Frontend folder not found${NC}"
    exit 1
  fi
  
  cd frontend
  
  if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
  else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
  fi
  
  cd ..
}

# Start services
start_services() {
  echo ""
  echo -e "${YELLOW}To start the application:${NC}"
  echo ""
  echo "Terminal 1 - Backend:"
  echo "  cd backend && npm run start:dev"
  echo ""
  echo "Terminal 2 - Frontend:"
  echo "  cd frontend && npm start"
  echo ""
  echo -e "${GREEN}Backend will run on: http://localhost:3001${NC}"
  echo -e "${GREEN}Frontend will run on: http://localhost:4200${NC}"
}

# Main execution
main() {
  check_prerequisites
  setup_backend
  setup_frontend
  
  echo ""
  echo -e "${GREEN}✓ Setup complete!${NC}"
  start_services
}

main "$@"
