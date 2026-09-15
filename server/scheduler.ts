import cron from 'node-cron';
import dotenv from 'dotenv';
import { mastra } from './src/mastra/index.ts';

dotenv.config();

export async function generateAndSavePost(
  themeOverride: string | null = null,
  dateOverride: string | null = null
) {
  console.log('Generating daily post via Mastra...\n');

  try {
    const workflow = mastra.getWorkflow('generateDailyPostWorkflow');
    const run = await workflow.createRun();
    const result = await run.start({
      inputData: {
        themeOverride,
        dateOverride,
      },
    });

    if (result.status !== 'success') {
      const message =
        result.status === 'failed'
          ? result.error?.message || 'Workflow failed'
          : `Workflow ended with status: ${result.status}`;
      throw new Error(message);
    }

    const post = result.result;
    console.log('\nRefresh your browser to see it!');
    return post;
  } catch (err) {
    if (err instanceof Error && err.message.includes('No post scheduled for today')) {
      console.log('⏸️  No post scheduled for today.');
      return;
    }
    throw err;
  }
}

export function startScheduler(): void {
  cron.schedule(
    '30 7 * * *',
    () => {
      console.log('⏰ Cron triggered - generating daily post...');
      generateAndSavePost().catch((err) => console.error('Scheduler error:', err));
    },
    { timezone: 'Asia/Hong_Kong' }
  );

  console.log('📅 Scheduler started - posts will generate at 07:30 HKT on scheduled days');
}
