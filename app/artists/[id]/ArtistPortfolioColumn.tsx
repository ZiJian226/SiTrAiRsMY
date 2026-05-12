"use client";

import { useMemo, useState, Children } from "react";
import LandscapeModal from "@/components/LandscapeModal";
import type { PortraitPicture } from "@/lib/types";

export default function ArtistPortfolioColumn({
  artistName,
  portfolio,
  portfolioArtImages,
}: {
  artistName: string;
  portfolio: string[];
  portfolioArtImages?: PortraitPicture[];
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);

  // Combine uploaded images and portfolio art URLs
  const allArtImages = useMemo(() => {
    const images: Array<{ url: string; type: 'uploaded' | 'url' }> = [];
    
    if (portfolioArtImages && portfolioArtImages.length > 0) {
      portfolioArtImages.forEach(pic => {
        images.push({ url: pic.url, type: 'uploaded' });
      });
    }

    portfolio.forEach((url) => {
      if (/\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(url)) {
        images.push({ url, type: 'url' });
      }
    });

    return images;
  }, [portfolio, portfolioArtImages]);

  // Responsive page size based on screen
  const pageSize = 3; // Will show 3 items per page on desktop
  const totalPages = Math.max(1, Math.ceil(allArtImages.length / pageSize));
  const canGoPrev = pageIndex > 0;
  const canGoNext = pageIndex < totalPages - 1;
  const visibleItems = allArtImages.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);

  const goPrev = () => setPageIndex((current) => Math.max(0, current - 1));
  const goNext = () => setPageIndex((current) => Math.min(totalPages - 1, current + 1));

  return (
    <div className="card bg-base-200 shadow-xl lg:sticky lg:top-24">
      <div className="card-body">
        <h2 className="card-title text-2xl">🖼️ Art Showcase</h2>
        <p className="text-sm opacity-70">Browse artwork collection</p>

        {allArtImages.length > 0 ? (
          <div className="space-y-4">
            {/* Art Grid with Carousel */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-h-[200px]">
                {visibleItems.map((item, index) => (
                  <button
                    key={`${item.url}-${pageIndex}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(item.url)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-base-300 bg-base-300 hover:scale-[1.02] transition-transform group"
                  >
                    <img
                      src={item.url}
                      alt={`${artistName} art piece ${pageIndex * pageSize + index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {item.type === 'uploaded' && (
                      <div className="absolute top-2 right-2 badge badge-primary badge-sm">
                        ✓ Own
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    className="btn btn-circle btn-sm btn-outline"
                    aria-label="Previous art batch"
                  >
                    ❮
                  </button>
                  <div className="text-sm opacity-70 text-center flex-1">
                    {pageIndex + 1} / {totalPages}
                  </div>
                  <button
                    onClick={goNext}
                    disabled={!canGoNext}
                    className="btn btn-circle btn-sm btn-outline"
                    aria-label="Next art batch"
                  >
                    ❯
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="alert alert-info mt-2">
            <span>No art portfolio yet.</span>
          </div>
        )}

        {/* Portfolio Links */}
        {portfolio.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-base-300 pt-4">
            <p className="font-semibold text-sm">Portfolio Links</p>
            <div className="space-y-2">
              {portfolio.map((url, index) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(url);
                return (
                  <a
                    key={`${url}-link-${index}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-xs btn-outline justify-start w-full normal-case truncate"
                    title={url}
                  >
                    {isImage ? '🖼️ Image' : '🔗'} {new URL(url).hostname}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <LandscapeModal
          isOpen={Boolean(selectedImage)}
          onClose={() => setSelectedImage(null)}
          imageUrl={selectedImage}
          imageAlt={`${artistName} artwork`}
          title={`${artistName} Artwork`}
          description="High resolution portfolio preview"
        />
      )}
    </div>
  );
}
