# Vercel Deployment Guide

## 🚀 Các files đã tạo để fix lỗi deploy

### 1. `vercel.json` - Cấu hình build chính
- Chỉ định build trong thư mục `frontend/`
- Cấu hình output directory là `frontend/build`
- Thiết lập rewrites cho SPA routing
- Tối ưu cache cho static files

### 2. `.vercelignore` - Loại bỏ files không cần thiết
- Bỏ qua backend code (chỉ deploy frontend)
- Loại bỏ env files, logs, test files
- Giảm thời gian build và kích thước deploy

### 3. `frontend/.env.production` - Biến môi trường production
- Cấu hình API URL cho production
- Disable sourcemap để tối ưu build
- Thiết lập production mode

## 📋 Các bước deploy lên Vercel

### Bước 1: Test build local trước
```powershell
# Test build frontend (từ root directory)
npm run build:frontend:local

# Hoặc test preview
npm run preview:build
```

### Bước 2: Commit và push code
```powershell
git add .
git commit -m "fix: add vercel configuration for frontend deployment"
git push origin master
```

### Bước 3: Cấu hình Vercel Project
1. Vào Vercel Dashboard
2. Import project từ GitHub
3. **Quan trọng**: Để Vercel tự detect (không cần chọn root directory)
4. Deploy!

### Bước 4: Cập nhật Environment Variables trên Vercel
Trong Vercel Project Settings → Environment Variables, thêm:
```
REACT_APP_API_URL=https://your-backend-url.com
REACT_APP_FRONTEND_URL=https://your-app.vercel.app
GENERATE_SOURCEMAP=false
CI=false
DISABLE_ESLINT_PLUGIN=true
```

## ✅ Kết quả sau khi setup

✓ Build local thành công  
✓ Bundle size: ~900KB (đang trong mức chấp nhận được)  
✓ Warnings ESLint được disable trong production  
✓ Security headers được thêm vào  
✓ Caching tối ưu cho static files  
✓ SPA routing được handle đúng

## 🔧 Troubleshooting

### Nếu vẫn lỗi "react-scripts: command not found":
1. Xóa cache npm:
   ```powershell
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Commit lại package-lock.json mới:
   ```powershell
   git add frontend/package-lock.json
   git commit -m "fix: regenerate package-lock.json"
   git push
   ```

### Nếu lỗi routing (404 trên refresh):
- File `vercel.json` đã có cấu hình rewrites để handle SPA routing
- Đảm bảo React Router sử dụng BrowserRouter (không HashRouter)

### Nếu lỗi API calls:
- Cập nhật `REACT_APP_API_URL` trong Vercel Environment Variables
- Đảm bảo backend đã được deploy và có CORS setup đúng

## 🎯 Tại sao làm như vậy?

### Lý thuyết:
1. **vercel.json**: Vercel cần biết cách build project monorepo (có cả frontend/backend)
2. **buildCommand**: Chỉ định cài dependencies và build trong thư mục frontend
3. **outputDirectory**: Cho Vercel biết nơi tìm built files (frontend/build)
4. **rewrites**: Handle client-side routing của React SPA
5. **.vercelignore**: Tối ưu build time bằng cách bỏ qua files không cần

### Quy trình:
1. Vercel clone repo
2. Chạy `buildCommand` → cd frontend && npm ci && npm run build
3. Lấy files từ `outputDirectory` → frontend/build
4. Deploy static files + áp dụng rewrites cho routing

## 📚 Lệnh hữu ích

```powershell
# Test build local
npm run build:frontend:local

# Test với production env
npm run build:frontend

# Preview build kết quả
npm run preview:build
```

Sau khi deploy thành công, nhớ cập nhật backend CORS để chấp nhận domain Vercel!
