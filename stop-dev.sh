#!/bin/bash

# Stop Development Servers

echo "Stopping development servers..."

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$SCRIPT_DIR"

# Check if PID files exist
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "Stopping Backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID
    else
        echo "Backend process not running"
    fi
    rm .backend.pid
else
    echo "No backend PID file found"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "Stopping Frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID
    else
        echo "Frontend process not running"
    fi
    rm .frontend.pid
else
    echo "No frontend PID file found"
fi

echo "Servers stopped!"
