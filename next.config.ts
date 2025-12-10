import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for GitHub Pages
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },
  basePath: process.env.NODE_ENV === 'production' ? '/StarMy' : '', // Replace 'StarMy' with your repo name
  assetPrefix: process.env.NODE_ENV === 'production' ? '/StarMy' : '',
};

export default nextConfig;
