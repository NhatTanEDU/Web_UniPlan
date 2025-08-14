@echo off
REM Deploy script for Vercel (Windows)

echo 🚀 Preparing for Vercel deployment...

REM Test build first
echo 📦 Testing build locally...
call npm run build:frontend:local

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    
    REM Add all files
    echo 📝 Adding files to git...
    git add .
    
    REM Commit with deployment message
    echo 💾 Committing changes...
    git commit -m "feat: add vercel deployment configuration

- Add vercel.json with proper build configuration
- Add .vercelignore to optimize build  
- Add frontend/.env.production for production settings
- Disable ESLint warnings in production build
- Add security headers and caching optimization
- Update package.json with build scripts"
    
    REM Push to GitHub
    echo ⬆️ Pushing to GitHub...
    git push origin master
    
    echo 🎉 Code pushed! Now go to Vercel to deploy:
    echo 1. Import project from GitHub
    echo 2. Vercel will auto-detect the configuration
    echo 3. Add environment variables in Vercel dashboard
    echo 4. Deploy!
    
) else (
    echo ❌ Build failed! Please fix errors before deploying.
    pause
    exit /b 1
)

pause
