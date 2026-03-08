# 图标CRM - 技术栈说明

## 概述

图标CRM 采用现代化的全栈架构，后端使用 Next.js API Routes + Prisma ORM 构建，提供高性能、可扩展的RESTful API服务。

## 技术栈总览

### 核心框架
- **Next.js 14.2** - React全栈框架，用于API Routes和服务端逻辑
- **TypeScript** - 类型安全的JavaScript超集
- **Node.js 20+** - 运行时环境

### 数据库与ORM
- **PostgreSQL** - 主数据库（关系型）
- **Prisma 5.19** - 类型安全的ORM框架
  - 自动类型生成
  - 数据库迁移管理
  - 可视化工具（Prisma Studio）

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Jest** - 单元测试框架
- **Supertest** - HTTP断言测试库

### 主要依赖
- **react** ^18.3.0 - UI库
- **zod** ^3.23.0 - 数据验证库（可用于请求验证）

## 架构设计

### 项目结构
```
backend/
├── src/
│   ├── app/
│   │   └── api/
│   │       └── v1/           # API v1路由
│   │           ├── contacts/ # 联系人接口
│   │           ├── opportunities/ # 机会接口
│   │           ├── projects/     # 项目接口
│   │           └── dashboard/    # 仪表盘接口
│   ├── lib/
│   │   └── prisma.ts         # Prisma客户端实例
│   └── middleware.ts         # 认证中间件
├── prisma/
│   └── schema.prisma         # 数据库模型定义
└── tests/                    # 测试文件
```

### API设计原则

1. **RESTful风格**
   - 标准HTTP方法（GET, POST, PATCH, DELETE）
   - 资源导向的URL设计
   - 统一的响应格式

2. **统一响应格式**

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
       "code": "ERROR_CODE",
       "message": "Error description"
     }
   }
   ```

3. **版本化API**
   - 所有API以 `/api/v1` 为前缀
   - 未来版本可通过 `/api/v2` 扩展

### 数据模型

核心实体：
- **User** - 用户
- **Contact** - 联系人
- **Node** - 超级节点（个人/组织）
- **Opportunity** - 商机
- **Project** - 项目
- **Interaction** - 跟进记录
- **Task** - 任务
- **CapabilityAsset** - 资料库

所有核心表包含审计字段：
- `createdAt` / `updatedAt`
- `createdBy` / `updatedBy`
- `isArchived` - 软删除标志

### 安全性

1. **认证机制**
   - Bearer Token（JWT）
   - 中间件自动验证

2. **数据安全**
   - SQL注入防护（Prisma ORM）
   - 输入验证（建议集成Zod）
   - 敏感数据保护

3. **错误处理**
   - 统一错误响应格式
   - 生产环境不暴露敏感信息

## 性能优化

1. **数据库层面**
   - 适当的索引优化
   - 查询结果分页
   - 使用select减少数据传输

2. **应用层面**
   - 并行查询（Promise.all）
   - 连接池管理（Prisma）
   - 可选Redis缓存（预留接口）

## 开发规范

### 代码风格
- 使用 Prettier 格式化
- 遵循 ESLint 规则
- TypeScript 严格模式

### 测试要求
- 单元测试覆盖率 > 70%
- 关键API必须有集成测试
- 使用 Jest + Supertest

### Git提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- refactor: 重构
- test: 测试相关
- chore: 构建/工具更新

## 版本信息

- 后端版本: 0.1.0
- API版本: v1.0
- 最后更新: 2026-03-07
