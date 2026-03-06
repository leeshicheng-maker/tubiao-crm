# RELATION_GRAPH_MODEL（六度人脉 + 政治语境）

## 目标
在 ToG 场景中，把“人脉直觉”转换为可计算的通路模型，用于项目推进路径推荐。

## 建模原则
1. 仅使用公开信息（官网、人事任免、公开报道、政府公文）。
2. 事实层与推断层分离。
3. 路径推荐仅作决策辅助，不替代人工判断。

## 图谱结构
- 节点（Node）
  - Leader（官员）
  - Business Connector（企业侧关键人/超级节点）
  - Org（机构）
  - Project（项目）

- 关系边（Edge）
  - superior_of（上下级）
  - same_system（同系统任职）
  - co_worked（同地/同单位共事）
  - alumni（同校）
  - co_appeared（公开活动共同出现）
  - introduced_by（引荐关系，需审计）

## 六度约束
- 推荐路径长度：2~4 跳（默认不超过4）
- 大于4跳视为弱路径，不进入一线推荐

## 路径可信度
每条边必须带：
- source_url
- evidence_text
- confidence (low/medium/high)
- updated_at

路径可信度 = 边可信度的加权聚合（含时间衰减）

## 输出
- 路径推荐（2~4条）
- 每条路径的解释：为什么推荐、风险点、备选路径
- 风险标识：单点依赖/信息陈旧/证据不足
