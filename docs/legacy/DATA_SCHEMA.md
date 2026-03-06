# DATA_SCHEMA（v1）

## 1) projects（项目主表）
- id (uuid, pk)
- project_name (text, not null)
- region_level (text) -- 省/市/区
- region_name (text)
- industry (text)
- budget_amount (numeric)
- currency (text, default CNY)
- stage (text) -- 规划/意向/立项/招标前/招标中/中标/落地
- expected_bid_date (date)
- owner_agency (text)
- source_url (text)
- source_type (text) -- 公告/批复/预算/新闻
- score (int, default 0)
- confidence (text) -- low/medium/high
- created_at (timestamp)
- updated_at (timestamp)

## 2) signals（前置信号表）
- id (uuid, pk)
- project_id (uuid, fk -> projects.id)
- signal_type (text) -- 意向公告/发改批复/预算披露/调研消息
- signal_title (text)
- signal_date (date)
- signal_value (text)
- source_url (text)
- extracted_fields (jsonb)
- confidence (text)
- created_at (timestamp)

## 3) leaders（关键人画像）
- id (uuid, pk)
- name (text, not null)
- gender (text)
- current_title (text)
- agency (text)
- region_name (text)
- education (text)
- resume_summary (text)
- career_path (jsonb)
- relation_notes (text) -- 仅公开信息的关系备注
- source_url (text)
- confidence (text)
- created_at (timestamp)
- updated_at (timestamp)

## 4) project_leaders（项目-关键人关联）
- id (uuid, pk)
- project_id (uuid, fk)
- leader_id (uuid, fk)
- role_type (text) -- 决策/分管/执行/影响
- evidence_url (text)
- confidence (text)
- created_at (timestamp)

## 5) visits（拜访记录）
- id (uuid, pk)
- project_id (uuid, fk)
- leader_id (uuid, fk, nullable)
- visit_date (date)
- visitor_name (text)
- channel (text) -- 上门/电话/会议/活动
- summary (text)
- outcome (text) -- 正向/中性/负向
- next_action (text)
- next_action_due (date)
- owner (text)
- created_at (timestamp)
- updated_at (timestamp)

## 6) scoring_logs（评分日志）
- id (uuid, pk)
- project_id (uuid, fk)
- timeliness_score (int)
- budget_score (int)
- policy_match_score (int)
- accessibility_score (int)
- competition_score (int)
- final_score (int)
- rule_version (text)
- scored_at (timestamp)

## 索引建议
- projects(region_name, stage)
- projects(score desc)
- signals(project_id, signal_date desc)
- leaders(region_name, agency)
- visits(project_id, visit_date desc)

## 合规说明
- 仅存储公开来源信息
- 每条核心记录需保留 source_url
- 推理字段需标注 confidence

## 7) leader_positions（领导任职轨迹）
- id (uuid, pk)
- leader_id (uuid, fk -> leaders.id)
- org_name (text)
- org_level (text) -- 区/市/省
- title_name (text)
- start_date (date)
- end_date (date, nullable)
- source_url (text)
- evidence_text (text)
- confidence (text)
- created_at (timestamp)

## 8) leader_edges（领导关系边）
- id (uuid, pk)
- from_leader_id (uuid, fk -> leaders.id)
- to_leader_id (uuid, fk -> leaders.id)
- edge_type (text) -- 上下级/同系统/同校/同地工作/历史协同
- period_start (date, nullable)
- period_end (date, nullable)
- influence_weight (numeric) -- 0~1
- source_url (text)
- evidence_text (text)
- confidence (text)
- is_inference (boolean, default true)
- created_at (timestamp)
- updated_at (timestamp)

## 9) route_recommendations（通路建议）
- id (uuid, pk)
- project_id (uuid, fk -> projects.id)
- target_leader_id (uuid, fk -> leaders.id)
- suggested_path (jsonb) -- 2~4跳路径
- node_match_score (int)
- final_route_score (int)
- rationale (text)
- generated_at (timestamp)
