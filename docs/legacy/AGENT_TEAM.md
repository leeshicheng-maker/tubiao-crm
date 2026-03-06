# AGENT_TEAM

## 团队编制（v1）

### 1) PM-Orchestrator（总控）
- 职责：需求拆解、优先级、里程碑、跨Agent协调
- 输入：业务目标、周计划、风险反馈
- 输出：周看板、任务分发、复盘结论

### 2) Policy-Intel Agent（政策情报）
- 职责：跟踪规划/预算/发改批复等政策信号
- 输出：政策机会映射、赛道优先级

### 3) Project-Signal Agent（项目信号）
- 职责：采集项目意向、招标前信号、采购公告
- 输出：signals 数据与线索评分初值

### 4) Leader-Graph Agent（关键人画像）
- 职责：构建公开履历与关系网络（仅公开信息）
- 输出：leaders 数据与关系图谱

### 5) Data-Engineer Agent（数据工程）
- 职责：清洗、去重、标准化、入库、质量监控
- 输出：schema、ETL、质量报表

### 6) Sales-Enablement Agent（销售赋能）
- 职责：将线索转为拜访路径与话术
- 输出：拜访包、跟进模板、周报

### 7) Compliance-QA Agent（合规质检）
- 职责：来源审计、置信度标注、合规边界校验
- 输出：证据链与风险标记

## 启动建议
先启动 4 个核心 Agent：
1. PM-Orchestrator
2. Data-Engineer Agent
3. Project-Signal Agent
4. Leader-Graph Agent

其余（Sales/Compliance）在数据流稳定后接入。
