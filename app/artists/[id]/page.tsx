import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import CommissionForm from "./CommissionForm";
import ArtistPortfolioColumn from "./ArtistPortfolioColumn";
import { getArtistById } from "@/lib/content/repository";

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtistById(id);

  if (!artist) {
    notFound();
  }

  const xUrl =
    (artist.socialLinks as { x?: string; twitter?: string } | undefined)?.x ||
    artist.socialLinks?.twitter;

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <Container className="py-12">
        <Link href="/artists" className="btn btn-ghost mb-6">
          ← Back to Artists
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <ArtistPortfolioColumn 
              artistName={artist.name} 
              portfolio={artist.portfolio}
              portfolioArtImages={artist.portfolioArtImages}
            />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                  <div className="avatar">
                    <div className="w-48 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-4">
                      <img src={artist.avatar} alt={artist.name} />
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-secondary mb-4">{artist.name}</h1>
                    <p className="text-lg mb-6">{artist.description}</p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                      {artist.specialty.map((spec: string) => (
                        <span key={spec} className="badge badge-accent badge-lg">
                          {spec}
                        </span>
                      ))}
                    </div>

                    <div className="text-lg font-semibold mb-4">Price Range: {artist.priceRange}</div>

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
                      {xUrl && (
                        <a
                          href={xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-accent btn-sm"
                        >
                          X
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

            <CommissionForm artist={artist} />
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
