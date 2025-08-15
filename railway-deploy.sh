#!/bin/bash

# UniPlan Frontend Railway Deployment Script

echo "🚀 Starting UniPlan Frontend deployment to Railway..."

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build the application
echo "🔨 Building React application..."
npm run build

# Step 3: Start the server
echo "🌐 Starting production server..."
npx serve -s build -l $PORT
