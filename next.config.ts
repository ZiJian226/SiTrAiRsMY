import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for GitHub Pages
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },
  basePath: process.env.NODE_ENV === 'production' ? '/SiTrAiRsMY' : '', // GitHub Pages subdirectory
  assetPrefix: process.env.NODE_ENV === 'production' ? '/SiTrAiRsMY' : '',
};

export default nextConfig;
