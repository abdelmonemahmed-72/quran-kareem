import { useEffect, useMemo, useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { quranApi } from '../services/quran';
import type { Surah } from '../types';
import Loading from '../components/Loading';
import { ErrorState } from '../components/States';

/**
 * توحيد الكتابة العربية للبحث.
 *
 * أمثلة:
 * أ / إ / آ  → ا
 * ة          → ه
 * ى          → ي
 * حذف التشكيل
 * حذف التطويل ـ
 */
function normalizeArabic(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ـ/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function Quran() {
  const [data, setData] = useState<Surah[]>([]);
  const [q, setQ] = useState('');
  const [err, setErr] = useState(false);

  const load = () => {
    setErr(false);

    quranApi
      .surahs()
      .then(setData)
      .catch(() => setErr(true));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const search = normalizeArabic(q);

    if (!search) {
      return data;
    }

    return data.filter((s) => {
      const name = normalizeArabic(s.name);
      const englishName = normalizeArabic(s.englishName);
      const number = String(s.number);

      return (
        name.includes(search) ||
        englishName.includes(search) ||
        number === search
      );
    });
  }, [data, q]);

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm text-gold">
            المصحف الشريف
          </div>

          <h1 className="text-3xl font-extrabold">
            سور القرآن الكريم
          </h1>

          <p className="mt-2 text-sm text-muted">
            114 سورة • اختر سورة لبدء القراءة
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search
            className="absolute right-3 top-3.5 text-muted"
            size={18}
          />

          <input
            className="input pr-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم السورة..."
            aria-label="البحث عن سورة"
          />
        </div>
      </div>

      {err ? (
        <ErrorState onRetry={load} />
      ) : !data.length ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <div className="surface py-10 text-center">
          <div className="font-arabic text-2xl font-bold">
            لا توجد نتائج
          </div>

          <p className="mt-2 text-sm text-muted">
            جرّب كتابة اسم السورة بطريقة أخرى.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              to={`/quran/${s.number}`}
              key={s.number}
              className="surface group flex items-center gap-4 transition hover:-translate-y-1"
            >
              <span className="surah-num">
                {String(s.number).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-arabic text-2xl font-bold">
                    {s.name.replace(/^سُورَةُ\s*/u, '')}
                  </h2>

                  <BookOpen
                    size={17}
                    className="text-gold opacity-0 transition group-hover:opacity-100"
                  />
                </div>

                <div className="mt-1 text-xs text-muted">
                  {s.englishName}
                  {' • '}
                  {s.revelationType === 'Meccan'
                    ? 'مكية'
                    : 'مدنية'}
                  {' • '}
                  {s.numberOfAyahs} آيات
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}