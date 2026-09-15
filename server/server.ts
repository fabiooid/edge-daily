import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { MastraServer } from '@mastra/express';
import {
  initializeDatabase,
  getLatestPost,
  getAllPosts,
  getPostBySlug,
  updatePostLinks,
  deletePostById,
  getPostByDate,
  type PostLink,
} from './database.ts';
import { startScheduler, generateAndSavePost } from './scheduler.ts';
import { getTodaysTheme } from './theme-scheduler.ts';
import { runEval } from './eval.ts';
import { mastra } from './src/mastra/index.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

initializeDatabase();
startScheduler();

async function checkMissedPost(): Promise<void> {
  try {
    const theme = getTodaysTheme();
    if (!theme) return;

    const hkNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
    const todayDate = hkNow.toISOString().split('T')[0];
    const hourHKT = hkNow.getHours();

    if (hourHKT < 7) {
      console.log('⏳ Too early for catch-up check — cron will handle it at 07:30 HKT');
      return;
    }

    const existing = await getPostByDate(todayDate);
    if (existing) {
      console.log(`✅ Post already exists for ${todayDate} — no catch-up needed`);
      return;
    }

    console.log(`⚠️  No post found for ${todayDate} (${theme}) — starting catch-up generation...`);
    generateAndSavePost(theme, todayDate).catch((err) =>
      console.error('Catch-up generation error:', err)
    );
  } catch (err) {
    console.error('Catch-up check error:', err);
  }
}

export const requireApiKey = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['x-api-key'] !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

async function startServer(): Promise<void> {
  app.set('trust proxy', 1);
  app.use(
    cors({
      origin: [process.env.FRONTEND_URL || 'https://edgedaily.vercel.app', 'http://localhost:5173'],
    })
  );
  app.use(express.json());
  app.use(
    '/api/',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Keep Edge Daily app routes under /api/*
  // Expose Mastra agents/workflows under /mastra/* to avoid collisions
  const mastraServer = new MastraServer({
    app,
    mastra,
    prefix: '/mastra',
  });
  await mastraServer.init();

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      message: 'Server is running',
      version: '2026-09-15-a',
      mastra: true,
    });
  });

  app.get('/api/posts/latest', async (_req: Request, res: Response) => {
    try {
      const post = await getLatestPost();
      res.json(post);
    } catch {
      res.status(500).json({ error: 'Failed to fetch latest post' });
    }
  });

  app.get('/api/posts', async (_req: Request, res: Response) => {
    try {
      const posts = await getAllPosts();
      res.json(posts);
    } catch {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });

  app.get('/api/posts/:slug', async (req: Request, res: Response) => {
    try {
      const post = await getPostBySlug(req.params.slug as string);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json(post);
    } catch {
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  });

  app.post('/api/trigger-post', requireApiKey, async (req: Request, res: Response) => {
    const { theme, date } = (req.body || {}) as { theme?: string; date?: string };
    res.json({
      ok: true,
      message: 'Post generation started',
      theme: theme || 'auto',
      date: date || 'today',
    });
    generateAndSavePost(theme || null, date || null).catch((err) =>
      console.error('Manual trigger error:', err)
    );
  });

  app.post('/api/eval/:slug', requireApiKey, async (req: Request, res: Response) => {
    try {
      const post = await getPostBySlug(req.params.slug as string);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      res.json({ ok: true, message: 'Eval started', slug: post.slug });
      const allPosts = await getAllPosts();
      const recentTitles = allPosts
        .filter((p) => p.slug !== post.slug)
        .map((p) => p.title)
        .filter(Boolean);
      runEval(post, recentTitles).catch((err) => console.error('Manual eval error:', err));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Eval failed';
      res.status(500).json({ error: message });
    }
  });

  app.patch('/api/posts/:slug/links', requireApiKey, async (req: Request, res: Response) => {
    try {
      const { links } = req.body as { links?: PostLink[] };
      if (!links || !Array.isArray(links)) {
        return res.status(400).json({ error: 'links array required' });
      }
      const result = await updatePostLinks(req.params.slug as string, links);
      res.json({ updated: result.changes });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update failed';
      res.status(500).json({ error: message });
    }
  });

  app.delete('/api/posts/:slug', requireApiKey, async (req: Request, res: Response) => {
    try {
      const post = await getPostBySlug(req.params.slug as string);
      if (!post) return res.status(404).json({ error: 'Post not found' });
      const result = await deletePostById(post.id);
      res.json({ deleted: result.changes });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      res.status(500).json({ error: message });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Mastra API available at http://localhost:${PORT}/mastra`);
    setTimeout(checkMissedPost, 5000);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
