# UniPlan Backend API

Backend API cho hệ thống quản lý dự án UniPlan - Project Management System.

## 🚀 Tính năng chính

- **Authentication & Authorization**: JWT-based auth system
- **Project Management**: Tạo, quản lý dự án và tasks
- **Team Collaboration**: Quản lý teams và members
- **Kanban Board**: Hệ thống kanban với drag & drop
- **Payment Integration**: Tích hợp MoMo payment gateway
- **File Upload**: Upload files với Supabase storage
- **Real-time Updates**: Socket.IO cho real-time collaboration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB với Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Supabase
- **Payment**: MoMo Gateway
- **Real-time**: Socket.IO

## 📦 Cài đặt

```bash
# Clone repository
git clone https://github.com/NhatTanEDU/UniPlan-Backend.git
cd UniPlan-Backend

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Cập nhật thông tin trong .env file
# Khởi động server
npm start
```

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/uniplan
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
MOMO_PARTNER_CODE=your-momo-partner-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

## 🚀 Deployment

### Railway
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### 123HOST
1. Upload files via FTP
2. Configure Node.js application
3. Set environment variables
4. Start application

## 📚 API Documentation

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh` - Refresh token

### Projects
- `GET /api/projects` - Lấy danh sách dự án
- `POST /api/projects` - Tạo dự án mới
- `PUT /api/projects/:id` - Cập nhật dự án
- `DELETE /api/projects/:id` - Xóa dự án

### Teams
- `GET /api/teams` - Lấy danh sách teams
- `POST /api/teams` - Tạo team mới
- `POST /api/teams/:id/members` - Thêm member vào team

### Payments
- `POST /api/payment/momo/create` - Tạo payment MoMo
- `POST /api/payment/momo/callback` - MoMo callback

## 🧪 Testing

```bash
# Chạy tests
npm test

# Test specific endpoint
node test-login.js
```

## 📝 License

MIT License - see LICENSE file for details.

## 👥 Contributors

- **NhatTanEDU** - Main Developer

## 🔗 Links

- **Frontend**: [UniPlan Frontend](https://uniplan.website)
- **Documentation**: [API Docs](https://uniplan.website/docs)
