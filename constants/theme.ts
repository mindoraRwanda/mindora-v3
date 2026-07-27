/**
 * Design tokens for the app. Colors are defined for light and dark mode —
 * screens should read from here instead of hardcoding hex values, so dark mode
 * actually works everywhere.
 */

import { Platform } from 'react-native';

const tintColorLight = '#6D28D9';
const tintColorDark = '#B49CF5';

// A fixed brand violet for solid-fill surfaces (primary buttons, hero cards) — used
// identically in both themes. `tint` itself is intentionally lighter in dark mode so
// text/icons/borders stay legible on a dark background, but that same lighter shade
// looks washed-out and pastel when used as a large solid fill with white text on top;
// this keeps those surfaces looking rich and premium in both themes instead.
const brandSolid = '#6D28D9';
const brandSolidPressed = '#5B21B6';

export const Colors = {
  light: {
    text: '#191324',
    textMuted: '#6B6478',
    background: '#FAFAFC',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: 'rgba(25,19,36,0.08)',
    tint: tintColorLight,
    tintPressed: '#5B21B6',
    tintSoft: '#F3EEFC',
    tintSolid: brandSolid,
    tintSolidPressed: brandSolidPressed,
    icon: '#6D28D9',
    tabIconDefault: '#9891A3',
    tabIconSelected: tintColorLight,
    success: '#0F9D6A',
    successSoft: '#E9F9F1',
    warning: '#B45309',
    warningSoft: '#FEF6E7',
    danger: '#C0362C',
    dangerSoft: '#FBEBEA',
    shadow: '#150E28',
  },
  dark: {
    text: '#F1EEF7',
    textMuted: '#A79FB5',
    background: '#0E0B16',
    surface: '#191420',
    surfaceRaised: '#221B2C',
    border: 'rgba(241,238,247,0.09)',
    tint: tintColorDark,
    tintPressed: '#C9B7F9',
    tintSoft: 'rgba(180, 156, 245, 0.14)',
    tintSolid: brandSolid,
    tintSolidPressed: brandSolidPressed,
    icon: '#C9B7F9',
    tabIconDefault: '#756D82',
    tabIconSelected: tintColorDark,
    success: '#3FCC94',
    successSoft: 'rgba(63, 204, 148, 0.12)',
    warning: '#E3A542',
    warningSoft: 'rgba(227, 165, 66, 0.12)',
    danger: '#E6746A',
    dangerSoft: 'rgba(230, 116, 106, 0.14)',
    shadow: '#000000',
  },
} as const;

export type ThemeColorName = keyof typeof Colors.light;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  xxl: 28,
  pill: 999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * A single, consistent type scale so screens stop inventing one-off font sizes.
 * Pair with a `color` from theme tokens at the call site.
 */
export const Typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const, letterSpacing: -0.4 },
  h1: { fontSize: 24, lineHeight: 30, fontWeight: '700' as const, letterSpacing: -0.2 },
  h2: { fontSize: 19, lineHeight: 25, fontWeight: '700' as const },
  h3: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  body: { fontSize: 14, lineHeight: 21, fontWeight: '400' as const },
  bodySm: { fontSize: 13, lineHeight: 19, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '700' as const, letterSpacing: 0.6 },
};

/**
 * Ready-to-spread elevation presets — pair with `{ shadowColor: colors.shadow }`.
 * Keeps shadow depth consistent instead of every card inventing its own numbers.
 */
export const Elevation = {
  none: { shadowOpacity: 0, elevation: 0 },
  sm: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  md: { shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  lg: { shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 28, elevation: 8 },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
