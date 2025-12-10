"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";
import { newsEvents } from "@/data/mockData";

export default function EventsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = ["All", "Announcement", "Spotlight", "Guide", "Events", "News"];

  const filteredNews = selectedCategory && selectedCategory !== "All"
    ? newsEvents.filter((article) => article.category === selectedCategory)
    : newsEvents;

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-12 flex-grow">
          <h1 className="text-5xl font-bold text-center mb-4 text-primary">
            Events & News
          </h1>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto opacity-70">
            Stay updated with the latest events, announcements, and stories from the StarMy community.
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
