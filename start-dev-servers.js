#!/usr/bin/env node
/*
 * Development startup script for SPARKTherapy
 * This script helps start both backend and frontend servers with robust error handling
 */
const { spawn, exec } = require('child_process');
const path = require('path');
const os = require('os');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

const log = (msg, color = 'reset') => {
  console.log(`${colors[color] || ''}${msg}${colors.reset}`);
};
const success = msg => log(msg, 'green');
const info = msg => log(msg, 'blue');
const warning = msg => log(msg, 'yellow');
const error = msg => log(msg, 'red');
const cmd = msg => log(`$ ${msg}`, 'magenta');
const dim = msg => log(msg, 'gray');

// Check if a port is in use
const isPortInUse = (port) => {
  return new Promise((resolve) => {
    const command = os.platform() === 'win32'
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port}`;

    exec(command, (err, stdout) => {
      if (err || !stdout) {
        resolve(false);
        return;
      }
      resolve(true);
    });
  });
};

// Kill process on a port (Windows only)
const killPort = async (port) => {
  if (os.platform() !== 'win32') {
    warning(`Killing processes on port ${port} is only supported on Windows`);
    return;
  }

  try {
    const { stdout } = await new Promise((resolve, reject) => {
      exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
        if (err) {
          // No process found on port, which is fine
          resolve({ stdout: '' });
        } else {
          resolve({ stdout });
        }
      });
    });

    if (!stdout) {
      dim(`No active process found on port ${port}`);
      return;
    }

    const lines = stdout.split('\n').filter(line => line.includes('LISTENING'));
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        try {
          await new Promise((resolve, reject) => {
            exec(`taskkill /PID ${pid} /F`, (err) => {
              if (err) {
                // Process might have already ended, which is fine
                dim(`Process ${pid} was already terminated or could not be killed`);
                resolve();
              } else {
                success(`Killed process ${pid} on port ${port}`);
                resolve();
              }
            });
          });
        } catch (err) {
          dim(`Process ${pid} was already terminated`);
        }
      }
    }
  } catch (err) {
    dim(`Could not check port ${port}: ${err.message}`);
  }
};

// Start backend server
const startBackend = async () => {
  info('\n🚀 Starting backend server...');
  cmd('cd backend && npm start');

  const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'pipe',
    shell: true
  });

  backend.stdout.on('data', (data) => {
    const output = data.toString();
    if (output.includes('Server running') || output.includes('Listening')) {
      success('✅ Backend server is running');
    }
    process.stdout.write(colors.gray + output + colors.reset);
  });

  backend.stderr.on('data', (data) => {
    process.stderr.write(colors.gray + data.toString() + colors.reset);
  });

  backend.on('error', (err) => {
    error(`❌ Failed to start backend: ${err.message}`);
  });

  backend.on('close', (code) => {
    if (code !== 0) {
      error(`❌ Backend server exited with code ${code}`);
    }
  });

  return backend;
};

// Start Expo/Metro server
const startFrontend = async () => {
  info('\n📱 Starting mobile development server...');
  cmd('npx expo start --clear');

  const frontend = spawn('npx', ['expo', 'start', '--clear', '--web'], {
    cwd: __dirname,
    stdio: 'pipe',
    shell: true
  });

  let metroStarted = false;

  frontend.stdout.on('data', (data) => {
    const output = data.toString();

    // Check for Metro startup
    if (output.includes('Metro is ready') || output.includes('Welcome to Expo')) {
      if (!metroStarted) {
        metroStarted = true;
        success('✅ Metro bundler is ready');
        info('\n📱 To run on:');
        info('   • Android: Scan the QR code with Expo Go app');
        info('   • iOS: Scan the QR code with Camera app');
        info('   • Web: Press w in the terminal');
        info('\n💡 Development server is running at:');
        info('   http://localhost:8081');
      }
    }

    // Filter out verbose logs
    if (!output.includes('transform') && !output.includes('bundle')) {
      process.stdout.write(colors.gray + output + colors.reset);
    }
  });

  frontend.stderr.on('data', (data) => {
    const output = data.toString();
    if (output.includes('error') || output.includes('Error')) {
      process.stderr.write(colors.red + output + colors.reset);
    } else {
      process.stderr.write(colors.gray + output + colors.reset);
    }
  });

  frontend.on('error', (err) => {
    error(`❌ Failed to start frontend: ${err.message}`);
  });

  frontend.on('close', (code) => {
    if (code !== 0) {
      error(`❌ Frontend server exited with code ${code}`);
    }
  });

  return frontend;
};

// Main startup function
const start = async () => {
  console.clear();
  log('='.repeat(60), 'bright');
  log('  SPARKTherapy Development Environment', 'cyan');
  log('='.repeat(60), 'bright');

  try {
    // Check for port conflicts
    const port8081InUse = await isPortInUse(8081);
    if (port8081InUse) {
      warning('⚠️  Port 8081 is in use. Attempting to free it...');
      await killPort(8081);
      // Wait a moment for the port to be released
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Start backend
    const backendProcess = await startBackend();

    // Wait for backend to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Start frontend
    const frontendProcess = await startFrontend();

    // Graceful shutdown
    process.on('SIGINT', () => {
      info('\n\n🛑 Shutting down servers...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      info('\n\n🛑 Shutting down servers...');
      backendProcess.kill();
      frontendProcess.kill();
      process.exit(0);
    });

  } catch (err) {
    error(`❌ Startup failed: ${err.message}`);
    process.exit(1);
  }
};

// Run the startup
start();