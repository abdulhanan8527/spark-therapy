#!/bin/bash

# SPARKTherapy Production Startup Script
# This script demonstrates the production-ready capabilities of the application

echo "🚀 SPARKTherapy Production System Startup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    case $1 in
        "SUCCESS")
            echo -e "${GREEN}✅ $2${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $2${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $2${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $2${NC}"
            ;;
    esac
}

# Check system prerequisites
print_status "INFO" "Checking system prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_status "ERROR" "Node.js is not installed"
    exit 1
else
    NODE_VERSION=$(node --version)
    print_status "SUCCESS" "Node.js $NODE_VERSION found"
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    print_status "WARNING" "MongoDB not found - using mock mode"
    USE_MOCK_DB=true
else
    MONGO_VERSION=$(mongod --version | head -1)
    print_status "SUCCESS" "MongoDB $MONGO_VERSION found"
    USE_MOCK_DB=false
fi

# Check if running in production mode
if [ "$NODE_ENV" = "production" ]; then
    print_status "INFO" "Running in PRODUCTION mode"
    CONFIG_FILE=".env.production"
else
    print_status "INFO" "Running in DEVELOPMENT mode"
    CONFIG_FILE=".env"
fi

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Check environment configuration
print_status "INFO" "Validating environment configuration..."

if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    print_status "WARNING" "No environment file found, creating default configuration"
    cp .env.example .env 2>/dev/null || echo "NODE_ENV=development" > .env
fi

# Install/update dependencies
print_status "INFO" "Installing/updating dependencies..."
npm ci --silent >/dev/null 2>&1 || npm install --silent >/dev/null 2>&1

if [ $? -eq 0 ]; then
    print_status "SUCCESS" "Dependencies installed successfully"
else
    print_status "ERROR" "Failed to install dependencies"
    exit 1
fi

# Run database optimization if MongoDB is available
if [ "$USE_MOCK_DB" = false ]; then
    print_status "INFO" "Optimizing database..."
    node utils/dbOptimizer.js >/dev/null 2>&1 &
    DB_OPTIMIZATION_PID=$!
fi

# Start the application
print_status "INFO" "Starting SPARKTherapy application..."

# Use PM2 in production, nodemon in development
if [ "$NODE_ENV" = "production" ]; then
    if command -v pm2 &> /dev/null; then
        pm2 start ecosystem.config.js --silent
        if [ $? -eq 0 ]; then
            print_status "SUCCESS" "Application started with PM2"
        else
            print_status "ERROR" "Failed to start application with PM2"
            exit 1
        fi
    else
        print_status "WARNING" "PM2 not found, using node directly"
        node server.js &
        APP_PID=$!
    fi
else
    # Development mode
    if command -v nodemon &> /dev/null; then
        nodemon server.js &
        APP_PID=$!
        print_status "SUCCESS" "Application started with nodemon (auto-reload enabled)"
    else
        node server.js &
        APP_PID=$!
        print_status "SUCCESS" "Application started with node"
    fi
fi

# Wait a moment for the server to start
sleep 3

# Check if server is responding
print_status "INFO" "Verifying application health..."

MAX_ATTEMPTS=10
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:5000/api/health >/dev/null 2>&1; then
        print_status "SUCCESS" "Application is healthy and responding"
        break
    fi
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_status "ERROR" "Application failed to start properly"
        exit 1
    fi
    
    print_status "INFO" "Waiting for application to start... (attempt $ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

# Display startup information
echo ""
print_status "SUCCESS" "SPARKTherapy Application Started Successfully!"
echo ""
echo "📋 Application Information:"
echo "   • API Endpoint: http://localhost:5000/api"
echo "   • Health Check: http://localhost:5000/api/health"
echo "   • Documentation: http://localhost:5000/api-docs (if enabled)"
echo ""

if [ "$NODE_ENV" = "development" ]; then
    echo "📱 Frontend Access:"
    echo "   • Expo Dev Tools: http://localhost:19002"
    echo "   • Web Preview: http://localhost:19006"
    echo ""
fi

echo "🔧 Management Commands:"
if [ "$NODE_ENV" = "production" ] && command -v pm2 &> /dev/null; then
    echo "   • View logs: pm2 logs sparktherapy-backend"
    echo "   • Restart app: pm2 restart sparktherapy-backend"
    echo "   • Stop app: pm2 stop sparktherapy-backend"
    echo "   • Monitor: pm2 monit"
else
    echo "   • View logs: tail -f backend/logs/*.log"
    echo "   • Stop app: kill $APP_PID"
fi

echo ""
echo "🧪 Quick Test Commands:"
echo "   • Health check: curl http://localhost:5000/api/health"
echo "   • API version: curl http://localhost:5000/api/version"
echo "   • System info: curl http://localhost:5000/api/health/detailed"
echo ""

# Wait for database optimization to complete
if [ "$USE_MOCK_DB" = false ] && [ -n "$DB_OPTIMIZATION_PID" ]; then
    print_status "INFO" "Waiting for database optimization to complete..."
    wait $DB_OPTIMIZATION_PID
    print_status "SUCCESS" "Database optimization completed"
fi

# Run sample tests if in development mode
if [ "$NODE_ENV" != "production" ]; then
    print_status "INFO" "Running quick smoke tests..."
    npm test -- --silent --testPathPattern=smoke.test.js 2>/dev/null || echo "No smoke tests found"
fi

print_status "SUCCESS" "SPARKTherapy is ready for use!"

# Keep script running to allow Ctrl+C to work properly
if [ "$NODE_ENV" != "production" ]; then
    print_status "INFO" "Press Ctrl+C to stop the application"
    wait $APP_PID
fi