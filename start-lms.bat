@echo off
title RME LMS Startup
echo.
echo =====================================================
echo            RME Learning Management System
echo =====================================================
echo.
echo Starting servers... Please wait...
echo.

cd /d "%~dp0"

echo [1/3] Building shared package...
cd shared
call npm run build
if errorlevel 1 (
    echo ERROR: Failed to build shared package
    pause
    exit /b 1
)

echo [2/3] Starting Backend Server...
cd ..\backend
start "RME LMS Backend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Starting Frontend Development Server...
cd ..\frontend
start "RME LMS Frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo =====================================================
echo   🎉 RME LMS is starting up!
echo   
echo   Backend:  http://10.10.11.243:3001
echo   Frontend: http://10.10.11.243:5173
echo   
echo   Opening browser in 5 seconds...
echo   Note: Frontend may take a moment to start on port 5173
echo =====================================================
echo.

timeout /t 5 /nobreak >nul
start http://10.10.11.243:5173

echo.
echo System started successfully!
echo You can close this window now.
echo.
pause 