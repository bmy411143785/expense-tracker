# 💰 记账助手 - Expense Tracker

一款基于 Vue3 + Ant Design Vue 的现代化个人记账应用，帮助您轻松管理日常消费，掌握资金流向。

![Vue3](https://img.shields.io/badge/Vue-3.4-42b883)
![Ant Design Vue](https://img.shields.io/badge/Ant%20Design%20Vue-4.x-1890ff)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ 功能特性

### 📝 快速记账
- 3秒完成一笔记录
- 快捷金额按钮（10/20/50/100/200/500）
- 智能记住上次消费类型
- 支持备注和支付方式

### 🏷️ 消费类型管理
- 10+ 系统预设类型
- 自定义类型（增删改查）
- 图标和颜色自定义
- 为类型设置月度预算

### 📊 多维统计分析
- **周统计**: 本周每日趋势、类别占比、与上周对比
- **月统计**: 月度总览、每日趋势、预算完成情况
- **年统计**: 年度总览、月度对比、消费热力图

### 🎨 精美设计
- 大气现代的 UI 设计
- 浅色/深色主题切换
- 响应式布局（支持移动端）
- 流畅的动画效果

### 🔒 数据安全
- 纯本地存储，数据完全私有
- 无需注册登录
- 支持数据导入导出

## 🚀 快速开始

### 安装依赖
```bash
cd expense-tracker
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本
```bash
npm run build
```

## 📱 项目截图

### 仪表盘
- 今日/本周/本月支出概览
- 近7天消费趋势图
- 本月类别占比饼图
- 最近记录列表

### 记账页面
- 大数字金额输入
- 图标网格选择消费类型
- 快捷金额按钮
- 今日记录列表

### 消费类型管理
- 表格展示所有类型
- 新增/编辑/删除类型
- 图标和颜色选择器
- 月度预算设置

### 统计分析
- 周/月/年维度切换
- 多维度数据概览
- 趋势图 + 饼图 + 柱状图
- 类别消费明细表

## 🏗️ 技术架构

```
expense-tracker/
├── src/
│   ├── assets/           # 静态资源
│   ├── components/       # 公共组件
│   │   └── Layout.vue    # 主布局组件
│   ├── views/            # 页面视图
│   │   ├── Dashboard.vue # 仪表盘
│   │   ├── Record.vue    # 记账页面
│   │   ├── Categories.vue # 类型管理
│   │   └── Statistics.vue # 统计分析
│   ├── stores/           # Pinia 状态管理
│   │   ├── settings.js   # 用户设置
│   │   ├── categories.js # 消费类型
│   │   └── records.js    # 消费记录
│   ├── utils/            # 工具函数
│   │   └── storage.js    # 本地存储封装
│   ├── router/           # 路由配置
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🛠️ 技术栈

- **前端框架**: Vue 3.4 (Composition API)
- **UI 组件库**: Ant Design Vue 4.x
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **图表库**: ECharts 5 + vue-echarts
- **构建工具**: Vite 5
- **日期处理**: Day.js

## 📊 数据模型

### 消费类型 Category
```typescript
{
  id: string;           // 唯一标识
  name: string;         // 类型名称
  icon: string;         // 图标名称
  color: string;        // 主题色
  budget?: number;      // 月度预算
  isDefault: boolean;   // 是否系统预设
  sortOrder: number;    // 排序权重
}
```

### 消费记录 Record
```typescript
{
  id: string;           // 唯一标识
  amount: number;       // 金额
  type: string;         // 类型ID
  date: string;         // 日期 (YYYY-MM-DD)
  paymentMethod: string; // 支付方式
  note?: string;        // 备注
  createdAt: string;    // 创建时间
  updatedAt: string;    // 更新时间
}
```

## 🎯 开发计划

### Phase 1 - MVP ✅
- [x] 项目框架搭建
- [x] 消费类型 CRUD
- [x] 基础记账功能
- [x] 简单统计
- [x] 数据本地存储

### Phase 2 - 核心功能完善 ✅
- [x] 周/月/年统计图表
- [x] 仪表盘首页
- [x] 记录筛选查询
- [x] 预算设置与提醒

### Phase 3 - 体验优化
- [ ] 数据导入导出
- [ ] 快捷记账模板
- [ ] 更多图表类型
- [ ] 移动端适配优化

### Phase 4 - 高级功能
- [ ] 多账本支持
- [ ] 收入记录
- [ ] 账单提醒
- [ ] 数据云同步

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License

---

Made with ❤️ by OpenClaw
