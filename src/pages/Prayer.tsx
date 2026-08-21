import { MapPin, RefreshCw, LocateFixed } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPrayerTimes } from '../services/prayer';
import type { PrayerData } from '../services/prayer';
import Loading from '../components/Loading';

const names = [
  ['Fajr', 'الفجر'],
  ['Sunrise', 'الشروق'],
  ['Dhuhr', 'الظهر'],
  ['Asr', 'العصر'],
  ['Maghrib', 'المغرب'],
  ['Isha', 'العشاء'],
] as const;

export default function Prayer() {
  const [city, setCity] = useState(localStorage.getItem('prayer-city') || 'القاهرة');
  const [country, setCountry] = useState(localStorage.getItem('prayer-country') || 'مصر');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(() => {
    try { return JSON.parse(localStorage.getItem('prayer-coordinates') || 'null'); } catch { return null; }
  });
  const [data, setData] = useState<PrayerData | null>(null);

  const load = () => {
    void getPrayerTimes(city, country, coords ?? undefined).then(setData);
  };

  useEffect(() => { load(); }, [coords]);

  const locate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      setCoords(next);
      localStorage.setItem('prayer-coordinates', JSON.stringify(next));
    });
  };

  const next = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    return names.map(([k, n]) => ({ k, n, t: data.timings[k] })).find((x) => {
      const [h, m] = x.t.split(':').map(Number);
      const d = new Date();
      d.setHours(h, m, 0, 0);
      return d > now;
    }) || { k: 'Fajr', n: 'الفجر', t: data.timings.Fajr };
  }, [data]);

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="text-sm text-gold">حساب محلي</div>
          <h1 className="text-3xl font-extrabold">مواقيت الصلاة</h1>
          <p className="mt-2 text-sm text-muted">تُحسب داخل الجهاز بدون إنترنت. استخدم تحديد الموقع للحصول على إحداثيات أدق.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={locate}><LocateFixed size={16} /> موقعي</button>
          <button className="btn-secondary" onClick={load}><RefreshCw size={16} /> تحديث</button>
        </div>
      </div>

      <div className="surface mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-3"><MapPin className="text-gold" /><input className="input" value={city} onChange={e => { setCity(e.target.value); localStorage.setItem('prayer-city', e.target.value); }} placeholder="المدينة" /></div>
        <input className="input flex-1" value={country} onChange={e => { setCountry(e.target.value); localStorage.setItem('prayer-country', e.target.value); }} placeholder="الدولة" />
      </div>

      {!data ? <Loading /> : <>
        <div className="surface mb-5 bg-forest text-paper">
          <div className="flex justify-between">
            <div><div className="text-sm text-paper/60">الصلاة القادمة</div><div className="mt-1 font-arabic text-3xl text-gold">{next?.n}</div></div>
            <div className="text-left"><div className="text-sm text-paper/60">التاريخ</div><div className="mt-1">{data.date.readable}</div></div>
          </div>
          <div className="mt-6 text-4xl font-extrabold tracking-widest">{next?.t}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {names.map(([k, n]) => <div key={k} className="surface"><div className="text-sm text-muted">{n}</div><div className="mt-2 text-3xl font-bold text-forest dark:text-gold">{data.timings[k]}</div></div>)}
        </div>
      </>}
    </div>
  );
}
