/**
 * Common utility functions used throughout the app
 */

/**
 * Simulate API delay for mock operations
 */
export const simulateApiDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format date to locale string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get role badge color
 */
export const getRoleBadgeClass = (role: string): string => {
  switch (role) {
    case 'admin':
      return 'badge-error';
    case 'talent':
      return 'badge-primary';
    case 'artist':
      return 'badge-secondary';
    default:
      return 'badge-ghost';
  }
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Generate avatar URL fallback
 */
export const getAvatarUrl = (avatarUrl: string | undefined, id: string, name: string): string => {
  return avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${id || name}`;
};

/**
 * Filter items by search term
 */
export const filterBySearch = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  fields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;
  
  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(term);
    })
  );
};
