import { getAssetUrl } from '../config/env';

/**
 * Converts a relative image URL to an absolute URL on the configured API host.
 *
 * Thin wrapper over the central `getAssetUrl` helper so every asset URL in the
 * app is built from the same environment configuration.
 *
 * @param imageUrl - Relative (e.g. `/uploads/avatar.png`) or absolute image URL
 * @returns Absolute URL, or undefined when the input is empty
 */
export const getImageUrl = (imageUrl?: string | null): string | undefined =>
  getAssetUrl(imageUrl);
