/**
 * Asset Path Utility
 * 
 * Public asset path helper.
 *
 * Use NEXT_PUBLIC_ASSET_BASE_PATH only when hosting under a subpath
 * (for example, GitHub Pages project sites). Leave it empty for OCI.
 */
const BASE_PATH = (process.env.NEXT_PUBLIC_ASSET_BASE_PATH || '').replace(/\/+$/, '');

/**
 * Generate an asset path with the base path (only in production)
 * @param path - The path to the asset (should start with /)
 * @returns The full asset path with base path in production, or just the path in development
 * 
 * @example
 * assetPath('/assets/images/icons/starmy-logo.svg')
 * // Development/OCI: '/assets/images/icons/starmy-logo.svg'
 * // Subpath deploy: '/your-base-path/assets/images/icons/starmy-logo.svg'
 */
export function assetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}` || normalizedPath;
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
