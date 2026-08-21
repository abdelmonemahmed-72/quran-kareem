import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ChevronLeft,
  ChevronRight,
  Play,
  Bookmark as BookmarkIcon,
  Copy,
  Share2,
} from "lucide-react";

import type {
  Ayah,
  Surah as S,
} from "../types";

import { useApp } from "../contexts/AppContext";
import { quranApi } from "../services/quran";
import AudioPlayer from "../components/AudioPlayer";
import Loading from "../components/Loading";
import { ErrorState } from "../components/States";
export default function Surah() {
  const { id } = useParams();
  const n = Number(id) || 1;

  const [s, setS] = useState<(S & { ayahs: Ayah[] }) | null>(null);
  const [err, setErr] = useState(false);
  const [audioPlaylist, setAudioPlaylist] = useState<string[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);

  const {
    settings,
    toggleBookmark,
    bookmarks,
    setLast,
  } = useApp();

  const load = () => {
    setErr(false);

    quranApi
      .surah(n)
      .then((x) => {
        setS(x);

        setLast({
          surah: n,
          ayah: 1,
        });
      })
      .catch(() => {
        setErr(true);
      });
  };

  useEffect(() => {
    load();
  }, [n]);

  useEffect(() => {
    const handleHash = () => {
      const match = window.location.hash.match(/ayah-(\d+)/);

      if (match) {
        const ayahNumber = Number(match[1]);

        document
          .getElementById(`ayah-${ayahNumber}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

        setSelectedAyah(ayahNumber);
      }
    };

    const timer = window.setTimeout(handleHash, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [s]);

  if (err) {
    return <ErrorState onRetry={load} />;
  }

  if (!s) {
    return <Loading />;
  }

  const playSurah = () => {
    setAudioPlaylist(
      quranApi.surahPlaylist(
        n,
        s.numberOfAyahs,
        settings.reciter
      )
    );
  };

  /*
   * تجميع الآيات حسب رقم صفحة المصحف.
   * الـAPI يوفر رقم الصفحة لكل آية.
   */
  const pages = Array.from(
    s.ayahs
      .reduce((map, ayah) => {
        const page = ayah.page ?? 0;

        if (!map.has(page)) {
          map.set(page, []);
        }

        map.get(page)!.push(ayah);

        return map;
      }, new Map<number, Ayah[]>())
      .entries()
  );

  return (
    <div className="mushaf-reader">
      {/* شريط الأدوات */}
      <div className="mushaf-toolbar">
        <div>
          <div className="text-sm text-gold">
            المصحف الشريف
          </div>

          <h1 className="mt-1 font-arabic text-3xl font-bold">
            {s.name}
          </h1>

          <div className="mt-1 text-xs text-paper/60">
            {s.revelationType === "Meccan"
              ? "مكية"
              : "مدنية"}{" "}
            • {s.numberOfAyahs} آيات
          </div>
        </div>

        <div className="mushaf-actions">
          <Link
            className="pill"
            to={`/quran/${Math.max(1, n - 1)}`}
          >
            <ChevronRight size={16} />
            السابقة
          </Link>

          <button
            type="button"
            className="pill"
            onClick={playSurah}
          >
            <Play size={16} />
            تشغيل
          </button>

          <Link
            className="pill"
            to={`/quran/${Math.min(114, n + 1)}`}
          >
            التالية
            <ChevronLeft size={16} />
          </Link>
        </div>
      </div>

      {/* صفحات المصحف */}
      <div className="mushaf-pages">
        {pages.map(([pageNumber, ayahs], pageIndex) => (
          <section
            className="mushaf-page"
            key={pageNumber || pageIndex}
            aria-label={`صفحة المصحف ${
              pageNumber || pageIndex + 1
            }`}
          >
            <div className="mushaf-page-border">
              {/* رأس الصفحة */}
              <div className="mushaf-page-topline">
                <span>الجزء</span>

                <span className="mushaf-page-title">
                  {s.name.replace(/^سُورَةُ\s*/u, "")}
                </span>

                <span>
                  {pageNumber || pageIndex + 1}
                </span>
              </div>

              {/* اسم السورة في أول صفحة */}
              {pageIndex === 0 && (
                <>
                  <div className="mushaf-surah-title">
                    <span>
                      {s.revelationType === "Meccan"
                        ? "مكية"
                        : "مدنية"}
                    </span>

                    <strong>
                      {s.name.replace(
                        /^سُورَةُ\s*/u,
                        ""
                      )}
                    </strong>

                    <span>
                      {s.numberOfAyahs} آيات
                    </span>
                  </div>

                  {/* البسملة */}
                  {n !== 9 && (
                    <div className="mushaf-basmalah font-arabic">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                  )}
                </>
              )}

              {/* نص الآيات */}
              <div
                className="mushaf-text"
                style={{
                  fontSize: settings.fontSize,
                  lineHeight: Math.max(
                    1.9,
                    settings.lineHeight
                  ),
                }}
              >
                {ayahs.map((a) => {
                 const saved = bookmarks.some(
                (b: any) =>
                b.surah === n &&
                b.ayah === a.numberInSurah
);

                  const selected =
                    selectedAyah === a.numberInSurah;

                  return (
                    <span
                      key={a.number}
                      id={`ayah-${a.numberInSurah}`}
                      className={`mushaf-ayah ${
                        selected ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedAyah(
                          a.numberInSurah
                        );

                        setLast({
                          surah: n,
                          ayah: a.numberInSurah,
                        });
                      }}
                    >
                      {a.text}{" "}

                      {/* رقم الآية */}
                      <span
                        className="mushaf-ayah-mark"
                        title={
                          saved
                            ? "محفوظة"
                            : undefined
                        }
                      >
                        {a.numberInSurah}
                      </span>

                      {" "}

                      {/* أدوات الآية */}
                      {selected && (
                        <span
                          className="mushaf-inline-tools"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          {/* تشغيل */}
                          <button
                            type="button"
                            onClick={() =>
                              setAudioPlaylist([
                                quranApi.audio(
                                  n,
                                  a.numberInSurah,
                                  settings.reciter
                                ),
                              ])
                            }
                            aria-label="استماع"
                          >
                            <Play size={13} />
                          </button>

                          {/* حفظ */}
                          <button
                            type="button"
                            onClick={() =>
                              toggleBookmark({
                                surah: n,
                                ayah: a.numberInSurah,
                                text: a.text,
                                surahName: s.name,
                                createdAt: Date.now(),
                              })
                            }
                            aria-label="حفظ"
                          >
                            <BookmarkIcon
                              size={13}
                              fill={
                                saved
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </button>

                          {/* نسخ */}
                          <button
                            type="button"
                            onClick={() =>
                              navigator.clipboard?.writeText(
                                a.text
                              )
                            }
                            aria-label="نسخ"
                          >
                            <Copy size={13} />
                          </button>

                          {/* مشاركة */}
                          <button
                            type="button"
                            onClick={() =>
                              navigator.share?.({
                                text: a.text,
                              })
                            }
                            aria-label="مشاركة"
                          >
                            <Share2 size={13} />
                          </button>
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>

              {/* أسفل الصفحة */}
              <div className="mushaf-page-footer">
                <span>القرآن الكريم</span>

                <span>
                  صفحة {pageNumber || pageIndex + 1}
                </span>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* التنقل السفلي */}
      <div className="mushaf-bottom-nav">
        <Link
          className="btn-secondary"
          to={`/quran/${Math.max(1, n - 1)}`}
        >
          <ChevronRight size={17} />
          السورة السابقة
        </Link>

        <button
          type="button"
          className="btn-gold"
          onClick={playSurah}
        >
          <Play size={17} />
          تشغيل السورة
        </button>

        <Link
          className="btn-secondary"
          to={`/quran/${Math.min(114, n + 1)}`}
        >
          السورة التالية
          <ChevronLeft size={17} />
        </Link>
      </div>

      {/* مشغل الصوت */}
      {audioPlaylist.length > 0 && (
        <AudioPlayer
          playlist={audioPlaylist}
          title={`${s.name} • ${settings.reciter}`}
        />
      )}
    </div>
  );
}