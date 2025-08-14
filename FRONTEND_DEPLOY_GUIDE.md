# Hướng dẫn Deploy Frontend Riêng Lẻ

## 🎯 Kế hoạch mới: Deploy chỉ thư mục frontend

### Bước 1: Xóa project cũ trên Vercel (nếu có)
1. Vào Vercel Dashboard
2. Xóa project cũ (nếu đã tạo)

### Bước 2: Tạo project mới từ thư mục frontend
1. **Vào Vercel Dashboard** → "Add New..." → "Project"
2. **Import từ GitHub** → Chọn repo Web_UniPlan
3. **QUAN TRỌNG**: Trong "Configure Project":
   - **Root Directory**: Chọn `frontend`
   - **Framework Preset**: Create React App (tự detect)
   - **Build Command**: `npm run build` (mặc định)
   - **Output Directory**: `build` (mặc định)

### Bước 3: Environment Variables
Thêm trong Vercel Project Settings:
```
REACT_APP_API_URL=https://your-backend-url.com
GENERATE_SOURCEMAP=false
CI=false
```

### Bước 4: Deploy!
Vercel sẽ tự động:
1. Cài `npm install` trong thư mục frontend
2. Chạy `npm run build`
3. Deploy từ thư mục `frontend/build`

## 🔧 Files trong repo

### `vercel.json` (ở root - cho SPA routing)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### `frontend/.env.production`
```
REACT_APP_API_URL=https://your-backend-url.com
GENERATE_SOURCEMAP=false
CI=false
```

## ✅ Lợi ích của cách này

1. **Đơn giản hơn**: Vercel tự detect React app
2. **Ít lỗi**: Không cần custom build commands
3. **Tự động**: Framework preset handle mọi thứ
4. **Caching tối ưu**: Vercel tự config cho React

## 🚀 Test local trước khi deploy

```powershell
cd frontend
npm run build
npx serve -s build -p 3000
```

Truy cập http://localhost:3000 để test.

## 🎯 Troubleshooting

### Nếu vẫn lỗi build:
1. **Kiểm tra Root Directory** = `frontend`
2. **Framework** = Create React App
3. **Node.js Version** = 18.x (trong Project Settings)

### Nếu lỗi routing (404):
- File `vercel.json` ở root đã có rewrites để handle SPA

### Nếu cần backend:
- Deploy backend riêng (Railway, Render, etc.)
- Cập nhật `REACT_APP_API_URL`
