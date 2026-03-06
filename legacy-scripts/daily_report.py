#!/usr/bin/env python3
import csv
from pathlib import Path
from datetime import datetime

PROJECTS = Path('data/sample_projects_scored.csv')
SIGNALS = Path('data/sample_signals.csv')
LEADERS = Path('data/sample_leaders.csv')
OUT = Path('docs/DAILY_REPORT.md')


def read_csv(path):
    if not path.exists():
        return []
    with path.open('r', encoding='utf-8') as f:
        return list(csv.DictReader(f))

projects = read_csv(PROJECTS)
signals = read_csv(SIGNALS)
leaders = read_csv(LEADERS)

projects_sorted = sorted(projects, key=lambda x: int(x.get('final_score', 0)), reverse=True)
a_count = sum(1 for r in projects_sorted if r.get('grade') == 'A')
b_count = sum(1 for r in projects_sorted if r.get('grade') == 'B')

now = datetime.now().strftime('%Y-%m-%d %H:%M')

lines = []
lines.append('# DAILY_REPORT')
lines.append('')
lines.append(f'- 生成时间：{now}')
lines.append(f'- 项目数：{len(projects_sorted)}')
lines.append(f'- 信号数：{len(signals)}')
lines.append(f'- 关键人数：{len(leaders)}')
lines.append(f'- 分级：A={a_count}, B={b_count}')
lines.append('')
lines.append('## Top 3 线索')
for i, r in enumerate(projects_sorted[:3], start=1):
    lines.append(f"{i}. {r['project_name']} | 分数={r['final_score']} | 等级={r['grade']} | 地区={r['region_name']}")
lines.append('')
lines.append('## 今日建议动作')
lines.append('1. 对 A 级线索安排拜访前资料包（政策+关键人+竞争态势）')
lines.append('2. 对 B 级线索补齐关键人画像，提高可接触性评分')
lines.append('3. 持续采集招标前信号，更新评分')

OUT.write_text('\n'.join(lines), encoding='utf-8')
print(f'Generated: {OUT}')
