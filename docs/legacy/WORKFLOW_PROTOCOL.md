# WORKFLOW_PROTOCOL

## 统一对象模型
- projects：项目主表
- signals：招标前/政策前置信号
- leaders：关键人公开画像
- visits：拜访与跟进记录

## 协作节奏

### 日节奏
1. Project-Signal 抓取新增线索
2. Data-Engineer 完成去重与入库
3. Leader-Graph 对高优线索补关键人画像
4. PM 汇总“今日新增 + 风险”

### 周节奏
1. 政策情报更新优先赛道
2. 输出 Top20 线索清单
3. Sales 形成拜访计划
4. Compliance 抽检来源与合规

## 状态协议（任务看板）
- todo
- doing
- blocked
- review
- done

每个任务必须带：
- owner
- due_date
- source_links（可追溯）
- confidence（low/medium/high）

## 升级机制
- blocked 超过 24h：自动升级给 PM
- 高价值线索（score >= 80）：当日进入拜访计划
