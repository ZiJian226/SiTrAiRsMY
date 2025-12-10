"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

// Mock gallery data - will be replaced with Supabase data
const galleryItems = [
  {
    id: "1",
    title: "StarMy Community Meetup 2025",
    description: "Our first offline community gathering featuring talents and fans!",
    image: "https://placehold.co/800x600/a855f7/ffffff?text=Community+Meetup",
    category: "Offline Event",
    date: "2025-11-15",
  },
  {
    id: "2",
    title: "Collaboration Stream with Guest VTubers",
    description: "Epic collab stream with special guest appearances.",
    image: "https://placehold.co/800x600/8b5cf6/ffffff?text=Collab+Stream",
    category: "Collab Event",
    date: "2025-11-20",
  },
  {
    id: "3",
    title: "StarMy Anniversary Celebration",
    description: "Celebrating one year of amazing content and community!",
    image: "https://placehold.co/800x600/facc15/000000?text=Anniversary",
    category: "Offline Event",
    date: "2025-12-01",
  },
  {
    id: "4",
    title: "Charity Stream Marathon",
    description: "24-hour charity stream raising funds for a good cause.",
    image: "https://placehold.co/800x600/a855f7/ffffff?text=Charity+Stream",
    category: "Collab Event",
    date: "2025-12-08",
  },
  {
    id: "5",
    title: "Fan Art Exhibition",
    description: "Showcasing incredible fan art from our community.",
    image: "https://placehold.co/800x600/8b5cf6/ffffff?text=Fan+Art",
    category: "Offline Event",
    date: "2025-12-10",
  },
  {
    id: "6",
    title: "Gaming Tournament",
    description: "Competitive gaming tournament with our talents.",
    image: "https://placehold.co/800x600/facc15/000000?text=Gaming+Tournament",
    category: "Collab Event",
    date: "2025-12-12",
  },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = ["All", "Collab Event", "Offline Event"];

  const filteredGallery = selectedCategory && selectedCategory !== "All"
    ? galleryItems.filter((item) => item.category === selectedCategory)
    : galleryItems;

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-12 flex-grow">
          <h1 className="text-5xl font-bold text-center mb-4 text-primary">
            Gallery
          </h1>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto opacity-70">
            Explore our collection of memorable moments from collab events, offline gatherings, and community celebrations.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`btn btn-sm ${
                  selectedCategory === category || (!selectedCategory && category === "All")
                    ? "btn-primary"
                    : "btn-outline"
                }`}
                onClick={() => setSelectedCategory(category === "All" ? null : category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2"
              >
                <figure className="h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary badge-sm">{item.category}</span>
                    <span className="text-xs opacity-60">{item.date}</span>
                  </div>
                  <h2 className="card-title text-primary text-lg">{item.title}</h2>
                  <p className="text-sm opacity-70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredGallery.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl opacity-70">No gallery items found in this category.</p>
            </div>
          )}
        </Container>

        <Footer />
      </div>
    </div>
  );
}
