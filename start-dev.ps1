# SPARKTherapy Development Server Startup Script
# Run with: .\start-dev.ps1

# Colors
$host.UI.RawUI.ForegroundColor = "Green"
Write-Host "============================================================"
Write-Host "  SPARKTherapy Development Environment"
Write-Host "============================================================"
$host.UI.RawUI.ForegroundColor = "White"

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion"
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion"
} catch {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    pause
    exit 1
}

# Check for port conflicts
Write-Host "⚠️  Checking for processes on port 8081..." -ForegroundColor Yellow
try {
    $processes = Get-NetTCPConnection -LocalPort 8081 -ErrorAction Stop
    if ($processes) {
        Write-Host "⚠️  Killing processes on port 8081..." -ForegroundColor Yellow
        $processes | ForEach-Object {
            $pid = $_.OwningProcess
            if ($pid -ne $PID) {  # Don't kill ourselves
                try {
                    Stop-Process -Id $pid -Force -ErrorAction Stop
                    Write-Host "Killed process ID: $pid" -ForegroundColor Green
                } catch {
                    # Process might have already ended, which is fine
                    Write-Host "Process $pid was already terminated" -ForegroundColor Gray
                }
            }
        }
        Start-Sleep -Seconds 2
    }
} catch {
    # No process found on port 8081, which is fine
    Write-Host "No active process found on port 8081" -ForegroundColor Gray
}

# Start the development servers
Write-Host "🚀 Starting development servers..." -ForegroundColor Cyan
node start-dev-servers.js

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")