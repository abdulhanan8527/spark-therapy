#!/usr/bin/env node
/*
 * Enhanced server startup script for SPARKTherapy backend
 * This script ensures proper startup with database connection checks
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if MongoDB is running
function checkMongoDB() {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(2000); // 2 second timeout
    
    socket.on('connect', () => {
      console.log('✅ MongoDB appears to be running on localhost:27017');
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log('⚠️ MongoDB connection timed out. Make sure MongoDB is installed and running.');
      console.log('💡 To start MongoDB:');
      console.log('   - Windows: Start MongoDB service from Services or run "net start MongoDB"');
      console.log('   - macOS: Run "brew services start mongodb-community"');
      console.log('   - Linux: Run "sudo systemctl start mongod"');
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log('⚠️ MongoDB is not running on localhost:27017');
      console.log('💡 To start MongoDB:');
      console.log('   - Windows: Start MongoDB service from Services or run "net start MongoDB"');
      console.log('   - macOS: Run "brew services start mongodb-community"');
      console.log('   - Linux: Run "sudo systemctl start mongod"');
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(27017, 'localhost');
  });
}

async function startServer() {
  console.log('🚀 Starting SPARKTherapy Backend Server...\n');
  
  // Check if MongoDB is running
  const isMongoRunning = await checkMongoDB();
  
  if (!isMongoRunning) {
    console.log('\n⚠️ Warning: MongoDB is not running. The server will start but may run in mock mode.\n');
  }
  
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating default .env file...');
    const defaultEnv = `NODE_ENV=development
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/spark_therapy
JWT_SECRET=spark_therapy_jwt_secret_key
JWT_EXPIRE=7d
`;
    fs.writeFileSync(envPath, defaultEnv);
    console.log('✅ Default .env file created');
  }
  
  // Load environment variables to get the actual port
  require('dotenv').config();
  const actualPort = process.env.PORT || 5000;
  
  console.log(`📡 Starting server on port ${actualPort}...`);
  console.log(`🌐 Access the API at: http://localhost:${actualPort}`);
  console.log(`🔍 API health check: http://localhost:${actualPort}/api/health\n`);
  
  // Start the server using nodemon for development
  const server = spawn('npx', ['nodemon', 'server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (err) => {
    console.error('❌ Failed to start server:', err.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   - Make sure port 5000 is not in use');
    console.log('   - Check if MongoDB is installed and running');
    console.log('   - Verify your .env file has correct configuration');
  });

  // Handle termination signals
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit();
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit();
  });
}

startServer().catch(console.error);