import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const DATA = fileURLToPath(new URL('../public/data/', import.meta.url));
const SOURCES = {
  quran: 'https://raw.githubusercontent.com/risan/quran-json/main/data/quran.json',
  chapters: 'https://raw.githubusercontent.com/risan/quran-json/main/data/chapters/en.json',
  pages: 'https://raw.githubusercontent.com/Mushaf-Learning/quran-text/main/metadata/pages.json',
};

await mkdir(DATA, { recursive: true });

async function download(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

for (const [name, url] of Object.entries(SOURCES)) {
  const target = path.join(DATA, `${name}.json`);
  console.log(`Downloading ${name}...`);
  const text = await download(url);
  JSON.parse(text);
  await writeFile(target, text, 'utf8');
  console.log(`Saved ${target}`);
}

const quran = JSON.parse(await readFile(path.join(DATA, 'quran.json'), 'utf8'));
const chapters = JSON.parse(await readFile(path.join(DATA, 'chapters.json'), 'utf8'));
const count = Object.values(quran).reduce((sum, verses) => sum + verses.length, 0);
if (count !== 6236 || chapters.length !== 114) {
  throw new Error(`Offline Quran validation failed: ${count} verses / ${chapters.length} surahs`);
}
console.log(`✓ Offline Quran ready: ${count} ayahs, ${chapters.length} surahs.`);
console.log('Source: risan/quran-json + Mushaf-Learning/quran-text.');
