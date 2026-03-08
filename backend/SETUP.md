# 图标CRM 后端启动指南

## 快速开始（10分钟）

### 第1步：数据库（Supabase，免费）

1. 去 [supabase.com](https://supabase.com) 注册
2. 点 **New Project**，填项目名 `tubiao-crm`
3. 等约2分钟初始化完成
4. 进 **Settings → Database → Connection string → URI**
5. 复制连接串（格式：`postgresql://postgres:xxxx@db.xxxx.supabase.co:5432/postgres`）

### 第2步：环境变量

```bash
cd backend
cp .env.example .env
# 编辑 .env，填入 DATABASE_URL
```

### 第3步：安装依赖 & 建表

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
```

成功后会看到：
```
✔ Generated Prisma Client
✔ Applied 1 migration: 20260308_init
```

### 第4步：启动

```bash
npm run dev
# 服务跑在 http://localhost:3000
```

### 第5步：验证

```bash
# 测试 API
curl http://localhost:3000/api/v1/opportunities
# 应该返回：{"success":true,"data":{"opportunities":[],"pagination":{...}}}
```

---

## 机器人配置

在 `.env` 中填入 Telegram 配置后，可手动测试机器人：

```bash
# 机会猎手（采集政府项目）
BOT_TASK=opportunity-hunter npx ts-node src/bots/index.ts

# 跟进卫士（检查待跟进项目）
BOT_TASK=followup-guard npx ts-node src/bots/index.ts
```

机器人 cron 定时任务在 OpenClaw 中配置（见主工作区 HEARTBEAT.md）。

---

## 项目结构

```
backend/
├── src/
│   ├── app/api/v1/          # REST API 路由
│   │   ├── contacts/        # 联系人
│   │   ├── nodes/           # 超级节点
│   │   ├── opportunities/   # 机会（含转项目接口）
│   │   ├── projects/        # 项目
│   │   ├── interactions/    # 跟进记录
│   │   ├── tasks/           # 任务
│   │   └── dashboard/       # 看板统计
│   ├── bots/                # 机器人
│   │   ├── opportunity-hunter.ts  # 机会猎手
│   │   ├── followup-guard.ts      # 跟进卫士
│   │   └── index.ts               # 调度入口
│   ├── lib/prisma.ts        # Prisma 客户端
│   └── middleware.ts        # 认证中间件
├── prisma/
│   └── schema.prisma        # 数据模型（8个表）
├── .env.example             # 环境变量模板
└── TECH_STACK.md            # 技术栈说明
```

---

## API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/opportunities | 机会列表 |
| POST | /api/v1/opportunities | 创建机会 |
| GET | /api/v1/opportunities/:id | 机会详情 |
| PATCH | /api/v1/opportunities/:id | 更新机会 |
| POST | /api/v1/opportunities/:id/convert-project | 机会转项目 |
| GET | /api/v1/projects | 项目列表 |
| GET | /api/v1/projects/:id | 项目详情 |
| PATCH | /api/v1/projects/:id | 更新项目阶段 |
| GET | /api/v1/contacts | 联系人列表 |
| POST | /api/v1/contacts | 创建联系人 |
| GET | /api/v1/nodes | 超级节点列表 |
| POST | /api/v1/nodes | 创建节点 |
| GET | /api/v1/interactions | 跟进记录 |
| POST | /api/v1/interactions | 记录跟进 |
| GET | /api/v1/tasks | 任务列表 |
| POST | /api/v1/tasks | 创建任务 |
| PATCH | /api/v1/tasks/:id | 更新/完成任务 |
| GET | /api/v1/dashboard/overview | 看板统计 |
