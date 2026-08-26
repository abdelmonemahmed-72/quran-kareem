export type Surah = {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
};

export type Ayah = {
  number: number;
  numberInSurah: number;
  text: string;
  page?: number;
};

export type Bookmark = {
  surah: number;
  ayah: number;
  text: string;
  surahName: string;
  createdAt: number;
};

export type Settings = {
  theme: "light" | "dark" | "system";
  language: "ar" | "en";
  fontSize: number;
  lineHeight: number;
  fontFamily: "amiri" | "naskh" | "system";
};