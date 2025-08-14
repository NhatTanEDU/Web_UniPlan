@echo off
echo 🧪 Testing frontend build before deploy...

cd frontend
echo 📂 Current directory: %CD%

echo 📦 Installing dependencies...
npm install

echo 🔨 Building React app...
npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo 📁 Build output:
    dir build
    echo.
    echo 🚀 Ready to deploy! 
    echo 👉 Go to Vercel and set Root Directory = frontend/
) else (
    echo ❌ Build failed! Fix errors before deploy.
)

pause
