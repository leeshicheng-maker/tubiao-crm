# BACKING_SCORE_MODEL（背书强度模型）

## 目标
衡量“某路径上的关键人是否能形成有效背书”，用于排序通路方案。

## 单边背书分（EdgeBackingScore）
EdgeBackingScore = 0.30 * RoleProximity
                 + 0.25 * CoWorkStrength
                 + 0.20 * Recency
                 + 0.15 * EvidenceCredibility
                 + 0.10 * AccessStability

各项范围：0~100

### 维度说明
1. RoleProximity（角色接近度）
   - 上下级 > 同系统 > 同校/同地 > 弱关联
2. CoWorkStrength（共事强度）
   - 共事时长、同项目次数、同条线关联
3. Recency（时效）
   - 近2年权重高，超5年明显衰减
4. EvidenceCredibility（证据可信）
   - 官方来源 > 主流媒体 > 其他公开来源
5. AccessStability（可触达稳定性）
   - 历史互动成功率、节点活跃度

## 路径背书分（PathBackingScore）
- 对路径中各边的 EdgeBackingScore 做几何平均
- 对跳数增加惩罚：
  - 2跳：x1.00
  - 3跳：x0.90
  - 4跳：x0.78

PathBackingScore = GeoMean(edge_scores) * HopPenalty

## 最终路由分（FinalRouteScore）
FinalRouteScore = 0.60 * ProjectMaturityScore + 0.40 * PathBackingScore

分级建议：
- A：>=80（优先推进）
- B：65~79（可推进，需补证据）
- C：50~64（观察）
- D：<50（暂缓）

## 风险闸门
出现以下任一条件，自动降级一档：
- 路径存在单点依赖
- 核心边 evidence 为 low
- 边更新时间超过 24 个月
