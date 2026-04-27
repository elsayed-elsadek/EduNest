/**
 * Unified Design System - Color Palette & Theme
 * This file serves as the single source of truth for all colors across student and mentor dashboards
 */

export const theme = {
  // ────────────────────────────────────────
  // Primary Colors (Brand)
  // ────────────────────────────────────────
  primary: {
    50: '#f0f4f8',
    100: '#d9e6f0',
    200: '#b3cde1',
    300: '#8db4d2',
    400: '#679bc3',
    500: '#0f5e8b',  // Primary (Updated to user's specified color)
    600: '#0a253c',  // Primary Dark (hover/active)
    700: '#081d30',
    800: '#061524',
    900: '#040e18',
  },

  // ────────────────────────────────────────
  // Secondary Colors (Accent)
  // ────────────────────────────────────────
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#cab5fd',
    400: '#a78bfa',
    500: '#8b5cf6',  // Secondary
    600: '#7c3aed',  // Secondary Dark
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },

  // ────────────────────────────────────────
  // Accent Colors (Success, Warning, Error)
  // ────────────────────────────────────────
  accent: {
    success: '#10b981',    // Emerald
    successLight: '#d1fae5',
    warning: '#f59e0b',    // Amber
    warningLight: '#fef3c7',
    error: '#ef4444',      // Red
    errorLight: '#fee2e2',
    info: '#3b82f6',       // Blue
    infoLight: '#dbeafe',
  },

  // ────────────────────────────────────────
  // Neutral/Gray (Backgrounds & Borders)
  // ────────────────────────────────────────
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    150: '#f0f1f4',  // Slightly darker for subtle contrast
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // ────────────────────────────────────────
  // Text Colors
  // ────────────────────────────────────────
  text: {
    primary: '#111827',      // Almost black (dark mode safe)
    secondary: '#6b7280',    // Medium gray
    tertiary: '#9ca3af',     // Light gray
    muted: '#d1d5db',        // Very light gray
    inverted: '#ffffff',     // White (for dark backgrounds)
  },

  // ────────────────────────────────────────
  // Background Colors
  // ────────────────────────────────────────
  background: {
    base: '#ffffff',
    elevated: '#f9fafb',
    muted: '#f3f4f6',
    overlay: 'rgba(0, 0, 0, 0.5)',
    light: '#fafbfc',
  },

  // ────────────────────────────────────────
  // Gradients (Hero & Decorative)
  // ────────────────────────────────────────
  gradients: {
    // Hero gradient (modern, professional)
    hero: 'linear-gradient(135deg, #0a253c 0%, #081d30 100%)',
    heroDark: 'linear-gradient(135deg, #061524 0%, #040e18 100%)',
    
    // Student portal hero (dark navy blue theme)
    studentHero: 'linear-gradient(135deg, #0C2D48 0%, #0a253c 100%)',
    
    // Subtle background gradient
    subtle: 'linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%)',
    
    // Purple accent (for secondary elements)
    accent: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },

  // ────────────────────────────────────────
  // Border Colors
  // ────────────────────────────────────────
  border: {
    light: '#e5e7eb',
    default: '#d1d5db',
    dark: '#9ca3af',
    primary: '#0C2D48',
  },

  // ────────────────────────────────────────
  // State Colors (Hover, Active, Focus, Disabled)
  // ────────────────────────────────────────
  states: {
    hover: '#f3f4f6',
    active: '#e5e7eb',
    focus: '#0C2D48',
    focusRing: 'rgba(12, 45, 72, 0.5)',
    disabled: '#f3f4f6',
    disabledText: '#9ca3af',
  },

  // ────────────────────────────────────────
  // Shadow Definitions
  // ────────────────────────────────────────
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    focus: '0 0 0 3px rgba(12, 45, 72, 0.5)',
  },
} as const;

// ────────────────────────────────────────
// Export CSS Variables String
// ────────────────────────────────────────
export const getCSSVariables = () => {
  return `
    :root {
      /* Primary Colors */
      --primary-50: ${theme.primary[50]};
      --primary-500: ${theme.primary[500]};
      --primary-600: ${theme.primary[600]};
      --primary-700: ${theme.primary[700]};
      
      /* Secondary Colors */
      --secondary-500: ${theme.secondary[500]};
      --secondary-600: ${theme.secondary[600]};
      
      /* Accent Colors */
      --accent-success: ${theme.accent.success};
      --accent-warning: ${theme.accent.warning};
      --accent-error: ${theme.accent.error};
      
      /* Neutral */
      --neutral-100: ${theme.neutral[100]};
      --neutral-200: ${theme.neutral[200]};
      --neutral-300: ${theme.neutral[300]};
      --neutral-500: ${theme.neutral[500]};
      --neutral-700: ${theme.neutral[700]};
      --neutral-900: ${theme.neutral[900]};
      
      /* Text */
      --text-primary: ${theme.text.primary};
      --text-secondary: ${theme.text.secondary};
      --text-muted: ${theme.text.tertiary};
      
      /* Backgrounds */
      --bg-base: ${theme.background.base};
      --bg-elevated: ${theme.background.elevated};
      --bg-muted: ${theme.background.muted};
    }
  `;
};

export default theme;
