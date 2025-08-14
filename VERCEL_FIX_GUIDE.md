# Fix Vercel Build Error - Step by Step Guide

## 🚨 Lỗi hiện tại
```
Command "react-scripts build" exited with 127
```

**Nguyên nhân:** Vercel đang build ở root directory thay vì frontend directory.

## ✅ Cách fix (2 phương pháp)

### Phương pháp 1: Cấu hình Root Directory trong Vercel Dashboard (KHUYẾN NGHỊ)

1. **Vào Vercel Project Settings:**
   - Dashboard → Project → Settings → General

2. **Cập nhật Root Directory:**
   - Tìm mục "Root Directory"
   - Thay đổi từ `.` (root) thành `frontend`
   - Save settings

3. **Redeploy:**
   - Vào Deployments tab
   - Click "Redeploy" trên deployment mới nhất

### Phương pháp 2: Cấu hình Environment Variables

Trong Vercel Project Settings → Environment Variables, thêm:
```
CI=false
GENERATE_SOURCEMAP=false
NODE_ENV=production
```

## 🔧 Files đã được cập nhật

### `vercel.json` (đã simplified)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 📋 Checklist để deploy thành công

### ✅ Local build working:
```powershell
cd frontend
npm run build
# Should succeed without errors
```

### ✅ Dependencies installed:
- `@vercel/analytics` ✓
- `react-scripts` ✓ (trong frontend/package.json)

### ✅ Vercel Configuration:
- [ ] Root Directory = `frontend` (trong Vercel Dashboard)
- [ ] Framework Preset = "Create React App" (auto-detected)
- [ ] Build Command = `npm run build` (auto-detected)
- [ ] Output Directory = `build` (auto-detected)

## 🎯 Tại sao lỗi này xảy ra?

### Monorepo Structure:
```
Web_UniPlan-master/
├── backend/          ← Backend code
├── frontend/         ← React app (cần build này)
├── package.json      ← Root package.json (không có react-scripts)
└── vercel.json       ← Vercel config
```

### Vấn đề:
- Vercel mặc định build ở root (`Web_UniPlan-master/`)
- Root không có `react-scripts` → Command not found (127)
- Cần chỉ định build trong `frontend/` directory

## 🚀 Next Steps

1. **Push code hiện tại:**
   ```powershell
   git add .
   git commit -m "fix: simplify vercel.json and update deployment guide"
   git push origin master
   ```

2. **Cấu hình Vercel Dashboard:**
   - Root Directory: `frontend`
   - Environment Variables: CI=false, GENERATE_SOURCEMAP=false

3. **Redeploy và check logs**

## 🔍 Troubleshooting

### Nếu vẫn lỗi:
1. Check Build & Development Settings trong Vercel
2. Override Build Command = `cd frontend && npm run build`
3. Override Output Directory = `frontend/build`

### Nếu deploy thành công nhưng blank page:
- Check browser console for errors
- Verify API URLs trong environment variables
- Check CORS settings trong backend

Ready để deploy! 🎉
