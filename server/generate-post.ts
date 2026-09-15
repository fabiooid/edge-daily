import dotenv from 'dotenv';
import { generateAndSavePost } from './scheduler.ts';

dotenv.config();

const theme = process.argv[2] || null;
const date = process.argv[3] || null;

generateAndSavePost(theme, date)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Generation failed:', err);
    process.exit(1);
  });
