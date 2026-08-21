import { mkdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const reciters = [
  ['Alafasy_128kbps', 'مشاري راشد العفاسي'],
  ['Abdul_Basit_Murattal_192kbps', 'عبد الباسط عبد الصمد'],
  ['Husary_128kbps', 'محمود خليل الحصري'],
  ['Minshawy_Murattal_128kbps', 'محمد صديق المنشاوي'],
  ['Mustafa_Ismail_48kbps', 'مصطفى إسماعيل'],
  ['MaherAlMuaiqly128kbps', 'ماهر المعيقلي'],
  ['Saood_ash-Shuraym_128kbps', 'سعود الشريم'],
  ['Yasser_Ad-Dussary_128kbps', 'ياسر الدوسري'],
  ['Ghamadi_40kbps', 'سعد الغامدي'],
  ['Abdurrahmaan_As-Sudais_192kbps', 'عبد الرحمن السديس'],
  ['Fares_Abbad_64kbps', 'فارس عباد'],
  ['Abdullah_Basfar_192kbps', 'عبد الله بصفر'],
  ['Hudhaify_128kbps', 'علي الحذيفي'],
  ['Muhammad_Ayyoub_128kbps', 'محمد أيوب'],
  ['Abdullaah_3awwaad_Al-Juhaynee_128kbps', 'عبد الله عواد الجهني'],
  ['Ahmed_Neana_128kbps', 'أحمد نعينة'],
  ['Muhammad_Jibreel_128kbps', 'محمد جبريل'],
  ['Mohammad_al_Tablaway_128kbps', 'محمد محمود الطبلاوي'],
  ['Nasser_Alqatami_128kbps', 'ناصر القطامي'],
  ['Ali_Jaber_64kbps', 'علي جابر'],
  ['Salah_Al_Budair_128kbps', 'صلاح البدير'],
];

const chapters = JSON.parse(
  await (
    await fetch(
      'https://raw.githubusercontent.com/risan/quran-json/main/data/chapters/en.json'
    )
  ).text()
);

const allRequested =
  process.argv.includes('--all') ||
  process.env.OFFLINE_RECITERS?.trim() === 'all';

const selected = allRequested
  ? reciters
  : reciters.filter(([folder]) =>
      (process.env.OFFLINE_RECITERS || 'Alafasy_128kbps')
        .split(',')
        .includes(folder)
    );

const concurrency = Number(process.env.AUDIO_CONCURRENCY || 3);

const jobs = [];

for (const [folder, name] of selected) {
  console.log(`Preparing ${name}`);

  for (const surah of chapters) {
    for (let ayah = 1; ayah <= surah.total_verses; ayah++) {
      const file =
        `${String(surah.id).padStart(3, '0')}` +
        `${String(ayah).padStart(3, '0')}.mp3`;

      jobs.push({
        folder,
        file,
        url: `https://www.everyayah.com/data/${folder}/${file}`,
      });
    }
  }
}

let cursor = 0;

let downloaded = 0;
let skipped = 0;
let failed = 0;

async function worker() {
  while (true) {
    const job = jobs[cursor++];

    if (!job) return;

    const dir = `public/audio/${job.folder}`;
    const target = `${dir}/${job.file}`;

    await mkdir(dir, { recursive: true });

    // الملف موجود بالفعل، لا تعيد تحميله
    if (existsSync(target)) {
      try {
        const fileStat = await stat(target);

        if (fileStat.size > 1000) {
          continue;
        }
      } catch {
        // لو حصل خطأ في قراءة الملف، نحاول تحميله من جديد
      }
    }

    try {
      const response = await fetch(job.url);

      // الملف غير موجود على EveryAyah
      if (!response.ok) {
        skipped++;

        console.warn(
          `⚠️ Skipped ${response.status}: ${job.folder}/${job.file}`
        );

        continue;
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      // حماية من ملفات فارغة أو تالفة
      if (buffer.length <= 1000) {
        skipped++;

        console.warn(
          `⚠️ Skipped empty file: ${job.folder}/${job.file}`
        );

        continue;
      }

      await writeFile(target, buffer);

      downloaded++;

      if (downloaded % 100 === 0) {
        console.log(
          `✓ Downloaded: ${downloaded} | Skipped: ${skipped}`
        );
      }
    } catch (error) {
      failed++;

      console.warn(
        `⚠️ Failed: ${job.folder}/${job.file}`
      );

      console.warn(
        error instanceof Error ? error.message : error
      );

      // مهم: لا توقف باقي التحميل
      continue;
    }
  }
}

await Promise.all(
  Array.from(
    { length: concurrency },
    () => worker()
  )
);

console.log('');
console.log('==============================');
console.log('Audio download finished');
console.log(`Total jobs: ${jobs.length}`);
console.log(`Downloaded: ${downloaded}`);
console.log(`Skipped: ${skipped}`);
console.log(`Failed: ${failed}`);
console.log('==============================');