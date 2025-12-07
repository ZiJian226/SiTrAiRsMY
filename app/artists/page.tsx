"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";
import { artists } from "@/data/mockData";

export default function ArtistsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(false);

  const allSpecialties = Array.from(new Set(artists.flatMap((a) => a.specialty)));

  const filteredArtists = artists.filter((artist) => {
    const matchesSearch =
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artist.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || artist.specialty.includes(selectedSpecialty);
    const matchesOpen = !openOnly || artist.commissionsOpen;
    return matchesSearch && matchesSpecialty && matchesOpen;
  });

  return (
    <div className="min-h-screen bg-base-100 relative">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-12">
          <h1 className="text-5xl font-bold text-center mb-8 text-secondary">
            Find Artists
          </h1>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
            Connect with talented artists and bring your creative visions to life!
          </p>

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            <div className="form-control">
              <input
                type="text"
                placeholder="Search artists..."
                className="input input-bordered input-secondary w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <button
                className={`btn btn-sm ${!selectedSpecialty ? "btn-secondary" : "btn-outline"}`}
                onClick={() => setSelectedSpecialty(null)}
              >
                All Specialties
              </button>
              {allSpecialties.map((specialty) => (
                <button
                  key={specialty}
                  className={`btn btn-sm ${selectedSpecialty === specialty ? "btn-secondary" : "btn-outline"
                    }`}
                  onClick={() => setSelectedSpecialty(specialty)}
                >
                  {specialty}
                </button>
              ))}
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  className="checkbox checkbox-secondary"
                  checked={openOnly}
                  onChange={(e) => setOpenOnly(e.target.checked)}
                />
                <span className="label-text">Show only artists open for commissions</span>
              </label>
            </div>
          </div>

          {/* Artists Grid */}
          {filteredArtists.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl opacity-70">No artists found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <figure className="px-10 pt-10">
                    <div className="avatar">
                      <div className="w-32 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                        <img src={artist.avatar} alt={artist.name} />
                      </div>
                    </div>
                  </figure>
                  <div className="card-body items-center text-center">
                    <h2 className="card-title text-secondary">{artist.name}</h2>
                    <p className="text-sm opacity-70">{artist.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {artist.specialty.map((spec) => (
                        <span key={spec} className="badge badge-accent badge-sm">
                          {spec}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm font-semibold mt-2">{artist.priceRange}</div>
                    {artist.commissionsOpen && (
                      <div className="badge badge-success">Open for Commissions</div>
                    )}
                    <div className="card-actions mt-4">
                      <Link href={`/artists/${artist.id}`} className="btn btn-secondary btn-sm">
                        View Portfolio
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>

        <Footer />
      </div>
    </div>
  );
}
