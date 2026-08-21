import { existsSync, statSync } from 'node:fs';

const required = ['public/data/quran.json', 'public/data/chapters.json', 'public/data/pages.json'];
for (const file of required) {
  if (!existsSync(file) || statSync(file).size < 10) {
    console.error(`Missing offline asset: ${file}`);
    console.error('Run: npm run offline:prepare');
    process.exit(1);
  }
}

console.log('✓ Offline data files are present.');
