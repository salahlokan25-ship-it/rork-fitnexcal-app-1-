# Cal AI Design System

## Overview

This design system implements a minimalist, clean aesthetic focused on a blue and white color palette with AI-powered functionality. It follows modern minimalism with a photo-first approach.

## Color Palette

### Primary Colors (Blue)
- `primary50`: #E3F2FD (Lightest blue)
- `primary100`: #BBDEFB
- `primary200`: #90CAF9
- `primary300`: #64B5F6
- `primary400`: #42A5F5
- `primary500`: #2196F3 (Main primary blue)
- `primary600`: #1E88E5
- `primary700`: #1976D2
- `primary800`: #1565C0
- `primary900`: #0D47A1 (Darkest blue)

### Neutral Colors
- `white`: #FFFFFF
- `gray50`: #FAFAFA
- `gray100`: #F5F5F5
- `gray200`: #EEEEEE
- `gray300`: #E0E0E0
- `gray400`: #BDBDBD
- `gray500`: #9E9E9E
- `gray600`: #757575
- `gray700`: #616161
- `gray800`: #424242
- `gray900`: #212121
- `black`: #000000

### Background Colors
- `background`: #FFFFFF (Main background)
- `surface`: #FFFFFF (Surface elements)
- `secondary`: #F5F7FA (Secondary backgrounds)
- `tertiary`: #E3F2FD (Tertiary backgrounds)
- `card`: #FFFFFF (Card backgrounds)
- `overlay`: rgba(0, 0, 0, 0.5) (Overlay backgrounds)

### Text Colors
- `text`: #212121 (Primary text)
- `textSecondary`: #616161 (Secondary text)
- `textTertiary`: #9E9E9E (Tertiary text)
- `textInverse`: #FFFFFF (Inverse text)
- `textLink`: #2196F3 (Link text)

### Semantic Colors
- `success`: #4CAF50
- `warning`: #FF9800
- `danger`: #F44336
- `info`: #2196F3

## Typography

### Font Families
- `primary`: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif
- `secondary`: 'SF Pro Text', 'Roboto', 'Helvetica', sans-serif
- `mono`: 'SF Mono', 'Roboto Mono', 'Courier New', monospace

### Font Sizes
- `xs`: 11px
- `sm`: 13px
- `base`: 15px
- `md`: 16px
- `lg`: 18px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 28px
- `4xl`: 32px
- `5xl`: 40px
- `6xl`: 48px

### Font Weights
- `light`: 300
- `regular`: 400
- `medium`: 500
- `semibold`: 600
- `bold`: 700
- `heavy`: 800

## Spacing

Based on a 4px base unit:
- `0`: 0px
- `1`: 4px
- `2`: 8px
- `2.5`: 10px
- `3`: 12px
- `4`: 16px
- `5`: 20px
- `6`: 24px
- `8`: 32px
- `10`: 40px
- `12`: 48px
- `16`: 64px
- `20`: 80px
- `24`: 96px

## Border Radius

- `none`: 0px
- `sm`: 4px
- `base`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 32px
- `full`: 9999px

## Shadows

- `none`: none
- `sm`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- `base`: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)
- `md`: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)
- `lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)
- `xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)
- `2xl`: 0 25px 50px -12px rgba(0, 0, 0, 0.25)
- `inner`: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)

## Usage

### In Components

To use the design system in your components:

```tsx
import { useTheme } from '@/hooks/theme';

export default function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <View style={{
      backgroundColor: theme.colors.background,
      padding: theme.spacing['4'],
      borderRadius: theme.radii.lg,
    }}>
      <Text style={{
        color: theme.colors.text,
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.regular,
        fontFamily: theme.typography.fontFamily.primary,
      }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Constants

Design system constants are available in:
- `@/constants/theme.ts` - Main theme definitions
- `@/constants/designSystem.ts` - Component-specific styles

## Component Styles

Component styles are defined in `@/constants/designSystem.ts` and include:
- Button styles
- Card styles
- Input styles
- Badge styles
- Progress bar styles
- Avatar styles
- Bottom sheet styles
- Modal styles
- Tabs styles
- Navigation bar styles

See the [DesignSystemExample.tsx](file:///d:/Games/TradeTrackr-main/rork-fitnexcal-app-1--main/components/DesignSystemExample.tsx) component for implementation examples.