/**
 * MusiGuess Color System
 * Professional-grade design tokens for consistent theming
 */

// Primary palette
const PRIMARY = '#00f3ff';      // Neon Cyan
const SECONDARY = '#ff00ff';    // Neon Magenta
const ACCENT = '#ffcc00';       // Gold/Yellow for highlights

// Background tones
const BACKGROUND_DARK = '#0a0e17';
const BACKGROUND_LIGHT = '#141a26';

// Surface colors with opacity variants
const SURFACE_BASE = 'rgba(255, 255, 255, 0.05)';
const SURFACE_HIGHLIGHT = 'rgba(255, 255, 255, 0.1)';
const SURFACE_ELEVATED = 'rgba(255, 255, 255, 0.15)';

// Text colors
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#8899ac';
const TEXT_MUTED = '#5a6a7a';

// Semantic colors
const SUCCESS = '#4caf50';
const SUCCESS_LIGHT = 'rgba(76, 175, 80, 0.2)';
const ERROR = '#f44336';
const ERROR_LIGHT = 'rgba(244, 67, 54, 0.2)';
const WARNING = '#ff9800';
const WARNING_LIGHT = 'rgba(255, 152, 0, 0.2)';
const INFO = '#2196f3';
const INFO_LIGHT = 'rgba(33, 150, 243, 0.2)';

// Speed tier colors (for new scoring system)
const LIGHTNING = '#ffcc00';  // Gold
const FAST = '#ff6b35';       // Orange
const GOOD = '#4caf50';       // Green

export const Colors = {
    // Core
    background: BACKGROUND_DARK,
    backgroundLight: BACKGROUND_LIGHT,
    primary: PRIMARY,
    secondary: SECONDARY,
    accent: ACCENT,

    // Surfaces
    surface: SURFACE_BASE,
    surfaceHighlight: SURFACE_HIGHLIGHT,
    surfaceElevated: SURFACE_ELEVATED,

    // Text
    text: TEXT_PRIMARY,
    textSecondary: TEXT_SECONDARY,
    textMuted: TEXT_MUTED,

    // Semantic
    success: SUCCESS,
    successLight: SUCCESS_LIGHT,
    error: ERROR,
    errorLight: ERROR_LIGHT,
    warning: WARNING,
    warningLight: WARNING_LIGHT,
    info: INFO,
    infoLight: INFO_LIGHT,

    // Speed tiers
    lightning: LIGHTNING,
    fast: FAST,
    good: GOOD,

    // Borders
    border: `rgba(0, 243, 255, 0.3)`,
    borderLight: 'rgba(255, 255, 255, 0.1)',
    borderMedium: 'rgba(255, 255, 255, 0.2)',

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)',

    // Gradients (as arrays for LinearGradient)
    gradients: {
        primary: [PRIMARY, SECONDARY],
        dark: [BACKGROUND_DARK, BACKGROUND_LIGHT],
        success: ['#4caf50', '#81c784'],
        error: ['#f44336', '#e57373'],
        gold: ['#ffcc00', '#ff9800'],
    },

    // Shadows (for web)
    shadows: {
        glow: `0 0 20px ${PRIMARY}40`,
        glowStrong: `0 0 40px ${PRIMARY}60`,
        card: '0 4px 20px rgba(0, 0, 0, 0.3)',
    },
} as const;

// Type for color keys
export type ColorKey = keyof typeof Colors;
