#!/bin/bash

echo "🚀 BenchWise Deployment Script"
echo "=============================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not initialized. Please run:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

echo "✅ Git repository found"

# Check if all files are committed
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Uncommitted changes detected. Please commit them first:"
    git status --short
    echo ""
    echo "Run: git add . && git commit -m 'Prepare for deployment'"
    exit 1
fi

echo "✅ All changes committed"

# Check if remote origin is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin set. Please add your GitHub repository:"
    echo "   git remote add origin <your-github-repo-url>"
    exit 1
fi

echo "✅ Remote origin configured"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
    echo ""
    echo "🎉 Ready for Render deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Go to https://dashboard.render.com/"
    echo "2. Create a new Web Service for the backend"
    echo "3. Create a new Static Site for the frontend"
    echo "4. Follow the DEPLOYMENT.md guide"
    echo ""
    echo "Backend URL will be: https://benchwise-server.onrender.com"
    echo "Frontend URL will be: https://benchwise-client.onrender.com"
else
    echo "❌ Failed to push to GitHub. Please check your connection and try again."
    exit 1
fi
