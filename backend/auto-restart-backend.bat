@echo off
title Backend Server (Auto-Restart)
color 0B

:loop
cls
echo ================================================
echo   Backend Server Running with Auto-Restart
echo ================================================
echo   Time: %date% %time%
echo   Press Ctrl+C to stop
echo ================================================
echo.

node server.js

echo.
echo ================================================
echo   Server crashed! Restarting in 5 seconds...
echo ================================================
timeout /t 5 /nobreak >nul
goto loop
