import { notFound } from "next/navigation";
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
                <h2 className="card-title text-2xl mb-4">🎵 TikTok</h2>
                <div className="aspect-video bg-base-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg mb-4">TikTok Profile</p>
                    <a
                      href={vtuber.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent"
                    >
                      Visit TikTok
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Twitch Stream Embed Example */}
          {vtuber.twitchUrl && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">🎮 Twitch</h2>
                <div className="aspect-video bg-base-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg mb-4">Live Stream</p>
                    <a
                      href={vtuber.twitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                    >
                      Watch on Twitch
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* YouTube Embed Example */}
          {vtuber.youtubeUrl && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">🎥 YouTube Channel</h2>
                <div className="aspect-video bg-base-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg mb-4">YouTube Channel</p>
                    <a
                      href={vtuber.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                    >
                      Visit YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  );
}
