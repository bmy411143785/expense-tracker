#!/bin/bash
# 一键部署到 GitHub Pages

set -e

echo "🚀 部署记账助手到 GitHub Pages"
echo ""

# 检查是否在正确目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在 expense-tracker 目录下运行此脚本"
    exit 1
fi

# 构建项目
echo "📦 步骤 1/4: 构建项目..."
npm run build
echo "✅ 构建完成"
echo ""

# 部署到 gh-pages 分支
echo "📤 步骤 2/4: 部署到 gh-pages 分支..."
cd dist

# 初始化 git
git init
git add .
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 获取 GitHub 用户名
if [ -z "$1" ]; then
    echo "请输入你的 GitHub 用户名:"
    read USERNAME
else
    USERNAME=$1
fi

REPO_URL="https://github.com/$USERNAME/expense-tracker.git"

echo "推送到: $REPO_URL"
git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
git branch -M gh-pages
git push -f origin gh-pages

echo "✅ 部署完成"
echo ""
echo "🌐 访问地址: https://$USERNAME.github.io/expense-tracker"
echo ""
echo "注意：如果是首次部署，请在 GitHub 仓库设置中启用 Pages:"
echo "  1. 访问 https://github.com/$USERNAME/expense-tracker/settings/pages"
echo "  2. Source 选择 'Deploy from a branch'"
echo "  3. Branch 选择 'gh-pages'"
echo "  4. 点击 Save"
