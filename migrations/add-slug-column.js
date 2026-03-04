import Database from 'better-sqlite3';

const db = new Database('./server/database.db');

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/--+/g, '-')      // Replace multiple hyphens with single
    .trim()
    .substring(0, 60);         // Limit length
}

try {
  console.log('Adding slug column to posts table...');
  
  // Add the slug column
  db.exec(`
    ALTER TABLE posts ADD COLUMN slug TEXT;
  `);
  
  console.log('Slug column added successfully!');
  
  // Backfill slugs for existing posts
  console.log('Generating slugs for existing posts...');
  const posts = db.prepare('SELECT id, title FROM posts').all();
  
  const updateSlug = db.prepare('UPDATE posts SET slug = ? WHERE id = ?');
  
  posts.forEach(post => {
    const slug = generateSlug(post.title);
    updateSlug.run(slug, post.id);
    console.log(`  Post ${post.id}: ${slug}`);
  });
  
  // Now add the unique constraint
  console.log('Adding unique constraint and index...');
  db.exec(`
    CREATE UNIQUE INDEX idx_posts_slug ON posts(slug);
  `);
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
} finally {
  db.close();
}