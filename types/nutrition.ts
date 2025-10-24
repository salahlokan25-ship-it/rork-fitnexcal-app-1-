export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  serving_size: string;
  image_url?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  food_item: FoodItem;
  quantity: number;
  meal_type: MealType;
  timestamp: Date;
  image_url?: string;
}

export interface WeeklyGoalSettings {
  enabled: boolean;
  weekly_target_calories?: number;
  buffer_enabled: boolean;
  buffer_max_per_day?: number;
}

export interface WeeklySummary {
  week_start: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  goal_calories: number;
  buffer_balance: number;
}

export interface DailyNutrition {
  date: string;
  meals: MealEntry[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  goal_calories: number;
  remaining_calories: number;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  weightGoal?: number; // kg
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose_weight' | 'maintain_weight' | 'gain_weight';
  goal_calories: number;
  goal_protein: number;
  goal_carbs: number;
  goal_fat: number;
  is_premium: boolean;
  avatar_url?: string;
  medical_conditions?: {
    diabetes?: boolean;
    kidney_disease?: boolean;
    celiac?: boolean;
    hypertension?: boolean;
  };
  allergies?: string[];
  lab_values?: {
    a1c?: number;
    fasting_glucose?: number;
    ldl?: number;
    hdl?: number;
    triglycerides?: number;
    creatinine?: number;
    egfr?: number;
    total_cholesterol?: number;
  };
  nutrition_preferences?: {
    max_added_sugar_g_per_serving?: number;
    target_carb_g_per_meal?: number;
    sodium_mg_daily_limit?: number;
  };
}

export interface CountryFood {
  country: string;
  flag: string;
  foods: FoodItem[];
}