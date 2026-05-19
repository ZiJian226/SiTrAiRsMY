"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import LazyRow from "@/components/LazyRow";
import PagedCarousel from "@/components/PagedCarousel";
import ContentHighlightsSection from "@/components/ContentHighlightsSection";
import GalleryMediaShowcase from "@/components/GalleryMediaShowcase";
import LandscapeModal from "@/components/LandscapeModal";
import EdgeStarAnimation from "@/components/EdgeStarAnimation";
import HomeHeroBackground from "@/components/HomeHeroBackground";
import { fallbackArtists, fallbackEvents, fallbackGalleryItems } from "@/lib/content/fallback";
import { useCachedApiResource } from "@/lib/hooks";
import type { ArtistProfile, EventArticle, GalleryEntry } from "@/lib/content/types";
import type { VTuber } from "@/lib/types";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    imageUrl: string;
    title?: string;
    description?: string;
    mediaItems?: GalleryEntry['media']
  } | null>(null);

  const { data: artists } = useCachedApiResource<ArtistProfile[]>({
    cacheKey: 'starmy:content:artists:v2',
    url: '/api/content/artists',
    fallbackData: fallbackArtists,
    maxAgeMs: 60_000,
    staleWhileRevalidateMs: 3_600_000,
  });

  const { data: talents } = useCachedApiResource<VTuber[]>({
    cacheKey: 'starmy:content:talents:v2',
    url: '/api/content/talents',
    fallbackData: [],
    maxAgeMs: 60_000,
    staleWhileRevalidateMs: 3_600_000,
  });

  const { data: staffs } = useCachedApiResource<VTuber[]>({
    cacheKey: 'starmy:content:staffs:v2',
    url: '/api/content/staffs',
    fallbackData: [],
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
    .filter(event => event.featured);

  const featuredGallery = galleryItems
    .filter(item => item.featured);

  const featuredTalents = talents
    .filter(talent => talent.featured);

  const featuredStaffs = staffs
    .filter(staff => staff.featured);

  const featuredArtists = (artists as any[])
    .filter((artist: any) => artist.featured) as ArtistProfile[];

  const talentShowcase = featuredTalents.length > 0 ? featuredTalents : talents;
  const staffShowcase = featuredStaffs.length > 0 ? featuredStaffs : staffs;
  const artistShowcase = featuredArtists.length > 0 ? featuredArtists : artists;

  const openModal = (imageUrl: string, title?: string, description?: string, mediaItems?: GalleryEntry['media']) => {
    setModalData({ imageUrl, title, description, mediaItems });
    setModalOpen(true);
  };

  useEffect(() => {
    const heroSection = document.getElementById("hero-section");
    const spacerDiv = document.getElementById("hero-spacer");
    if (!heroSection || !spacerDiv) return;

    let animationFrame: number | null = null;

    const updateHeroEffect = () => {
      animationFrame = null;

      const heroHeight = heroSection.offsetHeight || window.innerHeight;
      
      // Set spacer height to match hero height dynamically
      spacerDiv.style.height = `${heroHeight}px`;

      const blurStart = Math.max(0, heroHeight - window.innerHeight * 0.55);
      const blurRange = Math.max(window.innerHeight * 0.85, 520);
      const progress = Math.min(Math.max((window.scrollY - blurStart) / blurRange, 0), 1);

      heroSection.style.filter = `blur(${progress * 18}px)`;
      heroSection.style.opacity = `${Math.max(1 - progress * 0.55, 0.38)}`;

      // Set CSS custom property for navbar background fade-in
      document.documentElement.style.setProperty('--hero-blur-progress', progress.toString());
    };

    const scheduleUpdate = () => {
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(updateHeroEffect);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    document.addEventListener('visibilitychange', scheduleUpdate);

    scheduleUpdate();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate as EventListener);
      window.removeEventListener('resize', scheduleUpdate as EventListener);
      document.removeEventListener('visibilitychange', scheduleUpdate as EventListener);
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      {/* Hero Section - Fixed background */}
      <div
        id="hero-section"
        className="hero h-[100svh] fixed top-0 left-0 right-0 transition-all duration-0 ease-in-out overflow-hidden"
        style={{ zIndex: 0 }}
      >
        <HomeHeroBackground />
      </div>
      
      {/* Spacer for fixed hero - height is set dynamically to match hero height */}
      <div id="hero-spacer" className="w-full"></div>
      
      {/* Welcome Section - Overlays the hero as you scroll */}
      <div className="bg-base-100 py-16 relative" style={{ zIndex: 2, marginTop: '-10vh' }}>
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold pb-2 mb-4 bg-gradient-to-r from-secondary to-primary-content bg-clip-text text-transparent">
              Welcome to StarMyriad
            </h1>
            <p className="text-xl mb-8">
              Your gateway to the vibrant world of Malaysian VTubers and talented artists.
              Discover amazing content creators, explore stunning artwork, and commission your dream projects.
            </p>
          </div>
        </Container>
      </div>

      {/* Content Highlights Section */}
      <ContentHighlightsSection />

      {/* Featured News Section */}
      <div className="bg-base-200 py-16 relative" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <EdgeStarAnimation count={20} />
        </div>
        <Container className="relative z-10">
          <h2 className="text-4xl font-bold text-center mb-12">Featured News</h2>
          <LazyRow>
            {featuredNews.map((event) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-[360px] card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
                onClick={() => openModal(event.image, event.title, event.excerpt)}
              >
                <figure className="relative overflow-hidden aspect-video">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-colors">
                    <div className="text-white opacity-0 hover:opacity-100 transition-opacity text-center">
                      <p className="text-sm font-semibold">Click to view</p>
                    </div>
                  </div>
                </figure>
                <div className="card-body">
                  <div className="badge badge-secondary w-fit">{event.category}</div>
                  <h3 className="card-title text-primary">{event.title}</h3>
                  <p className="text-sm opacity-70">{event.excerpt}</p>
                </div>
              </div>
            ))}
          </LazyRow>
        </Container>
      </div>

      {/* Featured Gallery Section */}
      <div className="bg-base-100 py-16 relative" style={{ zIndex: 2 }}>
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <EdgeStarAnimation count={20} />
        </div>
        <Container className="relative z-10">
          <h2 className="text-4xl font-bold text-center mb-12">Featured Gallery</h2>
          {featuredGallery.length === 0 && (
            <p className="text-center opacity-70 mb-8">No featured gallery items have been pinned yet.</p>
          )}
          <PagedCarousel pageSizeDesktop={5} pageSizeMobile={3}>
            {featuredGallery.map((item) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-[320px] card bg-base-200 shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all group"
                onClick={() => openModal(item.image, item.title, item.description, item.media)}
              >
                <figure className="relative aspect-square overflow-hidden">
                  {item.media && item.media.length > 0 ? (
                    <GalleryMediaShowcase media={item.media} title={item.title} height="h-80" isPreview={true} previewImage={item.image} />
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      <p className="text-sm font-semibold">Click to view</p>
                    </div>
                  </div>
                </figure>
                <div className="card-body p-4">
                  <h3 className="card-title text-lg">{item.title}</h3>
                  <p className="text-sm opacity-70">{item.description}</p>
                </div>
              </div>
            ))}
          </PagedCarousel>
        </Container>
      </div>

      {/* Our Talents Section */}
      {talentShowcase.length > 0 && (
        <div className="bg-base-200 py-16 relative" style={{ zIndex: 2 }}>
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <EdgeStarAnimation count={22} />
          </div>
          <Container className="relative z-10">
            <h2 className="text-4xl font-bold text-center mb-12">Our Talents</h2>
            <PagedCarousel pageSizeDesktop={5} pageSizeMobile={3}>
              {talentShowcase.map((talent) => (
                <Link
                  key={talent.id}
                  href={`/talents/${talent.id}`}
                  className="card bg-base-100 shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                >
                  <figure className="relative w-full h-full">
                    <img
                      src={talent.profilePictureUrl || talent.avatar || talent.portraitPictureUrl }
                      alt={talent.name}
                      className="w-full h-full object-contain bg-base-300 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="w-full p-4">
                        <h3 className="text-xl font-bold text-white mb-2">{talent.name}</h3>
                        <div className="flex flex-wrap gap-2">
                          {talent.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="badge badge-primary badge-sm">
                              {tag}
                            </span>
                          ))}
                          {talent.tags.length > 2 && (
                            <span className="badge badge-outline badge-sm">+{talent.tags.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </figure>
                </Link>
              ))}
            </PagedCarousel>
          </Container>
        </div>
      )}

      {/* Our Artists Section */}
      {artistShowcase.length > 0 && (
        <div className="bg-base-100 py-16 relative" style={{ zIndex: 2 }}>
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <EdgeStarAnimation count={22} />
          </div>
          <Container className="relative z-10">
            <h2 className="text-4xl font-bold text-center mb-12">Our Artists</h2>
            <PagedCarousel pageSizeDesktop={5} pageSizeMobile={3}>
              {artistShowcase.map((artist) => (
                <Link
                  key={artist.id}
                  href={`/artists/${artist.id}`}
                  className="card bg-base-200 shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                >
                  <figure className="relative w-full h-56 overflow-hidden bg-base-300">
                    <img
                      src={
                        artist.avatar ||
                        artist.portfolioArtImages?.[0]?.url ||
                        artist.portfolioArt?.[0] ||
                        artist.portfolio?.[0]
                      }
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </figure>

                  <div className="card-body p-4">
                    <h3 className="card-title text-lg">{artist.name}</h3>
                    <p className="text-sm opacity-80 flex-grow">{artist.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {artist.specialty.slice(0, 2).map((spec) => (
                        <span key={spec} className="badge badge-secondary badge-sm">
                          {spec}
                        </span>
                      ))}
                      {artist.specialty.length > 2 && (
                        <span className="badge badge-outline badge-sm">+{artist.specialty.length - 2}</span>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex gap-2 pt-2">
                      {artist.commissionsOpen && (
                        <span className="badge badge-success badge-lg">Open for Commissions</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </PagedCarousel>
          </Container>
        </div>
      )}

      {/* Our Staffs Section */}
      {staffShowcase.length > 0 && (
        <div className="bg-base-200 py-16 relative" style={{ zIndex: 2 }}>
          <div className="absolute inset-0 overflow-hidden opacity-25">
            <EdgeStarAnimation count={18} />
          </div>
          <Container className="relative z-10">
            <h2 className="text-4xl font-bold text-center mb-12">Our Staffs</h2>
            <PagedCarousel pageSizeDesktop={5} pageSizeMobile={3}>
              {staffShowcase.map((staff) => (
                <Link
                  key={staff.id}
                  href={`/staffs/${staff.id}`}
                  className="card bg-base-100 shadow-lg overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                >
                  <figure className="relative w-full h-56 overflow-hidden bg-base-300">
                    <img
                      src={staff.profilePictureUrl || staff.avatar || staff.portraitPictureUrl }
                      alt={staff.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </figure>
                
                  <div className="card-body p-4">
                    <h3 className="card-title text-lg">{staff.name}</h3>
                    <p className="text-sm opacity-80 flex-grow">{staff.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {staff.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="badge badge-primary badge-sm">
                          {tag}
                        </span>
                      ))}
                      {staff.tags.length > 2 && (
                        <span className="badge badge-outline badge-sm">+{staff.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </PagedCarousel>
          </Container>
        </div>
      )}

      {/* Landscape Modal */}
      {modalData && (
        <LandscapeModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setModalData(null);
          }}
          imageUrl={modalData.imageUrl}
          title={modalData.title}
          description={modalData.description}
          mediaItems={modalData.mediaItems}
        />
      )}

      <div className="relative z-[2]">
        <Footer />
      </div>
    </div>
  );
}
