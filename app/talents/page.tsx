"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";
import { vtubers } from "@/data/mockData";

export default function TalentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(vtubers.flatMap((v) => v.tags)));

  const filteredTalents = vtubers.filter((talent) => {
    const matchesSearch =
      talent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      talent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || talent.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-base-100 relative">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

      <Container className="py-12">
        <h1 className="text-5xl font-bold text-center mb-8 text-primary">
          Our Talents
        </h1>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
          Explore our talented VTubers. Find your next favorite streamer!
        </p>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search Talents..."
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

        {/* Talents Grid */}
        {filteredTalents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl opacity-70">No talents found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((talent) => (
              <div
                key={talent.id}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <figure className="px-10 pt-10">
                  <div className="avatar">
                    <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img src={talent.avatar} alt={talent.name} />
                    </div>
                  </div>
                </figure>
                <div className="card-body items-center text-center">
                  <h2 className="card-title text-primary">{talent.name}</h2>
                  <p className="text-sm opacity-70">{talent.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {talent.tags.map((tag) => (
                      <span key={tag} className="badge badge-secondary badge-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="card-actions mt-4">
                    <Link href={`/talents/${talent.id}`} className="btn btn-primary btn-sm">
                      View Profile
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
