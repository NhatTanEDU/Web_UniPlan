@echo off
echo ========================================
echo     UNIPLAN MOMO NGROK SETUP
echo ========================================
echo.

:: Set paths
set NGROK_PATH=D:\Official_Project\Project_UniPlan\dowload\ngrok-v3-stable-windows-amd64\ngrok.exe
set PROJECT_PATH=D:\Official_Project\Project_UniPlan\Web_UniPlan-master\Web_UniPlan-master\backend

:: Check if ngrok exists
if not exist "%NGROK_PATH%" (
    echo ❌ Khong tim thay ngrok.exe tai: %NGROK_PATH%
    echo    Vui long kiem tra duong dan ngrok
    pause
    exit /b 1
)

:: Kill existing processes
echo 🔄 Dang dung cac process cu...
taskkill /F /IM ngrok.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1

:: Wait a bit
timeout /t 2 /nobreak >nul

:: Start ngrok in background
echo 🚀 Dang khoi dong ngrok...
start /B "" "%NGROK_PATH%" http 5000

:: Wait for ngrok to start
echo ⏳ Cho ngrok khoi dong (10 giay)...
timeout /t 10 /nobreak >nul

:: Change to backend directory
cd /d "%PROJECT_PATH%"

:: Update .env with ngrok URL
echo 📝 Dang cap nhat .env voi ngrok URL...
node update-env-with-ngrok.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Loi cap nhat .env
    pause
    exit /b 1
)

echo.
echo ✅ Hoan thanh! Ngrok da chay va .env da duoc cap nhat
echo.
echo 📋 BUOC TIEP THEO:
echo 1. Khoi dong backend server: node server.js
echo 2. Chay test MoMo: node test-momo-integration.js
echo 3. Thu thanh toan voi QR code moi
echo.
echo 🌐 Ngrok Web Interface: http://127.0.0.1:4040
echo.
pause
