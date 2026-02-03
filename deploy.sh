#!/bin/bash
# 部署记账助手到 GitHub Pages

# 配置
REPO_URL=""  # 填写你的 GitHub 仓库地址，如 git@github.com:username/expense-tracker.git
BRANCH="gh-pages"
DIST_DIR="dist"

echo "🚀 开始部署记账助手..."

# 检查是否在 expense-tracker 目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在 expense-tracker 目录下运行此脚本"
    exit 1
fi

# 检查仓库地址
if [ -z "$REPO_URL" ]; then
    echo "⚠️ 请先在脚本中填写你的 GitHub 仓库地址"
    echo "格式: git@github.com:用户名/仓库名.git 或 https://github.com/用户名/仓库名.git"
    exit 1
fi

# 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 创建临时目录
echo "📁 准备部署..."
TEMP_DIR=$(mktemp -d)
cp -r $DIST_DIR/* $TEMP_DIR/

# 初始化 git 并推送到 gh-pages 分支
cd $TEMP_DIR
git init
git add .
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
git branch -M $BRANCH
git remote add origin $REPO_URL
git push -f origin $BRANCH

# 清理
cd -
rm -rf $TEMP_DIR

echo "✅ 部署完成！"
echo "🌐 访问地址: https://$(echo $REPO_URL | sed 's/.*github.com[:/]//' | sed 's/\.git$//' | sed 's/\//.github.io\//')"
