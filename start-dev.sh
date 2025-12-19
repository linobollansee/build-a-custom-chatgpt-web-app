#!/bin/bash

# Start Development Servers
# Starts both backend and frontend in the background

echo "========================================"
echo "  Starting Development Servers"
echo "========================================"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Start Backend Server
echo -e "${YELLOW}Starting Backend Server...${NC}"
cd "$SCRIPT_DIR/backend"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait a moment to let backend start first
sleep 2

# Start Frontend Server
echo -e "${YELLOW}Starting Frontend Server...${NC}"
cd "$SCRIPT_DIR/frontend"
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Save PIDs to file for easy stopping
cd "$SCRIPT_DIR"
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Development Servers Started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}Backend:  http://localhost:3000${NC}"
echo -e "${CYAN}Frontend: http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Logs:${NC}"
echo "  Backend:  tail -f backend/backend.log"
echo "  Frontend: tail -f frontend/frontend.log"
echo ""
echo -e "${YELLOW}To stop servers:${NC}"
echo "  Run: ./stop-dev.sh"
echo "  Or:  kill $BACKEND_PID $FRONTEND_PID"
echo ""
