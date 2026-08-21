export type PrayerData = {
  timings: Record<string, string>;
  date: { readable: string; gregorian: { date: string }; hijri: { date: string; month: { ar: string } } };
  meta: { latitude: number; longitude: number };
};

type Coordinates = { latitude: number; longitude: number };

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

function solarDeclination(n: number) {
  const gamma = (2 * Math.PI / 365) * (n - 1);
  return 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
}

function equationOfTime(n: number) {
  const gamma = (2 * Math.PI / 365) * (n - 1);
  return 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
}

function solarTimeMinutes(date: Date, latitude: number, longitude: number, angle: number, morning: boolean) {
  const n = dayOfYear(date);
  const decl = solarDeclination(n);
  const eot = equationOfTime(n);
  const lat = latitude * DEG;
  const altitude = angle * DEG;
  const cosH = (Math.sin(altitude) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));

  if (cosH < -1 || cosH > 1) return null;

  const hourAngle = Math.acos(cosH) * RAD;
  const solarNoon = 720 - 4 * longitude - eot - date.getTimezoneOffset();
  return solarNoon + (morning ? -4 * hourAngle : 4 * hourAngle);
}

function asrMinutes(date: Date, latitude: number, longitude: number) {
  const n = dayOfYear(date);
  const decl = solarDeclination(n);
  const lat = latitude * DEG;
  const noon = 720 - 4 * longitude - equationOfTime(n) - date.getTimezoneOffset();
  const altitude = Math.atan(1 / (1 + Math.tan(Math.abs(lat - decl)))) * RAD;
  const cosH = (Math.sin(altitude * DEG) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
  if (cosH < -1 || cosH > 1) return null;
  return noon + 4 * Math.acos(cosH) * RAD;
}

function formatTime(minutes: number | null) {
  if (minutes === null || !Number.isFinite(minutes)) return '--:--';
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = Math.round(normalized % 60);
  const hour = m === 60 ? (h + 1) % 24 : h;
  const minute = m === 60 ? 0 : m;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export async function getPrayerTimes(_city = 'موقعي', _country = 'مصر', coordinates?: Coordinates): Promise<PrayerData> {
  const fallback: Coordinates = { latitude: 30.0444, longitude: 31.2357 };
  const position = coordinates ?? fallback;
  const now = new Date();
  const fajr = solarTimeMinutes(now, position.latitude, position.longitude, -18, true);
  const sunrise = solarTimeMinutes(now, position.latitude, position.longitude, -0.833, true);
  const noon = 720 - 4 * position.longitude - equationOfTime(dayOfYear(now)) - now.getTimezoneOffset();
  const asr = asrMinutes(now, position.latitude, position.longitude);
  const maghrib = solarTimeMinutes(now, position.latitude, position.longitude, -0.833, false);
  const isha = solarTimeMinutes(now, position.latitude, position.longitude, -18, false);

  const timings = {
    Fajr: formatTime(fajr),
    Sunrise: formatTime(sunrise),
    Dhuhr: formatTime(noon),
    Asr: formatTime(asr),
    Maghrib: formatTime(maghrib),
    Isha: formatTime(isha),
  };

  return {
    timings,
    date: {
      readable: now.toLocaleDateString('ar-EG'),
      gregorian: { date: now.toLocaleDateString('en-GB') },
      hijri: { date: '', month: { ar: '' } },
    },
    meta: position,
  };
}
