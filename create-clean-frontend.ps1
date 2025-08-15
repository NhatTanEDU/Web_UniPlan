# Script tạo UniPlan-Frontend-Clean cho Railway deployment
$sourceDir = "Web_UniPlan-master\Web_UniPlan-master\frontend"
$targetDir = "UniPlan-Frontend-Clean"

Write-Host "🚀 Tạo UniPlan-Frontend-Clean cho Railway deployment..."

# Copy essential files
Write-Host "📦 Copy essential files..."
Copy-Item "$sourceDir\package.json" "$targetDir\"
Copy-Item "$sourceDir\package-lock.json" "$targetDir\"
Copy-Item "$sourceDir\tsconfig.json" "$targetDir\"
Copy-Item "$sourceDir\tailwind.config.js" "$targetDir\"
Copy-Item "$sourceDir\postcss.config.js" "$targetDir\"
Copy-Item "$sourceDir\.env.production" "$targetDir\"
Copy-Item "$sourceDir\.env.example" "$targetDir\"
Copy-Item "$sourceDir\.gitignore" "$targetDir\"

# Copy directories
Write-Host "📁 Copy directories..."
Copy-Item "$sourceDir\public" "$targetDir\public" -Recurse
Copy-Item "$sourceDir\src" "$targetDir\src" -Recurse

# Create deployment files
Write-Host "⚙️ Create deployment files..."

# Procfile
@"
web: npm run build && npx serve -s build -l `$PORT
"@ | Out-File "$targetDir\Procfile" -Encoding UTF8

# Railway-optimized package.json
$packageJson = @"
{
  "name": "uniplan-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@ant-design/icons": "^6.0.0",
    "@hello-pangea/dnd": "^18.0.1",
    "@heroicons/react": "^2.2.0",
    "@radix-ui/react-slot": "^1.2.0",
    "@tailwindcss/aspect-ratio": "^0.4.2",
    "@tailwindcss/forms": "^0.5.10",
    "@vercel/analytics": "^1.5.0",
    "antd": "^5.26.1",
    "axios": "^1.8.4",
    "chart.js": "^4.4.8",
    "date-fns": "^4.1.0",
    "dhtmlx-gantt": "^9.0.11",
    "echarts": "^5.6.0",
    "echarts-for-react": "^3.0.2",
    "framer-motion": "^12.9.4",
    "gantt-task-react": "^0.3.9",
    "lucide-react": "^0.487.0",
    "react": "^18.3.1",
    "react-beautiful-dnd": "^13.1.1",
    "react-dom": "^18.3.1",
    "react-dropzone": "^14.3.8",
    "react-hot-toast": "^2.5.2",
    "react-router-dom": "^7.5.0",
    "react-scripts": "5.0.1",
    "react-toastify": "^11.0.5",
    "serve": "^14.2.3",
    "socket.io-client": "^4.8.1",
    "tailwindcss-animate": "^1.0.7",
    "web-vitals": "^2.1.4"
  },
  "devDependencies": {
    "@types/react": "^19.1.3",
    "@types/react-dom": "^19.1.4",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.1"
  },
  "scripts": {
    "start": "serve -s build -l `$PORT",
    "build": "react-scripts build",
    "dev": "react-scripts start",
    "test": "react-scripts test"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
"@
$packageJson | Out-File "$targetDir\package.json" -Encoding UTF8

# README for deployment
$readme = @"
# 🚀 UniPlan Frontend - Railway Deployment

## 📋 Production Ready Frontend

**Tech Stack:** React + TypeScript + Tailwind CSS  
**Backend API:** https://web-production-61868.up.railway.app  
**Deployment:** Railway Platform  

## 🔧 Environment Variables

Set these in Railway dashboard:
``````
REACT_APP_API_URL=https://web-production-61868.up.railway.app
REACT_APP_FRONTEND_URL=https://your-frontend-url.railway.app
GENERATE_SOURCEMAP=false
CI=false
DISABLE_ESLINT_PLUGIN=true
``````

## 🚀 Deployment Commands

**Build:** ``npm run build``  
**Start:** ``npm start``  

## ✅ Features

- ✅ User Authentication
- ✅ Project Management  
- ✅ Kanban Boards
- ✅ Team Collaboration
- ✅ Real-time Updates
- ✅ File Management
- ✅ Responsive Design

**🎯 Optimized for Railway deployment!**
"@
$readme | Out-File "$targetDir\README.md" -Encoding UTF8

Write-Host "✅ UniPlan-Frontend-Clean created successfully!"
Write-Host "📁 Location: $targetDir"
Write-Host "🚀 Ready for Railway deployment!"
