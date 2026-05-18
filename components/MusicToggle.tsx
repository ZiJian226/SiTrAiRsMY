'use client';

import { useAudio } from '@/contexts/AudioContext';
import { useState, useEffect } from 'react';

export const MusicToggle = () => {
  const { isBgmMuted, toggleBgmMute } = useAudio();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={toggleBgmMute}
      className="btn btn-ghost btn-circle pointer-events-auto hover:drop-shadow-[0_0_8px_rgba(141,118,209,0.8)] hover:scale-110 duration-300"
      aria-label={isBgmMuted ? 'Unmute music' : 'Mute music'}
      title={isBgmMuted ? 'Unmute music' : 'Mute music'}
    >
      <span className="relative inline-flex items-center justify-center text-xl leading-none">
        <span aria-hidden="true">🎵</span>
        {isBgmMuted && (
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-1/2 h-0.5 -rotate-12 bg-current rounded"
          />
        )}
      </span>
    </button>
  );
};
