@echo off
echo.
echo ====================================
echo   POSTIFY STUDIO EMAIL TESTER
echo ====================================
echo.

cd /d "%~dp0backend"

echo Checking if Node.js is installed...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking if npm packages are installed...
if not exist "node_modules" (
    echo Installing npm packages...
    npm install
)

echo.
echo Starting email configuration test...
echo.

node test-email.js

echo.
echo Test completed. Press any key to exit...
pause >nul
