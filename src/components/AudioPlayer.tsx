import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Gauge,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  src?: string;
  playlist?: string[];
  title?: string;
  speed?: number;
  onNext?: () => void;
  onPrev?: () => void;
};

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function AudioPlayer({
  src,
  playlist,
  title,
  speed = 1,
  onNext,
  onPrev,
}: Props) {
  const ref = useRef<HTMLAudioElement>(null);

  const items = useMemo(
    () => (playlist?.length ? playlist : src ? [src] : []),
    [playlist, src]
  );

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(speed);

  /*
   * Reset player when a completely new playlist/audio source is supplied.
   */
  useEffect(() => {
    setIndex(0);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setError(false);
    setPlaying(false);
  }, [playlist?.join('|'), src]);

  /*
   * Load current audio item.
   */
  useEffect(() => {
    const audio = ref.current;

    if (!audio || !items.length) return;

    const source = items[index];

    if (!source) return;

    audio.pause();
    audio.src = source;
    audio.load();

    audio.playbackRate = playbackSpeed;
    audio.volume = volume;

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    setError(false);

    const playAudio = async () => {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        /*
         * Browser autoplay policies can prevent automatic playback.
         * The user can press Play manually.
         */
        setPlaying(false);
      }
    };

    void playAudio();
  }, [items, index]);

  /*
   * Keep playback speed synchronized.
   */
  useEffect(() => {
    if (ref.current) {
      ref.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  /*
   * Keep volume synchronized.
   */
  useEffect(() => {
    if (ref.current) {
      ref.current.volume = volume;
    }
  }, [volume]);

  const play = async () => {
    const audio = ref.current;

    if (!audio) return;

    try {
      await audio.play();
      setPlaying(true);
      setError(false);
    } catch {
      setPlaying(false);
      setError(true);
    }
  };

  const pause = () => {
    const audio = ref.current;

    if (!audio) return;

    audio.pause();
    setPlaying(false);
  };

  const togglePlay = () => {
    if (playing) {
      pause();
    } else {
      void play();
    }
  };

  const next = () => {
    if (index < items.length - 1) {
      setIndex((value) => value + 1);
      return;
    }

    if (repeat) {
      setIndex(0);
      return;
    }

    setPlaying(false);
    onNext?.();
  };

  const prev = () => {
    const audio = ref.current;

    /*
     * If the user is more than 3 seconds into the current ayah,
     * Previous first restarts the current ayah.
     */
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      setProgress(0);
      return;
    }

    if (index > 0) {
      setIndex((value) => value - 1);
      return;
    }

    onPrev?.();
  };

  const handleLoadedMetadata = () => {
    const audio = ref.current;

    if (!audio) return;

    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
  };

  const handleTimeUpdate = () => {
    const audio = ref.current;

    if (!audio) return;

    const current = audio.currentTime || 0;
    const total = audio.duration || 0;

    setCurrentTime(current);
    setDuration(Number.isFinite(total) ? total : 0);
    setProgress(total > 0 ? current / total : 0);
  };

  const handleSeek = (value: number) => {
    const audio = ref.current;

    if (!audio || !duration) return;

    const time = value * duration;

    audio.currentTime = time;
    setCurrentTime(time);
    setProgress(value);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(1);
    }
  };

  const changeSpeed = () => {
    const currentIndex = SPEEDS.indexOf(playbackSpeed);
    const nextIndex =
      currentIndex === -1 ? 1 : (currentIndex + 1) % SPEEDS.length;

    setPlaybackSpeed(SPEEDS[nextIndex]);
  };

  const closePlayer = () => {
    const audio = ref.current;

    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }

    setPlaying(false);
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-2 right-2 z-40 mx-auto max-w-4xl rounded-2xl border border-gold/20 bg-forest px-3 py-3 text-paper shadow-2xl md:bottom-4 md:px-4">
      <audio
        ref={ref}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={next}
        onError={() => {
          setError(true);
          setPlaying(false);
        }}
      />

      {/* Top information */}
      <div className="mb-2 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {title || 'التلاوة'}
          </div>

          {items.length > 1 && (
            <div className="text-xs text-paper/60">
              الآية {index + 1} من {items.length}
            </div>
          )}
        </div>

        <button
          type="button"
          className="player-btn"
          onClick={closePlayer}
          aria-label="إغلاق مشغل الصوت"
          title="إغلاق"
        >
          <X size={17} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2">
        <span className="w-10 text-center text-[11px] text-paper/70">
          {formatTime(currentTime)}
        </span>

        <input
          aria-label="التقدم في التلاوة"
          className="w-full cursor-pointer accent-gold"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={(event) => handleSeek(Number(event.target.value))}
        />

        <span className="w-10 text-center text-[11px] text-paper/70">
          {formatTime(duration)}
        </span>
      </div>

      {/* Controls */}
      <div className="mt-2 flex items-center justify-center gap-1 sm:gap-2">
        <button
          type="button"
          className="player-btn"
          onClick={prev}
          aria-label="السابق"
          title="السابق"
        >
          <SkipBack size={18} />
        </button>

        <button
          type="button"
          className="player-main"
          onClick={togglePlay}
          aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
          title={playing ? 'إيقاف مؤقت' : 'تشغيل'}
        >
          {playing ? (
            <Pause size={20} />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
        </button>

        <button
          type="button"
          className="player-btn"
          onClick={next}
          aria-label="التالي"
          title="التالي"
        >
          <SkipForward size={18} />
        </button>

        <button
          type="button"
          className={`player-btn ${
            repeat ? 'text-gold' : 'text-paper'
          }`}
          onClick={() => setRepeat((value) => !value)}
          aria-label={repeat ? 'إيقاف التكرار' : 'تكرار السورة'}
          title={repeat ? 'إيقاف التكرار' : 'تكرار السورة'}
        >
          <Repeat size={17} />
        </button>

        <button
          type="button"
          className="player-btn hidden sm:flex"
          onClick={changeSpeed}
          aria-label={`سرعة التشغيل ${playbackSpeed}`}
          title="سرعة التشغيل"
        >
          <Gauge size={17} />
          <span className="text-[10px]">{playbackSpeed}x</span>
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            className="player-btn"
            onClick={toggleMute}
            aria-label={volume === 0 ? 'تشغيل الصوت' : 'كتم الصوت'}
            title={volume === 0 ? 'تشغيل الصوت' : 'كتم الصوت'}
          >
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <input
            aria-label="مستوى الصوت"
            className="w-20 accent-gold"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </div>
      </div>

      {/* Mobile speed control */}
      <div className="mt-2 flex justify-center sm:hidden">
        <button
          type="button"
          className="flex items-center gap-1 rounded-lg px-3 py-1 text-xs text-paper/80 hover:bg-white/10"
          onClick={changeSpeed}
          aria-label={`سرعة التشغيل ${playbackSpeed}`}
        >
          <Gauge size={14} />
          سرعة {playbackSpeed}x
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-2 text-center text-xs text-red-300">
          تعذر تشغيل الملف الصوتي، حاول مرة أخرى.
          <button
            type="button"
            className="mr-2 underline hover:text-white"
            onClick={() => void play()}
          >
            إعادة المحاولة
          </button>
        </div>
      )}
    </div>
  );
}