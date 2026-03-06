#!/usr/bin/env python3
import csv
from datetime import date, datetime
from pathlib import Path

IN = Path('data/sample_projects.csv')
OUT = Path('data/sample_projects_scored.csv')

TODAY = date.today()

# weights from docs/SCORING_MODEL.md
W = {
    'timeliness': 0.25,
    'budget': 0.20,
    'policy': 0.20,
    'accessibility': 0.20,
    'competition': 0.15,
}

def score_timeliness(expected_bid_date: str) -> int:
    try:
        d = datetime.strptime(expected_bid_date, '%Y-%m-%d').date()
        delta = (d - TODAY).days
        if delta <= 30: return 95
        if delta <= 60: return 85
        if delta <= 120: return 70
        return 50
    except Exception:
        return 40

def score_budget(v: str) -> int:
    try:
        b = float(v)
        if b >= 300_000_000: return 95
        if b >= 150_000_000: return 82
        if b >= 80_000_000: return 68
        return 50
    except Exception:
        return 40

def score_policy(stage: str, source_type: str) -> int:
    stage = (stage or '').strip()
    source_type = (source_type or '').strip()
    base = {
        '招标中': 90,
        '招标前': 88,
        '立项': 78,
        '意向': 65,
        '规划': 55,
    }.get(stage, 50)
    boost = {
        '发改批复': 8,
        '预算披露': 5,
        '招标公告': 6,
        '意向公告': 3,
    }.get(source_type, 0)
    return min(100, base + boost)

def score_accessibility(region_level: str, confidence: str) -> int:
    lvl = {'区': 82, '市': 74, '省': 62}.get((region_level or '').strip(), 60)
    c = {'high': 10, 'medium': 5, 'low': 0}.get((confidence or '').strip().lower(), 0)
    return min(100, lvl + c)

def score_competition(stage: str, budget: str) -> int:
    # higher means easier (lower competition)
    s = (stage or '').strip()
    try:
        b = float(budget)
    except Exception:
        b = 100_000_000
    stage_penalty = {'招标中': 25, '招标前': 10, '立项': 8, '意向': 5, '规划': 3}.get(s, 10)
    budget_penalty = 12 if b >= 300_000_000 else 8 if b >= 150_000_000 else 4
    return max(30, 90 - stage_penalty - budget_penalty)

def grade(total: int) -> str:
    if total >= 80: return 'A'
    if total >= 60: return 'B'
    if total >= 40: return 'C'
    return 'D'

rows = []
with IN.open('r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        t = score_timeliness(r['expected_bid_date'])
        b = score_budget(r['budget_amount'])
        p = score_policy(r['stage'], r['source_type'])
        a = score_accessibility(r['region_level'], r['confidence'])
        c = score_competition(r['stage'], r['budget_amount'])
        total = round(t*W['timeliness'] + b*W['budget'] + p*W['policy'] + a*W['accessibility'] + c*W['competition'])
        r.update({
            'timeliness_score': t,
            'budget_score': b,
            'policy_match_score': p,
            'accessibility_score': a,
            'competition_score': c,
            'final_score': total,
            'grade': grade(total),
        })
        rows.append(r)

fieldnames = list(rows[0].keys()) if rows else []
with OUT.open('w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

rows_sorted = sorted(rows, key=lambda x: int(x['final_score']), reverse=True)
print('Top opportunities:')
for i, r in enumerate(rows_sorted[:5], start=1):
    print(f"{i}. {r['project_name']} | score={r['final_score']} | grade={r['grade']} | {r['region_name']}")
print(f"\nOutput: {OUT}")
