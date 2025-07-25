#!/bin/bash

echo "🔍 Testing Backend Endpoints Locally..."

# Start the server in background
cd /Users/apple/Arena/lyzr-support-chat/backend
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

echo "Testing health endpoint..."
curl -s http://localhost:8080/health | jq '.' || echo "Health check failed"

echo "Testing demo page..."
curl -s http://localhost:8080/demo.html | head -20

echo "Testing widget endpoint..."
curl -s http://localhost:8080/api/widget/test/widget.js | head -10

echo "Testing static widget files..."
curl -s http://localhost:8080/widget/src/widget.js | head -10

# Stop the server
kill $SERVER_PID

echo "✅ Local testing completed!"
