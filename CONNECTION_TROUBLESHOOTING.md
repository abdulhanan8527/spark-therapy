# Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. `ERR_CONNECTION_REFUSED` on http://localhost:8081

**Problem**: The Metro bundler is not running or there's a port conflict.

**Solutions**:

#### Option A: Use the new startup script (Recommended)
```bash
# Windows (Command Prompt)
start-dev.bat

# Windows (PowerShell)
.\start-dev.ps1

# Cross-platform (Node.js)
npm run dev
```

#### Option B: Manual startup with port cleanup
```bash
# Kill any processes on port 8081
taskkill /f /im node.exe  # Windows
# OR
lsof -ti:8081 | xargs kill -9  # macOS/Linux

# Clear Metro cache
npx react-native start --reset-cache

# Start the server
npx expo start --clear
```

### 2. Metro Bundler Won't Start

**Check these first**:
1. Ensure Node.js is installed (`node --version`)
2. Ensure npm is installed (`npm --version`)
3. Check if port 8081 is in use (`netstat -ano | findstr :8081`)
4. Clear Metro cache: `npx react-native start --reset-cache`

### 3. QR Code Not Scanning

**Solutions**:
1. Ensure your phone and computer are on the same Wi-Fi network
2. Check firewall settings - allow Node.js through Windows Firewall
3. Try using the tunnel option: `npx expo start --tunnel`

### 4. App Crashes on Startup

**Solutions**:
1. Clear app data/cache in Expo Go app
2. Reinstall Expo Go app
3. Check for JavaScript errors in the terminal
4. Ensure all dependencies are installed: `npm install`

### 5. Backend API Not Responding

**Check**:
1. Backend server is running (`npm run backend`)
2. Correct API URL in `src/config/env.js`
3. No port conflicts on backend port (usually 5000)

## Permanent Fix Checklist

✅ **Create startup scripts**:
- `start-dev.bat` for Windows Command Prompt
- `start-dev.ps1` for Windows PowerShell
- `npm run dev` for cross-platform

✅ **Add port conflict resolution**:
- Scripts automatically kill processes on port 8081
- Clear Metro cache on startup
- Check for Node.js and npm installation

✅ **Improve error handling**:
- Colored terminal output
- Clear status messages
- Graceful shutdown handling

## Firewall Configuration (Windows)

If you're still having connection issues:

1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change settings" and then "Allow another app"
4. Browse to your Node.js installation (usually `C:\Program Files\nodejs\node.exe`)
5. Add it and allow both private and public networks

## Network Configuration

For development, ensure:
- Phone and computer are on the same network
- No VPN interference
- Router allows local network communication

## Quick Diagnostics

Run this to check your environment:
```bash
node --version
npm --version
netstat -ano | findstr :8081
```

If you see output from the last command, a process is using port 8081 and needs to be killed.

## Still Having Issues?

1. Restart your computer
2. Reinstall Node.js
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
5. Check GitHub issues or contact support