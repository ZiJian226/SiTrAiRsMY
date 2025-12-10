import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { artists } from "@/data/mockData";
import CommissionForm from "./CommissionForm";

// Generate static params for all artist IDs
export function generateStaticParams() {
  return artists.map((artist) => ({
    id: artist.id,
  }));
}

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = artists.find((a) => a.id === id);

  if (!artist) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <Container className="py-12">
        <Link href="/artists" className="btn btn-ghost mb-6">
          ← Back to Artists
        </Link>

        {/* Profile Header */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="avatar">
                <div className="w-48 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-4">
                  <img src={artist.avatar} alt={artist.name} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-secondary mb-4">
                  {artist.name}
                </h1>
                <p className="text-lg mb-6">{artist.description}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {artist.specialty.map((spec) => (
                    <span key={spec} className="badge badge-accent badge-lg">
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="text-lg font-semibold mb-4">
                  Price Range: {artist.priceRange}
                </div>
                <div className="mb-6">
                  {artist.commissionsOpen ? (
                    <div className="badge badge-success badge-lg">Open for Commissions</div>
                  ) : (
                    <div className="badge badge-error badge-lg">Commissions Closed</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {artist.socialLinks?.website && (
                    <a
                      href={artist.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Website
                    </a>
                  )}
                  {artist.socialLinks?.twitter && (
                    <a
                      href={artist.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent btn-sm"
                    >
                      Twitter
                    </a>
                  )}
                  {artist.socialLinks?.instagram && (
                    <a
                      href={artist.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent btn-sm"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 gap-4">
                {artist.portfolio.map((image, index) => (
                  <div key={index} className="aspect-[3/4] overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commission Form */}
          <CommissionForm artist={artist} />
        </div>
      </Container>

      <Footer />
    </div>
  );
}
