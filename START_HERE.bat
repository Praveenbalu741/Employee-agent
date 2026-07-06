@echo off
title Employee Feedback Agent - Launcher
color 0A

:menu
cls
echo ========================================================
echo.
echo      EMPLOYEE FEEDBACK AGENT - CONTROL PANEL
echo.
echo ========================================================
echo.
echo   [1] Start Application (Start Both Servers)
echo   [2] Stop Application (Stop All Servers)
echo   [3] Restart Application
echo   [4] Open Website in Browser
echo   [5] View Backend Logs
echo   [6] Exit
echo.
echo ========================================================
echo.
set /p choice="Select an option (1-6): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto openweb
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto exit

echo Invalid choice! Press any key to try again...
pause >nul
goto menu

:start
cls
echo Starting application...
call start-all.bat
goto menu

:stop
cls
echo Stopping application...
call stop-all.bat
goto menu

:restart
cls
echo Restarting application...
call restart-all.bat
goto menu

:openweb
start http://localhost:5173
echo Website opened in browser!
timeout /t 2 >nul
goto menu

:logs
cls
echo Recent Backend Logs:
echo ========================================================
type logs\combined.log 2>nul || echo No logs found.
echo ========================================================
echo.
pause
goto menu

:exit
echo Goodbye!
timeout /t 1 >nul
exit
