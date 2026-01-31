#!/bin/bash

echo "Starting SPARKTherapy Development Environment..."
echo

echo "Starting Backend Server..."
cd backend
node start-server.js &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

echo "Starting Frontend Development Server..."
npx react-native start &

echo
echo "Servers started:"
echo "Backend: http://localhost:5000"
echo "Frontend: Metro Bundler will start on http://localhost:8081"
echo
echo "To run the mobile app:"
echo "  - For Android: npx react-native run-android"
echo "  - For iOS: npx react-native run-ios"
echo

# Keep the script running
wait $BACKEND_PID