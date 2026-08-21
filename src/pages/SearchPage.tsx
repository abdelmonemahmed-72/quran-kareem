import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { quranApi } from '../services/quran';
import { ErrorState, EmptyState } from '../components/States';
import Loading from '../components/Loading';

type SearchMatch = {
  numberInSurah: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName?: string;
  };
};

type SearchResponse = {
  matches: SearchMatch[];
};

/**
 * Normalize Arabic text for searching only.
 *
 * IMPORTANT:
 * This function NEVER modifies the Quran text displayed to the user.
 * It is only used to compare the user's query with Quran text.
 */
function normalizeArabic(text: string): string {
  return text
    .normalize('NFKD')

    // Remove Arabic tashkeel / harakat
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')

    // Remove tatweel
    .replace(/\u0640/g, '')

    // Normalize Arabic hamza/alif variations
    .replace(/[أإآٱ]/g, 'ا')

    // Normalize hamza on waw / ya
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')

    // Normalize alif maqsura
    .replace(/ى/g, 'ي')

    // Normalize Arabic teh marbuta
    .replace(/ة/g, 'ه')

    // Remove invisible marks
    .replace(/[\u200C-\u200F\u202A-\u202E]/g, '')

    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Determines whether the Quran text contains the normalized search query.
 */
function matchesArabicText(text: string, query: string): boolean {
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);

  if (!normalizedQuery) {
    return false;
  }

  return normalizedText.includes(normalizedQuery);
}

export default function SearchPage() {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');

  const [res, setRes] = useState<SearchResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  /*
   * Debounce search input.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuery(q.trim());
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [q]);

  /* Search the bundled Quran database locally. */
  useEffect(() => {
    let cancelled = false;

    async function search() {
      if (!query) {
        setRes(null);
        setLoading(false);
        setErr(false);
        return;
      }

      setLoading(true);
      setErr(false);

      try {
        const result = (await quranApi.search(query)) as SearchResponse;

        if (cancelled) {
          return;
        }

        /*
         * Filter API results using normalized Arabic comparison.
         */
        const filtered = (result.matches || []).filter((match) =>
          matchesArabicText(match.text, query)
        );

        setRes({
          matches: filtered,
        });
      } catch {
        if (!cancelled) {
          setErr(true);
          setRes(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void search();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-gold">البحث</div>

        <h1 className="text-3xl font-extrabold">
          ابحث في القرآن الكريم
        </h1>

        <p className="mt-2 text-sm text-muted">
          اكتب كلمة أو عبارة للعثور على الآيات المطابقة.
          لا تحتاج إلى كتابة التشكيل أو الهمزات بدقة.
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <SearchIcon
          className="absolute right-4 top-4 text-muted"
          aria-hidden="true"
        />

        <input
          autoFocus
          dir="rtl"
          className="input h-14 pr-12 text-lg"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن كلمة في القرآن..."
          aria-label="البحث في القرآن الكريم"
          type="search"
        />
      </div>

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <Loading />
        ) : err ? (
          <ErrorState />
        ) : !query ? (
          <EmptyState
            title="ابدأ البحث"
            text="ستظهر النتائج هنا بمجرد كتابة كلمة أو عبارة."
          />
        ) : !res?.matches?.length ? (
          <EmptyState
            title="لا توجد نتائج"
            text="جرّب كلمة أخرى أو عبارة أقصر."
          />
        ) : (
          <div className="space-y-3">
            {res.matches.map((m) => (
              <Link
                key={`${m.surah.number}-${m.numberInSurah}`}
                to={`/quran/${m.surah.number}#ayah-${m.numberInSurah}`}
                className="surface block transition hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-semibold">
                      {m.surah.name}
                    </div>

                    <div className="text-xs text-muted">
                      الآية {m.numberInSurah}
                    </div>
                  </div>

                  <ArrowLeft
                    size={17}
                    className="shrink-0 text-gold"
                    aria-hidden="true"
                  />
                </div>

                {/* Original Quran text - NEVER normalized */}
                <p className="mt-4 font-arabic text-xl leading-loose">
                  {m.text}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}