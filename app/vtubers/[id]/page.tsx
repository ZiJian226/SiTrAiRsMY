import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import { vtubers } from "@/data/mockData";

export default async function VTuberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vtuber = vtubers.find((v) => v.id === id);

  if (!vtuber) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <Container className="py-12">
        <Link href="/vtubers" className="btn btn-ghost mb-6">
          ← Back to VTubers
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

        {/* Content Embeds */}
        <div className="space-y-8">
          {/* TikTok Embed Example */}
          {vtuber.tiktokUrl && (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">TikTok Content</h2>
                <div className="aspect-video bg-base-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg mb-4">TikTok Embed Preview</p>
                    <p className="text-sm opacity-70 max-w-md">
                      In a production environment, TikTok videos would be embedded here using their embed API.
                      Click the button below to visit their TikTok profile.
                    </p>
                    <a
                      href={vtuber.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary mt-4"
                    >
                      Visit TikTok Profile
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
                <h2 className="card-title text-2xl mb-4">Live Stream</h2>
                <div className="aspect-video bg-base-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg mb-4">Twitch Stream Embed Preview</p>
                    <p className="text-sm opacity-70 max-w-md">
                      In a production environment, Twitch streams would be embedded here using their embed API.
                      Click the button below to watch on Twitch.
                    </p>
                    <a
                      href={vtuber.twitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary mt-4"
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
                <h2 className="card-title text-2xl mb-4">YouTube Channel</h2>
                <div className="aspect-video bg-base-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg mb-4">YouTube Embed Preview</p>
                    <p className="text-sm opacity-70 max-w-md">
                      In a production environment, YouTube videos would be embedded here using their embed API.
                      Click the button below to visit their YouTube channel.
                    </p>
                    <a
                      href={vtuber.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary mt-4"
                    >
                      Visit YouTube Channel
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>

      <footer className="footer footer-center p-10 bg-base-300 text-base-content mt-16">
        <aside>
          <p className="font-bold text-xl text-primary">⭐ StarMy</p>
          <p className="mt-2">Connecting VTubers, Artists, and Fans</p>
        </aside>
      </footer>
    </div>
  );
}
