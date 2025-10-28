export type ThemeType = {
  colors: {
    background: string;
    surface: string;
    primary: string;
    primary700: string;
    primary600: string;
    primary500: string;
    primary300: string;
    accent: string;
    text: string;
    textMuted: string;
    border: string;
    cardShadow: string;
    success: string;
    warning: string;
    danger: string;
  };
  radii: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  shadow: {
    soft: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    medium: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
};

export const Theme: ThemeType = {
  colors: {
    background: '#E9ECEF',
    surface: '#FFFFFF',
    primary: '#0A84FF',
    primary700: '#0066FF',
    primary600: '#0A7BFF',
    primary500: '#1EA0FF',
    primary300: '#74C1FF',
    accent: '#EEF5FF',
    text: '#0F172A',
    textMuted: '#667085',
    border: 'rgba(15, 23, 42, 0.06)',
    cardShadow: 'rgba(10, 132, 255, 0.25)',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  radii: { xs: 8, sm: 12, md: 16, lg: 20, xl: 24, full: 999 },
  spacing: { xs: 6, sm: 10, md: 14, lg: 20, xl: 24, xxl: 32 },
  shadow: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 6,
    },
  },
};

export const BlueWhiteTheme = Theme;
