@echo off
echo ================================================
echo   Employee Feedback Agent - Starting All Services
echo ================================================
echo.

:: Start Backend in new window
echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0" && node backend/server.js"
timeout /t 5 /nobreak >nul

:: Start Frontend in new window
echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ================================================
echo   All Services Started!
echo ================================================
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:5000
echo.
echo   Login Credentials:
echo   - Employee: employee@example.com / Password123!
echo   - Manager:  manager@example.com  / Password123!
echo.
echo ================================================
echo.
echo Press any key to open website...
pause >nul
start http://localhost:5173
