import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enable static exports for GitHub Pages
  images: {
    unoptimized: true, // GitHub Pages doesn't support Next.js Image Optimization
  },
  // No basePath needed - GitHub Pages serves from repository name automatically
  // Repository: ZiJian226/SiTrAiRsMY → URL: https://zijian226.github.io/SiTrAiRsMY/
};

export default nextConfig;
