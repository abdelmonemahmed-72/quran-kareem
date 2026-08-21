import {Headphones,Play,Pause,SkipBack,SkipForward} from 'lucide-react';
import {useEffect,useState} from 'react';
import {getReciter,quranApi,RECITERS,surahPlaylist} from '../services/quran';
import type {Surah} from '../types';
import Loading from '../components/Loading';
import {ErrorState} from '../components/States';
import AudioPlayer from '../components/AudioPlayer';

export default function Audio(){
  const [surahs,setSurahs]=useState<Surah[]>([]);
  const [id,setId]=useState(1);
  const [reciter,setReciter]=useState('ar.alafasy');
  const [playing,setPlaying]=useState(false);
  const [playlist,setPlaylist]=useState<string[]>([]);
  const [err,setErr]=useState(false);
  const [loadingAudio,setLoadingAudio]=useState(false);
  const selected=getReciter(reciter);

  useEffect(()=>{quranApi.surahs().then(setSurahs).catch(()=>setErr(true))},[]);

  const start=async()=>{
    setLoadingAudio(true);
    try{
      const s=await quranApi.surah(id);
      setPlaylist(surahPlaylist(id,s.numberOfAyahs,reciter));
      setPlaying(true);
    }catch{setErr(true)}finally{setLoadingAudio(false)}
  };

  const s=surahs.find(x=>x.number===id);
  if(err)return <ErrorState onRetry={()=>location.reload()}/>;
  if(!surahs.length)return <Loading/>;

  return <div className="mx-auto max-w-5xl">
    <div className="mb-8"><div className="text-sm text-gold">القرآن المسموع</div><h1 className="text-3xl font-extrabold">استمع بتدبر</h1><p className="mt-2 text-sm text-muted">تم إصلاح روابط ماهر المعيقلي وياسر الدوسري وسعود الشريم وسعد الغامدي باستخدام ملفات الآيات المباشرة.</p></div>
    <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
      <div className="surface">
        <label className="label">القارئ</label>
        <select className="input" value={reciter} onChange={e=>{setReciter(e.target.value);setPlaying(false);setPlaylist([])}}>{RECITERS.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <label className="label mt-5">السورة</label>
        <select className="input" value={id} onChange={e=>{setId(+e.target.value);setPlaying(false);setPlaylist([])}}>{surahs.map(x=><option key={x.number} value={x.number}>{x.number}. {x.name}</option>)}</select>
        <button className="btn-primary mt-5 w-full" disabled={loadingAudio} onClick={start}><Play size={17}/> {loadingAudio?'جاري التجهيز...':'تشغيل السورة'}</button>
      </div>
      <div className="surface bg-forest text-paper">
        <div className="flex items-center gap-3"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold/15 text-gold"><Headphones/></span><div><div className="text-sm text-paper/60">تلاوة</div><div className="font-arabic text-2xl">{s?.name}</div><div className="text-sm text-paper/60">{selected.name}</div></div></div>
        <div className="mt-8 h-2 rounded-full bg-white/10"><div className={`h-full rounded-full bg-gold transition-all ${playing?'w-1/3':'w-0'}`}/></div>
        <div className="mt-7 flex justify-center gap-3"><button className="player-btn" onClick={()=>setPlaying(false)} aria-label="السابق"><SkipBack/></button><button className="player-main" onClick={()=>{if(playlist.length)setPlaying(!playing);else start()}}>{playing?<Pause/>:<Play fill="currentColor"/>}</button><button className="player-btn" onClick={()=>setPlaying(false)} aria-label="التالي"><SkipForward/></button></div>
        <p className="mt-5 text-center text-xs text-paper/50">المصدر: EveryAyah • التشغيل آيةً بعد آية لضمان عمل القراء المختلفين.</p>
      </div>
    </div>
    {playing&&playlist.length>0&&<AudioPlayer playlist={playlist} title={`${s?.name||'سورة'} • ${selected.name}`}/>} 
  </div>
}
