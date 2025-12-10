/**
 * Asset Path Utility
 * 
 * For GitHub Pages project sites, we need to add the base path to public assets.
 * 
 * IMPORTANT: 
 * - next.config.ts basePath handles ROUTES (pages navigation)
 * - This utility handles PUBLIC ASSETS (images, icons, etc. in /public folder)
 * 
 * Development: http://localhost:3000/
 * Production (GitHub Pages): https://zijian226.github.io/SiTrAiRsMY/
 */

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/SiTrAiRsMY' : '';

/**
 * Generate an asset path with the base path (only in production)
 * @param path - The path to the asset (should start with /)
 * @returns The full asset path with base path in production, or just the path in development
 * 
 * @example
 * assetPath('/assets/images/icons/starmy-logo.svg')
 * // Development: '/assets/images/icons/starmy-logo.svg'
 * // Production: '/SiTrAiRsMY/assets/images/icons/starmy-logo.svg'
 */
export function assetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}

/**
 * Common asset paths for easy access
 */
export const ASSETS = {
  images: {
    background: {
      starmy: assetPath('/assets/images/background/starmy-background.png'),
    },
    icons: {
      logo: assetPath('/assets/images/icons/starmy-logo.svg'),
    },
    mascot: {
      default: assetPath('/assets/images/mascot/starmy-poffu-default.svg'),
      notice: assetPath('/assets/images/mascot/starmy-poffu-notice.svg'),
      back: assetPath('/assets/images/mascot/starmy-poffu-back.svg'),
      side: assetPath('/assets/images/mascot/starmy-poffu-side.svg'),
    },
  },
} as const;
