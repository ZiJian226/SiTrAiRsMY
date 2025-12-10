"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

// Mock merchandise data - will be replaced with Supabase data
const merchandise = [
  {
    id: "1",
    name: "Luna Sparkle Acrylic Stand",
    talent: "Luna Sparkle",
    price: 45.00,
    currency: "MYR",
    image: "https://placehold.co/400x400/a855f7/ffffff?text=Acrylic+Stand",
    category: "Accessories",
    inStock: true,
    description: "Official acrylic stand featuring Luna Sparkle's signature look.",
  },
  {
    id: "2",
    name: "StarMy Official T-Shirt",
    talent: "StarMy",
    price: 89.00,
    currency: "MYR",
    image: "https://placehold.co/400x400/8b5cf6/ffffff?text=T-Shirt",
    category: "Apparel",
    inStock: true,
    description: "High-quality cotton t-shirt with StarMy logo.",
  },
  {
    id: "3",
    name: "Mia River Voice Pack Vol.1",
    talent: "Mia River",
    price: 25.00,
    currency: "MYR",
    image: "https://placehold.co/400x400/facc15/000000?text=Voice+Pack",
    category: "Digital",
    inStock: true,
    description: "Digital voice pack with 50+ exclusive voice lines.",
  },
  {
    id: "4",
    name: "Stella Nova Keychain",
    talent: "Stella Nova",
    price: 35.00,
    currency: "MYR",
    image: "https://placehold.co/400x400/a855f7/ffffff?text=Keychain",
    category: "Accessories",
    inStock: false,
    description: "Cute keychain featuring Stella Nova chibi design.",
  },
  {
    id: "5",
    name: "Hana Yuki Poster Set",
    talent: "Hana Yuki",
    price: 55.00,
    currency: "MYR",
    image: "https://placehold.co/400x400/8b5cf6/ffffff?text=Poster+Set",
    category: "Prints",
    inStock: true,
    description: "Set of 3 high-quality A3 posters.",
  },
  {
    id: "6",
    name: "StarMy Sticker Pack",
    talent: "StarMy",
    price: 20.00,
    currency: "MYR",
    image: "https://placehold.co/400x400/facc15/000000?text=Stickers",
    category: "Accessories",
    inStock: true,
    description: "Pack of 10 waterproof vinyl stickers featuring all talents.",
  },
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null);
  const categories = ["All", "Apparel", "Accessories", "Digital", "Prints"];
  const talents = ["All", ...Array.from(new Set(merchandise.map(m => m.talent)))];

  const filteredMerchandise = merchandise.filter((item) => {
    const matchesCategory = !selectedCategory || selectedCategory === "All" || item.category === selectedCategory;
    const matchesTalent = !selectedTalent || selectedTalent === "All" || item.talent === selectedTalent;
    return matchesCategory && matchesTalent;
  });

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-12 flex-grow">
          <h1 className="text-5xl font-bold text-center mb-4 text-primary">
            StarMy Store
          </h1>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto opacity-70">
            Support your favorite talents! Browse official merchandise from StarMy VTubers and artists.
          </p>

          {/* Filters */}
          <div className="space-y-4 mb-12">
            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-2 opacity-70">Category</h3>
              <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Talent Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-2 opacity-70">Talent</h3>
              <div className="flex flex-wrap gap-2">
                {talents.map((talent) => (
                  <button
                    key={talent}
                    className={`btn btn-sm ${
                      selectedTalent === talent || (!selectedTalent && talent === "All")
                        ? "btn-secondary"
                        : "btn-outline"
                    }`}
                    onClick={() => setSelectedTalent(talent === "All" ? null : talent)}
                  >
                    {talent}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Merchandise Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMerchandise.map((item) => (
              <div
                key={item.id}
                className={`card bg-base-200 shadow-xl hover:shadow-2xl transition-all ${
                  item.inStock ? "hover:-translate-y-2" : "opacity-75"
                }`}
              >
                <figure className="h-64 overflow-hidden bg-base-300">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary badge-sm">{item.category}</span>
                    {!item.inStock && (
                      <span className="badge badge-error badge-sm">Out of Stock</span>
                    )}
                  </div>
                  <h2 className="card-title text-primary text-lg">{item.name}</h2>
                  <p className="text-sm opacity-60 mb-1">by {item.talent}</p>
                  <p className="text-sm opacity-70 mb-4">{item.description}</p>
                  <div className="card-actions justify-between items-center">
                    <div className="text-2xl font-bold text-primary">
                      {item.currency} {item.price.toFixed(2)}
                    </div>
                    <button
                      className={`btn btn-sm ${
                        item.inStock ? "btn-primary" : "btn-disabled"
                      }`}
                      disabled={!item.inStock}
                    >
                      {item.inStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredMerchandise.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl opacity-70">No merchandise found matching your criteria.</p>
            </div>
          )}

          {/* Info Banner */}
          <div className="alert alert-info mt-12">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="font-bold">Note for Talents</h3>
              <div className="text-sm">
                Talents can manage their own merchandise through the admin portal. 
                Sign in to add, edit, or remove your products from the store.
              </div>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  );
}
