/**
 * Asset Path Utility
 * 
 * Generates correct asset paths based on the environment.
 * In production (GitHub Pages), assets are served from /SiTrAiRsMY/
 * In development, assets are served from the root /
 */

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/SiTrAiRsMY' : '';

/**
 * Generate an asset path with the correct base path for the current environment
 * @param path - The path to the asset (should start with /)
 * @returns The full asset path including the base path if in production
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
