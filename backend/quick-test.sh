#!/bin/bash

# Quick Start Script for Testing Timeout Middleware
# This script starts the server and runs timeout tests

echo "🚀 UniPlan Timeout Middleware Quick Test"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Please run this script from the backend directory${NC}"
    echo -e "${YELLOW}💡 Expected location: my_uniplan/backend/${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Checking backend directory...${NC}"
echo -e "${GREEN}✅ Found package.json${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Check for required files
echo -e "${BLUE}🔍 Checking timeout middleware files...${NC}"

required_files=(
    "middleware/timeout.middleware.js"
    "routes/debug.routes.js"
    "test-timeout-middleware.js"
    "performance-monitor.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ Found: $file${NC}"
    else
        echo -e "${RED}❌ Missing: $file${NC}"
        echo -e "${YELLOW}💡 Please ensure all timeout middleware files are in place${NC}"
        exit 1
    fi
done

# Check if server is already running
echo -e "${BLUE}🔍 Checking if server is running...${NC}"
if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server is already running${NC}"
    SERVER_RUNNING=true
else
    echo -e "${YELLOW}⚠️  Server is not running${NC}"
    SERVER_RUNNING=false
fi

# Function to start server
start_server() {
    echo -e "${BLUE}🚀 Starting UniPlan backend server...${NC}"
    
    # Start server in background
    npm start > server.log 2>&1 &
    SERVER_PID=$!
    
    echo -e "${YELLOW}⏳ Waiting for server to start (PID: $SERVER_PID)...${NC}"
    
    # Wait for server to be ready (max 30 seconds)
    for i in {1..30}; do
        if curl -s http://localhost:8080/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server started successfully!${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "\n${RED}❌ Server failed to start within 30 seconds${NC}"
    echo -e "${YELLOW}📝 Check server.log for details:${NC}"
    tail -n 20 server.log
    return 1
}

# Function to stop server
stop_server() {
    if [ ! -z "$SERVER_PID" ]; then
        echo -e "${YELLOW}🛑 Stopping server (PID: $SERVER_PID)...${NC}"
        kill $SERVER_PID 2>/dev/null
        wait $SERVER_PID 2>/dev/null
        echo -e "${GREEN}✅ Server stopped${NC}"
    fi
}

# Function to run tests
run_tests() {
    echo -e "${BLUE}🧪 Running timeout middleware tests...${NC}"
    echo -e "${YELLOW}⏳ This may take up to 2 minutes...${NC}"
    
    node test-timeout-middleware.js
    TEST_RESULT=$?
    
    if [ $TEST_RESULT -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        echo -e "${YELLOW}💡 Check the test output above for details${NC}"
    fi
    
    return $TEST_RESULT
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}Usage:${NC}"
    echo "  ./quick-test.sh [options]"
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo "  --test-only    Run tests only (assumes server is running)"
    echo "  --start-only   Start server only (no tests)"
    echo "  --monitor      Start performance monitor after tests"
    echo "  --help         Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  ./quick-test.sh                 # Start server and run tests"
    echo "  ./quick-test.sh --test-only     # Run tests only"
    echo "  ./quick-test.sh --start-only    # Start server only"
    echo "  ./quick-test.sh --monitor       # Start server, run tests, then monitor"
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    stop_server
    exit 0
}

# Trap signals for cleanup
trap cleanup SIGINT SIGTERM

# Parse command line arguments
CASE="$1"

case $CASE in
    --help)
        show_usage
        exit 0
        ;;
    --test-only)
        echo -e "${BLUE}🧪 Running tests only...${NC}"
        run_tests
        exit $?
        ;;
    --start-only)
        echo -e "${BLUE}🚀 Starting server only...${NC}"
        if [ "$SERVER_RUNNING" = false ]; then
            start_server
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✅ Server is running at http://localhost:8080${NC}"
                echo -e "${YELLOW}💡 Press Ctrl+C to stop the server${NC}"
                # Wait for interrupt
                while true; do
                    sleep 1
                done
            fi
        else
            echo -e "${GREEN}✅ Server is already running at http://localhost:8080${NC}"
        fi
        exit 0
        ;;
    --monitor)
        MONITOR_MODE=true
        ;;
    "")
        # Default behavior
        MONITOR_MODE=false
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $CASE${NC}"
        show_usage
        exit 1
        ;;
esac

# Main execution flow
echo -e "${BLUE}🎯 Running full timeout middleware test suite...${NC}"

# Start server if not running
if [ "$SERVER_RUNNING" = false ]; then
    start_server
    if [ $? -ne 0 ]; then
        exit 1
    fi
    SERVER_STARTED_BY_SCRIPT=true
else
    SERVER_STARTED_BY_SCRIPT=false
fi

# Run tests
run_tests
TEST_RESULT=$?

# Show final results
echo -e "\n${BLUE}📊 Test Summary:${NC}"
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Timeout middleware is working correctly${NC}"
    echo -e "${GREEN}✅ All debug endpoints are functioning${NC}"
    echo -e "${GREEN}✅ Request timeouts are properly handled${NC}"
else
    echo -e "${RED}❌ Some tests failed - check output above${NC}"
fi

# Start monitoring if requested
if [ "$MONITOR_MODE" = true ]; then
    echo -e "\n${BLUE}📈 Starting performance monitor...${NC}"
    echo -e "${YELLOW}💡 Use Ctrl+C to stop monitoring and see final report${NC}"
    node performance-monitor.js --simulate
fi

# Clean up
if [ "$SERVER_STARTED_BY_SCRIPT" = true ]; then
    stop_server
fi

echo -e "\n${BLUE}🏁 Quick test completed!${NC}"
exit $TEST_RESULT
