import type { Ayah, Surah } from '../types';
export const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري راشد العفاسي', folder: 'Alafasy_128kbps' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', folder: 'Abdul_Basit_Murattal_192kbps' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', folder: 'Husary_128kbps' },
  { id: 'ar.minshawy', name: 'محمد صديق المنشاوي', folder: 'Minshawy_Murattal_128kbps' },
  { id: 'ar.mahermuaiqly', name: 'ماهر المعيقلي', folder: 'MaherAlMuaiqly128kbps' },
  { id: 'ar.saoodshuraym', name: 'سعود الشريم', folder: 'Saood_ash-Shuraym_128kbps' },
  { id: 'ar.yasseraldossari', name: 'ياسر الدوسري', folder: 'Yasser_Ad-Dussary_128kbps' },
  { id: 'ar.saadalsalame', name: 'سعد الغامدي', folder: 'Ghamadi_40kbps' },
  { id: 'ar.sudais', name: 'عبد الرحمن السديس', folder: 'Abdurrahmaan_As-Sudais_192kbps' },
  { id: 'ar.faresabbad', name: 'فارس عباد', folder: 'Fares_Abbad_64kbps' },
  { id: 'ar.abdullahbasfar', name: 'عبد الله بصفر', folder: 'Abdullah_Basfar_192kbps' },
  { id: 'ar.hudhaify', name: 'علي الحذيفي', folder: 'Hudhaify_128kbps' },
  { id: 'ar.juhany', name: 'عبد الله عواد الجهني', folder: 'Abdullaah_3awwaad_Al-Juhaynee_128kbps' },
  { id: 'ar.ahmedneana', name: 'أحمد نعينة', folder: 'Ahmed_Neana_128kbps' },
  { id: 'ar.muhammadjibreel', name: 'محمد جبريل', folder: 'Muhammad_Jibreel_128kbps' },
  { id: 'ar.tablaway', name: 'محمد محمود الطبلاوي', folder: 'Mohammad_al_Tablaway_128kbps' },
  { id: 'ar.nasserqatami', name: 'ناصر القطامي', folder: 'Nasser_Alqatami_128kbps' },
  { id: 'ar.aliabdelrahman', name: 'علي جابر', folder: 'Ali_Jaber_64kbps' },
  { id: 'ar.salahbudair', name: 'صلاح البدير', folder: 'Salah_Al_Budair_128kbps' },
] as const;


export type ReciterId = typeof RECITERS[number]['id'];

type OfflineQuran = {
  surahs: Surah[];
  ayahs: Record<string, Ayah[]>;
};

type RawQuran = Record<string, Array<{ chapter: number; verse: number; text: string }>>;
type RawChapter = { id: number; name: string; transliteration: string; translation: string; type: string; total_verses: number };
type RawPage = { page: number; sura: number; aya: number };

let offlinePromise: Promise<OfflineQuran> | null = null;

async function loadOfflineQuran(): Promise<OfflineQuran> {
  if (!offlinePromise) {
    offlinePromise = Promise.all([
      fetch('/data/quran.json').then((r) => {
        if (!r.ok) throw new Error('ملف القرآن المحلي غير موجود');
        return r.json() as Promise<RawQuran>;
      }),
      fetch('/data/chapters.json').then((r) => {
        if (!r.ok) throw new Error('بيانات السور المحلية غير موجودة');
        return r.json() as Promise<RawChapter[]>;
      }),
      fetch('/data/pages.json').then((r) => (r.ok ? r.json() as Promise<RawPage[]> : [])),
    ]).then(([rawQuran, chapters, pageStarts]) => {
      const pageMap = new Map<string, number>();
      const sortedPages = [...pageStarts].sort((a, b) => a.page - b.page);

      for (const chapter of Object.keys(rawQuran)) {
        const verses = rawQuran[chapter] ?? [];
        for (const verse of verses) {
          let page = 0;
          for (const start of sortedPages) {
            if (start.sura < verse.chapter || (start.sura === verse.chapter && start.aya <= verse.verse)) {
              page = start.page;
            } else {
              break;
            }
          }
          pageMap.set(`${verse.chapter}:${verse.verse}`, page);
        }
      }

      const surahs: Surah[] = chapters.map((chapter) => ({
        number: chapter.id,
        name: `سُورَةُ ${chapter.name}`,
        englishName: chapter.transliteration,
        englishNameTranslation: chapter.translation,
        numberOfAyahs: chapter.total_verses,
        revelationType: chapter.type === 'meccan' ? 'Meccan' : 'Medinan',
      }));

      const ayahs: Record<string, Ayah[]> = {};
      for (const chapter of Object.keys(rawQuran)) {
        ayahs[chapter] = (rawQuran[chapter] ?? []).map((verse) => ({
          number: Number(`${verse.chapter}${String(verse.verse).padStart(3, '0')}`),
          numberInSurah: verse.verse,
          text: verse.text,
          page: pageMap.get(`${verse.chapter}:${verse.verse}`) || undefined,
        }));
      }

      return { surahs, ayahs };
    });
  }

  return offlinePromise;
}

export function getReciter(id: string) {
  return RECITERS.find((reciter) => reciter.id === id) || RECITERS[0];
}

export function normalizeArabic(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[\u200C-\u200F\u202A-\u202E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function everyAyahAudio(surah: number, ayah: number, reciterId: string): string {
  const reciter = getReciter(reciterId);
  const file = `${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;
  return `/audio/${reciter.folder}/${file}`;
}

export function surahPlaylist(surah: number, numberOfAyahs: number, reciterId: string): string[] {
  return Array.from({ length: numberOfAyahs }, (_, index) => everyAyahAudio(surah, index + 1, reciterId));
}

export const quranApi = {
  surahs: async () => (await loadOfflineQuran()).surahs,

  surah: async (id: number) => {
    const data = await loadOfflineQuran();
    const surah = data.surahs.find((item) => item.number === id);
    if (!surah) throw new Error('السورة غير موجودة');
    return { ...surah, ayahs: data.ayahs[String(id)] ?? [] };
  },

  search: async (query: string) => {
    const data = await loadOfflineQuran();
    const normalized = normalizeArabic(query);
    const matches: Array<any> = [];

    if (!normalized) return { matches, count: 0, query, total: 0 };

    for (const surah of data.surahs) {
      for (const ayah of data.ayahs[String(surah.number)] ?? []) {
        if (normalizeArabic(ayah.text).includes(normalized)) {
          matches.push({
            numberInSurah: ayah.numberInSurah,
            text: ayah.text,
            surah: {
              number: surah.number,
              name: surah.name,
              englishName: surah.englishName,
            },
          });
        }
      }
    }

    return { matches, count: matches.length, query, total: matches.length };
  },

  audio: (surah: number, ayah: number, edition = 'ar.alafasy') => everyAyahAudio(surah, ayah, edition),
  surahAudio: (id: number, edition = 'ar.alafasy') => everyAyahAudio(id, 1, edition),
  surahPlaylist,
};
