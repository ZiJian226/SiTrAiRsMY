import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PortraitCarousel from "./PortraitCarousel";
import { VideoEmbedWithAudio } from "@/components/VideoEmbedWithAudio";
import VtuberLoreSection from "@/components/VtuberLoreSection";
import { getStaffById } from "@/lib/content/repository";

export default async function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vtuber = await getStaffById(id);

  if (!vtuber || vtuber.role !== 'staff') {
    notFound();
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return "🎥";
      case "twitch":
        return "🎮";
      case "tiktok":
        return "🎵";
      default:
        return "📺";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "youtube":
        return "badge-error";
      case "twitch":
        return "badge-secondary";
      case "tiktok":
        return "badge-accent";
      default:
        return "badge-primary";
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watchMatch?.[1]) return watchMatch[1];

    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch?.[1]) return shortMatch[1];

    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (embedMatch?.[1]) return embedMatch[1];

    return null;
  };

  const extractTwitchChannel = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      if (!/twitch\.tv$/i.test(parsed.hostname)) {
        return null;
      }

      const firstSegment = parsed.pathname.split('/').filter(Boolean)[0];
      if (!firstSegment) {
        return null;
      }

      const reserved = new Set([
        'directory',
        'downloads',
        'jobs',
        'p',
        'products',
        'settings',
        'subscriptions',
        'turbo',
        'videos',
      ]);

      if (reserved.has(firstSegment.toLowerCase())) {
        return null;
      }

      return firstSegment;
    } catch {
      const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
      return match?.[1] || null;
    }
  };

  const extractTwitchVideoId = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!/twitch\.tv$/i.test(parsed.hostname)) return null;
    const match = parsed.pathname.match(/\/videos\/(\d+)/);
    if (match) return match[1];
    return null;
  } catch {
    const match = url.match(/twitch\.tv\/videos\/(\d+)/i);
    return match?.[1] || null;
  }
};

  const extractTikTokVideoId = (url: string): string | null => {
    const match = url.match(/\/video\/(\d+)/);
    return match?.[1] || null;
  };

  const extractTikTokVideoIdFromHtml = (html: string): string | null => {
    const match = html.match(/data-video-id="(\d+)"/);
    return match?.[1] || null;
  };

  const resolveTikTokVideoId = async (url: string): Promise<string | null> => {
    const direct = extractTikTokVideoId(url);
    if (direct) {
      return direct;
    }

    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        return null;
      }

      const data = (await response.json()) as { html?: string };
      if (!data.html) {
        return null;
      }

      return extractTikTokVideoIdFromHtml(data.html);
    } catch {
      return null;
    }
  };

  const toStringArray = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

  const tiktokVideoId = vtuber.tiktokUrl ? await resolveTikTokVideoId(vtuber.tiktokUrl) : null;
  const twitchChannel = vtuber.twitchUrl ? extractTwitchChannel(vtuber.twitchUrl) : null;
  const youtubeVideoId = vtuber.youtubeUrl ? extractYouTubeVideoId(vtuber.youtubeUrl) : null;
  const featuredVideoUrl = (vtuber as { featuredVideoUrl?: string | null }).featuredVideoUrl || null;
  const featuredVideoYoutubeId = featuredVideoUrl ? extractYouTubeVideoId(featuredVideoUrl) : null;
  const featuredVideoTwitchVideo = featuredVideoUrl ? extractTwitchVideoId(featuredVideoUrl) : null;
  const featuredVideoTikTokId = featuredVideoUrl ? await resolveTikTokVideoId(featuredVideoUrl) : null;
  const featuredVideoPlatform = featuredVideoTwitchVideo
    ? 'twitch'
    : featuredVideoTikTokId
      ? 'tiktok'
      : 'youtube';
  const portraitPictures = vtuber.portraitPictures && vtuber.portraitPictures.length > 0 
    ? vtuber.portraitPictures 
    : vtuber.portraitPictureUrl 
      ? [{ url: vtuber.portraitPictureUrl, object_key: undefined }]
      : [];
  const portraitOrProfileImage = portraitPictures[0]?.url || vtuber.profilePictureUrl || vtuber.avatar;
  const profilePictureImage = vtuber.profilePictureUrl || vtuber.avatar;
  const socialButtons = [
    vtuber.profileCardUrl ? {
      label: 'Profile Card',
      href: vtuber.profileCardUrl,
      className: 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M10.6 13.4a1 1 0 0 1 0-1.4l2.8-2.8a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0Zm-3.5 3.5a4 4 0 0 1 0-5.7l2-2a1 1 0 1 1 1.4 1.4l-2 2a2 2 0 1 0 2.8 2.8l2-2a1 1 0 1 1 1.4 1.4l-2 2a4 4 0 0 1-5.7 0Z" />
        </svg>
      ),
    } : null,
    vtuber.supportUrl ? {
      label: 'Support',
      href: vtuber.supportUrl,
      className: 'border-rose-500 bg-rose-500 text-white hover:bg-rose-600 hover:border-rose-600',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9C.7 8.3 2.8 4.5 7 4.2c2-.1 3.6 1 5 2.8 1.4-1.8 3-2.9 5-2.8 4.2.3 6.3 4.1 4.6 7.8C19.5 16.4 12 21 12 21Z" />
        </svg>
      ),
    } : null,
    vtuber.instagramUrl ? {
      label: 'Instagram',
      href: vtuber.instagramUrl,
      className: 'border-0 text-white bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] hover:brightness-110',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5Zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5Zm5-4.2a1.3 1.3 0 1 1-1.3 1.3 1.3 1.3 0 0 1 1.3-1.3Z" />
        </svg>
      ),
    } : null,
    vtuber.xUrl ? {
      label: 'X',
      href: vtuber.xUrl,
      className: 'border-black bg-black text-white hover:bg-neutral-800 hover:border-neutral-800',
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="currentColor" d="M4 4h4.2l4.3 5.7L17.4 4H20l-6.2 8 6.4 8H16l-4.4-5.8L7.4 20H4l6.5-8L4 4Zm4.4 1.5H6.6L17.4 18.5h1.8L8.4 5.5Z" />
        </svg>
      ),
    } : null,
  ].filter(Boolean) as Array<{ label: string; href: string; className: string; icon: React.ReactNode }>;
  const talentTags = toStringArray(vtuber.tags);
  const talentPortfolio = toStringArray(vtuber.portfolio);
  const talentCharacterInfo = vtuber.characterInfo && typeof vtuber.characterInfo === 'object' ? vtuber.characterInfo : undefined;
  const characterLikes = toStringArray(talentCharacterInfo?.likes);
  const characterDislikes = toStringArray(talentCharacterInfo?.dislikes);

  const headerStore = await headers();
  const forwardedHost = headerStore.get('x-forwarded-host');
  const hostHeader = headerStore.get('host');
  const runtimeHost = (forwardedHost || hostHeader || 'localhost').split(',')[0].trim().split(':')[0];
  const twitchParents = Array.from(new Set([runtimeHost, 'localhost'])).filter(Boolean);
  const twitchParentQuery = twitchParents.map((p) => `parent=${encodeURIComponent(p)}`).join('&');

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return 'external link';
    }
  };

  const extractUsernameFromUrl = (url: string, platform: string): string | null => {
    try {
      const parsed = new URL(url);
      const pathSegments = parsed.pathname.split('/').filter(Boolean);

      if (platform === 'twitch' && pathSegments[0]) {
        return pathSegments[0];
      }

      if ((platform === 'youtube' || platform === 'tiktok' || platform === 'instagram') && pathSegments[0]) {
        return pathSegments[0].startsWith('@') ? pathSegments[0] : `@${pathSegments[0]}`;
      }

      return null;
    } catch {
      return null;
    }
  };

  const getPlatformBrandColor = (platform: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; btn: string }> = {
      youtube: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', btn: 'btn-error' },
      twitch: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', btn: 'btn-secondary' },
      tiktok: { bg: 'bg-neutral-900', border: 'border-neutral-700', text: 'text-white', btn: 'btn-ghost' },
    };
    return colors[platform.toLowerCase()] || { bg: 'bg-base-300', border: 'border-base-400', text: 'text-base-content', btn: 'btn-outline' };
  };

  const PlatformIcon = ({ platform, className = 'w-6 h-6' }: { platform: string; className?: string }) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return (
          <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#FF0000" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z" />
            <path fill="#fff" d="m9.75 15.5 6.5-3.5-6.5-3.5v7Z" />
          </svg>
        );
      case 'twitch':
        return (
          <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#9146FF" d="M2 1h20v14l-5 5h-4l-3 3H7v-3H2V1Zm18 12V3H4v15h4v2l2-2h5l5-5Z" />
            <path fill="#9146FF" d="M9 7h2v6H9zm5 0h2v6h-2z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#25F4EE" d="M14.4 3v11.6a3.4 3.4 0 1 1-3.4-3.4c.2 0 .5 0 .7.1V8a6.6 6.6 0 1 0 6 6.6V9.7a7.3 7.3 0 0 0 4.3 1.4V7.8A4 4 0 0 1 18.8 4H14.4Z" />
            <path fill="#FE2C55" d="M13.6 2v11.6a3.4 3.4 0 1 1-3.4-3.4c.3 0 .5 0 .8.1V7a6.6 6.6 0 1 0 6 6.6V8.7a7.2 7.2 0 0 0 4.3 1.4V6.8a4 4 0 0 1-3.2-3.7h-4.5Z" />
            <path fill="#fff" d="M15.3 3.5v10.2a4.9 4.9 0 1 1-4.8-4.9h.2v2.3h-.2a2.6 2.6 0 1 0 2.6 2.6V3.5h2.2Zm2.6 1.3a6.1 6.1 0 0 0 2.4 2.4v1.6a7.8 7.8 0 0 1-2.4-1.1V4.8Z" />
          </svg>
        );
      default:
        return (
          <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M10.6 13.4a1 1 0 0 1 0-1.4l2.8-2.8a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0Zm-3.5 3.5a4 4 0 0 1 0-5.7l2-2a1 1 0 1 1 1.4 1.4l-2 2a2 2 0 1 0 2.8 2.8l2-2a1 1 0 1 1 1.4 1.4l-2 2a4 4 0 0 1-5.7 0Z" />
          </svg>
        );
    }
  };

  const SocialEmbedFallback = ({ url, platform, title }: { url: string; platform: string; title: string }) => {
    const username = extractUsernameFromUrl(url, platform);
    const branding = getPlatformBrandColor(platform);

    return (
      <div className={`h-full flex items-center justify-center ${branding.bg} border ${branding.border} p-5`}>
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <PlatformIcon platform={platform} className="w-12 h-12" />
          </div>
          <h3 className={`font-semibold text-xl ${branding.text}`}>{title}</h3>
          {username && <p className="text-sm opacity-80">{username}</p>}
          <div className="mt-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-sm gap-2 ${branding.btn}`}
            >
              Open profile
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <Container className="py-12">
        <Link href="/staffs" className="btn btn-ghost mb-6">
          ← Back to Staffs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Left Column: Portrait Carousel */}
          <div className="lg:col-span-1 order-last lg:order-none">
            <PortraitCarousel 
              name={vtuber.name} 
              portraitPictures={portraitPictures}
              tags={talentTags}
            />
          </div>

          {/* Right Column: All Existing Sections */}
          <div className="lg:col-span-2 space-y-8 order-first lg:order-none">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {/* Profile Picture Column (1 width) - Square Crop */}
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <img src={profilePictureImage} alt={`${vtuber.name} profile picture`} className="w-full h-full object-cover" />
                  </div>
                  {/* Name and Bio Column (2 width) */}
                  <div className="md:col-span-2 flex flex-col justify-center">
                    <h1 className="text-5xl font-bold text-primary mb-3">{vtuber.name}</h1>
                    <p className="text-lg opacity-90">{vtuber.description}</p>
                    {socialButtons.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {socialButtons.map((button) => (
                          <a key={button.label} href={button.href} target="_blank" rel="noopener noreferrer" className={`btn btn-sm gap-2 ${button.className}`}>
                            {button.icon}
                            <span>{button.label}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">ℹ️ Character Info</h2>
                {talentCharacterInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talentCharacterInfo.dateOfBirth && (
                      <div>
                        <span className="font-semibold text-primary">Date of Birth:</span>
                        <p className="text-lg">{talentCharacterInfo.dateOfBirth}</p>
                      </div>
                    )}
                    {talentCharacterInfo.debutDate && (
                      <div>
                        <span className="font-semibold text-primary">Debut Date:</span>
                        <p className="text-lg">{talentCharacterInfo.debutDate}</p>
                      </div>
                    )}
                    {talentCharacterInfo.height && (
                      <div>
                        <span className="font-semibold text-primary">Height:</span>
                        <p className="text-lg">{talentCharacterInfo.height}</p>
                      </div>
                    )}
                    {talentCharacterInfo.species && (
                      <div>
                        <span className="font-semibold text-primary">Species:</span>
                        <p className="text-lg">{talentCharacterInfo.species}</p>
                      </div>
                    )}
                    {characterLikes.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-semibold text-primary">Likes:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {characterLikes.map((like, idx) => (
                            <span key={idx} className="badge badge-success badge-lg">
                              ❤️ {like}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {characterDislikes.length > 0 && (
                      <div className="md:col-span-2">
                        <span className="font-semibold text-primary">Dislikes:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {characterDislikes.map((dislike, idx) => (
                            <span key={idx} className="badge badge-error badge-lg">
                              💔 {dislike}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-base opacity-70 italic">
                    Character information coming soon!
                  </p>
                )}
              </div>
            </div>

            {(vtuber.vtuberLore || talentCharacterInfo?.vtuberLore) && (
              <VtuberLoreSection text={String(vtuber.vtuberLore || talentCharacterInfo?.vtuberLore || '')} />
            )}

            {featuredVideoUrl && (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">🎬 Featured Video</h2>
                  {featuredVideoTwitchVideo ? (
                     <VideoEmbedWithAudio
                        src={`https://player.twitch.tv/?video=${featuredVideoTwitchVideo}&${twitchParentQuery}`}
                        title={`${vtuber.name} Twitch VOD`}
                        aspectRatio="aspect-video xl:aspect-[21/9]"
                      />
                  ) : featuredVideoTikTokId ? (
                     <VideoEmbedWithAudio
                       src={`https://www.tiktok.com/player/v1/${featuredVideoTikTokId}`}
                       title={`${vtuber.name} featured TikTok video`}
                     />
                  ) : featuredVideoYoutubeId ? (
                     <VideoEmbedWithAudio
                       src={`https://www.youtube.com/embed/${featuredVideoYoutubeId}`}
                       title={`${vtuber.name} featured YouTube video`}
                     />
                  ) : (
                    <SocialEmbedFallback url={featuredVideoUrl} platform={featuredVideoPlatform} title="Featured Video" />
                  )}
                </div>
              </div>
            )}

            {vtuber.schedule && vtuber.schedule.length > 0 && (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">📅 Streaming Schedule (MYT)</h2>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Time</th>
                          <th>Stream Title</th>
                          <th>Platform</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vtuber.schedule.map((slot: { id: string; day: string; time: string; title: string; platform: 'youtube' | 'twitch' | 'tiktok' }) => (
                          <tr key={slot.id} className="hover">
                            <td className="font-semibold">{slot.day}</td>
                            <td>{slot.time}</td>
                            <td>{slot.title}</td>
                            <td>
                              <span className={`badge ${getPlatformColor(slot.platform)}`}>
                                {getPlatformIcon(slot.platform)} {slot.platform}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {talentPortfolio.length > 0 && (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">🎨 Portfolio</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talentPortfolio.map((link, idx) => {
                      const youtubeMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
                      const youtubeId = youtubeMatch ? youtubeMatch[1] : null;
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(link);

                      return (
                        <div key={idx} className="relative overflow-hidden rounded-lg group aspect-video bg-base-300">
                          {youtubeId ? (
                             <VideoEmbedWithAudio
                               src={`https://www.youtube.com/embed/${youtubeId}`}
                               title={`Portfolio ${idx + 1}`}
                             />
                          ) : isImage ? (
                            <img
                              src={link}
                              alt={`Portfolio ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full h-full flex items-center justify-center hover:bg-base-100 transition-colors no-underline"
                            >
                              <div className="text-center px-4">
                                <p className="text-lg font-semibold mb-2">📌 Portfolio</p>
                                <p className="text-sm opacity-80 break-all">{new URL(link).hostname}</p>
                                <p className="text-xs opacity-60 mt-2">Click to visit</p>
                              </div>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {(vtuber.tiktokUrl || vtuber.twitchUrl || vtuber.youtubeUrl) && (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">📺 Social Platforms</h2>
                  <div className="space-y-5">
                    {vtuber.twitchUrl && (
                      <div className="card bg-base-200 shadow-xl h-full">
                        <div className="card-body p-4">
                          <h3 className="card-title text-xl mb-3 flex items-center gap-2">
                            <PlatformIcon platform="twitch" className="w-6 h-6" />
                            Twitch
                          </h3>
                          {twitchChannel ? (
                             <VideoEmbedWithAudio
                               src={`https://player.twitch.tv/?channel=${encodeURIComponent(twitchChannel)}&${twitchParentQuery}`}
                               title={`${vtuber.name} Twitch`}
                               aspectRatio="aspect-video xl:aspect-[21/9]"
                             />
                          ) : (
                            <SocialEmbedFallback url={vtuber.twitchUrl} platform="twitch" title="Twitch Channel" />
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                      {vtuber.tiktokUrl && (
                        <div className="card bg-base-200 shadow-xl h-full">
                          <div className="card-body p-4">
                            <h3 className="card-title text-xl mb-3 flex items-center gap-2">
                              <PlatformIcon platform="tiktok" className="w-6 h-6" />
                              TikTok
                            </h3>
                            {tiktokVideoId ? (
                               <VideoEmbedWithAudio
                                 src={`https://www.tiktok.com/player/v1/${tiktokVideoId}`}
                                 title={`${vtuber.name} TikTok`}
                               />
                            ) : (
                              <SocialEmbedFallback url={vtuber.tiktokUrl} platform="tiktok" title="TikTok Profile" />
                            )}
                          </div>
                        </div>
                      )}

                      {vtuber.youtubeUrl && (
                        <div className="card bg-base-200 shadow-xl h-full">
                          <div className="card-body p-4">
                            <h3 className="card-title text-xl mb-3 flex items-center gap-2">
                              <PlatformIcon platform="youtube" className="w-6 h-6" />
                              YouTube
                            </h3>
                            {youtubeVideoId ? (
                               <VideoEmbedWithAudio
                                 src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                                 title={`${vtuber.name} YouTube`}
                               />
                            ) : (
                              <SocialEmbedFallback url={vtuber.youtubeUrl} platform="youtube" title="YouTube Channel" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
