@echo off
REM Postify Studio Development Startup Script for Windows

echo 🚀 Starting Postify Studio Development Environment...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Start backend
echo 📦 Installing backend dependencies...
cd backend
if not exist "node_modules" (
    npm install
)

if not exist ".env" (
    echo ⚠️  No .env file found in backend. Copying from .env.example...
    copy .env.example .env
    echo ⚠️  Please configure your .env file with your actual values
)

echo 🔧 Starting backend server...
start "Backend Server" cmd /k "npm run dev"

REM Start frontend
echo 🎨 Installing frontend dependencies...
cd ..\frontend
if not exist "node_modules" (
    npm install
)

if not exist ".env" (
    echo ⚠️  No .env file found in frontend. Copying from .env.example...
    copy .env.example .env
    echo ⚠️  Please configure your .env file with your actual values
)

echo 🌐 Starting frontend development server...
start "Frontend Server" cmd /k "npm run dev"

REM Wait for servers to start
timeout /t 3 /nobreak >nul

echo.
echo 🎉 Postify Studio is now running!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 📊 API Health: http://localhost:5000/api/health
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open application in default browser
start http://localhost:3000

echo.
echo Development servers are running in separate windows.
echo Close those windows to stop the servers.
pause
