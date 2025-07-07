# UniPlan Backend - Safe Mode Operation

## 🎯 Overview

This guide explains how to run UniPlan backend in **Safe Mode** with complex features disabled to prevent errors while maintaining core functionality.

## 🚀 Quick Start

### Start in Safe Mode
```bash
npm run start:safe
```

### Test Safe Mode
```bash
npm run test:safe
```

### Test Simple Search APIs
```bash
npm run test:simple
```

## 📊 Feature Status

### ✅ **ENABLED Features (Safe Mode)**
- `SIMPLE_SEARCH` - Your working team search APIs
- `BASIC_AUTH` - Authentication system
- `BASIC_CRUD` - Basic database operations
- `BASIC_API` - Core API functionality
- `HEALTH_CHECKS` - System health monitoring

### ❌ **DISABLED Features (Safe Mode)**
- `ENHANCED_TEAMS` - Complex team analytics
- `WEBSOCKETS` - Real-time WebSocket connections
- `SOCKET_IO` - Socket.IO real-time features
- `REAL_TIME_NOTIFICATIONS` - Live notification system
- `NOTIFICATION_CENTER` - Complex notification management
- `ADVANCED_SEARCH` - Complex search with filters
- `AI_FEATURES` - AI-powered functionality
- `CUSTOM_WIDGETS` - Dashboard widgets
- `ANALYTICS` - User behavior tracking
- And many more complex features...

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run start:safe` | Start server in safe mode with feature toggles |
| `npm run start` | Start server normally (may have errors) |
| `npm run test:safe` | Test safe mode functionality |
| `npm run test:simple` | Test simple search APIs |
| `npm run test:teams` | Full team testing suite |

## 📍 Important Endpoints

### ✅ Working Endpoints (Safe Mode)

#### System Status
```
GET /api/system/status
```
Returns current feature toggle status and system health.

#### Simple Team Search
```
GET /api/teams-simple/health
GET /api/teams-simple/search?name=TeamName
GET /api/teams-simple/:teamId/members/search?query=member
```

#### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/password/forgot
POST /api/password/reset
```

#### Basic Team Operations
```
GET /api/teams
POST /api/teams
PUT /api/teams/:id
DELETE /api/teams/:id
```

### ❌ Disabled Endpoints (Safe Mode)

These endpoints will return `503 Service Unavailable` with a feature disabled message:

```
/api/teams-enhanced/*     (Enhanced team features)
/api/widgets/*           (Custom widgets)
/api/notifications/*     (Real-time notifications)
/api/kanban/*           (Advanced kanban features)
```

## 🛠️ Configuration

### Feature Toggles

Edit `config/featureToggles.js` to enable/disable features:

```javascript
const FEATURE_TOGGLES = {
  SIMPLE_SEARCH: true,      // ✅ Keep enabled
  BASIC_AUTH: true,         // ✅ Keep enabled
  ENHANCED_TEAMS: false,    // ❌ Disabled for safety
  SOCKET_IO: false,         // ❌ Disabled for safety
  // ... more features
};
```

### Enabling Features

To safely enable a feature:

1. Set the feature to `true` in `config/featureToggles.js`
2. Restart the server: `npm run start:safe`
3. Test the feature: `npm run test:safe`
4. If tests pass, the feature is working correctly

## 🧪 Testing

### Safe Mode Verification
```bash
npm run test:safe
```

This test verifies:
- ✅ System status endpoint works
- ✅ Simple search APIs are functional
- ✅ Complex features are properly disabled
- ✅ Basic authentication is working

### Simple Search Testing
```bash
npm run test:simple
```

This test verifies:
- ✅ Team search by name
- ✅ Member search within teams
- ✅ Health check endpoints
- ✅ Error handling and validation

### Comprehensive Team Testing
```bash
npm run test:teams
```

Interactive testing menu with 32 different test scenarios.

## 🔍 Monitoring

### System Health
Monitor system status at:
```
http://localhost:5000/api/system/status
```

### Simple Search Health
Monitor simple search APIs at:
```
http://localhost:5000/api/teams-simple/health
```

## 🚨 Troubleshooting

### Server Won't Start
1. Check MongoDB connection in `.env`
2. Ensure required features are enabled in `featureToggles.js`
3. Run: `npm run test:safe` to diagnose issues

### Simple Search Not Working
1. Verify `SIMPLE_SEARCH: true` in feature toggles
2. Check authentication token is valid
3. Test with: `npm run test:simple`

### Need to Enable Complex Features
1. **Warning**: Only enable features you need
2. Enable one feature at a time in `featureToggles.js`
3. Test after each change: `npm run test:safe`
4. Monitor for errors in console

## 📈 Performance

Safe Mode provides:
- ⚡ **Faster startup** (fewer modules loaded)
- 🔒 **More stable** (complex features disabled)
- 🐛 **Fewer errors** (problematic code paths avoided)
- 📊 **Easier debugging** (simpler call stack)

## 🎯 Production Deployment

For production, consider:

1. **Staging Environment**: Test with gradually enabled features
2. **Feature Flags**: Use environment variables for feature toggles
3. **Monitoring**: Set up alerts for disabled features
4. **Rollback Plan**: Keep safe mode configuration ready

## 📚 API Documentation

For detailed API documentation of the working simple search endpoints, see:
- `docs/SIMPLE_SEARCH_API.md`

## 🆘 Support

If you encounter issues:

1. **Check Logs**: Look for error messages in console
2. **Test Safe Mode**: Run `npm run test:safe`
3. **Verify Features**: Check `/api/system/status`
4. **Simple Search**: Test with `npm run test:simple`

---

**Remember**: Safe Mode is designed to keep your application running reliably with core functionality while complex features are being debugged or developed.
