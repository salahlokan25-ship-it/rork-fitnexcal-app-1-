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
    cardBorder: string;
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
    background: '#1A1F2E',
    surface: '#252B3D',
    primary: '#3B82F6',
    primary700: '#3B82F6',
    primary600: '#60A5FA',
    primary500: '#60A5FA',
    primary300: '#93C5FD',
    accent: '#2D3548',
    text: '#FFFFFF',
    textMuted: '#9CA3AF',
    border: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(75, 85, 99, 0.3)',
    cardShadow: 'rgba(59, 130, 246, 0.25)',
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
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 6,
    },
  },
};

export const BlueWhiteTheme = Theme;
