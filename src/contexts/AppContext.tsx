import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Bookmark, Settings } from '../types';

const defaults: Settings = {
  theme: 'system',
  language: 'ar',
  fontSize: 30,
  lineHeight: 2.2,
  fontFamily: 'amiri',
};

const load = <T,>(k: string, d: T): T => {
  try {
    return JSON.parse(localStorage.getItem(k) || 'null') ?? d;
  } catch {
    return d;
  }
};

const C = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() =>
    load<Settings>('quran-settings', defaults)
  );

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    load('quran-bookmarks', [])
  );

  const [last, setLast] = useState(() =>
    load('quran-last', { surah: 1, ayah: 1 })
  );

  useEffect(() => {
    localStorage.setItem('quran-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('quran-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('quran-last', JSON.stringify(last));
  }, [last]);

  useEffect(() => {
    const root = document.documentElement;

    const dark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', dark);
    root.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
    root.lang = settings.language;
  }, [settings]);

  const toggleBookmark = (b: Bookmark) =>
    setBookmarks((x) =>
      x.some((v) => v.surah === b.surah && v.ayah === b.ayah)
        ? x.filter(
            (v) => !(v.surah === b.surah && v.ayah === b.ayah)
          )
        : [...x, b]
    );

  const value = useMemo(
    () => ({
      settings,
      setSettings,
      bookmarks,
      toggleBookmark,
      last,
      setLast,
    }),
    [settings, bookmarks, last]
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export const useApp = () => useContext(C);