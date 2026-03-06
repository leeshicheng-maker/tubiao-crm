# 图标CRM｜API与数据字典 V1

版本：V1.0  
日期：2026-03-06

## 1. API设计原则
- RESTful + JSON
- 统一前缀：`/api/v1`
- 认证：Bearer Token
- 审计：关键写操作记录 `operatorId`、`timestamp`

## 2. 核心接口（P0）

## 2.1 联系人与超级节点
- `GET /contacts`
- `POST /contacts`
- `GET /contacts/:id`
- `PATCH /contacts/:id`
- `GET /nodes`
- `POST /nodes`
- `GET /nodes/:id`
- `PATCH /nodes/:id`

## 2.2 机会与项目
- `GET /opportunities`
- `POST /opportunities`
- `GET /opportunities/:id`
- `PATCH /opportunities/:id`
- `POST /opportunities/:id/convert-project`（机会转项目）
- `GET /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`

## 2.3 跟进与任务
- `GET /interactions?targetType=&targetId=`
- `POST /interactions`
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`

## 2.4 资料库与看板
- `GET /capability-assets`
- `POST /capability-assets`
- `GET /dashboard/overview`

## 3. 关键请求体（示例）

### 3.1 创建机会
```json
{
  "title": "某市智慧项目合作",
  "sourceNodeId": "node_123",
  "industry": "政务数字化",
  "budgetRange": "100-300万",
  "urgency": "high",
  "ownerId": "user_001"
}
```

### 3.2 机会转项目
```json
{
  "ownerId": "user_002",
  "stage": "初筛",
  "nextAction": "安排首次沟通",
  "nextActionDueAt": "2026-03-10T10:00:00+08:00"
}
```

## 4. 错误码（V1）
- `400` 参数错误
- `401` 未认证
- `403` 无权限
- `404` 资源不存在
- `409` 状态冲突（如重复转项目）
- `500` 服务异常

## 5. 数据字典（补充）

### 5.1 枚举
- Opportunity.status: `new|assessing|advancing|converted|closed`
- Project.stage: `screening|contact|proposal|negotiation|won|lost`
- Task.priority: `low|medium|high|urgent`
- Interaction.type: `call|meeting|message|email`

### 5.2 审计字段（所有核心表）
- `createdAt`
- `updatedAt`
- `createdBy`
- `updatedBy`
- `isArchived`

## 6. V1约束
- 删除操作统一改为归档 `isArchived=true`
- 敏感字段返回受角色控制
- 项目7天未更新需出现在看板预警

---

下一步：输出 `04-低保真原型说明-V1.md`