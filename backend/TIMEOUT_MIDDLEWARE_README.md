# Timeout Middleware System Documentation

## 📋 Overview

This comprehensive timeout middleware system prevents server hangs and provides detailed diagnostic logging to identify performance bottlenecks in the UniPlan backend API. The system specifically targets team, project, and kanban operations that may cause timeouts.

## 🎯 Features

### ✅ Request Timeout Protection
- **15-second timeout limit** for all requests
- Automatic request termination to prevent server hangs
- Graceful error handling with proper HTTP status codes

### 📊 Performance Monitoring
- **Real-time request tracking** with unique request IDs
- **Response time analysis** with multiple warning thresholds:
  - ⚠️ Warning: Requests > 5 seconds
  - 🚨 Critical: Requests > 10 seconds
  - ❌ Timeout: Requests > 15 seconds

### 🔍 Detailed Diagnostic Logging
- **Enhanced logging** in critical controllers:
  - `team.controller.js` - Team operations
  - `project.controller.js` - Project creation
  - `kanbanTask.controller.js` - Task management (18+ diagnostic steps)
- **Step-by-step operation tracking**
- **Database query performance monitoring**
- **Permission check logging**

### 🧪 Debug Testing Suite
- **5 test endpoints** to validate timeout behavior
- **Comprehensive test script** with colored output
- **Performance monitoring tools**

## 📁 File Structure

```
backend/
├── middleware/
│   └── timeout.middleware.js          # Main timeout middleware
├── routes/
│   └── debug.routes.js                # Debug endpoints for testing
├── controllers/
│   ├── team.controller.js             # Enhanced with diagnostics
│   ├── project.controller.js          # Enhanced with diagnostics
│   └── kanbanTask.controller.js       # Enhanced with 18+ diagnostic steps
├── test-timeout-middleware.js         # Comprehensive test suite
├── performance-monitor.js             # Performance monitoring tool
├── quick-test.sh                      # Linux/Mac test script
├── quick-test.bat                     # Windows test script
└── TIMEOUT_MIDDLEWARE_README.md       # This documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- UniPlan backend dependencies installed (`npm install`)

### Option 1: Automated Testing (Recommended)

**Linux/Mac:**
```bash
chmod +x quick-test.sh
./quick-test.sh
```

**Windows:**
```cmd
quick-test.bat
```

### Option 2: Manual Testing

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Run timeout tests:**
   ```bash
   node test-timeout-middleware.js
   ```

3. **Monitor performance:**
   ```bash
   node performance-monitor.js --simulate
   ```

## 🧪 Test Endpoints

The debug routes provide comprehensive testing scenarios:

| Endpoint | Behavior | Expected Result |
|----------|----------|-----------------|
| `/api/debug/quick-endpoint` | Instant response | ✅ 200 OK immediately |
| `/api/debug/moderate-endpoint` | 8-second delay | ⚠️ 200 OK with warning log |
| `/api/debug/error-endpoint` | 3-second delay + error | ❌ 500 Error |
| `/api/debug/slow-endpoint` | 20-second delay | ⏰ 503 Timeout after 15s |
| `/api/debug/hang-endpoint` | Infinite hang | ⏰ 503 Timeout after 15s |

## 📊 Monitoring Features

### Real-time Metrics
- Total requests processed
- Average response time
- Timeout incident count
- Response time distribution
- Slowest endpoints ranking

### Performance Analysis
- Automatic bottleneck identification
- Trend analysis over time
- User-specific performance tracking
- Endpoint-specific metrics

### Alerting Thresholds
- **Green**: < 1 second (optimal)
- **Yellow**: 1-5 seconds (acceptable)
- **Orange**: 5-10 seconds (slow)
- **Red**: 10-15 seconds (critical)
- **Black**: > 15 seconds (timeout)

## 🔧 Configuration

### Timeout Settings
Located in `app.js`:
```javascript
const TIMEOUT_SECONDS = '15s';  // Adjust timeout duration
const TIMEOUT_MS = 15000;       // Timeout in milliseconds
```

### Warning Thresholds
Located in timeout middleware:
```javascript
if (duration > 5000) {          // Warning threshold
  console.warn(`⚠️ SLOW Request`);
}
if (duration > 10000) {         // Critical threshold
  console.error(`🚨 CRITICAL`);
}
```

## 📈 Enhanced Controller Logging

### kanbanTask.controller.js
The `createTask` function includes **18+ diagnostic steps**:

1. Request validation start
2. User authentication check
3. Permission verification
4. Board access validation
5. Task data sanitization
6. Database connection check
7. Transaction initialization
8. Duplicate task check
9. Priority validation
10. Assignment validation
11. Tag processing
12. Database insertion
13. Index update
14. Cache invalidation
15. Notification preparation
16. Response formatting
17. Cleanup operations
18. Final validation

### team.controller.js & project.controller.js
Enhanced with:
- Request timing
- Database query performance
- Error context capture
- User activity tracking

## 🚨 Troubleshooting

### Common Issues

**1. Tests Fail with Connection Errors**
```bash
# Check if server is running
curl http://localhost:8080/api/health

# Start server if not running
npm start
```

**2. Timeout Not Working**
- Verify middleware is registered in `app.js`
- Check `connect-timeout` package is installed
- Ensure middleware order is correct

**3. Debug Routes Not Found**
- Verify debug routes are enabled (non-production only)
- Check route registration in `app.js`
- Confirm `NODE_ENV` is not set to 'production'

### Performance Issues

**High Timeout Rate (>5%)**
1. Check database connection health
2. Review slow query logs
3. Analyze endpoint-specific metrics
4. Consider caching strategies

**Slow Response Times**
1. Use performance monitor to identify bottlenecks
2. Check database query optimization
3. Review third-party API calls
4. Analyze memory usage

## 📝 Logging Examples

### Successful Request
```
🚀 [2024-01-15T10:30:00.000Z] START Request: GET-/api/teams/123-1705320600000
   📍 Endpoint: GET /api/teams/123
   👤 User: user456
   🔗 IP: 192.168.1.100
✅ [2024-01-15T10:30:01.200Z] COMPLETED Request: GET-/api/teams/123-1705320600000 in 1200ms (Status: 200)
```

### Timeout Incident
```
❌❌❌ CRITICAL TIMEOUT DETECTED ❌❌❌
🔥 Request ID: POST-/api/kanban-tasks-1705320600000
🔥 Endpoint: POST /api/kanban-tasks
🔥 Duration: 15023ms (exceeded 15000ms limit)
🔥 User: user789
🔥 Request Body: {"title":"New Task","boardId":"board123"}
🔥 Query Params: {}
🔥 Route Params: {}
❌❌❌ END TIMEOUT REPORT ❌❌❌
```

### Enhanced createTask Logging
```
[KANBAN-TASK-CREATE] Step 1: Request validation started - Duration: 2ms
[KANBAN-TASK-CREATE] Step 2: User authentication verified - Duration: 15ms
[KANBAN-TASK-CREATE] Step 3: Permission check passed - Duration: 45ms
...
[KANBAN-TASK-CREATE] Step 18: Task creation completed successfully - Total: 1,234ms
```

## 🔍 Advanced Monitoring

### Generate Performance Report
```bash
# Start monitoring with simulation
node performance-monitor.js --simulate

# Monitor live traffic (run alongside server)
node performance-monitor.js
```

### Analyze Metrics
Performance data is saved to:
- `logs/metrics.json` - Current metrics
- `logs/performance-monitor.log` - Detailed event log

### Custom Scripts
```bash
# Test specific scenarios
./quick-test.sh --test-only      # Run tests only
./quick-test.sh --start-only     # Start server only
./quick-test.sh --monitor        # Full test + monitoring
```

## 🛡️ Production Deployment

### Safety Measures
1. **Disable debug routes** in production (`NODE_ENV=production`)
2. **Adjust timeout values** based on production load
3. **Set up log rotation** for performance logs
4. **Configure monitoring alerts** for timeout incidents

### Recommended Settings
```javascript
// Production timeout settings
const TIMEOUT_SECONDS = process.env.REQUEST_TIMEOUT || '30s';  // Longer timeout
const WARNING_THRESHOLD = 10000;    // 10s warning
const CRITICAL_THRESHOLD = 20000;   // 20s critical
```

### Monitoring Integration
- Connect to APM tools (New Relic, DataDog)
- Set up Slack/email alerts for timeout incidents
- Create dashboards for response time trends

## 📞 Support

If you encounter issues:

1. **Check server logs** for detailed error information
2. **Run diagnostic tests** using the provided scripts
3. **Review performance metrics** for bottleneck identification
4. **Verify configuration** against this documentation

## 🔄 Updates

This timeout middleware system is designed to be:
- **Extensible** - Easy to add new monitoring features
- **Configurable** - Adjust thresholds and timeouts as needed
- **Production-ready** - Built with safety and performance in mind

---

*Last updated: January 2024*
*Version: 1.0.0*
