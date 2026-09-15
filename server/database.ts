import sqlite3 from 'sqlite3';
import { randomBytes } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'daily-learning.db')
  : path.join(__dirname, 'daily-learning.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the daily-learning.db database.');
    console.log('Database location:', dbPath);
  }
});

export type PostLink = {
  title: string;
  url: string;
};

/** Normalized post returned to API consumers (links parsed, content cleaned). */
export type Post = {
  id: number;
  theme: string;
  title: string;
  content: string;
  links: PostLink[];
  date: string;
  slug: string;
  created_at?: string;
};

type PostRow = {
  id: number;
  theme: string;
  title: string;
  content: string;
  links: string | PostLink[] | null;
  date: string;
  slug: string;
  created_at?: string;
};

type ColumnInfo = {
  name: string;
};

type RunResult = {
  lastID: number;
  changes: number;
};

function generateSlug(): string {
  return randomBytes(4).toString('hex');
}

function regenerateSlugs(
  resolve: () => void,
  reject: (err: Error) => void
): void {
  db.all('SELECT id, title FROM posts', (err, posts: { id: number; title: string }[]) => {
    if (err) {
      console.error('Error fetching posts:', err);
      reject(err);
      return;
    }

    if (posts.length === 0) {
      console.log('✓ No existing posts to migrate');
      db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)', (err) => {
        if (err) {
          console.error('Error creating index:', err);
          reject(err);
        } else {
          console.log('✓ Migration completed successfully!');
          resolve();
        }
      });
      return;
    }

    let completed = 0;
    posts.forEach((post) => {
      const slug = generateSlug();

      db.run('UPDATE posts SET slug = ? WHERE id = ?', [slug, post.id], (err) => {
        if (err) {
          console.error(`Error updating slug for post ${post.id}:`, err);
        } else {
          console.log(`  ✓ Generated slug for: ${post.title}`);
        }

        completed++;

        if (completed === posts.length) {
          db.run('CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug)', (err) => {
            if (err) {
              console.error('Error creating index:', err);
              reject(err);
            } else {
              console.log('✓ Migration completed successfully!');
              resolve();
            }
          });
        }
      });
    });
  });
}

function runSlugMigration(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(posts)', (err, columns: ColumnInfo[]) => {
      if (err) {
        console.error('Error checking table info:', err);
        reject(err);
        return;
      }

      const hasSlug = columns.some((col) => col.name === 'slug');

      if (!hasSlug) {
        console.log('Running slug migration...');

        db.run('ALTER TABLE posts ADD COLUMN slug TEXT', (err) => {
          if (err) {
            console.error('Error adding slug column:', err);
            reject(err);
            return;
          }

          console.log('✓ Slug column added');
          regenerateSlugs(resolve, reject);
        });
      } else {
        db.get(
          'SELECT slug FROM posts WHERE length(slug) > 10 LIMIT 1',
          (err, row: { slug: string } | undefined) => {
            if (err) {
              console.error('Error checking slugs:', err);
              reject(err);
              return;
            }

            if (row && row.slug && row.slug.includes('-')) {
              console.log('Found old word-based slugs, regenerating...');
              regenerateSlugs(resolve, reject);
            } else {
              console.log('✓ Slug column already exists with correct format');
              resolve();
            }
          }
        );
      }
    });
  });
}

export function initializeDatabase(): void {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      theme TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      links TEXT,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Posts table ready');
      runSlugMigration().catch((err) => {
        console.error('Migration failed:', err);
      });
    }
  });
}

function parseLinks(links: string | PostLink[] | null | undefined): PostLink[] {
  try {
    const parsed = typeof links === 'string' ? JSON.parse(links) : links;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatPost(row: PostRow | undefined | null): Post | null {
  if (!row) return null;
  return {
    ...row,
    content: (row.content || '').replace(/LINKS:[\s\S]*/i, '').trim(),
    links: parseLinks(row.links),
  };
}

export function createPost(
  theme: string,
  title: string,
  content: string,
  links: PostLink[],
  date: string
): Promise<{ id: number; slug: string }> {
  return new Promise((resolve, reject) => {
    const linksJSON = JSON.stringify(links);
    const slug = generateSlug();
    const sql = `INSERT INTO posts (theme, title, content, links, date, slug) VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [theme, title, content, linksJSON, date, slug], function (this: RunResult, err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, slug });
    });
  });
}

export function getLatestPost(): Promise<Post | null> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM posts ORDER BY date DESC LIMIT 1`;

    db.get(sql, (err, row: PostRow | undefined) => {
      if (err) reject(err);
      else resolve(formatPost(row));
    });
  });
}

export function getPostBySlug(slug: string): Promise<Post | null> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM posts WHERE slug = ?`;

    db.get(sql, [slug], (err, row: PostRow | undefined) => {
      if (err) reject(err);
      else resolve(formatPost(row));
    });
  });
}

export function getAllPosts(): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM posts ORDER BY date DESC LIMIT 500`;

    db.all(sql, (err, rows: PostRow[]) => {
      if (err) reject(err);
      else resolve((rows || []).map((row) => formatPost(row)!));
    });
  });
}

export function getPostsByTheme(theme: string): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM posts WHERE theme = ? ORDER BY date DESC`;

    db.all(sql, [theme], (err, rows: PostRow[]) => {
      if (err) reject(err);
      else resolve((rows || []).map((row) => formatPost(row)!));
    });
  });
}

export function updatePostLinks(
  slug: string,
  links: PostLink[]
): Promise<{ changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE posts SET links = ? WHERE slug = ?',
      [JSON.stringify(links), slug],
      function (this: RunResult, err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

export function updatePostContent(
  slug: string,
  title: string,
  content: string
): Promise<{ changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE posts SET title = ?, content = ? WHERE slug = ?',
      [title, content, slug],
      function (this: RunResult, err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      }
    );
  });
}

export function deletePostById(id: number): Promise<{ changes: number }> {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM posts WHERE id = ?', [id], function (this: RunResult, err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
}

export function getPostByDate(date: string): Promise<Post | null> {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM posts WHERE date = ?', [date], (err, row: PostRow | undefined) => {
      if (err) reject(err);
      else resolve(formatPost(row));
    });
  });
}
