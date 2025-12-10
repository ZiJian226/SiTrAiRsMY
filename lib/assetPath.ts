/**
 * Asset Path Utility
 * 
 * Generates correct asset paths for Next.js.
 * Since next.config.ts already handles basePath and assetPrefix,
 * we just need to ensure paths start from root (/).
 * Next.js will automatically add the base path in production.
 */

/**
 * Generate an asset path (normalized to start with /)
 * @param path - The path to the asset (should start with /)
 * @returns The normalized asset path
 * 
 * @example
 * assetPath('/assets/images/icons/starmy-logo.svg')
 * // Returns: '/assets/images/icons/starmy-logo.svg'
 * // Next.js will automatically handle the basePath in production
 */
export function assetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return normalizedPath;
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
