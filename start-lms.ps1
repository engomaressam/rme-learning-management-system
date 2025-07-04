# RME Learning Management System Startup Script
# PowerShell version

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "            RME Learning Management System" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Starting servers... Please wait..." -ForegroundColor Yellow
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

try {
    # Step 1: Build shared package
    Write-Host "[1/4] Building shared package..." -ForegroundColor Green
    Set-Location "$ScriptDir\shared"
    $result = & npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build shared package"
    }
    Write-Host "✅ Shared package built successfully" -ForegroundColor Green

    # Step 2: Start backend server
    Write-Host ""
    Write-Host "[2/4] Starting Backend Server..." -ForegroundColor Green
    Set-Location "$ScriptDir\backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\backend'; npm run dev" -WindowStyle Normal
    Write-Host "✅ Backend server starting..." -ForegroundColor Green
    Start-Sleep -Seconds 8

    # Step 3: Build frontend
    Write-Host ""
    Write-Host "[3/4] Building Frontend..." -ForegroundColor Green
    Set-Location "$ScriptDir\frontend"
    $result = & npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build frontend"
    }
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green

    # Step 4: Start frontend server
    Write-Host ""
    Write-Host "[4/4] Starting Frontend Server..." -ForegroundColor Green
    Set-Location "$ScriptDir\frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\frontend'; node server.js" -WindowStyle Normal
    Write-Host "✅ Frontend server starting..." -ForegroundColor Green
    Start-Sleep -Seconds 5

    # Success message
    Write-Host ""
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host "   🎉 RME LMS is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Backend:  http://10.10.11.243:3001" -ForegroundColor White
    Write-Host "   Frontend: http://10.10.11.243:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "   Opening browser in 3 seconds..." -ForegroundColor Yellow
    Write-Host "=======================================================" -ForegroundColor Cyan

    # Open browser
    Start-Sleep -Seconds 3
    Start-Process "http://10.10.11.243:5173"
    
    Write-Host ""
    Write-Host "✅ Browser opened successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 System started successfully!" -ForegroundColor Green
    Write-Host "📝 Login credentials:" -ForegroundColor Cyan
    Write-Host "   Admin: admin@company.com / admin123" -ForegroundColor White
    Write-Host "   Employee: employee1@company.com / password123" -ForegroundColor White
    Write-Host ""
    Write-Host "You can close this window now." -ForegroundColor Yellow

} catch {
    Write-Host ""
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Read-Host "Press Enter to exit" 