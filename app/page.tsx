"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { vtubers, artists, newsEvents } from "@/data/mockData";
import Image from "next/image";

export default function Home() {
  // Get recent events (most recent first, limit to 2)
  const recentEvents = newsEvents
    .filter(event => event.category === "Events")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2);
  
  // Get featured artwork from all artists' portfolios
  const featuredArtwork = artists.flatMap(artist => 
    artist.portfolio.slice(0, 2).map((portfolioUrl, index) => ({
      id: `${artist.id}-${index}`,
      imageUrl: portfolioUrl,
      artistName: artist.name,
      artistId: artist.id,
      specialty: artist.specialty[0] || 'Artwork'
    }))
  ).slice(0, 6); // Show 6 artworks

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
          <Image
            src="/assets/images/background/starmy-background.png"
            alt="StarMy Background"
            fill
            className="object-cover"
            priority
            quality={100}
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

      {/* Recent Events Section */}
      <div className="bg-base-200 py-16 relative" style={{ zIndex: 2 }}>
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">Recent Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentEvents.map((event) => (
              <div key={event.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <figure>
                  <img src={event.image} alt={event.title} className="w-full h-64 object-cover" />
                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary">{event.category}</span>
                    <span className="text-sm opacity-70">{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="card-title text-primary">{event.title}</h3>
                  <p className="text-sm opacity-70 mb-3">{event.excerpt}</p>
                  <div className="card-actions justify-between items-center">
                    <span className="text-xs opacity-50">By {event.author}</span>
                    <Link href="/events" className="btn btn-primary btn-sm">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/events" className="btn btn-outline btn-primary">
              View All Events
            </Link>
          </div>
        </Container>
      </div>

      {/* Featured Art Section */}
      <div className="bg-base-100 py-16 relative" style={{ zIndex: 2 }}>
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">Featured Art</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtwork.map((artwork) => (
              <Link 
                key={artwork.id} 
                href={`/artists/${artwork.artistId}`}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
              >
                <figure className="aspect-square overflow-hidden">
                  <img 
                    src={artwork.imageUrl} 
                    alt={`${artwork.specialty} by ${artwork.artistName}`}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-secondary">{artwork.artistName}</p>
                      <p className="text-xs opacity-70">{artwork.specialty}</p>
                    </div>
                    <span className="badge badge-accent badge-sm">View Artist</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/gallery" className="btn btn-outline btn-secondary">
              View Gallery
            </Link>
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
}
