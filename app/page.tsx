"use client";

import { useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { vtubers, artists } from "@/data/mockData";
import Image from "next/image";

export default function Home() {
  const featuredVTubers = vtubers.filter((v) => v.featured);
  const featuredArtists = artists.slice(0, 2);

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

        <div className="hero-content text-center relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold pb-2 mb-4 bg-gradient-to-r from-secondary to-primary-content bg-clip-text text-transparent">
              Welcome to StarMy
            </h1>
            <p className="text-xl mb-8">
              Your gateway to the vibrant world of VTubers and talented artists.
              Discover amazing content creators, explore stunning artwork, and commission your dream projects.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/vtubers" className="btn btn-primary btn-lg">
                Explore VTubers
              </Link>
              <Link href="/artists" className="btn btn-secondary btn-lg">
                Find Artists
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured VTubers Section - This will cover the hero on scroll */}
      <div className="bg-base-100 py-16 relative " style={{ zIndex: 2 }}>
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">Featured VTubers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredVTubers.map((vtuber) => (
              <div key={vtuber.id} className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="avatar">
                      <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={vtuber.avatar} alt={vtuber.name} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title text-primary">{vtuber.name}</h3>
                      <p className="text-sm opacity-70 mb-3">{vtuber.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {vtuber.tags.map((tag) => (
                          <span key={tag} className="badge badge-secondary badge-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/vtubers/${vtuber.id}`} className="btn btn-primary btn-sm">
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/vtubers" className="btn btn-outline btn-primary">
              View All VTubers
            </Link>
          </div>
        </Container>
      </div>

      {/* Featured Artists Section */}
      <div className="bg-base-200 py-16 relative" style={{ zIndex: 2 }}>
        <Container>
          <h2 className="text-4xl font-bold text-center mb-12">Featured Artists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArtists.map((artist) => (
              <div key={artist.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body">
                  <div className="flex items-start gap-4">
                    <div className="avatar">
                      <div className="w-24 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2">
                        <img src={artist.avatar} alt={artist.name} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="card-title text-secondary">{artist.name}</h3>
                      <p className="text-sm opacity-70 mb-3">{artist.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {artist.specialty.map((spec) => (
                          <span key={spec} className="badge badge-accent badge-sm">
                            {spec}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/artists/${artist.id}`} className="btn btn-secondary btn-sm">
                          View Portfolio
                        </Link>
                        {artist.commissionsOpen && (
                          <span className="badge badge-success">Open for Commissions</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/artists" className="btn btn-outline btn-secondary">
              View All Artists
            </Link>
          </div>
        </Container>
      </div>

      <Footer />
    </div>
  );
}
