#!/bin/bash
# Permanent backend startup script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting SPARKTherapy Backend Permanently${NC}"

# Function to check if MongoDB is running
check_mongodb() {
    if ! pgrep -x "mongod" > /dev/null; then
        echo -e "${YELLOW}⚠️  Starting MongoDB...${NC}"
        sudo systemctl start mongod
        sleep 5
    fi
    
    if mongosh --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ MongoDB is running${NC}"
        return 0
    else
        echo -e "${RED}❌ MongoDB failed to start${NC}"
        return 1
    fi
}

# Function to start backend with auto-restart
start_backend() {
    local backend_dir="/home/abdul-hanan/Downloads/New/SPARKTherapy/backend"
    
    if [ ! -d "$backend_dir" ]; then
        echo -e "${RED}❌ Backend directory not found: $backend_dir${NC}"
        return 1
    fi
    
    cd "$backend_dir"
    
    # Kill any existing backend processes
    pkill -f "node.*start-server.js" 2>/dev/null
    pkill -f "nodemon.*server.js" 2>/dev/null
    
    echo -e "${YELLOW}🔄 Starting backend server...${NC}"
    
    # Start backend in background with logging
    nohup npm run dev > backend.log 2>&1 &
    local backend_pid=$!
    
    # Wait for startup
    sleep 10
    
    # Check if backend is responding
    if curl -f http://localhost:5001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend server started successfully (PID: $backend_pid)${NC}"
        echo -e "${GREEN}🌐 Server available at: http://localhost:5001${NC}"
        echo -e "${GREEN}📝 Logs saved to: $backend_dir/backend.log${NC}"
        return 0
    else
        echo -e "${RED}❌ Backend failed to start${NC}"
        echo "Check logs: tail -f $backend_dir/backend.log"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
    
    # Check MongoDB
    if ! check_mongodb; then
        echo -e "${RED}❌ Cannot start backend without MongoDB${NC}"
        exit 1
    fi
    
    # Start backend
    if start_backend; then
        echo -e "${GREEN}🎉 Backend is now running permanently!${NC}"
        echo -e "${YELLOW}💡 To stop: pkill -f \"node.*start-server.js\"${NC}"
        echo -e "${YELLOW}💡 To check logs: tail -f /home/abdul-hanan/Downloads/New/SPARKTherapy/backend/backend.log${NC}"
    else
        echo -e "${RED}❌ Failed to start backend${NC}"
        exit 1
    fi
}

# Run main function
main