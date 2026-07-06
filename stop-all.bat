@echo off
echo ================================================
echo   Stopping All Services...
echo ================================================
echo.

:: Kill Node processes
echo Stopping Backend...
taskkill /F /FI "WINDOWTITLE eq Backend Server*" >nul 2>&1
taskkill /F /IM node.exe /FI "IMAGENAME eq node.exe" >nul 2>&1

:: Kill Frontend processes
echo Stopping Frontend...
taskkill /F /FI "WINDOWTITLE eq Frontend Server*" >nul 2>&1

echo.
echo ================================================
echo   All Services Stopped!
echo ================================================
echo.
pause
