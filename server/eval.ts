import dotenv from 'dotenv';
import { runMastraEval } from './src/mastra/lib/eval.ts';
import type { Theme } from './src/mastra/lib/theme.ts';
import type { Post } from './database.ts';

dotenv.config();

export async function runEval(post: Post, recentTitles: string[] = []) {
  return runMastraEval(
    { ...post, theme: post.theme as Theme },
    recentTitles
  );
}
