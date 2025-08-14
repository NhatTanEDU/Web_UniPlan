# Hướng dẫn Deploy Frontend lên Vercel

## 🎯 Cách deploy CHÍNH XÁC (chỉ thư mục frontend)

### Bước 1: Chuẩn bị 
Đảm bảo trong thư mục `frontend/` có:
- ✅ `package.json` với react-scripts
- ✅ `src/` folder với code React
- ✅ `.env.production` (đã có)

### Bước 2: Deploy trên Vercel Dashboard

1. **Vào Vercel Dashboard**
2. **Click "Add New..." → Project**
3. **Import từ GitHub** (chọn repo Web_UniPlan)
4. **QUAN TRỌNG - Cấu hình Project:**
   ```
   Framework Preset: Create React App
   Root Directory: frontend/
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

5. **Environment Variables** (optional):
   ```
   REACT_APP_API_URL=https://your-backend-url.com
   GENERATE_SOURCEMAP=false
   ```

6. **Click Deploy**

### Bước 3: Vercel sẽ tự động:
- Chạy `cd frontend/`
- Chạy `npm install` 
- Chạy `npm run build`
- Deploy thư mục `frontend/build/`

## 🔧 Nếu vẫn lỗi

### Option A: Deploy trực tiếp thư mục frontend
1. **Clone repo mới chỉ frontend:**
   ```bash
   # Tạo repo mới chỉ cho frontend
   mkdir uniplan-frontend
   cd uniplan-frontend
   
   # Copy tất cả files từ frontend/ sang đây
   cp -r ../Web_UniPlan/frontend/* .
   
   # Init git mới
   git init
   git add .
   git commit -m "Initial frontend only"
   
   # Push lên GitHub repo mới
   ```

2. **Deploy repo frontend mới này lên Vercel**

### Option B: Sử dụng Vercel CLI
```bash
# Cài Vercel CLI
npm install -g vercel

# Chạy trong thư mục frontend/
cd frontend
vercel

# Follow prompts và deploy
```

## 📋 Checklist before deploy

- [ ] `frontend/package.json` có đúng dependencies
- [ ] `npm run build` chạy thành công trong `frontend/`
- [ ] File `frontend/build/index.html` được tạo ra
- [ ] Vercel project settings đặt Root Directory = `frontend/`

## 🎉 Sau khi deploy thành công

Analytics sẽ hoạt động tự động vì đã có:
```tsx
// Trong App.tsx
import { Analytics } from "@vercel/analytics/react";

function App() {
    return (
        <Router>
            <AppContent />
            <Analytics />
        </Router>
    );
}
```

Vercel sẽ show:
- 📊 Real-time visitors
- 🚀 Performance metrics  
- 🌍 Geographic data
- 📱 Device analytics
