@echo off
:: SPARKTherapy Production Startup Script for Windows
:: This script demonstrates the production-ready capabilities of the application

title SPARKTherapy Production System Startup

echo 🚀 SPARKTherapy Production System Startup
echo ==========================================

:: Check system prerequisites
echo ℹ️  Checking system prerequisites...

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo ✅ Node.js %NODE_VERSION% found
)

:: Check MongoDB
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB not found - using mock mode
    set USE_MOCK_DB=true
) else (
    for /f "tokens=*" %%i in ('mongod --version ^| findstr "db version"') do set MONGO_VERSION=%%i
    echo ✅ MongoDB found
    set USE_MOCK_DB=false
)

:: Check if running in production mode
if "%NODE_ENV%"=="production" (
    echo ℹ️  Running in PRODUCTION mode
    set CONFIG_FILE=.env.production
) else (
    echo ℹ️  Running in DEVELOPMENT mode
    set CONFIG_FILE=.env
)

:: Navigate to backend directory
cd /d "%~dp0backend"

:: Check environment configuration
echo ℹ️  Validating environment configuration...

if not exist ".env" if not exist ".env.local" (
    echo ⚠️  No environment file found, creating default configuration
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
    ) else (
        echo NODE_ENV=development > ".env"
    )
)

:: Install/update dependencies
echo ℹ️  Installing/updating dependencies...
call npm ci --silent >nul 2>&1
if %errorlevel% neq 0 (
    call npm install --silent >nul 2>&1
)

if %errorlevel% equ 0 (
    echo ✅ Dependencies installed successfully
) else (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

:: Run database optimization if MongoDB is available
if "%USE_MOCK_DB%"=="false" (
    echo ℹ️  Optimizing database...
    start /b node utils/dbOptimizer.js >nul 2>&1
)

:: Start the application
echo ℹ️  Starting SPARKTherapy application...

:: Use PM2 in production, nodemon in development
if "%NODE_ENV%"=="production" (
    pm2 --version >nul 2>&1
    if %errorlevel% equ 0 (
        pm2 start ecosystem.config.js --silent >nul 2>&1
        if %errorlevel% equ 0 (
            echo ✅ Application started with PM2
        ) else (
            echo ❌ Failed to start application with PM2
            pause
            exit /b 1
        )
    ) else (
        echo ⚠️  PM2 not found, using node directly
        start /b node server.js
        set APP_PID=%errorlevel%
    )
) else (
    :: Development mode
    nodemon --version >nul 2>&1
    if %errorlevel% equ 0 (
        start /b nodemon server.js
        echo ✅ Application started with nodemon (auto-reload enabled)
    ) else (
        start /b node server.js
        echo ✅ Application started with node
    )
)

:: Wait a moment for the server to start
timeout /t 3 /nobreak >nul

:: Check if server is responding
echo ℹ️  Verifying application health...

set MAX_ATTEMPTS=10
set ATTEMPT=1

:health_check
powershell -Command "try { $resp = Invoke-WebRequest -Uri 'http://localhost:5000/api/health' -UseBasicParsing -TimeoutSec 5; exit 0 } catch { exit 1 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is healthy and responding
    goto :startup_complete
)

if %ATTEMPT% equ %MAX_ATTEMPTS% (
    echo ❌ Application failed to start properly
    pause
    exit /b 1
)

echo ℹ️  Waiting for application to start... (attempt %ATTEMPT%/%MAX_ATTEMPTS%)
timeout /t 2 /nobreak >nul
set /a ATTEMPT+=1
goto :health_check

:startup_complete
:: Display startup information
echo.
echo ✅ SPARKTherapy Application Started Successfully!
echo.
echo 📋 Application Information:
echo    • API Endpoint: http://localhost:5000/api
echo    • Health Check: http://localhost:5000/api/health
echo    • Documentation: http://localhost:5000/api-docs (if enabled)
echo.

if not "%NODE_ENV%"=="production" (
    echo 📱 Frontend Access:
    echo    • Expo Dev Tools: http://localhost:19002
    echo    • Web Preview: http://localhost:19006
    echo.
)

echo 🔧 Management Commands:
if "%NODE_ENV%"=="production" (
    pm2 --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo    • View logs: pm2 logs sparktherapy-backend
        echo    • Restart app: pm2 restart sparktherapy-backend
        echo    • Stop app: pm2 stop sparktherapy-backend
        echo    • Monitor: pm2 monit
    )
) else (
    echo    • View logs: Check backend/logs/ directory
    echo    • Stop app: Use Task Manager to end Node.js processes
)

echo.
echo 🧪 Quick Test Commands:
echo    • Health check: curl http://localhost:5000/api/health
echo    • PowerShell test: Invoke-WebRequest -Uri "http://localhost:5000/api/health"
echo.

:: Run sample tests if in development mode
if not "%NODE_ENV%"=="production" (
    echo ℹ️  Running quick smoke tests...
    npm test -- --silent --testPathPattern=smoke.test.js 2>nul
)

echo ✅ SPARKTherapy is ready for use!

:: Keep window open
if not "%NODE_ENV%"=="production" (
    echo.
    echo ℹ️  Press any key to stop the application and close this window
    pause >nul
    
    :: Stop the application
    taskkill /f /im node.exe >nul 2>&1
    echo ✅ Application stopped
)

exit /b 0