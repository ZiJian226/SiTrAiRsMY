'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useAudio } from '@/contexts/AudioContext';

interface VideoEmbedProps {
  src: string;
  title: string;
  className?: string;
  aspectRatio?: string;
}

export const VideoEmbedWithAudio = ({
  src,
  title,
  className = 'w-full h-full',
  aspectRatio = 'aspect-video',
}: VideoEmbedProps) => {
  const { setVideoPlaying } = useAudio();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const platformRef = useRef<'youtube' | 'twitch' | 'tiktok' | 'other'>('other');

  const resolvedSrc = useMemo(() => {
    try {
      const url = new URL(src);

      if (/youtube\.com$/i.test(url.hostname) || /youtu\.be$/i.test(url.hostname)) {
        platformRef.current = 'youtube';
        if (!url.searchParams.has('enablejsapi')) {
          url.searchParams.set('enablejsapi', '1');
        }
        if (!url.searchParams.has('origin') && typeof window !== 'undefined') {
          url.searchParams.set('origin', window.location.origin);
        }
        return url.toString();
      }

      if (/twitch\.tv$/i.test(url.hostname)) {
        platformRef.current = 'twitch';
        return url.toString();
      }

      if (/tiktok\.com$/i.test(url.hostname)) {
        platformRef.current = 'tiktok';
        return url.toString();
      }
    } catch {
      platformRef.current = 'other';
    }

    return src;
  }, [src]);

  useEffect(() => {
    // Only force-stop when embed is out of view, do not auto-start mute on visibility.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            setVideoPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (iframeRef.current) {
      observer.observe(iframeRef.current);
    }

    return () => {
      observer.disconnect();
      setVideoPlaying(false);
    };
  }, [setVideoPlaying]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (platformRef.current !== 'youtube') return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (typeof event.data !== 'string') return;

      try {
        const data = JSON.parse(event.data) as { event?: string; info?: number };
        if (data.event !== 'onStateChange') return;

        if (data.info === 1) {
          setVideoPlaying(true);
        } else if (data.info === 0 || data.info === 2) {
          setVideoPlaying(false);
        }
      } catch {
        // Ignore non-JSON player messages.
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setVideoPlaying(false);
      }
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setVideoPlaying]);

  const handleIframeLoad = () => {
    if (platformRef.current === 'youtube' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'addEventListener', args: ['onStateChange'] }),
        '*'
      );
    }
  };

  const handlePointerDown = () => {
    if (platformRef.current !== 'youtube') {
      setVideoPlaying(true);
    }
  };

  return (
    <div className={`${aspectRatio} rounded-xl overflow-hidden bg-base-300`} onPointerDown={handlePointerDown}>
      <iframe
        ref={iframeRef}
        className={className}
        src={resolvedSrc}
        title={title}
        loading="lazy"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};
