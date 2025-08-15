# 🚀 UniPlan Frontend - Railway Deployment Guide

## 📋 Thông tin Deployment

**Frontend URL:** `https://uniplan-frontend.railway.app` (sẽ update sau khi deploy)  
**Backend API:** `https://web-production-61868.up.railway.app`  
**Tech Stack:** React + TypeScript + Tailwind CSS  

## 🔧 Cấu hình Environment Variables

### Production Environment (.env.production)
```bash
REACT_APP_API_URL=https://web-production-61868.up.railway.app
REACT_APP_FRONTEND_URL=https://uniplan-frontend.railway.app
GENERATE_SOURCEMAP=false
CI=false
DISABLE_ESLINT_PLUGIN=true
REACT_APP_NODE_ENV=production
FAST_REFRESH=false
```

## 📦 Build & Deployment

### Local Build Test
```bash
npm install
npm run build
npx serve -s build -l 3000
```

### Railway Deployment
1. **Connect Repository:** Link Git repository to Railway
2. **Environment Variables:** Set production environment variables
3. **Build Command:** `npm run build`
4. **Start Command:** `npx serve -s build -l $PORT`

## 🔗 API Integration

Frontend đã được cấu hình để kết nối với Railway backend:
- **Authentication:** JWT token-based
- **API Base URL:** `https://web-production-61868.up.railway.app`
- **CORS:** Đã được cấu hình cho cross-origin requests

## ✅ Features Tested

- ✅ User Authentication (Login/Register)
- ✅ Project Management
- ✅ Kanban Boards
- ✅ Team Management
- ✅ Real-time Updates (Socket.io)
- ✅ File Upload/Download
- ✅ Responsive Design

## 🚀 Deployment Steps

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Frontend ready for Railway deployment"
   git push origin main
   ```

2. **Railway Setup:**
   - Create new Railway project
   - Connect GitHub repository
   - Set environment variables
   - Deploy automatically

3. **Post-deployment:**
   - Update CORS settings in backend
   - Test all functionality
   - Update frontend URL in backend

## 📱 Production Ready

Frontend đã được tối ưu cho production với:
- Code splitting
- Asset optimization
- Environment-specific configurations
- Error boundaries
- Performance monitoring

**🎯 Ready to deploy to Railway!**
