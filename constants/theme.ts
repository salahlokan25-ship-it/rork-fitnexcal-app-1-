export type ThemeType = {
  colors: {
    background: string;
    surface: string;
    offWhite: string;
    lightGray: string;
    
    primary: string;
    primaryLight: string;
    primaryPale: string;
    
    black: string;
    darkGray: string;
    mediumGray: string;
    borderGray: string;
    
    text: string;
    textMuted: string;
    border: string;
    
    red: string;
    coral: string;
    orange: string;
    wheat: string;
    green: string;
    
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  
  typography: {
    hero: number;
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    body: number;
    bodySmall: number;
    caption: number;
    micro: number;
  };
  
  fontWeights: {
    regular: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
    heavy: '800';
  };
  
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  
  radii: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    full: number;
    pill: number;
  };
  
  shadow: {
    sm: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    card: {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    modal: {
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
    background: '#F8F8F8',
    surface: '#FFFFFF',
    offWhite: '#F8F8F8',
    lightGray: '#F5F5F7',
    
    primary: '#4A90E2',
    primaryLight: '#6BA3E8',
    primaryPale: '#E8F4FF',
    
    black: '#000000',
    darkGray: '#1A1A1A',
    mediumGray: '#8E8E93',
    borderGray: '#E5E5EA',
    
    text: '#000000',
    textMuted: '#8E8E93',
    border: '#E5E5EA',
    
    red: '#FF6B6B',
    coral: '#FF8A80',
    orange: '#FFB74D',
    wheat: '#F4A460',
    green: '#4CAF50',
    
    success: '#4CAF50',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#007AFF',
  },
  
  typography: {
    hero: 64,
    h1: 34,
    h2: 28,
    h3: 22,
    h4: 20,
    body: 17,
    bodySmall: 15,
    caption: 13,
    micro: 11,
  },
  
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  radii: {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    full: 999,
    pill: 9999,
  },
  
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 6,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 48,
      elevation: 10,
    },
  },
};

export const BlueWhiteTheme = Theme;
