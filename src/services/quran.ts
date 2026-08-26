import type { Ayah, Surah } from "../types";

type OfflineQuran = {
  surahs: Surah[];
  ayahs: Record<string, Ayah[]>;
};

type RawQuran = Record<
  string,
  Array<{
    chapter: number;
    verse: number;
    text: string;
  }>
>;

type RawChapter = {
  id: number;
  name: string;
  transliteration: string;
  translation: string;
  type: string;
  total_verses: number;
};

type RawPage = {
  page: number;
  sura: number;
  aya: number;
};

let offlinePromise: Promise<OfflineQuran> | null = null;

/*
 * مسارات الملفات المحلية
 *
 * GitHub Pages:
 *   https://abdelmonemahmed-72.github.io/quran-kareem/data/...
 *
 * Android / Capacitor:
 *   /data/...
 *
 * Localhost:
 *   /data/...
 */
function assetPath(path: string): string {
  const cleanPath = path.replace(/^\/+/, "");

  if (window.location.hostname.endsWith("github.io")) {
    return `/quran-kareem/${cleanPath}`;
  }

  return `/${cleanPath}`;
}

async function loadOfflineQuran(): Promise<OfflineQuran> {
  if (!offlinePromise) {
    offlinePromise = Promise.all([
      fetch(assetPath("data/quran.json")).then((r) => {
        if (!r.ok) {
          throw new Error(
            `ملف القرآن المحلي غير موجود: ${r.status} ${r.statusText}`,
          );
        }

        return r.json() as Promise<RawQuran>;
      }),

      fetch(assetPath("data/chapters.json")).then((r) => {
        if (!r.ok) {
          throw new Error(
            `بيانات السور المحلية غير موجودة: ${r.status} ${r.statusText}`,
          );
        }

        return r.json() as Promise<RawChapter[]>;
      }),

      fetch(assetPath("data/pages.json")).then((r) =>
        r.ok ? (r.json() as Promise<RawPage[]>) : [],
      ),
    ]).then(([rawQuran, chapters, pageStarts]) => {
      const pageMap = new Map<string, number>();

      const sortedPages = [...pageStarts].sort(
        (a, b) => a.page - b.page,
      );

      for (const chapter of Object.keys(rawQuran)) {
        const verses = rawQuran[chapter] ?? [];

        for (const verse of verses) {
          let page = 0;

          for (const start of sortedPages) {
            if (
              start.sura < verse.chapter ||
              (start.sura === verse.chapter &&
                start.aya <= verse.verse)
            ) {
              page = start.page;
            } else {
              break;
            }
          }

          pageMap.set(
            `${verse.chapter}:${verse.verse}`,
            page,
          );
        }
      }

      const surahs: Surah[] = chapters.map((chapter) => ({
        number: chapter.id,
        name: `سُورَةُ ${chapter.name}`,
        englishName: chapter.transliteration,
        englishNameTranslation: chapter.translation,
        numberOfAyahs: chapter.total_verses,
        revelationType:
          chapter.type === "meccan"
            ? "Meccan"
            : "Medinan",
      }));

      const ayahs: Record<string, Ayah[]> = {};

      for (const chapter of Object.keys(rawQuran)) {
        ayahs[chapter] = (rawQuran[chapter] ?? []).map(
          (verse) => ({
            number: Number(
              `${verse.chapter}${String(
                verse.verse,
              ).padStart(3, "0")}`,
            ),

            numberInSurah: verse.verse,

            text: verse.text,

            page:
              pageMap.get(
                `${verse.chapter}:${verse.verse}`,
              ) || undefined,
          }),
        );
      }

      return {
        surahs,
        ayahs,
      };
    });
  }

  return offlinePromise;
}

export function normalizeArabic(text: string): string {
  return text
    .normalize("NFKD")
    .replace(
      /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g,
      "",
    )
    .replace(/\u0640/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u200C-\u200F\u202A-\u202E]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export const quranApi = {
  surahs: async () =>
    (await loadOfflineQuran()).surahs,

  surah: async (id: number) => {
    const data = await loadOfflineQuran();

    const surah = data.surahs.find(
      (item) => item.number === id,
    );

    if (!surah) {
      throw new Error("السورة غير موجودة");
    }

    return {
      ...surah,
      ayahs: data.ayahs[String(id)] ?? [],
    };
  },

  search: async (query: string) => {
    const data = await loadOfflineQuran();

    const normalized = normalizeArabic(query);

    const matches: Array<{
      numberInSurah: number;
      text: string;
      surah: {
        number: number;
        name: string;
        englishName: string;
      };
    }> = [];

    if (!normalized) {
      return {
        matches,
        count: 0,
        query,
        total: 0,
      };
    }

    for (const surah of data.surahs) {
      for (
        const ayah of
          data.ayahs[String(surah.number)] ?? []
      ) {
        if (
          normalizeArabic(ayah.text).includes(
            normalized,
          )
        ) {
          matches.push({
            numberInSurah:
              ayah.numberInSurah,

            text: ayah.text,

            surah: {
              number: surah.number,
              name: surah.name,
              englishName:
                surah.englishName,
            },
          });
        }
      }
    }

    return {
      matches,
      count: matches.length,
      query,
      total: matches.length,
    };
  },
};