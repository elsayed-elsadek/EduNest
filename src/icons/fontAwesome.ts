/**
 * FontAwesome Tree Shaking - Centralized Icon Exports
 * 
 * This file centralizes all FontAwesome icon imports to enable better tree-shaking.
 * Only import the icons you need from this file instead of importing from @fortawesome packages directly.
 * 
 * Tree Shaking Benefits:
 * - Reduces bundle size significantly
 * - Only includes used icons in the final build
 * - Better dead code elimination
 * 
 * Usage:
 * import { Icons } from '@/icons/fontAwesome';
 * <FontAwesomeIcon icon={Icons.faEnvelope} />
 */

// Solid Icons
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons/faFolderOpen';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen';
import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo';
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faTwitch } from '@fortawesome/free-brands-svg-icons/faTwitch';
import { faInstagram } from '@fortawesome/free-brands-svg-icons/faInstagram';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faFacebook } from '@fortawesome/free-brands-svg-icons/faFacebook';
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { faYoutube } from '@fortawesome/free-brands-svg-icons/faYoutube';

// Export all icons as a single object for easier importing
export const FontAwesomeIcons = {
  // Solid Icons
  faEnvelope,
  faCheck,
  faArrowRight,
  faSearch,
  faFolderOpen,
  faBookOpen,
  faVideo,
  faBell,
  faChevronDown,
  faChevronUp,
  
  // Brand Icons
  faTwitch,
  faInstagram,
  faLinkedin,
  faFacebook,
  faTwitter,
  faYoutube,
} as const;

// Export type for icon prop
export type FontAwesomeIconType = typeof FontAwesomeIcons[keyof typeof FontAwesomeIcons];

// Re-export the library for convenience
export { library } from '@fortawesome/fontawesome-svg-core';
export { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/**
 * Optional: Add icons to library for dynamic usage
 * Use this only if you need to use icons dynamically by name
 */
export const addIconsToLibrary = (icons: FontAwesomeIconType[]) => {
  // This function can be used to add icons to the library dynamically
  // Useful for dynamic icon rendering but less efficient than direct imports
  return icons;
};

