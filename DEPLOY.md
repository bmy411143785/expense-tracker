# 🚀 部署指南

记账助手构建完成！以下是多种部署方案：

---

## 方案一：Vercel（推荐，最简单）

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署
```bash
cd expense-tracker
vercel --prod
```

✅ 完成！Vercel 会自动给你一个 `.vercel.app` 域名。

---

## 方案二：GitHub Pages（免费）

### 1. 创建 GitHub 仓库
- 在 GitHub 创建一个新仓库，如 `expense-tracker`

### 2. 编辑部署脚本
```bash
# 编辑 deploy.sh，填写你的仓库地址
REPO_URL="git@github.com:你的用户名/expense-tracker.git"
```

### 3. 运行部署脚本
```bash
cd expense-tracker
./deploy.sh
```

### 4. 启用 GitHub Pages
- 进入仓库 Settings → Pages
- Source 选择 "Deploy from a branch"
- Branch 选择 "gh-pages"
- 点击 Save

✅ 访问地址：`https://你的用户名.github.io/expense-tracker`

---

## 方案三：Netlify

### 方式 A：拖拽上传
1. 打开 https://app.netlify.com/drop
2. 将 `expense-tracker/dist` 文件夹拖拽到页面
3. 获得即时在线链接

### 方式 B：Git 集成
1. 将代码推送到 GitHub
2. 在 Netlify 导入项目
3. Build command: `npm run build`
4. Publish directory: `dist`

---

## 方案四：Cloudflare Pages

1. 登录 https://dash.cloudflare.com
2. 进入 Pages → Create a project
3. 连接 GitHub 仓库
4. Build settings:
   - Build command: `npm run build`
   - Build output directory: `/dist`
5. 点击 Save and Deploy

---

## 📦 当前构建状态

- ✅ 构建完成：`expense-tracker/dist/`
- 📁 文件大小：约 2.2MB（已压缩）
- 🎯 可直接部署到任何静态托管服务

---

## 🔧 本地预览生产版本

```bash
cd expense-tracker
npm run preview
```

---

选择一种方案开始部署吧！遇到问题随时问我。
