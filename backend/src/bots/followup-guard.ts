/**
 * 跟进卫士（Follow-up Guard）
 * P0 核心机器人 #3
 *
 * 职责：
 * - 每天 9:00 扫描待跟进项目（>14天未更新）
 * - 扫描即将逾期任务（24h内）
 * - 扫描已逾期任务
 * - 生成每日待办摘要推送到 Telegram
 *
 * 触发方式：
 * - 定时：每天 9:00（由 OpenClaw cron 触发）
 * - 手动：node src/bots/followup-guard.ts
 */

import { prisma } from '@/lib/prisma';

const CONFIG = {
  // 超过多少天未跟进算"久未联系"
  staleProjectDays: 14,
  staleOpportunityDays: 7,

  // Telegram 配置
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
};

// ============================================
// 检查：久未跟进的项目
// ============================================

async function checkStaleProjects() {
  const cutoff = new Date(Date.now() - CONFIG.staleProjectDays * 24 * 3600 * 1000);

  const stale = await prisma.project.findMany({
    where: {
      isArchived: false,
      stage: { notIn: ['WON', 'LOST'] },
      updatedAt: { lt: cutoff },
    },
    include: {
      owner: { select: { name: true } },
      opportunity: { select: { title: true } },
    },
    orderBy: { updatedAt: 'asc' },
    take: 20,
  });

  return stale.map(p => ({
    id: p.id,
    title: p.opportunity?.title || p.title || '未命名项目',
    owner: p.owner.name,
    stage: p.stage,
    daysSinceUpdate: Math.floor((Date.now() - p.updatedAt.getTime()) / 86400000),
  }));
}

// ============================================
// 检查：久未跟进的机会
// ============================================

async function checkStaleOpportunities() {
  const cutoff = new Date(Date.now() - CONFIG.staleOpportunityDays * 24 * 3600 * 1000);

  const stale = await prisma.opportunity.findMany({
    where: {
      isArchived: false,
      status: { in: ['NEW', 'ASSESSING', 'ADVANCING'] },
      updatedAt: { lt: cutoff },
    },
    include: {
      owner: { select: { name: true } },
    },
    orderBy: { updatedAt: 'asc' },
    take: 10,
  });

  return stale.map(o => ({
    id: o.id,
    title: o.title,
    owner: o.owner.name,
    status: o.status,
    daysSinceUpdate: Math.floor((Date.now() - o.updatedAt.getTime()) / 86400000),
  }));
}

// ============================================
// 检查：逾期和即将逾期任务
// ============================================

async function checkTasks() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);

  const [overdue, dueSoon] = await Promise.all([
    // 已逾期
    prisma.task.findMany({
      where: {
        isArchived: false,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { lt: now },
      },
      include: { assignee: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
    // 24h内到期
    prisma.task.findMany({
      where: {
        isArchived: false,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueDate: { gte: now, lt: tomorrow },
      },
      include: { assignee: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }),
  ]);

  return {
    overdue: overdue.map(t => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee.name,
      priority: t.priority,
      dueDate: t.dueDate?.toLocaleDateString('zh-CN'),
      overdueDays: t.dueDate ? Math.floor((now.getTime() - t.dueDate.getTime()) / 86400000) : 0,
    })),
    dueSoon: dueSoon.map(t => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee.name,
      priority: t.priority,
      dueDate: t.dueDate?.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })),
  };
}

// ============================================
// 生成摘要并推送 Telegram
// ============================================

async function sendDailySummary(data: {
  staleProjects: Awaited<ReturnType<typeof checkStaleProjects>>;
  staleOpportunities: Awaited<ReturnType<typeof checkStaleOpportunities>>;
  tasks: Awaited<ReturnType<typeof checkTasks>>;
}) {
  const { staleProjects, staleOpportunities, tasks } = data;
  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  const lines: string[] = [
    `📋 *跟进卫士日报* — ${today}`,
    '',
  ];

  // 逾期任务
  if (tasks.overdue.length > 0) {
    lines.push(`🔴 *逾期任务 (${tasks.overdue.length}个)*`);
    tasks.overdue.slice(0, 5).forEach(t => {
      lines.push(`  • ${t.title}（${t.assignee}，逾期${t.overdueDays}天）`);
    });
    lines.push('');
  }

  // 即将到期
  if (tasks.dueSoon.length > 0) {
    lines.push(`🟡 *今日到期任务 (${tasks.dueSoon.length}个)*`);
    tasks.dueSoon.slice(0, 5).forEach(t => {
      lines.push(`  • ${t.title}（${t.assignee}，${t.dueDate}）`);
    });
    lines.push('');
  }

  // 久未跟进项目
  if (staleProjects.length > 0) {
    lines.push(`⚠️ *久未跟进项目 (${staleProjects.length}个，超${CONFIG.staleProjectDays}天)*`);
    staleProjects.slice(0, 5).forEach(p => {
      lines.push(`  • ${p.title}（${p.owner}，${p.daysSinceUpdate}天未更新）`);
    });
    lines.push('');
  }

  // 久未跟进机会
  if (staleOpportunities.length > 0) {
    lines.push(`📌 *搁置机会 (${staleOpportunities.length}个，超${CONFIG.staleOpportunityDays}天)*`);
    staleOpportunities.slice(0, 3).forEach(o => {
      lines.push(`  • ${o.title}（${o.owner}，${o.daysSinceUpdate}天未更新）`);
    });
    lines.push('');
  }

  // 一切正常
  const hasAlerts = tasks.overdue.length + tasks.dueSoon.length + staleProjects.length + staleOpportunities.length > 0;
  if (!hasAlerts) {
    lines.push('✅ *一切正常，今日无待处理提醒*');
  }

  const text = lines.join('\n');
  console.log('[跟进卫士] 摘要:\n', text);

  if (!CONFIG.telegramBotToken || !CONFIG.telegramChatId) {
    console.log('[Telegram] 未配置，跳过推送');
    return;
  }

  await fetch(`https://api.telegram.org/bot${CONFIG.telegramBotToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CONFIG.telegramChatId,
      text,
      parse_mode: 'Markdown',
    }),
  });
}

// ============================================
// 主流程
// ============================================

export async function runFollowupGuard() {
  console.log('[跟进卫士] 开始运行...', new Date().toLocaleString('zh-CN'));

  const [staleProjects, staleOpportunities, tasks] = await Promise.all([
    checkStaleProjects(),
    checkStaleOpportunities(),
    checkTasks(),
  ]);

  console.log(`[跟进卫士] 久未跟进项目: ${staleProjects.length}, 机会: ${staleOpportunities.length}, 逾期任务: ${tasks.overdue.length}, 即将到期: ${tasks.dueSoon.length}`);

  await sendDailySummary({ staleProjects, staleOpportunities, tasks });

  console.log('[跟进卫士] 运行完成');
  return {
    staleProjects: staleProjects.length,
    staleOpportunities: staleOpportunities.length,
    overdueTasks: tasks.overdue.length,
    dueSoonTasks: tasks.dueSoon.length,
  };
}

// 直接运行
if (require.main === module) {
  runFollowupGuard()
    .then(result => {
      console.log('结果:', result);
      process.exit(0);
    })
    .catch(err => {
      console.error('致命错误:', err);
      process.exit(1);
    });
}
