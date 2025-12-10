import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for GitHub Pages
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },
  // Only use basePath in production (GitHub Pages)
  basePath: process.env.NODE_ENV === 'production' ? '/SiTrAiRsMY' : '',
  // Note: assetPrefix is intentionally NOT set to avoid double paths for public assets
};

export default nextConfig;
