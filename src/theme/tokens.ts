import { useColorScheme } from 'react-native';

// Cicada's design tokens. Screens take colours, type, spacing and radii from
// here, never raw values. Picked on Board 2 (vault Decision 0009): one sage
// accent, used only on +, ✓, ✦, insights and charts.

const dark = {
  background: '#131215',
  surface: '#1E1D21',
  elevated: '#2A292E',
  text: '#F2F1F4',
  textSecondary: '#96949E',
  line: '#2E2D33',
  accent: '#93B79E',
  onAccent: '#0F1A12',
  accentTint: 'rgba(147, 183, 158, 0.14)',
  scrim: 'rgba(0, 0, 0, 0.45)',
};

const light: typeof dark = {
  background: '#F6F6F8',
  surface: '#FFFFFF',
  elevated: '#ECECF0',
  text: '#151418',
  textSecondary: '#6C6A74',
  line: '#E2E1E6',
  accent: '#3F6D4D',
  onAccent: '#FFFFFF',
  accentTint: 'rgba(63, 109, 77, 0.10)',
  scrim: 'rgba(0, 0, 0, 0.30)',
};

export const palettes = { dark, light } as const;
export type Palette = typeof dark;

export function useColors(): Palette {
  return useColorScheme() === 'light' ? light : dark;
}

// Fonts loaded in app/_layout.tsx. Android needs one family per weight.
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  read: 'Newsreader_400Regular',
  readMedium: 'Newsreader_500Medium',
} as const;

// Type scale, after Apple's text styles. Entry text uses the reading face.
export const type = {
  largeTitle: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 41, letterSpacing: -0.4 },
  title: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  headline: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 24 },
  entry: { fontFamily: fonts.read, fontSize: 18, lineHeight: 27 },
  callout: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
  caption: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 14, lg: 20, pill: 999 } as const;

export const motion = {
  pressScale: 0.97, // the press squish
  pressDelay: 130, // ms a touch waits before squishing, so a scroll never squishes a card
} as const;
