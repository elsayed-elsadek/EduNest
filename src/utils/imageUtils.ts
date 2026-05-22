import api from '../services/api';

/**
 * Converts relative image URLs to absolute URLs using API base URL
 * Handles: /uploads/... -> http://localhost:8080/uploads/...
 * @param imageUrl - Relative or absolute image URL
 * @returns Absolute URL or undefined
 */
export const getImageUrl = (imageUrl?: string | null): string | undefined => {
  if (!imageUrl) return undefined;

  // Already absolute
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Get BASE_URL from api config (VITE_BASE_URL || localhost:8080)
  const baseURL = (api.defaults.baseURL ?? '').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  return baseURL ? `${baseURL}${imageUrl}` : undefined;
};
