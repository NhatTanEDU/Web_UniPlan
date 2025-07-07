@echo off
setlocal enabledelayedexpansion

REM Quick Start Script for Testing Timeout Middleware (Windows)
REM This script starts the server and runs timeout tests

echo 🚀 UniPlan Timeout Middleware Quick Test
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ❌ Please run this script from the backend directory
    echo 💡 Expected location: my_uniplan\backend\
    pause
    exit /b 1
)

echo 🔍 Checking backend directory...
echo ✅ Found package.json

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)

REM Check for required files
echo 🔍 Checking timeout middleware files...

set "files_to_check=middleware\timeout.middleware.js routes\debug.routes.js test-timeout-middleware.js performance-monitor.js"
for %%f in (%files_to_check%) do (
    if exist "%%f" (
        echo ✅ Found: %%f
    ) else (
        echo ❌ Missing: %%f
        echo 💡 Please ensure all timeout middleware files are in place
        pause
        exit /b 1
    )
)

REM Check if server is already running
echo 🔍 Checking if server is running...
curl -s http://localhost:8080/api/health >nul 2>&1
if !errorlevel! equ 0 (
    echo ✅ Server is already running
    set SERVER_RUNNING=true
) else (
    echo ⚠️  Server is not running
    set SERVER_RUNNING=false
)

REM Parse command line arguments
if "%1"=="--help" goto :show_usage
if "%1"=="--test-only" goto :test_only
if "%1"=="--start-only" goto :start_only
if "%1"=="--monitor" (
    set MONITOR_MODE=true
) else (
    set MONITOR_MODE=false
)

REM Main execution flow
echo 🎯 Running full timeout middleware test suite...

REM Start server if not running
if "%SERVER_RUNNING%"=="false" (
    call :start_server
    if errorlevel 1 exit /b 1
    set SERVER_STARTED_BY_SCRIPT=true
) else (
    set SERVER_STARTED_BY_SCRIPT=false
)

REM Run tests
call :run_tests
set TEST_RESULT=!errorlevel!

REM Show final results
echo.
echo 📊 Test Summary:
if !TEST_RESULT! equ 0 (
    echo ✅ Timeout middleware is working correctly
    echo ✅ All debug endpoints are functioning
    echo ✅ Request timeouts are properly handled
) else (
    echo ❌ Some tests failed - check output above
)

REM Start monitoring if requested
if "%MONITOR_MODE%"=="true" (
    echo.
    echo 📈 Starting performance monitor...
    echo 💡 Use Ctrl+C to stop monitoring and see final report
    node performance-monitor.js --simulate
)

REM Clean up
if "%SERVER_STARTED_BY_SCRIPT%"=="true" (
    call :stop_server
)

echo.
echo 🏁 Quick test completed!
pause
exit /b !TEST_RESULT!

:start_server
echo 🚀 Starting UniPlan backend server...

REM Start server in background and get PID
start /b npm start > server.log 2>&1

echo ⏳ Waiting for server to start...

REM Wait for server to be ready (max 30 seconds)
for /l %%i in (1,1,30) do (
    curl -s http://localhost:8080/api/health >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Server started successfully!
        exit /b 0
    )
    echo|set /p="."
    timeout /t 1 /nobreak >nul
)

echo.
echo ❌ Server failed to start within 30 seconds
echo 📝 Check server.log for details:
type server.log | tail -n 20
exit /b 1

:stop_server
echo 🛑 Stopping server...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Server stopped
exit /b 0

:run_tests
echo 🧪 Running timeout middleware tests...
echo ⏳ This may take up to 2 minutes...

node test-timeout-middleware.js
set TEST_RESULT=!errorlevel!

if !TEST_RESULT! equ 0 (
    echo 🎉 All tests passed!
) else (
    echo ❌ Some tests failed
    echo 💡 Check the test output above for details
)

exit /b !TEST_RESULT!

:test_only
echo 🧪 Running tests only...
call :run_tests
pause
exit /b !errorlevel!

:start_only
echo 🚀 Starting server only...
if "%SERVER_RUNNING%"=="false" (
    call :start_server
    if !errorlevel! equ 0 (
        echo ✅ Server is running at http://localhost:8080
        echo 💡 Press any key to stop the server
        pause >nul
        call :stop_server
    )
) else (
    echo ✅ Server is already running at http://localhost:8080
    pause
)
exit /b 0

:show_usage
echo Usage:
echo   quick-test.bat [options]
echo.
echo Options:
echo   --test-only    Run tests only (assumes server is running)
echo   --start-only   Start server only (no tests)
echo   --monitor      Start performance monitor after tests
echo   --help         Show this help message
echo.
echo Examples:
echo   quick-test.bat                 # Start server and run tests
echo   quick-test.bat --test-only     # Run tests only
echo   quick-test.bat --start-only    # Start server only
echo   quick-test.bat --monitor       # Start server, run tests, then monitor
pause
exit /b 0
