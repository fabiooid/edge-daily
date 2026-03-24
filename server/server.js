import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeDatabase, getLatestPost, getAllPosts, getPostBySlug, updatePostContent } from './database.js';
import { startScheduler } from './scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database when server starts
initializeDatabase();

// Start scheduler
startScheduler();

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.FRONTEND_URL || 'https://edgedaily.vercel.app' }));
app.use(express.json());
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

const requireApiKey = (req, res, next) => {
  if (req.headers['x-api-key'] !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
export { requireApiKey };

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get latest post
app.get('/api/posts/latest', async (req, res) => {
  try {
    const post = await getLatestPost();
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch latest post' });
  }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await getAllPosts();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get post by slug
app.get('/api/posts/:slug', async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});







// TEMP: rewrite today's post in journalist style
app.post('/api/fix-post-5b4f8c7e-v2', requireApiKey, async (req, res) => {
  const title = "Mastercard Acquires Stablecoin Startup BVNK for $1.8 Billion in Landmark Crypto Deal";
  const content = `Mastercard is acquiring BVNK, a London-based stablecoin payments company, for up to $1.8 billion — the largest stablecoin acquisition on record and the clearest signal yet that traditional financial networks are moving beyond experimenting with crypto.

Founded in 2021, BVNK built infrastructure that lets businesses send, receive, and settle payments using stablecoins. The startup operates across more than 100 countries and processed billions in transaction volume last year, making it one of the more mature enterprise-grade stablecoin rails available. Its technology enables 24/7, near-instant cross-border settlement — a stark contrast to the multi-day delays of traditional correspondent banking.

For Mastercard, the deal serves two purposes. It gains direct access to blockchain-based settlement infrastructure that can be integrated into its existing global network, targeting high-friction use cases like B2B payments, remittances, and cross-border transfers. It also positions the company ahead of a structural shift in global payments: stablecoins are increasingly seen not as a crypto asset class but as a next-generation payments rail, a view accelerating as the US and EU move closer to clear regulatory frameworks for their use. The acquisition puts Mastercard firmly in the infrastructure layer of that transition.`;
  try {
    const result = await updatePostContent('5b4f8c7e', title, content);
    res.json({ ok: true, changes: result.changes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});