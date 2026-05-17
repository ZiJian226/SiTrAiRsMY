'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import type { HomepageHeroConfig, HomepageHeroMediaType, HomepageHeroMode } from '@/lib/types';
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

export default function HomepageBackgroundPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [config, setConfig] = useState<HomepageHeroConfig | null>(null);
  const [settings, setSettings] = useState({
    mode: 'slideshow' as HomepageHeroMode,
    slideshow_interval_ms: 3000,
    overlay_opacity: 30,
  });
  const [media, setMedia] = useState<EditableHomepageMedia[]>([]);
  const previewMedia = useMemo(
    () => media.filter((item) => item.is_active && item.media_url.trim().length > 0).sort((left, right) => left.sort_order - right.sort_order),
    [media],
  );
  const [previewIndex, setPreviewIndex] = useState(0);

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
          mode: data.settings?.mode ?? 'slideshow',
          slideshow_interval_ms: data.settings?.slideshow_interval_ms ?? 3000,
          overlay_opacity: data.settings?.overlay_opacity ?? 30,
        });
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
    setPreviewIndex(0);
  }, [settings.mode, previewMedia.length]);

  useEffect(() => {
    if (settings.mode !== 'slideshow' || previewMedia.length <= 1) {
      return undefined;
    }

    const intervalMs = Math.max(1000, settings.slideshow_interval_ms || 3000);
    const timer = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % previewMedia.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [settings.mode, settings.slideshow_interval_ms, previewMedia.length]);

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

      const response = await fetch('/api/admin/homepage-background', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settings,
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
                  <p className="opacity-70">Choose between a looping video or a rotating slideshow.</p>
                </div>
                <div className="badge badge-outline badge-lg capitalize">{settings.mode}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="form-control">
                  <span className="label-text font-semibold mb-2">Display Mode</span>
                  <select
                    className="select select-bordered"
                    value={settings.mode}
                    onChange={(e) => setSettings((prev) => ({ ...prev, mode: e.target.value as HomepageHeroMode }))}
                  >
                    <option value="slideshow">Slideshow</option>
                    <option value="video">Video</option>
                  </select>
                </label>

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
            </div>
          </div>

          <div className="card bg-base-200 shadow-xl">
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="card-title text-2xl text-secondary">Media Items</h2>
                  <p className="opacity-70">Add photos for slideshows or one muted looping video.</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addMedia('photo')}>
                    + Add Photo
                  </button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={() => addMedia('video')}>
                    + Add Video
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="form-control">
                          <span className="label-text font-semibold mb-2">Sort Order</span>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={item.sort_order}
                            onChange={(e) => updateMedia(index, { sort_order: Number(e.target.value) || index })}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <label className="form-control">
                          <span className="label-text font-semibold mb-2">Media Type</span>
                          <select
                            className="select select-bordered"
                            value={item.media_type}
                            onChange={(e) => updateMedia(index, { media_type: e.target.value as HomepageHeroMediaType })}
                          >
                            <option value="photo">Photo</option>
                            <option value="video">Video</option>
                          </select>
                        </label>

                        <label className="form-control md:col-span-2">
                          <span className="label-text font-semibold mb-2">Media URL</span>
                          <input
                            type="text"
                            className="input input-bordered"
                            placeholder={item.media_type === 'video' ? 'Video URL or /api/media/... path' : 'Image URL or /api/media/... path'}
                            value={item.media_url}
                            onChange={(e) => updateMedia(index, { media_url: e.target.value, media_object_key: undefined })}
                          />
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                          <input
                            type="file"
                            className="file-input file-input-bordered w-full"
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
                            <p className="text-xs text-primary mt-2">Uploading media...</p>
                          )}
                        </div>

                        <label className="label cursor-pointer justify-start gap-3">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary"
                            checked={item.is_active}
                            onChange={(e) => updateMedia(index, { is_active: e.target.checked })}
                          />
                          <span className="label-text font-semibold">Active</span>
                        </label>
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
              <p className="opacity-70 text-sm">This is a quick preview of the hero area behavior.</p>
              <div className="relative mt-4 aspect-[16/10] rounded-box overflow-hidden border border-base-300 bg-base-300">
                {previewMedia.length > 0 ? (
                  <div className="relative w-full h-full">
                    {previewMedia.map((item, index) => {
                      const isVisible = index === previewIndex;
                      return (
                        <div
                          key={`${item.id || item.media_url}-${index}`}
                          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
                        >
                          {item.media_type === 'video' || settings.mode === 'video' ? (
                            <video
                              src={item.media_url}
                              autoPlay
                              muted
                              loop
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src={item.media_url}
                              alt={`Homepage preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <img
                    src={ASSETS.images.background.starmy}
                    alt="Default homepage background"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-base-100/30"></div>
              </div>
              <div className="mt-4 text-sm opacity-70 space-y-1">
                <p>Mode: {settings.mode}</p>
                <p>Overlay: {settings.overlay_opacity}%</p>
                <p>Interval: {settings.slideshow_interval_ms}ms</p>
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
