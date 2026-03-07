@echo off
echo ==========================================
echo   ROAD SAFETY ECOSYSTEM - LAUNCHER
echo ==========================================
echo.
echo Starting Backend Server...
start cmd /k "cd server && node index.js"
echo.
echo Starting Frontend Dashboard...
start cmd /k "npm run dev"
echo.
echo ==========================================
echo   SYSTEMS INITIALIZING...
echo   1. Wait for Backend (Port 3001)
echo   2. Wait for Frontend (Port 5173)
echo ==========================================
pause
