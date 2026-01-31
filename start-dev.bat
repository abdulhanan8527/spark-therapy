@echo off
title SPARKTherapy Development Server
color 0A

echo.
echo ============================================================
echo   SPARKTherapy Development Environment
echo ============================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed
    pause
    exit /b 1
)

:: Kill any existing processes on port 8081
echo ⚠️  Checking for processes on port 8081...
for /f "skip=3 tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    if "%%a" neq "" (
        echo ⚠️  Killing processes on port 8081...
        taskkill /PID %%a /F >nul 2>&1
        if %errorlevel% equ 0 (
            echo Killed process ID: %%a
        ) else (
            echo Process %%a was already terminated or could not be killed
        )
    ) else (
        echo No active process found on port 8081
    )
)
timeout /t 2 /nobreak >nul

:: Start the development servers
echo 🚀 Starting development servers...
node start-dev-servers.js

pause