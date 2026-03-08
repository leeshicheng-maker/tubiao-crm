/**
 * 机器人调度入口
 * 由 OpenClaw cron 触发，根据任务名分发
 *
 * 用法：
 *   BOT_TASK=opportunity-hunter npx ts-node src/bots/index.ts
 *   BOT_TASK=followup-guard npx ts-node src/bots/index.ts
 */

import { runOpportunityHunter } from './opportunity-hunter';
import { runFollowupGuard } from './followup-guard';

const task = process.env.BOT_TASK || process.argv[2];

async function main() {
  console.log(`[机器人调度] 任务: ${task}`);

  switch (task) {
    case 'opportunity-hunter':
      await runOpportunityHunter();
      break;
    case 'followup-guard':
      await runFollowupGuard();
      break;
    default:
      console.error(`未知任务: ${task}`);
      console.log('可用任务: opportunity-hunter, followup-guard');
      process.exit(1);
  }
}

main().catch(err => {
  console.error('机器人运行失败:', err);
  process.exit(1);
});
