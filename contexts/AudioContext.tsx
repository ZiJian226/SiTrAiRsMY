'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface AudioContextType {
  isBgmMuted: boolean;
  toggleBgmMute: () => void;
  playPoffuSound: () => void;
  setVideoPlaying: (playing: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

const BGM_VOLUME = 0.3;
const BGM_MUTED_KEY = 'starmy_bgm_muted';
const BGM_OWNER_KEY = 'starmy_bgm_owner';
const BGM_CHANNEL = 'starmy-bgm-sync';
const OWNER_HEARTBEAT_MS = 2000;
const OWNER_STALE_MS = 6000;

type OwnerRecord = {
  tabId: string;
  updatedAt: number;
};

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

function parseBoolean(value: string | null): boolean | null {
  if (value == null) return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBgmMuted, setIsBgmMuted] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const poffuAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ownershipIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetVolumeRef = useRef<number>(0);
  const tabIdRef = useRef<string>('');
  const isOwnerRef = useRef<boolean>(false);
  const syncChannelRef = useRef<BroadcastChannel | null>(null);
  const hydratedPreferenceRef = useRef(false);
  const isBgmMutedRef = useRef(true);
  const videoPlayingRef = useRef(false);

  const readOwner = (): OwnerRecord | null => {
    try {
      const raw = localStorage.getItem(BGM_OWNER_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as OwnerRecord;
      if (!parsed?.tabId || typeof parsed.updatedAt !== 'number') return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const writeOwner = () => {
    if (!tabIdRef.current) return;
    const payload: OwnerRecord = { tabId: tabIdRef.current, updatedAt: Date.now() };
    localStorage.setItem(BGM_OWNER_KEY, JSON.stringify(payload));
    isOwnerRef.current = true;
  };

  const releaseOwner = () => {
    const owner = readOwner();
    if (owner?.tabId === tabIdRef.current) {
      localStorage.removeItem(BGM_OWNER_KEY);
    }
    isOwnerRef.current = false;
  };

  const tryAcquireOwner = () => {
    const now = Date.now();
    const owner = readOwner();

    if (!owner || now - owner.updatedAt > OWNER_STALE_MS || owner.tabId === tabIdRef.current) {
      writeOwner();
      return true;
    }

    isOwnerRef.current = owner.tabId === tabIdRef.current;
    return isOwnerRef.current;
  };

  const persistMutePreference = (nextMuted: boolean) => {
    localStorage.setItem(BGM_MUTED_KEY, String(nextMuted));
    writeCookie(BGM_MUTED_KEY, String(nextMuted));
    syncChannelRef.current?.postMessage({ type: 'mute-change', muted: nextMuted });
  };

  const startFade = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const fadeStep = 0.02;
    const fadeInterval = 50;

    fadeIntervalRef.current = setInterval(() => {
      if (!bgmAudioRef.current) return;

      const current = bgmAudioRef.current.volume;
      const target = targetVolumeRef.current;
      const diff = target - current;

      if (Math.abs(diff) < fadeStep) {
        bgmAudioRef.current.volume = target;
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }

        if (target === 0 && !bgmAudioRef.current.paused) {
          bgmAudioRef.current.pause();
        }
      } else {
        bgmAudioRef.current.volume = current + (diff > 0 ? fadeStep : -fadeStep);
      }
    }, fadeInterval);
  };

  const applyPlaybackState = () => {
    const audio = bgmAudioRef.current;
    if (!audio) return;

    const canPlay =
      !isBgmMutedRef.current &&
      !videoPlayingRef.current &&
      isOwnerRef.current &&
      document.visibilityState === 'visible';

    targetVolumeRef.current = canPlay ? BGM_VOLUME : 0;

    if (canPlay) {
      audio.play().catch(() => {
        // Browser autoplay policy may block until user gesture.
      });
    }

    startFade();
  };

  // Initialize audio elements
  useEffect(() => {
    tabIdRef.current = `tab_${Math.random().toString(36).slice(2)}_${Date.now()}`;

    // Create BGM audio element
    const bgmAudio = new Audio('/assets/audio/bgm.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0;
    bgmAudioRef.current = bgmAudio;

    // Create Poffu audio element
    const poffuAudio = new Audio('/assets/audio/poffu.mp3');
    poffuAudio.volume = 1;
    poffuAudioRef.current = poffuAudio;

    const cookieMuted = parseBoolean(readCookie(BGM_MUTED_KEY));
    const localMuted = parseBoolean(localStorage.getItem(BGM_MUTED_KEY));
    const initialMuted = cookieMuted ?? localMuted ?? true;
    setIsBgmMuted(initialMuted);
    isBgmMutedRef.current = initialMuted;
    hydratedPreferenceRef.current = true;

    if (typeof BroadcastChannel !== 'undefined') {
      syncChannelRef.current = new BroadcastChannel(BGM_CHANNEL);
      syncChannelRef.current.onmessage = (event: MessageEvent<{ type?: string; muted?: boolean }>) => {
        if (event.data?.type === 'mute-change' && typeof event.data.muted === 'boolean') {
          isBgmMutedRef.current = event.data.muted;
          setIsBgmMuted(event.data.muted);
        }
      };
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key === BGM_MUTED_KEY && event.newValue !== null) {
        const next = parseBoolean(event.newValue);
        if (next !== null) {
          isBgmMutedRef.current = next;
          setIsBgmMuted(next);
        }
      }

      if (event.key === BGM_OWNER_KEY) {
        const owner = readOwner();
        isOwnerRef.current = owner?.tabId === tabIdRef.current;
        applyPlaybackState();
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        releaseOwner();
      }
      applyPlaybackState();
    };

    const onExit = () => {
      releaseOwner();
    };

    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onExit);
    window.addEventListener('pagehide', onExit);

    return () => {
      if (ownershipIntervalRef.current) {
        clearInterval(ownershipIntervalRef.current);
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      syncChannelRef.current?.close();
      syncChannelRef.current = null;
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onExit);
      window.removeEventListener('pagehide', onExit);
      releaseOwner();
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
    };
  }, []);

  // Persist preference on mute change
  useEffect(() => {
    isBgmMutedRef.current = isBgmMuted;
    if (!hydratedPreferenceRef.current) return;
    persistMutePreference(isBgmMuted);
  }, [isBgmMuted]);

  useEffect(() => {
    videoPlayingRef.current = videoPlaying;
  }, [videoPlaying]);

  // Ownership heartbeat and playback coordination across tabs
  useEffect(() => {
    const tick = () => {
      const canOwn = !isBgmMuted && !videoPlaying && document.visibilityState === 'visible';

      if (!canOwn) {
        releaseOwner();
      } else {
        tryAcquireOwner();
        if (isOwnerRef.current) {
          writeOwner();
        }
      }

      applyPlaybackState();
    };

    tick();
    if (ownershipIntervalRef.current) {
      clearInterval(ownershipIntervalRef.current);
    }

    ownershipIntervalRef.current = setInterval(tick, OWNER_HEARTBEAT_MS);

    return () => {
      if (ownershipIntervalRef.current) {
        clearInterval(ownershipIntervalRef.current);
        ownershipIntervalRef.current = null;
      }
    };
  }, [isBgmMuted, videoPlaying]);

  const toggleBgmMute = () => {
    setIsBgmMuted((prev) => !prev);
  };

  const playPoffuSound = () => {
    if (poffuAudioRef.current) {
      poffuAudioRef.current.currentTime = 0;
      poffuAudioRef.current.play().catch(() => {
        // Play blocked, silent fail
      });
    }
  };

  const handleSetVideoPlaying = (playing: boolean) => {
    setVideoPlaying(playing);
  };

  return (
    <AudioContext.Provider
      value={{
        isBgmMuted,
        toggleBgmMute,
        playPoffuSound,
        setVideoPlaying: handleSetVideoPlaying,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
};
