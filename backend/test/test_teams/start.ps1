# PowerShell Script để khởi chạy hệ thống Test Teams
# Khởi chạy: .\start.ps1

Clear-Host

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                                  ║" -ForegroundColor Cyan
Write-Host "║               🎯 HỆ THỐNG TEST TEAMS - UNIPLAN                                   ║" -ForegroundColor Yellow
Write-Host "║                        PowerShell Launcher                                      ║" -ForegroundColor Cyan
Write-Host "║                                                                                  ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 Chuẩn bị khởi động hệ thống test..." -ForegroundColor Green
Write-Host ""

# Kiểm tra Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js đã cài đặt: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js chưa được cài đặt hoặc không có trong PATH" -ForegroundColor Red
    Write-Host "💡 Vui lòng cài đặt Node.js từ: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

# Kiểm tra thư mục node_modules
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Cài đặt dependencies..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dependencies đã được cài đặt!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Lỗi cài đặt dependencies" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát"
        exit 1
    }
} else {
    Write-Host "✅ Dependencies đã sẵn sàng!" -ForegroundColor Green
}

# Kiểm tra thư mục ketquathongke
if (!(Test-Path "ketquathongke")) {
    Write-Host "📁 Tạo thư mục kết quả..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Name "ketquathongke" | Out-Null
    Write-Host "✅ Đã tạo thư mục ketquathongke!" -ForegroundColor Green
} else {
    Write-Host "✅ Thư mục ketquathongke đã tồn tại!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Khởi động hệ thống test..." -ForegroundColor Magenta
Write-Host ""

# Khởi chạy hệ thống
try {
    node src/mainTestSystem.js
} catch {
    Write-Host ""
    Write-Host "❌ Lỗi khởi chạy hệ thống: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host ""
Write-Host "👋 Cảm ơn bạn đã sử dụng hệ thống Test Teams!" -ForegroundColor Green
Read-Host "Nhấn Enter để thoát"
