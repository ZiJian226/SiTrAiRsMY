import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  images: {
    unoptimized: isStaticExport,
  },
  basePath: isStaticExport ? '/SiTrAiRsMY' : '',
  trailingSlash: isStaticExport,
  // Note: assetPrefix is intentionally NOT set to avoid double paths for public assets
};

export default nextConfig;
