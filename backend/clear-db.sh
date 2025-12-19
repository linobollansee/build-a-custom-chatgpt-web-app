#!/bin/bash

# Clear Database and Restart Server
echo "========================================"
echo "  Clear Database & Restart Server"
echo "========================================"
echo ""

# Stop any running node/nodemon processes
echo "Stopping any running server processes..."
pkill -f "node.*server.js" 2>/dev/null || pkill nodemon 2>/dev/null || pkill node 2>/dev/null

if [ $? -eq 0 ]; then
    echo "  Server processes stopped"
    sleep 1
else
    echo "  No running server processes found"
fi

echo ""

# Remove the database file
echo "Deleting database file..."
if [ -f "chat.db" ]; then
    rm chat.db
    echo "  Database deleted successfully!"
else
    echo "  No database file found (chat.db doesn't exist)"
fi

echo ""
echo "Starting server with fresh database..."
echo "========================================"
echo ""

# Start the server
npm run dev
