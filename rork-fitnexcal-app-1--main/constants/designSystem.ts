import type { ThemeType } from '@/constants/theme';

// Button styles
export const buttonStyles = (theme: ThemeType) => ({
  primary: {
    background: theme.colors.primary,
    color: theme.colors.white,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing['3'],
    paddingHorizontal: theme.spacing['6'],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    shadow: theme.shadow.md,
    hover: {
      background: theme.colors.primary600,
      transform: 'translateY(-1px)',
      shadow: theme.shadow.lg,
    },
    active: {
      transform: 'translateY(0)',
      shadow: theme.shadow.base,
    },
    disabled: {
      background: theme.colors.gray400,
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  secondary: {
    background: theme.colors.white,
    color: theme.colors.primary,
    border: `1.5px solid ${theme.colors.primary}`,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing['3'],
    paddingHorizontal: theme.spacing['6'],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  ghost: {
    background: 'transparent',
    color: theme.colors.primary,
    border: 'none',
    paddingVertical: theme.spacing['3'],
    paddingHorizontal: theme.spacing['6'],
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  icon: {
    shape: 'circle or square with rounded corners',
    size: '40-48px',
    background: theme.colors.gray100,
    color: theme.colors.primary,
    hover: {
      background: theme.colors.primary50,
    },
  },
});

// Card styles
export const cardStyles = (theme: ThemeType) => ({
  default: {
    background: theme.colors.card,
    borderRadius: theme.radii.xl,
    padding: theme.spacing['5'],
    shadow: theme.shadow.sm,
    border: `1px solid ${theme.colors.border}`,
  },
  elevated: {
    background: theme.colors.card,
    borderRadius: theme.radii.xl,
    padding: theme.spacing['6'],
    shadow: theme.shadow.md,
    border: 'none',
  },
  flat: {
    background: theme.colors.secondary,
    borderRadius: theme.radii.md,
    padding: theme.spacing['4'],
    shadow: 'none',
    border: 'none',
  },
  photo: {
    background: theme.colors.card,
    borderRadius: theme.radii.xl,
    padding: 0,
    shadow: theme.shadow.base,
    overflow: 'hidden',
    imageRadius: theme.radii.xl,
  },
});

// Input styles
export const inputStyles = (theme: ThemeType) => ({
  default: {
    background: theme.colors.white,
    border: `1.5px solid ${theme.colors.borderLight}`,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing['3'],
    paddingHorizontal: theme.spacing['4'],
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    placeholder: theme.colors.gray500,
    focus: {
      border: `1.5px solid ${theme.colors.primary}`,
      shadow: `0 0 0 3px ${theme.colors.primary}20`,
    },
  },
  search: {
    background: theme.colors.gray100,
    border: 'none',
    borderRadius: theme.radii['2xl'],
    paddingVertical: theme.spacing['2'],
    paddingLeft: theme.spacing['10'],
    paddingRight: theme.spacing['4'],
    fontSize: theme.typography.fontSize.base,
    iconLeft: {
      size: 20,
      color: theme.colors.gray500,
    },
  },
});

// Badge styles
export const badgeStyles = (theme: ThemeType) => ({
  default: {
    background: theme.colors.primary50,
    color: theme.colors.primary700,
    borderRadius: theme.radii.sm,
    paddingVertical: theme.spacing['1'],
    paddingHorizontal: theme.spacing['2'],
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  pill: {
    background: theme.colors.primary50,
    color: theme.colors.primary700,
    borderRadius: theme.radii.full,
    paddingVertical: theme.spacing['1'],
    paddingHorizontal: theme.spacing['3'],
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  dot: {
    size: 8,
    background: theme.colors.primary,
    borderRadius: theme.radii.full,
  },
});

// Progress bar styles
export const progressBarStyles = (theme: ThemeType) => ({
  container: {
    height: 8,
    background: theme.colors.gray300,
    borderRadius: theme.radii.full,
    overflow: 'hidden',
  },
  fill: {
    background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.primary300})`,
    height: '100%',
    borderRadius: theme.radii.full,
    transition: 'width 0.3s ease',
  },
  circular: {
    size: 120,
    strokeWidth: 8,
    trackColor: theme.colors.gray300,
    fillColor: theme.colors.primary,
  },
});

// Avatar styles
export const avatarStyles = (theme: ThemeType) => ({
  sizes: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
    '2xl': 120,
  },
  borderRadius: theme.radii.full,
  border: `2px solid ${theme.colors.white}`,
  shadow: theme.shadow.sm,
});

// Bottom sheet styles
export const bottomSheetStyles = (theme: ThemeType) => ({
  background: theme.colors.surface,
  borderRadius: `${theme.radii['2xl']}px ${theme.radii['2xl']}px 0 0`,
  padding: theme.spacing['6'],
  shadow: theme.shadow.lg,
  handle: {
    width: 40,
    height: 4,
    background: theme.colors.gray300,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing['4'],
  },
});

// Modal styles
export const modalStyles = (theme: ThemeType) => ({
  background: theme.colors.surface,
  borderRadius: theme.radii.xl,
  padding: theme.spacing['6'],
  shadow: theme.shadow.xl,
  maxWidth: '90%',
  backdrop: {
    background: theme.colors.overlay,
    backdropFilter: 'blur(4px)',
  },
});

// Tabs styles
export const tabsStyles = (theme: ThemeType) => ({
  container: {
    background: theme.colors.gray100,
    borderRadius: theme.radii.md,
    padding: theme.spacing['1'],
  },
  tab: {
    paddingVertical: theme.spacing['2'],
    paddingHorizontal: theme.spacing['4'],
    borderRadius: theme.radii.sm,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray600,
    active: {
      background: theme.colors.white,
      color: theme.colors.primary,
      shadow: theme.shadow.sm,
    },
  },
});

// Navigation bar styles
export const navigationBarStyles = (theme: ThemeType) => ({
  bottom: {
    position: 'fixed bottom',
    background: theme.colors.surface,
    height: 60,
    borderTop: `1px solid ${theme.colors.border}`,
    shadow: theme.shadow.sm,
    items: {
      count: '4-5',
      spacing: 'evenly distributed',
      iconSize: 24,
      labelSize: 11,
      activeColor: theme.colors.primary,
      inactiveColor: theme.colors.gray500,
    },
  },
  top: {
    position: 'fixed top',
    background: theme.colors.surface,
    height: 56,
    borderBottom: `1px solid ${theme.colors.border}`,
    paddingHorizontal: theme.spacing['4'],
  },
});