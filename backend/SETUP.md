# 图标CRM - 后端安装与设置指南

## 前置要求

确保你的开发环境满足以下要求：

- **Node.js** >= 20.0.0
- **npm** >= 9.0.0 或 pnpm >= 8.0.0
- **PostgreSQL** >= 14.0 或使用 Prisma Postgres（免费云数据库）
- **Git**

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd tubiao-crm/backend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 文件并创建实际的 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tubiao_crm?schema=public"

# Application
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# JWT Secret
JWT_SECRET="your-jwt-secret-key-change-in-production"
```

### 4. 数据库设置

#### 选项A：使用本地PostgreSQL

1. 创建数据库：
```sql
CREATE DATABASE tubiao_crm;
```

2. 更新 `.env` 中的 `DATABASE_URL`

3. 运行数据库迁移：
```bash
npm run db:migrate
```

这会创建所有必要的表和关系。

#### 选项B：使用Prisma Postgres（推荐用于开发）

Prisma提供免费的云PostgreSQL数据库，非常适合开发和测试：

```bash
# 创建Prisma数据库（首次使用）
npm exec -- create-db

# 这会自动更新你的 DATABASE_URL
# 然后运行迁移
npm run db:migrate
```

### 5. 生成Prisma客户端

```bash
npm run db:generate
```

### 6. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 应该能看到Next.js的欢迎页面。

API端点示例：
- `http://localhost:3000/api/v1/contacts`
- `http://localhost:3000/api/v1/opportunities`
- `http://localhost:3000/api/v1/dashboard/overview`

## 数据库管理

### Prisma Studio

使用可视化界面管理数据库：

```bash
npm run db:studio
```

这会打开一个本地Web界面，可以查看和编辑数据库。

### 创建新迁移

当你修改了 `prisma/schema.prisma` 文件后：

```bash
npm run db:migrate
```

### 重置数据库（开发环境）

⚠️ **警告：此操作会删除所有数据！**

```bash
npx prisma migrate reset
```

## 测试

### 运行测试

```bash
npm test
```

### 监听模式运行测试

```bash
npm run test:watch
```

查看测试覆盖率的命令需在 jest.config.js 中配置 `coverage` 选项后运行。

## 代码质量

### 检查代码规范

```bash
npm run lint
```

### 格式化代码

```bash
npm run format
```

### 检查格式是否符合规范

```bash
npm run format:check
```

## 构建与部署

### 构建生产版本

```bash
npm run build
```

### 运行生产服务器

```bash
npm start
```

## 环境变量详解

| 变量名 | 说明 | 必需 | 示例 |
|--------|------|------|------|
| DATABASE_URL | PostgreSQL数据库连接字符串 | 是 | `postgresql://user:pass@localhost:5432/db` |
| NEXT_PUBLIC_API_BASE_URL | API基础URL | 是 | `http://localhost:3000` |
| NODE_ENV | 运行环境 | 否 | `development` \| `production` |
| JWT_SECRET | JWT密钥 | 生产环境必须 | `your-secret-key` |

## 常见问题

### 1. 数据库连接失败

检查PostgreSQL是否运行：
```bash
# macOS
psql -U postgres -c "SELECT version();"

# Linux
sudo systemctl status postgresql
```

### 2. Prisma客户端生成失败

删除 `node_modules/.prisma` 后重新生成：
```bash
rm -rf node_modules/.prisma
npm run db:generate
```

### 3. 端口被占用

修改 `next.config.ts` 或使用环境变量：
```bash
PORT=3001 npm run dev
```

### 4. 迁移冲突

重置迁移历史（开发环境）：
```bash
npx prisma migrate reset
```

## 开发工具推荐

- **PostgreSQL客户端**：TablePlus, DBeaver, pgAdmin
- **API测试**：Postman, Insomnia, 或使用 VS Code REST Client
- **Git GUI**：GitKraken, SourceTree

## 生产部署建议

### 推荐平台

1. **Vercel** - Next.js最佳选择
2. **Railway** - 简单的数据库托管
3. **Neon/PlanetScale** - 现代化云数据库
4. **Render/Fly.io** - 全栈应用部署

### 部署检查清单

- [ ] 设置生产环境的 `DATABASE_URL`
- [ ] 配置强 `JWT_SECRET`
- [ ] 设置 `NODE_ENV=production`
- [ ] 配置数据库备份策略
- [ ] 设置监控和日志
- [ ] 配置域名和SSL

## 下一步

- 查看 [API文档](../docs/03-API与数据字典-V1.md)
- 阅读 [技术栈说明](./TECH_STACK.md)
- 查看项目根目录的 README.md

## 获取帮助

如遇到问题，请：
1. 查看本文档的常见问题部分
2. 检查 [Prisma文档](https://www.prisma.io/docs)
3. 查看 [Next.js文档](https://nextjs.org/docs)
4. 联系项目维护者

---

版本: 0.1.0
最后更新: 2026-03-07
