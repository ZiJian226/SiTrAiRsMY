"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";
import { useCachedApiResource } from "@/lib/hooks";
import type { Talent } from "@/lib/content/types";

export default function StaffsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const { data: talents, loading } = useCachedApiResource<Talent[]>({
    cacheKey: 'starmy:content:staffs:v1',
    url: '/api/content/staffs',
    fallbackData: [],
    maxAgeMs: 60_000,
    staleWhileRevalidateMs: 3_600_000,
  });

  const allTags = Array.from(new Set(talents.flatMap((v) => v.tags)));

  const filteredTalents = talents.filter((talent) => {
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
          Our Staffs
        </h1>
        <p className="text-center text-lg mb-12 max-w-2xl mx-auto">
          Meet the people who help StarMy run behind the scenes.
        </p>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="form-control">
            <input
              type="text"
              placeholder="Search Staffs..."
              className="input input-bordered input-primary w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Talents Grid */}
        {loading && (
          <div className="flex justify-center py-4">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        )}

        {filteredTalents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl opacity-70">No staffs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalents.map((talent) => (
              <div
                key={talent.id}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <figure className="aspect-video overflow-hidden">
                  <img src={talent.avatar} alt={talent.name} className="w-full h-full object-cover" />
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
                    <Link href={`/staffs/${talent.id}`} className="btn btn-primary btn-sm">
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
