import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.RAILWAY_VOLUME_MOUNT_PATH 
  ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, 'daily-learning.db')
  : path.join(__dirname, 'daily-learning.db');

const db = new sqlite3.Database(dbPath);

function generateSlug() {
  return Math.random().toString(36).substring(2, 9);
}

console.log('Regenerating all slugs with random codes...');

db.all('SELECT id, title FROM posts', (err, posts) => {
  if (err) {
    console.error('Error fetching posts:', err);
    db.close();
    return;
  }
  
  if (posts.length === 0) {
    console.log('No posts to update');
    db.close();
    return;
  }
  
  let completed = 0;
  
  posts.forEach(post => {
    const newSlug = generateSlug();
    
    db.run('UPDATE posts SET slug = ? WHERE id = ?', [newSlug, post.id], (err) => {
      if (err) {
        console.error(`Error updating post ${post.id}:`, err);
      } else {
        console.log(`✓ ${post.title} → ${newSlug}`);
      }
      
      completed++;
      
      if (completed === posts.length) {
        console.log('\n✓ All slugs regenerated successfully!');
        db.close();
      }
    });
  });
});