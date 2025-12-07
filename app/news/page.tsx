"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

// Mock news data - will be replaced with Supabase data
const newsArticles = [
  {
    id: "1",
    title: "Welcome to StarMy - Malaysia's Premier VTuber & Artist Hub",
    excerpt: "We're excited to announce the launch of StarMy, a platform dedicated to connecting Malaysia's VTuber and artist community.",
    content: "Full article content here...",
    date: "2025-12-01",
    category: "Announcement",
    image: "https://placehold.co/800x400/a855f7/ffffff?text=StarMy+Launch",
    author: "StarMy Team",
  },
  {
    id: "2",
    title: "Featured VTuber Spotlight: Luna Sparkle",
    excerpt: "Get to know Luna Sparkle, one of our featured gaming and singing VTubers who's been making waves in the community.",
    content: "Full article content here...",
    date: "2025-12-03",
    category: "Spotlight",
    image: "https://placehold.co/800x400/8b5cf6/ffffff?text=Luna+Sparkle",
    author: "Community Team",
  },
  {
    id: "3",
    title: "Commission Tips: How to Work with Artists",
    excerpt: "A comprehensive guide on how to request commissions, communicate effectively, and get the best results from our talented artists.",
    content: "Full article content here...",
    date: "2025-12-05",
    category: "Guide",
    image: "https://placehold.co/800x400/facc15/000000?text=Commission+Guide",
    author: "Artist Relations",
  },
  {
    id: "4",
    title: "Upcoming Events: December 2025",
    excerpt: "Check out the exciting community events, streams, and collaborations happening this month!",
    content: "Full article content here...",
    date: "2025-12-06",
    category: "Events",
    image: "https://placehold.co/800x400/a855f7/ffffff?text=December+Events",
    author: "Events Team",
  },
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = ["All", "Announcement", "Spotlight", "Guide", "Events"];

  const filteredNews = selectedCategory && selectedCategory !== "All"
    ? newsArticles.filter((article) => article.category === selectedCategory)
    : newsArticles;

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-12 flex-grow">
          <h1 className="text-5xl font-bold text-center mb-4 text-primary">
            Latest News
          </h1>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto opacity-70">
            Stay updated with the latest news, announcements, and stories from the StarMy community.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                className={`btn btn-sm ${selectedCategory === category || (!selectedCategory && category === "All")
                    ? "btn-primary"
                    : "btn-outline"
                  }`}
                onClick={() => setSelectedCategory(category === "All" ? null : category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNews.map((article) => (
              <div key={article.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all">
                <figure>
                  <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />
                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary badge-sm">{article.category}</span>
                    <span className="text-sm opacity-70">{new Date(article.date).toLocaleDateString()}</span>
                  </div>
                  <h2 className="card-title text-2xl">{article.title}</h2>
                  <p className="opacity-70">{article.excerpt}</p>
                  <div className="card-actions justify-between items-center mt-4">
                    <span className="text-sm opacity-70">By {article.author}</span>
                    <Link href={`/news/${article.id}`} className="btn btn-primary btn-sm">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNews.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl opacity-70">No news articles found in this category.</p>
            </div>
          )}
        </Container>

        <Footer />
      </div>
    </div>
  );
}
