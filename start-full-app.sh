#!/bin/bash
echo "Starting SPARKTherapy Full Application Stack..."

# Start backend server in background
echo "Starting backend server..."
cd /home/abdul-hanan/Downloads/New/SPARKTherapy/backend
gnome-terminal -- bash -c "node start-server.js; exec bash" &

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend web application..."
cd /home/abdul-hanan/Downloads/New/SPARKTherapy
gnome-terminal -- bash -c "npx expo start --web; exec bash" &

echo "Applications started!"
echo "Backend: http://localhost:5001"
echo "Frontend: http://localhost:8081"
echo ""
echo "Check the separate terminals for logs"