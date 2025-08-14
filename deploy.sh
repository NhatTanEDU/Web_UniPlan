#!/bin/bash
# Deploy script for Vercel

echo "🚀 Preparing for Vercel deployment..."

# Test build first
echo "📦 Testing build locally..."
npm run build:frontend:local

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Add all files
    echo "📝 Adding files to git..."
    git add .
    
    # Commit with deployment message
    echo "💾 Committing changes..."
    git commit -m "feat: add vercel deployment configuration

- Add vercel.json with proper build configuration
- Add .vercelignore to optimize build
- Add frontend/.env.production for production settings
- Disable ESLint warnings in production build
- Add security headers and caching optimization
- Update package.json with build scripts"
    
    # Push to GitHub
    echo "⬆️ Pushing to GitHub..."
    git push origin master
    
    echo "🎉 Code pushed! Now go to Vercel to deploy:"
    echo "1. Import project from GitHub"
    echo "2. Vercel will auto-detect the configuration"
    echo "3. Add environment variables in Vercel dashboard"
    echo "4. Deploy!"
    
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi
