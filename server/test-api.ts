import dotenv from 'dotenv';
import { mastra } from './src/mastra/index.ts';

dotenv.config();

async function testPostGeneration() {
  console.log('Generating a test Web3 explanation via Mastra...\n');

  const writerAgent = mastra.getAgent('writerAgent');
  const result = await writerAgent.generate(
    'Explain "blockchain consensus mechanisms" in 2-3 simple paragraphs for someone new to Web3. Do not include links.'
  );

  console.log('Generated content:\n');
  console.log(result.text);
}

testPostGeneration().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
