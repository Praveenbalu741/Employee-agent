@echo off
echo ================================================
echo   Restarting All Services...
echo ================================================
echo.

call stop-all.bat
timeout /t 2 /nobreak >nul
call start-all.bat
