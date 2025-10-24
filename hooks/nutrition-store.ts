import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DailyNutrition, MealEntry, FoodItem, MealType, WeeklyGoalSettings, WeeklySummary } from '@/types/nutrition';
import { useUser } from '@/hooks/user-store';

type HealthCondition = 'diabetes' | 'hypertension' | 'celiac' | 'kidney_disease' | 'allergy';

export interface HealthAlert {
  id: string;
  condition: HealthCondition;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  food: FoodItem;
  allergen?: string;
}

function evaluateHealthAlerts(
  food: FoodItem,
  conditions?: { diabetes?: boolean; kidney_disease?: boolean; celiac?: boolean; hypertension?: boolean },
  allergies?: string[],
  prefs?: { max_added_sugar_g_per_serving?: number; target_carb_g_per_meal?: number; sodium_mg_daily_limit?: number },
): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const name = (food.name || '').toLowerCase();
  const carbs = Number(food.carbs ?? 0);
  const sugar = Number(food.sugar ?? 0);
  const sodium = Number(food.sodium ?? 0);
  const protein = Number(food.protein ?? 0);

  const isSugary = sugar >= 10 || carbs >= (prefs?.target_carb_g_per_meal ? prefs.target_carb_g_per_meal : 25) || /soda|cola|juice|candy|cookie|cake|dessert|frappuccino|sweet|syrup/.test(name);
  const isHighSodium = sodium >= (prefs?.sodium_mg_daily_limit ? Math.max(400, Math.round((prefs.sodium_mg_daily_limit || 1500) / 3)) : 500) || /soy sauce|ramen|chips|noodles|processed|cured|pickles|soup/.test(name);
  const hasGluten = /wheat|barley|rye|bread|pasta|cracker|biscuit|cookie|pizza|bulgur|farro|seitan/.test(name);
  const kidneyLoad = protein >= 25 || /red meat|nuts|almonds|peanut|cheese|processed/.test(name);

  if (conditions?.diabetes && isSugary) {
    alerts.push({
      id: `alert_${Date.now()}_diab`,
      condition: 'diabetes',
      title: 'High sugar/carb item',
      message: 'This may spike blood sugar. Prefer low-GI, high-fiber or protein-forward options.',
      severity: 'warning',
      food,
    });
  }
  if (conditions?.hypertension && isHighSodium) {
    alerts.push({
      id: `alert_${Date.now()}_htn`,
      condition: 'hypertension',
      title: 'High sodium item',
      message: 'This may increase blood pressure. Choose lower-sodium alternatives.',
      severity: 'warning',
      food,
    });
  }
  if (conditions?.celiac && hasGluten) {
    alerts.push({
      id: `alert_${Date.now()}_celiac`,
      condition: 'celiac',
      title: 'Contains gluten',
      message: 'Avoid gluten-containing foods. Look for gluten-free alternatives.',
      severity: 'critical',
      food,
    });
  }
  if (conditions?.kidney_disease && kidneyLoad) {
    alerts.push({
      id: `alert_${Date.now()}_ckd`,
      condition: 'kidney_disease',
      title: 'Potential kidney load',
      message: 'High protein/sodium foods can strain kidneys. Prefer kidney-friendly options.',
      severity: 'warning',
      food,
    });
  }

  const list = (allergies ?? []).map((a) => a.toLowerCase());
  for (const a of list) {
    if (a && name.includes(a)) {
      alerts.push({
        id: `alert_${Date.now()}_alg_${a}`,
        condition: 'allergy',
        title: `Contains ${a}`,
        message: 'Allergen detected in item name. Please verify ingredients before consuming.',
        severity: 'critical',
        food,
        allergen: a,
      });
    }
  }

  return alerts;
}

const SETTINGS_KEY = 'nutrition_settings_weekly';

function getISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - day);
  return getISODate(start);
}

export const [NutritionProvider, useNutrition] = createContextHook(() => {
  const [dailyNutrition, setDailyNutrition] = useState<DailyNutrition | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [weeklySettings, setWeeklySettings] = useState<WeeklyGoalSettings>({ enabled: false, buffer_enabled: false });
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [healthAlerts, setHealthAlerts] = useState<HealthAlert[]>([]);
  const { user } = useUser();

  const getTodayKey = () => {
    return getISODate(new Date());
  };

  const loadSettings = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WeeklyGoalSettings;
        setWeeklySettings(parsed);
      }
    } catch (e) {
      console.error('[Nutrition] loadSettings error', e);
    }
  }, []);

  const saveSettings = useCallback(async (settings: WeeklyGoalSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      setWeeklySettings(settings);
    } catch (e) {
      console.error('[Nutrition] saveSettings error', e);
    }
  }, []);

  const loadDay = useCallback(async (dateISO: string): Promise<DailyNutrition> => {
    try {
      const key = `nutrition_${dateISO}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const nutrition = JSON.parse(data) as DailyNutrition;
        nutrition.meals = (nutrition.meals || []).map((meal: any) => ({
          ...meal,
          timestamp: new Date(meal.timestamp as any),
        }));
        if (!nutrition.goal_calories) nutrition.goal_calories = 2000;
        nutrition.remaining_calories = nutrition.goal_calories - (nutrition.total_calories ?? 0);
        nutrition.date = dateISO;
        return nutrition;
      }
      const emptyDay: DailyNutrition = {
        date: dateISO,
        meals: [],
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        goal_calories: 2000,
        remaining_calories: 2000,
      };
      await AsyncStorage.setItem(`nutrition_${dateISO}`, JSON.stringify(emptyDay));
      return emptyDay;
    } catch (e) {
      console.error('[Nutrition] loadDay error', e);
      return {
        date: dateISO,
        meals: [],
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        goal_calories: 2000,
        remaining_calories: 2000,
      };
    }
  }, []);

  const loadTodayNutrition = useCallback(async () => {
    try {
      const todayKey = getTodayKey();
      const nutrition = await loadDay(todayKey);
      setDailyNutrition(nutrition);
    } catch (error) {
      console.error('Error loading nutrition data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadDay]);

  useEffect(() => {
    void loadSettings();
    void loadTodayNutrition();
  }, [loadSettings, loadTodayNutrition]);

  const calculateTotals = (meals: MealEntry[]) => {
    return meals.reduce(
      (totals, meal) => ({
        total_calories: totals.total_calories + meal.food_item.calories * meal.quantity,
        total_protein: totals.total_protein + meal.food_item.protein * meal.quantity,
        total_carbs: totals.total_carbs + meal.food_item.carbs * meal.quantity,
        total_fat: totals.total_fat + meal.food_item.fat * meal.quantity,
      }),
      { total_calories: 0, total_protein: 0, total_carbs: 0, total_fat: 0 },
    );
  };

  const persistDay = useCallback(async (day: DailyNutrition) => {
    await AsyncStorage.setItem(`nutrition_${day.date}`, JSON.stringify(day));
  }, []);

  const recalcWeeklySummary = useCallback(async () => {
    if (!dailyNutrition) return;
    try {
      const today = new Date();
      const startISO = getWeekStart(today);
      let totals = { cals: 0, p: 0, c: 0, f: 0 };
      for (let i = 0; i < 7; i += 1) {
        const d = new Date(startISO);
        d.setDate(new Date(startISO).getDate() + i);
        const key = `nutrition_${getISODate(d)}`;
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as DailyNutrition;
          totals.cals += parsed.total_calories ?? 0;
          totals.p += parsed.total_protein ?? 0;
          totals.c += parsed.total_carbs ?? 0;
          totals.f += parsed.total_fat ?? 0;
        }
      }
      const goalDaily = dailyNutrition.goal_calories;
      const weeklyGoal = weeklySettings.enabled && weeklySettings.weekly_target_calories ? weeklySettings.weekly_target_calories : goalDaily * 7;
      const bufferBalance = Math.round((weeklyGoal ?? goalDaily * 7) - totals.cals);
      const summary: WeeklySummary = {
        week_start: startISO,
        total_calories: totals.cals,
        total_protein: totals.p,
        total_carbs: totals.c,
        total_fat: totals.f,
        goal_calories: weeklyGoal,
        buffer_balance: bufferBalance,
      };
      setWeeklySummary(summary);
    } catch (e) {
      console.error('[Nutrition] recalcWeeklySummary error', e);
    }
  }, [dailyNutrition, weeklySettings]);

  const addMeal = useCallback(
    async (foodItem: FoodItem, quantity: number, mealType: MealType, imageUrl?: string) => {
      if (!dailyNutrition) return;

      try {
        const newMeal: MealEntry = {
          id: Date.now().toString(),
          food_item: foodItem,
          quantity,
          meal_type: mealType,
          timestamp: new Date(),
          image_url: imageUrl,
        };

        const updatedMeals = [...dailyNutrition.meals, newMeal];
        const totals = calculateTotals(updatedMeals);

        const updatedNutrition: DailyNutrition = {
          ...dailyNutrition,
          meals: updatedMeals,
          ...totals,
          remaining_calories: dailyNutrition.goal_calories - totals.total_calories,
        };

        await persistDay(updatedNutrition);
        setDailyNutrition(updatedNutrition);
        await recalcWeeklySummary();

        const alerts = evaluateHealthAlerts(foodItem, user?.medical_conditions, user?.allergies, user?.nutrition_preferences);
        if (alerts.length > 0) {
          setHealthAlerts((prev) => [...prev, ...alerts]);
          console.log('[HealthAlerts] triggered', alerts.map((a) => a.condition).join(','));
        }
      } catch (error) {
        console.error('Error adding meal:', error);
        throw error;
      }
    },
    [dailyNutrition, persistDay, recalcWeeklySummary, user?.medical_conditions, user?.allergies, user?.nutrition_preferences],
  );

  const removeMeal = useCallback(
    async (mealId: string) => {
      if (!dailyNutrition) return;

      try {
        const updatedMeals = dailyNutrition.meals.filter((meal) => meal.id !== mealId);
        const totals = calculateTotals(updatedMeals);

        const updatedNutrition: DailyNutrition = {
          ...dailyNutrition,
          meals: updatedMeals,
          ...totals,
          remaining_calories: dailyNutrition.goal_calories - totals.total_calories,
        };

        await persistDay(updatedNutrition);
        setDailyNutrition(updatedNutrition);
        await recalcWeeklySummary();
      } catch (error) {
        console.error('Error removing meal:', error);
        throw error;
      }
    },
    [dailyNutrition, persistDay, recalcWeeklySummary],
  );

  const updateGoalCalories = useCallback(
    async (goalCalories: number) => {
      if (!dailyNutrition) return;

      const updatedNutrition: DailyNutrition = {
        ...dailyNutrition,
        goal_calories: goalCalories,
        remaining_calories: goalCalories - dailyNutrition.total_calories,
      };

      await persistDay(updatedNutrition);
      setDailyNutrition(updatedNutrition);
      await recalcWeeklySummary();
    },
    [dailyNutrition, persistDay, recalcWeeklySummary],
  );

  const moveCaloriesBetweenMeals = useCallback(
    async (from: MealType, to: MealType, calories: number) => {
      if (!dailyNutrition || calories <= 0) return;
      try {
        let remaining = calories;
        const sorted = [...dailyNutrition.meals]
          .filter((m) => m.meal_type === from)
          .sort((a, b) => b.food_item.calories * b.quantity - a.food_item.calories * a.quantity);
        const updatedMeals: MealEntry[] = [...dailyNutrition.meals];
        for (const meal of sorted) {
          if (remaining <= 0) break;
          const mealCals = meal.food_item.calories * meal.quantity;
          const take = Math.min(remaining, mealCals);
          const fraction = take / mealCals;
          if (fraction >= 1) {
            const idx = updatedMeals.findIndex((m) => m.id === meal.id);
            if (idx >= 0) updatedMeals.splice(idx, 1);
            updatedMeals.push({ ...meal, id: `${meal.id}_moved_${Date.now()}`, meal_type: to });
          } else {
            const idx = updatedMeals.findIndex((m) => m.id === meal.id);
            if (idx >= 0) {
              updatedMeals[idx] = { ...meal, quantity: meal.quantity * (1 - fraction) };
            }
            updatedMeals.push({ ...meal, id: `${meal.id}_part_${Date.now()}`, quantity: meal.quantity * fraction, meal_type: to });
          }
          remaining -= take;
        }
        const totals = calculateTotals(updatedMeals);
        const updatedNutrition: DailyNutrition = {
          ...dailyNutrition,
          meals: updatedMeals,
          ...totals,
          remaining_calories: dailyNutrition.goal_calories - totals.total_calories,
        };
        await persistDay(updatedNutrition);
        setDailyNutrition(updatedNutrition);
      } catch (e) {
        console.error('[Nutrition] moveCaloriesBetweenMeals error', e);
      }
    },
    [dailyNutrition, persistDay],
  );

  const moveCaloriesAcrossDays = useCallback(
    async (fromDateISO: string, toDateISO: string, calories: number) => {
      if (calories <= 0) return;
      try {
        const fromDay = await loadDay(fromDateISO);
        const toDay = await loadDay(toDateISO);

        let remaining = calories;
        const sortedFrom = [...fromDay.meals]
          .sort((a, b) => b.food_item.calories * b.quantity - a.food_item.calories * a.quantity);
        const updatedFromMeals: MealEntry[] = [...fromDay.meals];
        const movedMeals: MealEntry[] = [];

        for (const meal of sortedFrom) {
          if (remaining <= 0) break;
          const mealCals = meal.food_item.calories * meal.quantity;
          if (mealCals <= 0) continue;
          const take = Math.min(remaining, mealCals);
          const fraction = take / mealCals;
          if (fraction >= 1) {
            const idx = updatedFromMeals.findIndex((m) => m.id === meal.id);
            if (idx >= 0) updatedFromMeals.splice(idx, 1);
            movedMeals.push({ ...meal, id: `${meal.id}_mv_${Date.now()}` });
          } else {
            const idx = updatedFromMeals.findIndex((m) => m.id === meal.id);
            if (idx >= 0) {
              updatedFromMeals[idx] = { ...meal, quantity: meal.quantity * (1 - fraction) };
            }
            movedMeals.push({ ...meal, id: `${meal.id}_part_${Date.now()}`, quantity: meal.quantity * fraction });
          }
          remaining -= take;
        }

        const updatedToMeals: MealEntry[] = [...toDay.meals, ...movedMeals.map((m) => ({ ...m, timestamp: new Date() }))];

        const fromTotals = calculateTotals(updatedFromMeals);
        const updatedFrom: DailyNutrition = {
          ...fromDay,
          meals: updatedFromMeals,
          ...fromTotals,
          remaining_calories: fromDay.goal_calories - fromTotals.total_calories,
        };

        const toTotals = calculateTotals(updatedToMeals);
        const updatedTo: DailyNutrition = {
          ...toDay,
          meals: updatedToMeals,
          ...toTotals,
          remaining_calories: toDay.goal_calories - toTotals.total_calories,
        };

        await AsyncStorage.setItem(`nutrition_${fromDateISO}`, JSON.stringify(updatedFrom));
        await AsyncStorage.setItem(`nutrition_${toDateISO}`, JSON.stringify(updatedTo));

        const todayISO = getTodayKey();
        if (fromDateISO === todayISO) {
          setDailyNutrition(updatedFrom);
        } else if (toDateISO === todayISO) {
          setDailyNutrition(updatedTo);
        }
        await recalcWeeklySummary();
      } catch (e) {
        console.error('[Nutrition] moveCaloriesAcrossDays error', e);
      }
    },
    [loadDay, recalcWeeklySummary],
  );

  const loadHistoryRange = useCallback(async (days: number) => {
    const today = new Date();
    const out: { label: string; calories: number; protein: number; carbs: number; fat: number }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = `nutrition_${d.toISOString().split('T')[0]}`;
      try {
        const raw = await AsyncStorage.getItem(key);
        if (!raw) {
          out.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), calories: 0, protein: 0, carbs: 0, fat: 0 });
        } else {
          const parsed = JSON.parse(raw) as DailyNutrition;
          out.push({
            label: d.toLocaleDateString('en-US', { weekday: 'short' }),
            calories: parsed.total_calories ?? 0,
            protein: parsed.total_protein ?? 0,
            carbs: parsed.total_carbs ?? 0,
            fat: parsed.total_fat ?? 0,
          });
        }
      } catch (e) {
        console.error('history read error', e);
        out.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), calories: 0, protein: 0, carbs: 0, fat: 0 });
      }
    }
    return out;
  }, []);

  const updateWeeklySettings = useCallback(async (updates: Partial<WeeklyGoalSettings>) => {
    const next = { ...weeklySettings, ...updates } as WeeklyGoalSettings;
    await saveSettings(next);
    await recalcWeeklySummary();
  }, [weeklySettings, saveSettings, recalcWeeklySummary]);

  useEffect(() => {
    void recalcWeeklySummary();
  }, [dailyNutrition, weeklySettings, recalcWeeklySummary]);

  const clearHealthAlerts = useCallback(() => {
    setHealthAlerts([]);
  }, []);

  return useMemo(
    () => ({
      dailyNutrition,
      isLoading,
      addMeal,
      removeMeal,
      updateGoalCalories,
      loadTodayNutrition,
      loadHistoryRange,
      weeklySettings,
      updateWeeklySettings,
      weeklySummary,
      moveCaloriesBetweenMeals,
      moveCaloriesAcrossDays,
      healthAlerts,
      clearHealthAlerts,
    }),
    [
      dailyNutrition,
      isLoading,
      addMeal,
      removeMeal,
      updateGoalCalories,
      loadTodayNutrition,
      loadHistoryRange,
      weeklySettings,
      updateWeeklySettings,
      weeklySummary,
      moveCaloriesBetweenMeals,
      moveCaloriesAcrossDays,
      healthAlerts,
      clearHealthAlerts,
    ],
  );
});