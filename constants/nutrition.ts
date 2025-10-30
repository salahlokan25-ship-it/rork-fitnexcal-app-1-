export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const GOAL_ADJUSTMENTS = {
  lose_weight: -500, // 500 calorie deficit
  maintain_weight: 0,
  gain_weight: 500, // 500 calorie surplus
};

export const MACRO_RATIOS = {
  protein: 0.25, // 25% of calories
  carbs: 0.45,   // 45% of calories
  fat: 0.30,     // 30% of calories
};

export const COUNTRIES_FOODS = [
  { country: 'Italy', flag: '🇮🇹', code: 'it' },
  { country: 'Japan', flag: '🇯🇵', code: 'jp' },
  { country: 'Mexico', flag: '🇲🇽', code: 'mx' },
  { country: 'Spain', flag: '🇪🇸', code: 'es' },
  { country: 'France', flag: '🇫🇷', code: 'fr' },
  { country: 'India', flag: '🇮🇳', code: 'in' },
  { country: 'China', flag: '🇨🇳', code: 'cn' },
  { country: 'Thailand', flag: '🇹🇭', code: 'th' },
  { country: 'Argentina', flag: '🇦🇷', code: 'ar' },
  { country: 'Turkey', flag: '🇹🇷', code: 'tr' },
  { country: 'South Korea', flag: '🇰🇷', code: 'kr' },
  { country: 'Vietnam', flag: '🇻🇳', code: 'vn' },
  { country: 'Belgium', flag: '🇧🇪', code: 'be' },
  { country: 'United States', flag: '🇺🇸', code: 'us' },
  { country: 'Greece', flag: '🇬🇷', code: 'gr' },
  { country: 'Morocco', flag: '🇲🇦', code: 'ma' },
  { country: 'Lebanon', flag: '🇱🇧', code: 'lb' },
  { country: 'Indonesia', flag: '🇮🇩', code: 'id' },
  { country: 'Portugal', flag: '🇵🇹', code: 'pt' },
  { country: 'Ethiopia', flag: '🇪🇹', code: 'et' },
  { country: 'UK', flag: '🇬🇧', code: 'gb' },
  { country: 'Syria', flag: '🇸🇾', code: 'sy' },
];