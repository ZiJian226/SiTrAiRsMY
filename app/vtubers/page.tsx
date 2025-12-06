"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import { vtubers } from "@/data/mockData";

export default function VTubersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(vtubers.flatMap((v) => v.tags)));

  const filteredVTubers = vtubers.filter((vtuber) => {
    const matchesSearch =
      vtuber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vtuber.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || vtuber.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <Container className="py-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-primary">
          Discover VTubers
        </h1>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
          Explore our community of talented VTubers. Find your next favorite streamer!
        </p>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search VTubers..."
              className="input input-bordered input-primary w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${!selectedTag ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedTag(null)}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                className={`btn btn-sm ${
                  selectedTag === tag ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* VTubers Grid */}
        {filteredVTubers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl opacity-70">No VTubers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVTubers.map((vtuber) => (
              <div
                key={vtuber.id}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <figure className="px-10 pt-10">
                  <div className="avatar">
                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={vtuber.avatar} alt={vtuber.name} />
                    </div>
                  </div>
                </figure>
                <div className="card-body items-center text-center">
                  <h2 className="card-title text-primary">{vtuber.name}</h2>
                  <p className="text-sm opacity-70">{vtuber.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {vtuber.tags.map((tag) => (
                      <span key={tag} className="badge badge-secondary badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="card-actions mt-4">
                    <Link href={`/vtubers/${vtuber.id}`} className="btn btn-primary btn-sm">
                      View Profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
