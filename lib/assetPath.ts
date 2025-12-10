/**
 * Asset Path Utility
 * 
 * For GitHub Pages project sites, assets are served from the repository path automatically.
 * Repository: ZiJian226/SiTrAiRsMY → Deployed at: https://zijian226.github.io/SiTrAiRsMY/
 * 
 * Since the repository name becomes part of the URL path, we just need normalized paths.
 * GitHub Pages handles the base path automatically.
 */

/**
 * Generate a normalized asset path
 * @param path - The path to the asset (should start with /)
 * @returns The normalized asset path
 * 
 * @example
 * assetPath('/assets/images/icons/starmy-logo.svg')
 * // Returns: '/assets/images/icons/starmy-logo.svg'
 * // GitHub Pages serves it from: /SiTrAiRsMY/assets/images/icons/starmy-logo.svg
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
