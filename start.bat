@echo off
REM Tier II Compliance Dashboard Startup Script

echo.
echo ========================================
echo Tier II Compliance Dashboard
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Navigate to project root directory
cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
    echo.
)

REM Start the server
echo Starting Tier II Compliance Dashboard Server...
echo.
echo The dashboard will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.

node server/server.js

pause
