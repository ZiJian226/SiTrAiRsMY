'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import type { HomepageHeroConfig, HomepageHeroMediaType, HomepageHeroMode, BackgroundFitMode } from '@/lib/types';
import { ASSETS } from '@/lib/assetPath';
import { useAuth } from '@/contexts/AuthContext';

interface EditableHomepageMedia {
  id?: string;
  media_type: HomepageHeroMediaType;
  media_url: string;
  media_object_key?: string;
  sort_order: number;
  is_active: boolean;
}

function getBackgroundFitClasses(fitMode: string): string {
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
      return 'object-cover object-center'; // For tile, we'd need background-repeat; covered by CSS
    default:
      return 'object-contain';
  }
}

function inferMediaType(mediaType: HomepageHeroMediaType, mediaUrl: string): HomepageHeroMediaType {
  if (mediaType === 'video') {
    return 'video';
  }

  if (/\.(mp4|webm|mov|mkv|m4v)(?:[?#].*)?$/i.test(mediaUrl)) {
    return 'video';
  }

  return 'photo';
}

function normalizeMedia(items: EditableHomepageMedia[]): EditableHomepageMedia[] {
  return items
    .map((item, index) => ({
      ...item,
      media_url: item.media_url.trim(),
      media_object_key: item.media_object_key?.trim() || undefined,
      sort_order: Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : index,
    }))
    .filter((item) => item.media_url.length > 0);
}

function isHexColor(value: string) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

function expandHexColor(value: string) {
  const hex = value.trim().replace('#', '');
  if (hex.length === 3) {
    return hex.split('').map((character) => character + character).join('');
  }

  return hex;
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, '0'))
    .join('')}`;
}

async function getDominantColorFromImageUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 32;
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(image, 0, 0, size, size);
        const { data } = context.getImageData(0, 0, size, size);
        const colorCounts = new Map<string, number>();

        for (let index = 0; index < data.length; index += 4) {
          const alpha = data[index + 3];
          if (alpha < 32) {
            continue;
          }

          const red = Math.floor(data[index] / 32) * 32;
          const green = Math.floor(data[index + 1] / 32) * 32;
          const blue = Math.floor(data[index + 2] / 32) * 32;
          const color = rgbToHex(red, green, blue);
          colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
        }

        if (colorCounts.size === 0) {
          resolve(null);
          return;
        }

        let dominantColor = '#ffffff';
        let dominantCount = 0;

        colorCounts.forEach((count, color) => {
          if (count > dominantCount) {
            dominantColor = color;
            dominantCount = count;
          }
        });

        resolve(dominantColor);
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = url;
  });
}

async function deriveHomepageColor(mediaItems: EditableHomepageMedia[]): Promise<string> {
  const photoItems = mediaItems.filter((item) => item.is_active && item.media_type === 'photo' && item.media_url.trim().length > 0);

  const dominantColors = await Promise.all(photoItems.map((item) => getDominantColorFromImageUrl(item.media_url)));
  const colorCounts = new Map<string, number>();

  dominantColors.filter((color): color is string => Boolean(color)).forEach((color) => {
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
  });

  let fallbackColor = '#ffffff';
  let fallbackCount = 0;

  colorCounts.forEach((count, color) => {
    if (count > fallbackCount) {
      fallbackColor = color;
      fallbackCount = count;
    }
  });

  return fallbackColor;
}

export default function HomepageBackgroundPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [config, setConfig] = useState<HomepageHeroConfig | null>(null);
  const [settings, setSettings] = useState<{
    mode: HomepageHeroMode;
    slideshow_interval_ms: number;
    overlay_opacity: number;
    background_color: string;
    background_fit: BackgroundFitMode;
  }>({
    mode: 'slideshow',
    slideshow_interval_ms: 3000,
    overlay_opacity: 30,
    background_color: '',
    background_fit: 'fit',
  });
  const [media, setMedia] = useState<EditableHomepageMedia[]>([]);
  const [colorMode, setColorMode] = useState<'auto' | 'manual'>('auto');
  const [colorScanning, setColorScanning] = useState(false);
  const previewBackgroundColor = isHexColor(settings.background_color) ? settings.background_color : 'oklch(var(--b1))';
  const previewMedia = useMemo(
    () => media.filter((item) => item.is_active && item.media_url.trim().length > 0).sort((left, right) => left.sort_order - right.sort_order),
    [media],
  );

  // Sliding-track preview (cloned edges like homepage)
  const slideshowPreviewMedia = useMemo(() => {
    if (previewMedia.length <= 1) return previewMedia;
    return [previewMedia[previewMedia.length - 1], ...previewMedia, previewMedia[0]];
  }, [previewMedia]);

  const [previewTrackIndex, setPreviewTrackIndex] = useState(previewMedia.length > 1 ? 1 : 0);
  const [previewShouldAnimate, setPreviewShouldAnimate] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (!authLoading && profile && profile.role !== 'admin' && profile.role !== 'staff') {
      router.push('/dashboard');
    }
  }, [authLoading, user, profile, router]);

  useEffect(() => {
    if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
      return;
    }

    const loadConfig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/admin/homepage-background', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load homepage background config');
        }

        const data = payload.data as HomepageHeroConfig;
        setConfig(data);
        setSettings({
          mode: 'slideshow',
          slideshow_interval_ms: data.settings?.slideshow_interval_ms ?? 3000,
          overlay_opacity: data.settings?.overlay_opacity ?? 30,
          background_color: data.settings?.background_color ?? '',
          background_fit: data.settings?.background_fit ?? 'fit',
        });
        setColorMode(data.settings?.background_color ? 'manual' : 'auto');
        setMedia(
          (data.media || []).map((item, index) => ({
            id: item.id,
            media_type: item.media_type,
            media_url: item.media_url,
            media_object_key: item.media_object_key || undefined,
            sort_order: item.sort_order ?? index,
            is_active: item.is_active,
          })),
        );
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load homepage background config');
      } finally {
        setLoading(false);
      }
    };

    void loadConfig();
  }, [user, profile]);

  useEffect(() => {
    setPreviewTrackIndex(previewMedia.length > 1 ? 1 : 0);
    setPreviewShouldAnimate(false);
    const raf = window.requestAnimationFrame(() => setPreviewShouldAnimate(true));
    return () => window.cancelAnimationFrame(raf);
  }, [previewMedia.length]);

  useEffect(() => {
    if (previewMedia.length <= 1) return undefined;

    const currentItem = slideshowPreviewMedia[previewTrackIndex];
    if (!currentItem || currentItem.media_type === 'video') {
      return undefined;
    }

    const intervalMs = Math.max(1000, settings.slideshow_interval_ms || 3000);
    const timer = window.setTimeout(() => setPreviewTrackIndex((i) => i + 1), intervalMs);
    return () => window.clearTimeout(timer);
  }, [settings.slideshow_interval_ms, previewMedia.length, previewTrackIndex, slideshowPreviewMedia]);

  useEffect(() => {
    let cancelled = false;

    const applyDefaultColor = async () => {
      if (colorMode !== 'auto' || isHexColor(settings.background_color)) {
        return;
      }

      if (previewMedia.length === 0) {
        return;
      }

      setColorScanning(true);
      try {
        const derivedColor = await deriveHomepageColor(previewMedia);
        if (!cancelled) {
          setSettings((prev) => ({
            ...prev,
            background_color: derivedColor,
          }));
        }
      } finally {
        if (!cancelled) {
          setColorScanning(false);
        }
      }
    };

    void applyDefaultColor();

    return () => {
      cancelled = true;
    };
  }, [colorMode, previewMedia, settings.background_color]);

  async function handleAutoPickColor() {
    setColorScanning(true);
    try {
      const derivedColor = await deriveHomepageColor(previewMedia);
      setSettings((prev) => ({
        ...prev,
        background_color: derivedColor,
      }));
      setColorMode('auto');
    } finally {
      setColorScanning(false);
    }
  }

  async function handleUploadMediaFile(file: File, index: number) {
    setUploadingIndex(index);
    setError(null);

    try {
      const payload = new FormData();
      payload.append('file', file);
      payload.append('folder', 'homepage-background');

      const response = await fetch('/api/admin/uploads/media', {
        method: 'POST',
        body: payload,
      });

      const uploadPayload = await response.json().catch(() => null) as { error?: string; url?: string; key?: string; mediaType?: HomepageHeroMediaType } | null;
      if (!response.ok) {
        throw new Error(uploadPayload?.error || 'Failed to upload media');
      }

      setMedia((prev) => prev.map((item, currentIndex) => (
        currentIndex === index
          ? {
              ...item,
              media_url: uploadPayload?.url || item.media_url,
              media_object_key: uploadPayload?.key || item.media_object_key,
              media_type: inferMediaType(uploadPayload?.mediaType ?? item.media_type, uploadPayload?.url || item.media_url),
            }
          : item
      )));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload media');
    } finally {
      setUploadingIndex(null);
    }
  }

  function addMedia(type: HomepageHeroMediaType) {
    setMedia((prev) => [
      ...prev,
      {
        media_type: type,
        media_url: '',
        sort_order: prev.length,
        is_active: true,
      },
    ]);
  }

  function updateMedia(index: number, patch: Partial<EditableHomepageMedia>) {
    setMedia((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, ...patch } : item)));
  }

  function removeMedia(index: number) {
    setMedia((prev) => prev.filter((_, currentIndex) => currentIndex !== index).map((item, currentIndex) => ({ ...item, sort_order: currentIndex })));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const normalizedMedia = normalizeMedia(media).map((item, index) => ({
        ...item,
        media_type: inferMediaType(item.media_type, item.media_url),
        sort_order: index,
      }));

      let backgroundColor = settings.background_color.trim();
      if (!isHexColor(backgroundColor)) {
        backgroundColor = await deriveHomepageColor(normalizedMedia);
        setSettings((prev) => ({
          ...prev,
          background_color: backgroundColor,
        }));
      }

      const response = await fetch('/api/admin/homepage-background', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
          background_color: backgroundColor,
          media: normalizedMedia,
        }),
      });

      const payload = await response.json().catch(() => null) as { error?: string; data?: HomepageHeroConfig } | null;
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to save homepage background');
      }

      setConfig(payload?.data || null);
      setMedia(
        (payload?.data?.media || normalizedMedia).map((item, index) => ({
          id: item.id,
          media_type: item.media_type,
          media_url: item.media_url,
          media_object_key: item.media_object_key || undefined,
          sort_order: item.sort_order ?? index,
          is_active: item.is_active,
        })),
      );
      window.localStorage.setItem('starmy:homepage-background-updated', String(Date.now()));
      if (typeof window.BroadcastChannel !== 'undefined') {
        const channel = new window.BroadcastChannel('homepage-background');
        channel.postMessage('homepage-background-updated');
        channel.close();
      }
      setSuccess('Homepage background updated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save homepage background');
    } finally {
      setSaving(false);
    }
  }

  function handlePreviewTrackTransitionEnd() {
    if (previewMedia.length <= 1) return;

    const lastIndex = slideshowPreviewMedia.length - 1;

    if (previewTrackIndex === lastIndex) {
      setPreviewShouldAnimate(false);
      setPreviewTrackIndex(1);
      requestAnimationFrame(() => requestAnimationFrame(() => setPreviewShouldAnimate(true)));
      return;
    }

    if (previewTrackIndex === 0) {
      setPreviewShouldAnimate(false);
      setPreviewTrackIndex(slideshowPreviewMedia.length - 2);
      requestAnimationFrame(() => requestAnimationFrame(() => setPreviewShouldAnimate(true)));
      return;
    }
  }

  function handlePreviewMediaEnded() {
    if (previewMedia.length <= 1) return;
    setPreviewTrackIndex((i) => i + 1);
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    return null;
  }

  return (
    <PageLayout title="Homepage Background" description="Manage the homepage hero background media for the public homepage only.">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="btn btn-ghost btn-sm">
          ← Back to Dashboard
        </Link>
        <Link href="/admin" className="btn btn-ghost btn-sm">
          Admin Panel
        </Link>
      </div>

      <div className="alert alert-info mb-6">
        <span>This manages only the homepage hero area. It will not change the background image used on other pages.</span>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="card-title text-2xl text-primary">Hero Settings</h2>
                  <p className="opacity-70">Mix photos and videos together. Photos use the interval; videos advance when they end.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control">
                  <span className="label-text font-semibold mb-2">Slideshow Interval (ms)</span>
                  <input
                    type="number"
                    min={1000}
                    step={500}
                    className="input input-bordered"
                    value={settings.slideshow_interval_ms}
                    onChange={(e) => setSettings((prev) => ({ ...prev, slideshow_interval_ms: Number(e.target.value) || 3000 }))}
                  />
                </label>

                <label className="form-control">
                  <span className="label-text font-semibold mb-2">Overlay Opacity</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    className="range range-primary"
                    value={settings.overlay_opacity}
                    onChange={(e) => setSettings((prev) => ({ ...prev, overlay_opacity: Number(e.target.value) || 30 }))}
                  />
                  <div className="text-xs opacity-70 mt-2">{settings.overlay_opacity}%</div>
                </label>
              </div>

              <label className="form-control">
                <span className="label-text font-semibold mb-2">Background Fit Mode</span>
                <select
                  className="select select-bordered"
                  value={settings.background_fit}
                  onChange={(e) => setSettings((prev) => ({ ...prev, background_fit: e.target.value as any }))}
                >
                  <option value="fill">Fill (stretches to fill)</option>
                  <option value="fit">Fit (contain with letterbox)</option>
                  <option value="stretch">Stretch (same as fill)</option>
                  <option value="center">Center (contain centered)</option>
                  <option value="span">Span (cover the area)</option>
                  <option value="tile">Tile (repeat pattern)</option>
                </select>
                <div className="text-xs opacity-70 mt-2">Choose how media fills the hero area</div>
              </label>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="card-title text-2xl text-secondary">Media Items</h2>
                  <p className="opacity-70">Add photos and videos in any order. Photos use the interval; videos play until they end.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control">
                  <span className="label-text font-semibold mb-2">Background Color</span>
                  <input
                    type="color"
                    className="input input-bordered h-12 w-full p-2"
                    value={isHexColor(settings.background_color) ? `#${expandHexColor(settings.background_color)}` : '#ffffff'}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, background_color: e.target.value }));
                      setColorMode('manual');
                    }}
                  />
                </label>

                <div className="flex flex-col justify-end gap-2">
                  <div className="text-xs opacity-70 break-all">
                    {colorMode === 'auto' ? 'Auto-picked from slideshow photos.' : 'Manual override enabled.'}
                  </div>
                  <button type="button" className="btn btn-outline self-start" onClick={() => void handleAutoPickColor()} disabled={colorScanning}>
                    {colorScanning ? 'Scanning...' : 'Auto-pick from photos'}
                  </button>
                </div>
              </div>

              {media.length === 0 && (
                <div className="alert alert-warning">
                  <span>No media has been added yet. The homepage will fall back to the default background image.</span>
                </div>
              )}

              <div className="space-y-4">
                {media.map((item, index) => (
                  <div key={`${item.id || 'new'}-${index}`} className="card bg-base-100 border border-base-300">
                    <div className="card-body space-y-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <h3 className="font-semibold text-lg">Media #{index + 1}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="badge badge-outline capitalize">{item.media_type}</div>
                          <button type="button" className="btn btn-xs btn-error btn-outline" onClick={() => removeMedia(index)}>
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[96px_minmax(0,1fr)_auto] gap-4 items-end">
                        <label className="form-control">
                          <span className="label-text font-semibold mb-2">Sort</span>
                          <input
                            type="number"
                            className="input input-bordered w-24"
                            value={item.sort_order}
                            onChange={(e) => updateMedia(index, { sort_order: Number(e.target.value) || index })}
                          />
                        </label>

                        <label className="form-control">
                          <span className="label-text font-semibold mb-2">Media URL</span>
                          <input
                            type="text"
                            className="input input-bordered"
                            placeholder={item.media_type === 'video' ? 'Video URL or /api/media/... path' : 'Image URL or /api/media/... path'}
                            value={item.media_url}
                            onChange={(e) => updateMedia(index, { media_url: e.target.value, media_object_key: undefined })}
                          />
                        </label>

                        <label className="form-control">
                          <span className="label-text font-semibold mb-2">Type / Active</span>
                          <div className="flex flex-wrap items-center gap-3 pt-1">
                            <select
                              className="select select-bordered select-sm min-w-28"
                              value={item.media_type}
                              onChange={(e) => updateMedia(index, { media_type: e.target.value as HomepageHeroMediaType })}
                            >
                              <option value="photo">Photo</option>
                              <option value="video">Video</option>
                            </select>

                            <label className="label cursor-pointer justify-start gap-3 px-0">
                              <input
                                type="checkbox"
                                className="checkbox checkbox-primary"
                                checked={item.is_active}
                                onChange={(e) => updateMedia(index, { is_active: e.target.checked })}
                              />
                              <span className="label-text font-semibold">Active</span>
                            </label>
                          </div>
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          className="file-input file-input-bordered flex-1 min-w-[16rem]"
                          accept={item.media_type === 'video' ? 'video/*' : 'image/*'}
                          disabled={uploadingIndex === index}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              void handleUploadMediaFile(file, index);
                            }
                            e.currentTarget.value = '';
                          }}
                        />
                        {uploadingIndex === index && (
                          <p className="text-xs text-primary">Uploading media...</p>
                        )}
                      </div>

                      {item.media_url && item.media_type === 'photo' && (
                        <img
                          src={item.media_url}
                          alt={`Media ${index + 1}`}
                          className="rounded-lg max-h-56 w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = ASSETS.images.background.starmy;
                          }}
                        />
                      )}

                      {item.media_url && item.media_type === 'video' && (
                        <video
                          src={item.media_url}
                          controls
                          muted
                          playsInline
                          className="rounded-lg max-h-56 w-full object-cover bg-black"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn btn-lg btn-outline" onClick={() => addMedia('photo')}>
                  + Photo
                </button>
                <button type="button" className="btn btn-lg btn-outline" onClick={() => addMedia('video')}>
                  + Video
                </button>

                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Homepage Background'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl text-accent">Preview</h2>
              <p className="opacity-70 text-sm">This preview mirrors the live homepage in desktop and mobile layouts.</p>

              <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">PC browser preview</h3>
                    <span className="badge badge-outline">Desktop</span>
                  </div>
                  <div className="relative aspect-[16/9] rounded-box overflow-hidden border border-base-300" style={{ backgroundColor: previewBackgroundColor }}>
                    {previewMedia.length > 0 ? (
                      <div className="relative w-full h-full overflow-hidden">
                        <div
                          className={`h-full flex ${previewShouldAnimate ? 'transition-transform duration-700 ease-in-out' : ''}`}
                          style={{ width: `${slideshowPreviewMedia.length * 100}%`, transform: `translateX(-${(previewTrackIndex * 100) / slideshowPreviewMedia.length}%)` }}
                          onTransitionEnd={handlePreviewTrackTransitionEnd}
                        >
                          {slideshowPreviewMedia.map((item, index) => (
                            <div key={`desktop-${item.id || item.media_url}-${index}`} className="flex-shrink-0 h-full" style={{ width: `${100 / slideshowPreviewMedia.length}%` }}>
                              {item.media_type === 'video' ? (
                                <video src={item.media_url} autoPlay muted loop={previewMedia.length <= 1} playsInline onEnded={handlePreviewMediaEnded} className={`w-full h-full ${getBackgroundFitClasses(settings.background_fit)}`} />
                              ) : (
                                <img src={item.media_url} alt={`Desktop preview ${index + 1}`} className={`w-full h-full ${getBackgroundFitClasses(settings.background_fit)}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <img src={ASSETS.images.background.starmy} alt="Default homepage background" className="w-full h-full object-contain" />
                    )}
                    <div className="absolute inset-0 bg-base-100 pointer-events-none" style={{ opacity: settings.overlay_opacity / 100 }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Mobile preview</h3>
                    <span className="badge badge-outline">Phone</span>
                  </div>
                  <div className="mx-auto relative aspect-[9/16] max-w-[18rem] rounded-box overflow-hidden border border-base-300" style={{ backgroundColor: previewBackgroundColor }}>
                    {previewMedia.length > 0 ? (
                      <div className="relative w-full h-full overflow-hidden">
                        <div
                          className={`h-full flex ${previewShouldAnimate ? 'transition-transform duration-700 ease-in-out' : ''}`}
                          style={{ width: `${slideshowPreviewMedia.length * 100}%`, transform: `translateX(-${(previewTrackIndex * 100) / slideshowPreviewMedia.length}%)` }}
                        >
                          {slideshowPreviewMedia.map((item, index) => (
                            <div key={`mobile-${item.id || item.media_url}-${index}`} className="flex-shrink-0 h-full" style={{ width: `${100 / slideshowPreviewMedia.length}%` }}>
                              {item.media_type === 'video' ? (
                                <video src={item.media_url} autoPlay muted loop={previewMedia.length <= 1} playsInline onEnded={handlePreviewMediaEnded} className={`w-full h-full ${getBackgroundFitClasses(settings.background_fit)}`} />
                              ) : (
                                <img src={item.media_url} alt={`Mobile preview ${index + 1}`} className={`w-full h-full ${getBackgroundFitClasses(settings.background_fit)}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <img src={ASSETS.images.background.starmy} alt="Default homepage background" className="w-full h-full object-contain" />
                    )}
                    <div className="absolute inset-0 bg-base-100 pointer-events-none" style={{ opacity: settings.overlay_opacity / 100 }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm opacity-70 space-y-1">
                <p>Playback: Mixed media carousel</p>
                <p>Fit: {settings.background_fit}</p>
                <p>Overlay: {settings.overlay_opacity}%</p>
                <p>Interval: {settings.slideshow_interval_ms}ms</p>
                <p>Background: {settings.background_color || 'auto-detected'}</p>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Notes</h2>
              <ul className="list-disc list-inside space-y-2 text-sm opacity-80">
                <li>Use a muted video for a single looping hero background.</li>
                <li>Use slideshow mode for photo rotation every few seconds.</li>
                <li>Uploads are stored in Oracle Object Storage under the homepage-background folder.</li>
                <li>Other pages still use the original shared background image component.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
