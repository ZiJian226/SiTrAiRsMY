import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { getTalentById } from "@/lib/content/repository";

export default async function TalentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vtuber = await getTalentById(id);

  if (!vtuber) {
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

  const extractTikTokVideoId = (url: string): string | null => {
    const match = url.match(/\/video\/(\d+)/);
    return match?.[1] || null;
  };

  const toYouTubeEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
    }

    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }

    return url;
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

  const tiktokVideoId = vtuber.tiktokUrl ? await resolveTikTokVideoId(vtuber.tiktokUrl) : null;
  const twitchChannel = vtuber.twitchUrl ? extractTwitchChannel(vtuber.twitchUrl) : null;

  const headerStore = await headers();
  const forwardedHost = headerStore.get('x-forwarded-host');
  const hostHeader = headerStore.get('host');
  const runtimeHost = (forwardedHost || hostHeader || 'localhost').split(',')[0].trim().split(':')[0];
  const twitchParents = Array.from(new Set([runtimeHost, 'localhost'])).filter(Boolean);
  const twitchParentQuery = twitchParents.map(parent => `parent=${encodeURIComponent(parent)}`).join('&');

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
    const colors: Record<string, { bg: string; border: string; text: string; icon: string; btn: string }> = {
      youtube: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: '🎥', btn: 'btn-error' },
      twitch: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '🎮', btn: 'btn-secondary' },
      tiktok: { bg: 'bg-gray-900', border: 'border-gray-700', text: 'text-white', icon: '🎵', btn: 'btn-ghost' },
    };
    return colors[platform.toLowerCase()] || { bg: 'bg-base-300', border: 'border-base-400', text: 'text-base-content', icon: '🔗', btn: 'btn-outline' };
  };

  const SocialProfileCard = ({ url, platform, title }: { url: string; platform: string; title: string }) => {
    const username = extractUsernameFromUrl(url, platform);
    const branding = getPlatformBrandColor(platform);

    return (
      <div className={`card ${branding.bg} shadow-md border-2 ${branding.border}`}>
        <div className="card-body items-center text-center py-6">
          <div className="text-5xl mb-3">{branding.icon}</div>
          <h3 className={`card-title text-xl ${branding.text}`}>{title}</h3>
          {username && <p className="text-sm opacity-80">{username}</p>}
          <div className="card-actions mt-4">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-sm gap-2 ${branding.btn}`}
            >
              Visit Profile →
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
        <Link href="/talents" className="btn btn-ghost mb-6">
          ← Back to Talents
        </Link>

        {/* Profile Header */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="avatar">
                <div className="w-48 rounded-full ring ring-primary ring-offset-base-100 ring-offset-4">
                  <img src={vtuber.avatar} alt={vtuber.name} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-primary mb-4">
                  {vtuber.name}
                </h1>
                <p className="text-lg mb-6">{vtuber.description}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                  {vtuber.tags.map((tag) => (
                    <span key={tag} className="badge badge-secondary badge-lg">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {vtuber.youtubeUrl && (
                    <a
                      href={vtuber.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      YouTube
                    </a>
                  )}
                  {vtuber.twitchUrl && (
                    <a
                      href={vtuber.twitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      Twitch
                    </a>
                  )}
                  {vtuber.tiktokUrl && (
                    <a
                      href={vtuber.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent"
                    >
                      TikTok
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">📖 Introduction / Lore</h2>
            {vtuber.lore ? (
              <p className="text-lg leading-relaxed whitespace-pre-line">{vtuber.lore}</p>
            ) : (
              <p className="text-base opacity-70 italic">
                Lore coming soon! Stay tuned for {vtuber.name}'s backstory...
              </p>
            )}
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">ℹ️ Character Info</h2>
            {vtuber.characterInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vtuber.characterInfo.dateOfBirth && (
                  <div>
                    <span className="font-semibold text-primary">Date of Birth:</span>
                    <p className="text-lg">{vtuber.characterInfo.dateOfBirth}</p>
                  </div>
                )}
                {vtuber.characterInfo.debutDate && (
                  <div>
                    <span className="font-semibold text-primary">Debut Date:</span>
                    <p className="text-lg">{vtuber.characterInfo.debutDate}</p>
                  </div>
                )}
                {vtuber.characterInfo.height && (
                  <div>
                    <span className="font-semibold text-primary">Height:</span>
                    <p className="text-lg">{vtuber.characterInfo.height}</p>
                  </div>
                )}
                {vtuber.characterInfo.species && (
                  <div>
                    <span className="font-semibold text-primary">Species:</span>
                    <p className="text-lg">{vtuber.characterInfo.species}</p>
                  </div>
                )}
                {vtuber.characterInfo.likes && vtuber.characterInfo.likes.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-semibold text-primary">Likes:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vtuber.characterInfo.likes.map((like, idx) => (
                        <span key={idx} className="badge badge-success badge-lg">
                          ❤️ {like}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {vtuber.characterInfo.dislikes && vtuber.characterInfo.dislikes.length > 0 && (
                  <div className="md:col-span-2">
                    <span className="font-semibold text-primary">Dislikes:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {vtuber.characterInfo.dislikes.map((dislike, idx) => (
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

        {/* Streaming Schedule */}
        {vtuber.schedule && vtuber.schedule.length > 0 && (
          <div className="card bg-base-200 shadow-xl mb-8">
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
                    {vtuber.schedule.map((slot) => (
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
              <div className="alert alert-info mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Schedule may change. Follow on social media for updates!</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Embeds & Portfolio */}
        <div className="space-y-8">
          {/* Portfolio Gallery */}
          {vtuber.portfolio && vtuber.portfolio.length > 0 && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">🎨 Portfolio</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vtuber.portfolio.map((link, idx) => (
                    <div key={idx} className="relative overflow-hidden rounded-lg group aspect-video bg-base-300">
                      {/* Try to embed or display portfolio links */}
                      {link.includes('youtube.com') || link.includes('youtu.be') ? (
                        <iframe
                          className="w-full h-full"
                          src={link.replace('youtube.com/watch?v=', 'youtube.com/embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          allowFullScreen
                          title={`Portfolio ${idx + 1}`}
                        />
                      ) : link.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={link}
                          alt={`Portfolio ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'https://placehold.co/400x300/333/FFF/png?text=Portfolio+' + (idx + 1)
                          }}
                        />
                      ) : (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full h-full flex items-center justify-center hover:bg-base-200 transition-colors"
                        >
                          <div className="text-center">
                            <p className="text-sm mb-2">Portfolio Link</p>
                            <p className="text-xs opacity-70 truncate max-w-xs">{link}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TikTok Embed Example */}
          {vtuber.tiktokUrl && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">🎵 TikTok</h2>
                {tiktokVideoId ? (
                  <div className="aspect-video bg-base-300 rounded-lg overflow-hidden mb-4">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.tiktok.com/embed/v2/${tiktokVideoId}`}
                      title={`${vtuber.name} TikTok`}
                      loading="lazy"
                    />
                  </div>
                ) : null}
                {!tiktokVideoId && (
                  <SocialProfileCard url={vtuber.tiktokUrl} platform="tiktok" title="TikTok Profile" />
                )}
              </div>
            </div>
          )}

          {/* Twitch Stream Embed Example */}
          {vtuber.twitchUrl && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">🎮 Twitch</h2>
                {twitchChannel ? (
                  <div className="aspect-video bg-base-300 rounded-lg overflow-hidden mb-4">
                    <iframe
                      className="w-full h-full"
                      src={`https://player.twitch.tv/?channel=${encodeURIComponent(twitchChannel)}&${twitchParentQuery}`}
                      title={`${vtuber.name} Twitch`}
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                ) : null}
                {!twitchChannel && (
                  <SocialProfileCard url={vtuber.twitchUrl} platform="twitch" title="Twitch Channel" />
                )}
              </div>
            </div>
          )}

          {/* YouTube Embed Example */}
          {vtuber.youtubeUrl && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">🎥 YouTube Channel</h2>
                {extractYouTubeVideoId(vtuber.youtubeUrl) ? (
                  <div className="aspect-video bg-base-300 rounded-lg overflow-hidden mb-4">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(vtuber.youtubeUrl)}`}
                      title={`${vtuber.name} YouTube`}
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : null}
                {!extractYouTubeVideoId(vtuber.youtubeUrl) && (
                  <SocialProfileCard url={vtuber.youtubeUrl} platform="youtube" title="YouTube Channel" />
                )}
              </div>
            </div>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  );
}
