import { Platform } from 'react-native';

/**
 * MindLog Design System — "Ethereal Dream"
 * Core Metaphor: Soft glass, breathing light, pastel dreams.
 */

export const theme = {
  colors: {
    paper: {
      bg: '#fff5ee', // Seashell (Base background behind glass)
      cream: '#fffdf9',
      pressed: 'rgba(255, 182, 193, 0.1)', // Light Pink touch
    },
    glass: {
      card: 'rgba(255, 255, 255, 0.65)', // Frosted Glass
      border: 'rgba(255, 255, 255, 0.9)', // Inner glow
      overlay: 'rgba(255, 255, 255, 0.8)', // Vellum/Tracing paper
    },
    ink: {
      main: '#5E5E6E', // Muted Slate (Primary Text)
      secondary: '#8E8E99', // Softer Slate
      pencil: '#A0A0B0',
      watermark: 'rgba(94, 94, 110, 0.2)',
    },
    marks: {
      sage: '#748B75', // Kept for legacy compatibility
      terracotta: '#E89F71',
      vermilion: '#ffb6c1', // Replaced Red with Light Pink for highlights
      blueGrey: '#d4e1f1', // Light Periwinkle
      pinkGlow: '#ffb6c1',
    },
    ui: {
      cardstock: 'rgba(255, 255, 255, 0.75)', // Glass Tab Bar
      washi: 'rgba(212, 225, 241, 0.5)', // Periwinkle Tape
    }
  },
  typography: {
    serif: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Merriweather', 'Georgia', serif",
    }),
    sans: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: "'Nunito', 'Segoe UI', sans-serif",
    }),
  },
  shadows: {
    soft: {
      shadowColor: '#d4e1f1', // Periwinkle shadow
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 4,
    },
    glass: {
      shadowColor: '#d4e1f1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    pressed: {
      shadowColor: '#ffb6c1',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 1,
    }
  },
  layout: {
    margin: 20,
    radius: {
      card: 24, // Soft rounded
      sheet: 32,
    }
  }
} as const;

export type AppTheme = typeof theme;
