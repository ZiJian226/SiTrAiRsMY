"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { ASSETS } from "@/lib/assetPath";
import { fallbackArtists, fallbackEvents, fallbackGalleryItems } from "@/lib/content/fallback";
import { useCachedApiResource } from "@/lib/hooks";
import type { ArtistProfile, EventArticle, GalleryEntry } from "@/lib/content/types";

export default function Home() {
  const { data: artists } = useCachedApiResource<ArtistProfile[]>({
    cacheKey: 'starmy:content:artists:v2',
    url: '/api/content/artists',
    fallbackData: fallbackArtists,
    maxAgeMs: 60_000,
    staleWhileRevalidateMs: 3_600_000,
  });

  const { data: newsEvents } = useCachedApiResource<EventArticle[]>({
    cacheKey: 'starmy:content:events:v3',
    url: '/api/content/events',
    fallbackData: fallbackEvents,
    maxAgeMs: 60_000,
    staleWhileRevalidateMs: 3_600_000,
  });

  const { data: galleryItems } = useCachedApiResource<GalleryEntry[]>({
    cacheKey: 'starmy:content:gallery:v3',
    url: '/api/content/gallery',
    fallbackData: fallbackGalleryItems,
    maxAgeMs: 60_000,
    staleWhileRevalidateMs: 3_600_000,
  });

  const featuredNews = newsEvents
    .filter(event => event.featured)
    .slice(0, 2);

  const featuredGallery = galleryItems
    .filter(item => item.featured)
    .slice(0, 3);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("hero-section");
      if (!heroSection) return;

      const scrollPosition = window.scrollY;
      const heroHeight = heroSection.offsetHeight;

      // Calculate blur amount based on scroll (0 to 20px blur)
      const blurAmount = Math.min((scrollPosition / heroHeight) * 20, 20);

      // Calculate opacity (fade from 1 to 0.3)
      const opacity = Math.max(1 - (scrollPosition / heroHeight) * 0.7, 0.3);

      // Apply filter and opacity
      heroSection.style.filter = `blur(${blurAmount}px)`;
      heroSection.style.opacity = opacity.toString();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      {/* Hero Section with Scroll Blur Effect */}
      <div
        id="hero-section"
        className="hero min-h-[600px] relative sticky top-0 transition-all duration-0 ease-in-out overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={ASSETS.images.background.starmy}
            alt="StarMy Background"
            className="w-full h-full object-cover"
          />
        </div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-base-100/30 z-10"></div>
      </div>

      {/* Welcome Section - Moved below hero image */}
      <div className="bg-base-100 py-16 relative" style={{ zIndex: 2 }}>
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold pb-2 mb-4 bg-gradient-to-r from-secondary to-primary-content bg-clip-text text-transparent">
              Welcome to StarMy
            </h1>
            <p className="text-xl mb-8">
              Your gateway to the vibrant world of VTubers and talented artists.
              Discover amazing content creators, explore stunning artwork, and commission your dream projects.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/talents" className="btn btn-primary btn-lg">
                Explore Talents
              </Link>
              <Link href="/artists" className="btn btn-secondary btn-lg">
                Find Artists
              </Link>
              <Link href="/events" className="btn btn-accent btn-lg">
                View Events
              </Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Featured News Section */}
      <div className="bg-base-200 py-16 relative" style={{ zIndex: 2 }}>
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">Featured News</h2>
          {featuredNews.length === 0 && (
            <p className="text-center opacity-70 mb-8">No featured news has been pinned yet.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredNews.map((event) => (
              <div key={event.id} className="card bg-base-100 shadow-xl">
                <figure>
                  <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
                </figure>
                <div className="card-body">
                  <div className="badge badge-secondary w-fit">{event.category}</div>
                  <h3 className="card-title text-primary">{event.title}</h3>
                  <p className="text-sm opacity-70">{event.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Featured Gallery Section */}
      <div className="bg-base-100 py-16 relative" style={{ zIndex: 2 }}>
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">Featured Gallery</h2>
          {featuredGallery.length === 0 && (
            <p className="text-center opacity-70 mb-8">No featured gallery items have been pinned yet.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGallery.map((item) => (
              <div key={item.id} className="card bg-base-200 shadow-xl overflow-hidden">
                <figure className="aspect-square">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </figure>
                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{item.title}</h3>
                  <p className="text-sm opacity-70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
