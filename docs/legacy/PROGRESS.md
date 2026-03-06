# PROGRESS

## 2026-03-05 Checkpoint #1

- ✅ 完成样本数据文件：`data/sample_projects.csv`（5条）
- ✅ 完成评分脚本：`scripts/score_projects.py`
- ✅ 生成评分结果：`data/sample_projects_scored.csv`
- ✅ 输出 Top5 机会排序（见脚本输出）

### 下一步（Checkpoint #2）
1. 增加 `signals` 与 `leaders` 样本数据
2. 产出 `seed.sql`（可直接入库）
3. 增加一个 `daily_report.py` 自动生成日报摘要

## 2026-03-05 Checkpoint #2

- ✅ 新增 `signals` 样本：`data/sample_signals.csv`
- ✅ 新增 `leaders` 样本：`data/sample_leaders.csv`
- ✅ 新增种子脚本：`db/seed_v1.sql`
- ✅ 新增日报脚本：`scripts/daily_report.py`
- ✅ 生成日报：`docs/DAILY_REPORT.md`

## 2026-03-05 Checkpoint #3（关系网络模型）

- ✅ 新增六度关系图谱设计：`docs/RELATION_GRAPH_MODEL.md`
- ✅ 新增背书强度与路由评分：`docs/BACKING_SCORE_MODEL.md`
- ✅ 明确路径跳数约束（2~4跳）与风险闸门
