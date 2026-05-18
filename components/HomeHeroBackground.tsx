"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ASSETS } from '@/lib/assetPath';
import type { HomepageHeroConfig, HomepageHeroMedia } from '@/lib/types';

function getBackgroundFitClasses(fitMode?: string): string {
  switch (fitMode) {
    case 'fill':
      return 'object-fill';
    case 'fit':
      return 'object-contain';
    case 'stretch':
      return 'object-fill';
    case 'center':
      return 'object-contain object-center';
    case 'span':
      return 'object-cover object-center';
    case 'tile':
      return 'object-cover object-center';
    default:
      return 'object-contain';
  }
}

export default function HomeHeroBackground() {
  const [config, setConfig] = useState<HomepageHeroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackIndex, setTrackIndex] = useState(1);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const loadBackground = useCallback(async (cancelledRef?: { current: boolean }) => {
    try {
      const response = await fetch('/api/content/homepage-background', { cache: 'no-store' });
      const payload = await response.json();
      if (!cancelledRef?.current) {
        setConfig(payload.data || null);
      }
    } catch (error) {
      console.error('Failed to load homepage background:', error);
    } finally {
      if (!cancelledRef?.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const cancelledRef = { current: false };

    void loadBackground(cancelledRef);

    const refreshFromStorage = (event: StorageEvent) => {
      if (event.key === 'starmy:homepage-background-updated') {
        void loadBackground(cancelledRef);
      }
    };

    const refreshFromBroadcast = (event: MessageEvent) => {
      if (event.data === 'homepage-background-updated') {
        void loadBackground(cancelledRef);
      }
    };

    window.addEventListener('storage', refreshFromStorage);
    const channel = typeof window.BroadcastChannel !== 'undefined' ? new BroadcastChannel('homepage-background') : null;
    channel?.addEventListener('message', refreshFromBroadcast);

    return () => {
      cancelledRef.current = true;
      window.removeEventListener('storage', refreshFromStorage);
      channel?.removeEventListener('message', refreshFromBroadcast);
      channel?.close();
    };
  }, [loadBackground]);

  const activeMedia = useMemo<HomepageHeroMedia[]>(() => {
    return (config?.media || []).filter((item) => item.is_active && item.media_url.trim().length > 0);
  }, [config]);

  const settings = config?.settings;
  const overlayOpacity = Math.min(100, Math.max(0, settings?.overlay_opacity ?? 30));
  const backgroundColor = settings?.background_color?.trim() || 'oklch(var(--b1))';

  const slideshowMedia = useMemo<HomepageHeroMedia[]>(() => {
    if (activeMedia.length <= 1) {
      return activeMedia;
    }

    return [activeMedia[activeMedia.length - 1], ...activeMedia, activeMedia[0]];
  }, [activeMedia]);

  useEffect(() => {
    setTrackIndex(activeMedia.length > 1 ? 1 : 0);
    setShouldAnimate(false);

    const animationFrame = window.requestAnimationFrame(() => {
      setShouldAnimate(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [activeMedia.length]);

  useEffect(() => {
    if (activeMedia.length <= 1) {
      return undefined;
    }

    const currentItem = slideshowMedia[trackIndex];
    if (!currentItem || currentItem.media_type === 'video') {
      return undefined;
    }

    const intervalMs = Math.max(1000, settings?.slideshow_interval_ms ?? 3000);
    const timer = window.setTimeout(() => {
      setTrackIndex((index) => index + 1);
    }, intervalMs);

    return () => window.clearTimeout(timer);
  }, [activeMedia.length, slideshowMedia, trackIndex, settings?.slideshow_interval_ms]);

  // Reset/repair track when the document regains visibility (fixes tab-switch burst)
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;

      if (activeMedia.length <= 1) return;

      // Temporarily disable animation, ensure trackIndex is valid, then re-enable
      setShouldAnimate(false);

      setTrackIndex((i) => {
        // ensure index is within safe bounds (1..slideshowMedia.length-2)
        const maxIndex = Math.max(1, slideshowMedia.length - 2);
        if (i < 1 || i > maxIndex) return 1;
        return i;
      });

      // force layout, then re-enable animation next frame(s)
      // (double rAF to avoid transitional flash)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      document.body.offsetHeight;
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setShouldAnimate(true);
        });
      });
    };

    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [activeMedia.length, slideshowMedia.length]);

  const handleTrackTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') {
      return;
    }

    if (activeMedia.length <= 1) {
      return;
    }

    if (trackIndex === slideshowMedia.length - 1) {
      setShouldAnimate(false);
      setTrackIndex(1);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setShouldAnimate(true);
        });
      });
    }
  };

  const handleMediaEnded = () => {
    if (activeMedia.length <= 1) {
      return;
    }

    setTrackIndex((index) => index + 1);
  };

  return (
    <div className="w-full h-full min-h-[100svh] relative z-0" style={{ backgroundColor }}>
      <div className="w-full h-full min-h-[100svh]">
        {loading || activeMedia.length === 0 ? (
          <img
            src={ASSETS.images.background.starmy}
            alt="StarMy Background"
            className="w-full h-full object-contain block"
          />
        ) : (
          <div className="relative w-full h-full overflow-hidden">
            <div
              className={`flex h-full ${shouldAnimate ? 'transition-transform duration-700 ease-in-out' : 'transition-none'}`}
              style={{
                width: `${slideshowMedia.length * 100}%`,
                transform: `translateX(-${trackIndex * (100 / slideshowMedia.length)}%)`,
              }}
              onTransitionEnd={handleTrackTransitionEnd}
            >
              {slideshowMedia.map((item) => (
                <div
                  key={item.id}
                  className="shrink-0 h-full"
                  style={{ width: `${100 / slideshowMedia.length}%` }}
                >
                  {item.media_type === 'video' ? (
                    <video
                      src={item.media_url}
                      autoPlay
                      muted
                      loop={activeMedia.length <= 1}
                      playsInline
                      onEnded={handleMediaEnded}
                      className={`block w-full h-full ${getBackgroundFitClasses(settings?.background_fit)}`}
                    />
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.label || 'StarMy background'}
                      className={`block w-full h-full ${getBackgroundFitClasses(settings?.background_fit)}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-base-100 pointer-events-none" style={{ opacity: overlayOpacity / 100 }}></div>
    </div>
  );
}
