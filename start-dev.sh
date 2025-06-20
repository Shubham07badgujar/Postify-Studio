#!/bin/bash

# Postify Studio Development Startup Script

echo "🚀 Starting Postify Studio Development Environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if MongoDB is running (optional - works with cloud MongoDB too)
if command_exists mongod; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running. Starting MongoDB..."
        mongod --fork --logpath /var/log/mongodb.log
    else
        echo "✅ MongoDB is already running"
    fi
fi

# Start backend
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found in backend. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please configure your .env file with your actual values"
fi

echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Start frontend
echo "🎨 Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found in frontend. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please configure your .env file with your actual values"
fi

echo "🌐 Starting frontend development server..."
npm run dev &
FRONTEND_PID=$!

# Wait for servers to start
sleep 3

echo ""
echo "🎉 Postify Studio is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "📊 API Health: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to catch Ctrl+C and cleanup
trap cleanup INT

# Wait for background processes
wait
