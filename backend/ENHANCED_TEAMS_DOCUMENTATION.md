# Enhanced Team API Documentation

## 🎯 Tổng Quan

Enhanced Team API đã được xây dựng thành công với các tính năng nâng cao cho quản lý nhóm trong hệ thống UniPlan. 

## 📊 Trạng Thái Hiện Tại

✅ **HOÀN THÀNH:**
- Team Validation Middleware với thông báo tiếng Việt
- Team Statistics Controller (thống kê toàn diện)
- Team Search Controller (tìm kiếm nâng cao + AI recommendations)
- Team Bulk Operations Controller (xử lý hàng loạt)
- Rate Limiting Middleware (bảo vệ API)
- Team Activity Model (ghi nhận hoạt động)
- Enhanced Routes với health check
- Package dependencies (express-rate-limit, express-validator)
- Server integration và testing cơ bản

## 🚀 API Endpoints

### Public Endpoints (Không cần authentication)
```
GET /api/teams-enhanced/health
```

### Protected Endpoints (Cần authentication)

#### Statistics
```
GET /api/teams-enhanced/stats/overview
GET /api/teams-enhanced/:teamId/stats/detail  
GET /api/teams-enhanced/stats/comparison
GET /api/teams-enhanced/:teamId/stats/activity
```

#### Search & Discovery
```
GET /api/teams-enhanced/search?query=xxx&filters=xxx
GET /api/teams-enhanced/search/public
GET /api/teams-enhanced/:teamId/members/search
GET /api/teams-enhanced/recommendations
```

#### Bulk Operations
```
POST /api/teams-enhanced/:teamId/members/bulk/add
DELETE /api/teams-enhanced/:teamId/members/bulk/remove
PUT /api/teams-enhanced/:teamId/members/bulk/roles
POST /api/teams-enhanced/:teamId/projects/bulk/assign
DELETE /api/teams-enhanced/bulk/delete
```

#### Enhanced Management
```
POST /api/teams-enhanced/enhanced/create
PUT /api/teams-enhanced/:teamId/enhanced/update
POST /api/teams-enhanced/:teamId/members/enhanced/add
```

#### Activity & Health
```
GET /api/teams-enhanced/:teamId/activities
GET /api/teams-enhanced/:teamId/activities/stats
GET /api/teams-enhanced/:teamId/health
```

## 🛡️ Security & Rate Limiting

### Rate Limits
- **General API**: 100 requests/15 minutes
- **Team Creation**: 5 requests/15 minutes
- **Bulk Operations**: 10 requests/15 minutes
- **Search**: 50 requests/15 minutes
- **Statistics**: 20 requests/15 minutes

### Authentication
- Tất cả endpoints (trừ health check) yêu cầu JWT token
- Role-based permissions cho team access
- Input validation với express-validator

## 📁 File Structure

```
backend/
├── controllers/
│   ├── teamStats.controller.js      # Thống kê teams
│   ├── teamSearch.controller.js     # Tìm kiếm & gợi ý
│   └── teamBulk.controller.js       # Xử lý hàng loạt
├── middleware/
│   ├── teamValidation.js            # Validation với tiếng Việt
│   └── rateLimiting.js              # Rate limiting
├── models/
│   └── teamActivity.model.js        # Ghi nhận hoạt động
├── routes/
│   └── teamEnhanced.routes.js       # Routes tổng hợp
└── utils/
    └── responseHelper.js            # Response chuẩn hóa
```

## 🔧 Configuration

### App.js Integration
```javascript
const teamEnhancedRoutes = require('./routes/teamEnhanced.routes');
const { generalRateLimit } = require('./middleware/rateLimiting');

app.use(generalRateLimit);
app.use('/api/teams-enhanced', teamEnhancedRoutes);
```

### Package Dependencies
```json
{
  "express-rate-limit": "^7.5.0",
  "express-validator": "^7.2.1"
}
```

## 🧪 Testing

### Health Check Test
```bash
# PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/api/teams-enhanced/health" -Method GET

# Response: 200 OK with features list
```

### Comprehensive Testing
```javascript
// File: test-comprehensive-teams.js
node test-comprehensive-teams.js
```

## 📋 Next Steps

### 1. Authentication Testing
- Lấy JWT token từ login endpoint
- Test tất cả protected endpoints
- Verify role-based permissions

### 2. Frontend Integration
- Tích hợp với React components
- Implement team statistics dashboard
- Add search và bulk operation UI

### 3. Database Testing
- Test với real team data
- Verify statistics accuracy
- Test bulk operations performance

### 4. Performance Optimization
- Monitor rate limiting effectiveness
- Optimize database queries
- Add caching for statistics

### 5. Additional Features
- Real-time notifications cho team activities
- Export statistics ra Excel/PDF
- Advanced team health monitoring
- Integration với email notifications

## 🎨 Vietnamese Language Support

Tất cả error messages và responses đều hỗ trợ tiếng Việt:

```javascript
// Examples
"Tên nhóm không được để trống"
"Bạn không có quyền truy cập nhóm này"
"Thống kê teams thành công"
"Lỗi lấy thống kê chi tiết team"
```

## 🔍 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Thành công",
  "data": {...},
  "timestamp": "2025-05-27T19:10:45.465Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Lỗi xảy ra",
  "error": "Chi tiết lỗi",
  "statusCode": 400
}
```

## 🏆 Features Highlight

### 1. **Comprehensive Statistics**
- Team overview với role distribution
- Detailed team metrics
- Comparison between teams
- Activity timeline analysis

### 2. **Advanced Search**
- Multi-filter search
- Public team discovery
- AI-powered recommendations
- Member search within teams

### 3. **Bulk Operations**
- Add/remove multiple members
- Bulk role updates
- Multiple project assignments
- Batch team deletion

### 4. **Security & Monitoring**
- Multi-tier rate limiting
- Activity logging
- Permission-based access
- Input validation

### 5. **Team Health Monitoring**
- Health score calculation
- Improvement recommendations
- Activity tracking
- Performance metrics

---

**Status**: ✅ Backend hoàn thiện, sẵn sàng cho frontend integration và testing chi tiết
**Last Updated**: May 27, 2025
**Version**: 1.0.0
