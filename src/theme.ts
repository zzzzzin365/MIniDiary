import { Platform } from 'react-native';

/**
 * MindLog Design System — "Soft Pastel"
 * Color Palette: #fff5ee (Seashell), #ffb6c1 (Light Pink), #d4e1f1 (Soft Blue)
 */

export const theme = {
  colors: {
    paper: {
      bg: '#fff5ee', // Seashell (Primary Background)
      cream: '#fff5ee', // Same as bg for consistency
      pressed: '#f5ebe5', // Slightly darker seashell for pressed state
    },
    ink: {
      // 文字颜色保持不变
      main: '#2C3E50', // Dark Indigo (Journal Text / Inner Voice)
      secondary: '#4A4A4A', // Faded Charcoal (Date Numbers)
      pencil: '#555555', // Graphite Grey (General Schedule Text)
      watermark: '#D1D1D6', // Very Light Grey (Lunar/Solar terms)
    },
    marks: {
      sage: '#d4e1f1', // Soft Blue (Schedule Dot)
      terracotta: '#ffb6c1', // Light Pink (Diary/Reflection highlight)
      vermilion: '#ffb6c1', // Light Pink (Today Circle / Active indicator)
      blueGrey: '#d4e1f1', // Soft Blue (Timeline Ruling)
    },
    ui: {
      cardstock: '#fff5ee', // Seashell (Bottom Tab Bar)
      washi: 'rgba(255, 182, 193, 0.3)', // Light Pink transparent (Washi Tape)
    }
  },
  typography: {
    /**
     * Emotional / Inner Voice / Questions
     * iOS: New York (Serif)
     * Android: Serif
     */
    serif: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      web: "'Merriweather', 'Georgia', serif",
    }),
    /**
     * Functional / Schedule / Times
     * iOS: System Sans
     * Android: Sans
     */
    sans: Platform.select({
      ios: 'System',
      android: 'sans-serif',
      web: "'Nunito', 'Segoe UI', sans-serif",
    }),
  },
  shadows: {
    soft: {
      shadowColor: '#d4e1f1', // Soft Blue shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 2,
    },
    pressed: {
      shadowColor: '#ffb6c1', // Light Pink
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1,
      elevation: 0,
    },
    floating: {
      shadowColor: '#d4e1f1', // Soft Blue
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    }
  },
  layout: {
    margin: 20,
    radius: {
      card: 12,
      sheet: 24,
    }
  }
} as const;

export type AppTheme = typeof theme;
