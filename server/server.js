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






// TEMP: fix today's stablecoin post content
app.post('/api/fix-post-5b4f8c7e', requireApiKey, async (req, res) => {
  const title = "Mastercard Buys Stablecoin Startup BVNK for $1.8 Billion, Signaling Mainstream Web3 Adoption";
  const content = `Mastercard announced this week it's acquiring BVNK, a London-based stablecoin infrastructure company, for up to $1.8 billion. The deal is the largest stablecoin acquisition on record and a significant bet by a traditional payments giant on blockchain-based money movement.

BVNK has built infrastructure that lets businesses send, receive, and settle in stablecoins — dollar-pegged digital assets that move across borders in minutes, 24/7, without the delays of legacy banking rails. Mastercard's goal is to plug that capability directly into its global network, targeting high-friction use cases like cross-border transfers, remittances, and B2B settlements where traditional systems typically take days.

The deal reinforces a broader shift on Wall Street: stablecoins are increasingly treated as a serious payments layer, not a crypto experiment. For Mastercard, it's as much a defensive move as an offensive one — as digital currency adoption accelerates, owning the infrastructure keeps them central in a world where settlement no longer has to run through them.`;
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