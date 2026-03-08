/**
 * 机会猎手（Opportunity Hunter）
 * P0 核心机器人 #1
 *
 * 职责：
 * - 爬取中国政府采购网等来源的招标信息
 * - 关键词过滤 + 优先级评分
 * - 新机会推送到 Telegram
 * - 写入 CRM opportunities 表（草稿状态）
 *
 * 触发方式：
 * - 定时：每天 8:00 和 18:00（由 OpenClaw cron 触发）
 * - 手动：node src/bots/opportunity-hunter.ts
 */

import { prisma } from '@/lib/prisma';

// ============================================
// 配置
// ============================================

const CONFIG = {
  // 关键词（命中越多分越高）
  keywords: [
    '智慧城市', '数字政务', '政务信息化', '智慧园区',
    '政府数字化', '大数据平台', '政务云', '电子政务',
    '智慧医疗', '智慧教育', '智慧交通', '公共安全',
    'AI', '人工智能', '数据治理',
  ],

  // 排除词（命中则跳过）
  excludeKeywords: ['硬件', '设备采购', '家具', '印刷', '食品'],

  // 预算门槛（万元）
  minBudget: 50,

  // Telegram Bot（从环境变量读取）
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',

  // CRM API
  crmApiBase: process.env.CRM_API_BASE || 'http://localhost:3000/api/v1',
  crmToken: process.env.CRM_API_TOKEN || '',

  // 默认归属用户（系统机器人用户ID）
  defaultOwnerId: process.env.BOT_USER_ID || '',
  defaultSourceNodeId: process.env.BOT_SOURCE_NODE_ID || '',
};

// ============================================
// 数据类型
// ============================================

interface RawOpportunity {
  title: string;
  url: string;
  budget: number | null;   // 万元
  location: string;
  publishDate: string;
  source: string;
  rawText: string;
}

interface ScoredOpportunity extends RawOpportunity {
  score: number;
  matchedKeywords: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

// ============================================
// 爬虫：中国政府采购网
// ============================================

async function fetchCCGP(): Promise<RawOpportunity[]> {
  const results: RawOpportunity[] = [];

  try {
    // 搜索关键词分批查询
    for (const keyword of ['智慧城市', '数字政务', '政务信息化']) {
      const url = `http://search.ccgp.gov.cn/bxsearch?searchtype=1&bidSort=0&buyerName=&projectId=&pinMu=0&bidType=0&dbselect=bidx&kw=${encodeURIComponent(keyword)}&start_time=&end_time=&timeType=6&displayZone=&zoneId=&pppStatus=0&agentName=`;

      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TubiaoBot/1.0)',
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!resp.ok) continue;

      const html = await resp.text();

      // 简单正则提取（后续可换 cheerio 解析）
      const titleMatches = html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([^<]{10,100})<\/a>/g);
      const budgetMatches = html.matchAll(/预算金额[：:]\s*([\d,.]+)\s*万/g);

      const budgets = [...budgetMatches].map(m => parseFloat(m[1].replace(',', '')));
      let budgetIdx = 0;

      for (const match of titleMatches) {
        const [, link, title] = match;
        if (!title.includes('采购') && !title.includes('项目') && !title.includes('服务')) continue;

        results.push({
          title: title.trim(),
          url: link.startsWith('http') ? link : `http://www.ccgp.gov.cn${link}`,
          budget: budgets[budgetIdx++] || null,
          location: '全国',
          publishDate: new Date().toISOString().split('T')[0],
          source: '中国政府采购网',
          rawText: title,
        });

        if (results.length >= 50) break;
      }

      // 礼貌延迟
      await sleep(2000);
    }
  } catch (e) {
    console.error('[CCGP] 爬取失败:', e);
  }

  return results;
}

// ============================================
// 评分引擎
// ============================================

function scoreOpportunity(item: RawOpportunity): ScoredOpportunity {
  let score = 0;
  const matchedKeywords: string[] = [];

  const text = `${item.title} ${item.rawText}`.toLowerCase();

  // 关键词匹配
  for (const kw of CONFIG.keywords) {
    if (text.includes(kw.toLowerCase())) {
      score += 10;
      matchedKeywords.push(kw);
    }
  }

  // 排除词
  for (const kw of CONFIG.excludeKeywords) {
    if (text.includes(kw.toLowerCase())) {
      score -= 50;
    }
  }

  // 预算加分
  if (item.budget) {
    if (item.budget >= 500) score += 30;
    else if (item.budget >= 200) score += 20;
    else if (item.budget >= 100) score += 10;
    else if (item.budget < CONFIG.minBudget) score -= 20;
  }

  // 判断紧急程度
  let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'LOW';
  if (score >= 60) urgency = 'URGENT';
  else if (score >= 40) urgency = 'HIGH';
  else if (score >= 20) urgency = 'MEDIUM';

  return { ...item, score, matchedKeywords, urgency };
}

// ============================================
// 去重（基于标题相似度）
// ============================================

async function dedup(items: ScoredOpportunity[]): Promise<ScoredOpportunity[]> {
  // 查最近7天已有的机会标题
  const existing = await prisma.opportunity.findMany({
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
    },
    select: { title: true },
  });

  const existingTitles = new Set(existing.map(e => e.title.trim()));

  return items.filter(item => {
    // 简单标题去重
    const normalized = item.title.replace(/\s+/g, '');
    for (const t of existingTitles) {
      if (t.replace(/\s+/g, '') === normalized) return false;
    }
    return true;
  });
}

// ============================================
// 写入 CRM
// ============================================

async function saveToCRM(items: ScoredOpportunity[]): Promise<string[]> {
  const savedIds: string[] = [];

  for (const item of items) {
    if (item.score < 10) continue; // 分数太低不写入

    try {
      const opp = await prisma.opportunity.create({
        data: {
          title: item.title,
          sourceNodeId: CONFIG.defaultSourceNodeId,
          industry: '政务信息化',
          budgetRange: item.budget ? `${item.budget}万` : '未知',
          urgency: item.urgency,
          status: 'NEW',
          ownerId: CONFIG.defaultOwnerId,
          notes: `来源：${item.source}\n链接：${item.url}\n匹配关键词：${item.matchedKeywords.join('、')}\n评分：${item.score}`,
          createdBy: 'bot:opportunity-hunter',
        },
      });
      savedIds.push(opp.id);
    } catch (e) {
      console.error(`[CRM] 写入失败: ${item.title}`, e);
    }
  }

  return savedIds;
}

// ============================================
// Telegram 推送
// ============================================

async function sendToTelegram(items: ScoredOpportunity[], savedCount: number): Promise<void> {
  if (!CONFIG.telegramBotToken || !CONFIG.telegramChatId) {
    console.log('[Telegram] 未配置，跳过推送');
    return;
  }

  const top5 = items.slice(0, 5);
  const lines = [
    `🎯 *机会猎手日报* — ${new Date().toLocaleDateString('zh-CN')}`,
    `发现 ${items.length} 个候选机会，写入 CRM ${savedCount} 个`,
    '',
    ...top5.map((item, i) =>
      `${i + 1}. *${item.title}*\n   预算：${item.budget ? item.budget + '万' : '未知'} | 评分：${item.score} | ${item.urgency}\n   来源：${item.source}`
    ),
    '',
    items.length > 5 ? `_还有 ${items.length - 5} 个，请登录 CRM 查看_` : '',
  ].filter(Boolean).join('\n');

  await fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CONFIG.telegramChatId,
      text: lines,
      parse_mode: 'Markdown',
    }),
  });
}

// ============================================
// 工具
// ============================================

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 主流程
// ============================================

export async function runOpportunityHunter() {
  console.log('[机会猎手] 开始运行...', new Date().toLocaleString('zh-CN'));

  // 1. 爬取
  const raw = await fetchCCGP();
  console.log(`[机会猎手] 采集到 ${raw.length} 条原始数据`);

  // 2. 评分
  const scored = raw.map(scoreOpportunity).sort((a, b) => b.score - a.score);

  // 3. 过滤低分
  const filtered = scored.filter(s => s.score >= 0);
  console.log(`[机会猎手] 过滤后剩余 ${filtered.length} 条`);

  // 4. 去重
  const deduped = await dedup(filtered);
  console.log(`[机会猎手] 去重后剩余 ${deduped.length} 条新机会`);

  // 5. 写入 CRM
  const savedIds = await saveToCRM(deduped);
  console.log(`[机会猎手] 写入 CRM ${savedIds.length} 条`);

  // 6. 推送 Telegram
  await sendToTelegram(deduped, savedIds.length);

  console.log('[机会猎手] 运行完成');
  return { total: raw.length, filtered: filtered.length, saved: savedIds.length };
}

// 直接运行
if (require.main === module) {
  runOpportunityHunter()
    .then(result => {
      console.log('结果:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('致命错误:', err);
      process.exit(1);
    });
}
