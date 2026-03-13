import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.35;
    audio.loop = true;

    const tryPlay = () => {
      audio
        .play()
        .then(() => setNeedsInteraction(false))
        .catch(() => setNeedsInteraction(true));
    };

    tryPlay();

    const handleUserGesture = () => {
      tryPlay();
      document.removeEventListener('pointerdown', handleUserGesture);
    };

    document.addEventListener('pointerdown', handleUserGesture);

    return () => {
      document.removeEventListener('pointerdown', handleUserGesture);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/background.mp3"
        preload="auto"
        autoPlay
        loop
      />
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
        {needsInteraction && (
          <span className="text-[10px] uppercase tracking-widest text-gray-400 bg-surface-800/80 border border-surface-700 rounded-full px-3 py-1">
            Tap anywhere to enable sound
          </span>
        )}
        <button
          type="button"
          onClick={() => setMuted((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-800/80 border border-surface-600 text-xs font-semibold text-white hover:border-btc-500/60 transition-colors"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          {muted ? 'Unmute' : 'Mute BGM'}
        </button>
      </div>
    </>
  );
}
