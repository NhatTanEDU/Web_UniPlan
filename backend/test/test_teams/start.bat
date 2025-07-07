@echo off
cls
echo.
echo ╔══════════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                                  ║
echo ║               🎯 HỆ THỐNG TEST TEAMS - UNIPLAN                                   ║
echo ║                        Khởi động nhanh                                          ║
echo ║                                                                                  ║
echo ╚══════════════════════════════════════════════════════════════════════════════════╝
echo.
echo 🔧 Chuẩn bị khởi động hệ thống test...
echo.

:: Kiểm tra Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js chưa được cài đặt hoặc không có trong PATH
    echo 💡 Vui lòng cài đặt Node.js từ: https://nodejs.org
    pause
    exit /b 1
)

:: Kiểm tra thư mục node_modules
if not exist "node_modules" (
    echo 📦 Cài đặt dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Lỗi cài đặt dependencies
        pause
        exit /b 1
    )
)

:: Kiểm tra thư mục ketquathongke
if not exist "ketquathongke" (
    echo 📁 Tạo thư mục kết quả...
    mkdir ketquathongke
)

echo ✅ Chuẩn bị hoàn tất!
echo.
echo 🚀 Khởi động hệ thống test...
echo.

:: Khởi chạy hệ thống
node src/mainTestSystem.js

echo.
echo 👋 Cảm ơn bạn đã sử dụng hệ thống Test Teams!
pause
