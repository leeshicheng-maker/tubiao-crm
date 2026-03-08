# 图标CRM - 项目 README

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.19-2D3748)](https://www.prisma.io/)

> 专业的CRM系统，专注于节点管理、商机跟进和项目管理

## 📋 目录

- [项目概述](#项目概述)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [开发指南](#开发指南)
- [API文档](#api文档)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 🎯 项目概述

图标CRM是一个现代化的客户关系管理系统，帮助团队管理：
- 🤝 联系人和超级节点
- 💼 商机（Opportunities）全生命周期
- 📋 项目（Projects）进度跟踪
- 📝 跟进记录和任务管理
- 📊 仪表盘和数据分析

## ✨ 功能特性

### 核心功能
- ✅ 联系人管理与标签系统
- ✅ 超级节点（个人/组织）管理
- ✅ 商机跟踪：从线索到结案
- ✅ 项目管理：阶段流转和进度管理
- ✅ 互动记录：通话、会议、消息等
- ✅ 任务系统：优先级和状态管理
- ✅ 资料库：文档和最佳实践共享
- ✅ 数据看板：实时业务概览

### 技术特点
- 🚀 Next.js 14 + TypeScript
- 💎 Prisma ORM + PostgreSQL
- 🎨 现代化的API设计（RESTful）
- 🧪 完整的测试覆盖
- 📦 代码质量工具（ESLint + Prettier）
- 🔒 安全认证（JWT）

## 📁 项目结构

```
tubiao-crm/
├── backend/              # 后端项目（Next.js API）
│   ├── src/
│   │   ├── app/api/v1/  # API路由
│   │   └── lib/         # 工具库
│   ├── prisma/          # 数据库模型
│   ├── tests/           # 测试文件
│   ├── package.json
│   ├── TECH_STACK.md    # 技术栈文档
│   └── SETUP.md        # 安装指南
├── frontend/            # 前端项目（待开发）
├── mobile/              # 移动端项目（待开发）
├── docs/                # 项目文档
│   ├── 01-产品需求-V1.md
│   ├── 02-用户故事-V1.md
│   └── 03-API与数据字典-V1.md
├── legacy-data/         # 历史数据迁移
├── legacy-scripts/      # 历史脚本
└── README.md
```

## 🚀 快速开始

### 前置要求

- Node.js >= 20.0.0
- PostgreSQL >= 14.0（或使用Prisma Postgres）
- npm >= 9.0.0

### 后端安装

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接

# 运行数据库迁移
npm run db:migrate

# 生成Prisma客户端
npm run db:generate

# 启动开发服务器
npm run dev
```

后端服务将在 `http://localhost:3000` 启动

详细的安装指南请查看 [后端SETUP指南](./backend/SETUP.md)

## 📚 开发指南

### 开发后端API

1. **添加新的API端点**
   - 在 `src/app/api/v1/` 创建或修改路由文件
   - 遵循统一的响应格式（参考 `src/app/api/v1/route.ts`）

2. **数据库变更**
   - 修改 `prisma/schema.prisma`
   - 运行 `npm run db:migrate` 应用变更
   - 运行 `npm run db:generate` 更新类型

3. **运行测试**
   ```bash
   npm test              # 运行所有测试
   npm run test:watch    # 监听模式
   ```

4. **代码质量**
   ```bash
   npm run lint          # 检查代码规范
   npm run format        # 格式化代码
   ```

详细的技术栈说明请查看 [TECH_STACK.md](./backend/TECH_STACK.md)

## 📖 API文档

API采用RESTful风格，统一前缀为 `/api/v1`

### 主要端点

| 资源 | 方法 | 端点 | 说明 |
|------|------|------|------|
| 联系人 | GET | `/api/v1/contacts` | 获取联系人列表 |
| 联系人 | POST | `/api/v1/contacts` | 创建联系人 |
| 联系人 | GET | `/api/v1/contacts/:id` | 获取联系人详情 |
| 机会 | GET | `/api/v1/opportunities` | 获取机会列表 |
| 机会 | POST | `/api/v1/opportunities` | 创建机会 |
| 看板 | GET | `/api/v1/dashboard/overview` | 获取仪表盘数据 |

完整的API文档请查看 [API与数据字典](./docs/03-API与数据字典-V1.md)

### 响应格式

成功响应：
```json
{
  "success": true,
  "data": {},
  "message": "Success"
}
```

错误响应：
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

## 🛠️ 开发工具

### 推荐VS Code插件
- Prisma
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- REST Client（用于测试API）

### 常用命令

```bash
# 后端
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm run test             # 运行测试
npm run db:studio        # 打开Prisma数据库管理界面
npm run db:migrate       # 运行数据库迁移
npm run format           # 格式化代码

# 检查项目状态
git status
```

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

### 提交规范

使用语义化提交信息：
- `feat:` 新功能
- `fix:` Bug修复
- `docs:` 文档更新
- `style:` 代码格式（不影响代码运行的变动）
- `refactor:` 重构（既不是新增功能，也不是修改bug的代码变动）
- `test:` 增加测试
- `chore:` 构建过程或辅助工具的变动

## 📝 项目进度

- [x] 项目规划和需求分析
- [x] API设计文档
- [x] 后端项目结构搭建
- [x] Prisma Schema设计
- [x] API路由架构
- [x] 测试框架初始化
- [ ] 前端项目开发
- [ ] 移动端开发
- [ ] 生产环境部署

## 🔐 安全性

- 生产环境必须配置 `JWT_SECRET`
- 敏感数据存储使用环境变量
- API端点需要认证（除公开端点外）
- 数据库连接使用SSL（生产环境）

## 📧 联系方式

项目维护者：李世成（老李）

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**版本**: 0.1.0
**最后更新**: 2026-03-07
**状态**: 🚧 开发中
