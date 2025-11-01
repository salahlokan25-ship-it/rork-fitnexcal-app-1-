import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { Plus, ChevronLeft, ChevronRight, Calendar, User, Lightbulb } from 'lucide-react-native';
import { useUser } from '@/hooks/user-store';
import { useNutrition } from '@/hooks/nutrition-store';
import CircularProgress from '@/components/CircularProgress';
import { router } from 'expo-router';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';
import type { MealEntry } from '@/types/nutrition';




export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { theme } = useTheme();
  const { dailyNutrition, isLoading } = useNutrition();
  const [selectedDate] = useState('Today');

  const handleAddFood = useCallback(() => {
    router.push('/(tabs)/scan');
  }, []);

  const dynamic = stylesWithTheme(theme);

  if (isLoading || !dailyNutrition || !user) {
    return (
      <View style={[dynamic.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[dynamic.initialLoadingText, { color: theme.colors.textMuted }]}>Loading your nutrition data...</Text>
        </View>
      </View>
    );
  }

  const calorieProgress = Math.max(0, Math.min(1, dailyNutrition.total_calories / dailyNutrition.goal_calories));
  const remainingCalories = Math.max(0, dailyNutrition.goal_calories - dailyNutrition.total_calories);

  const mealsByType = {
    breakfast: dailyNutrition.meals.filter((m) => m.meal_type === 'breakfast'),
    lunch: dailyNutrition.meals.filter((m) => m.meal_type === 'lunch'),
    dinner: dailyNutrition.meals.filter((m) => m.meal_type === 'dinner'),
  } as const;

  const getTotalCaloriesForMeal = (meals: MealEntry[]) => {
    return meals.reduce((sum, meal) => sum + (meal.food_item.calories * meal.quantity), 0);
  };

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}> 
      <ScrollView style={dynamic.scrollView} showsVerticalScrollIndicator={false} testID="home-scroll">
        <AnimatedFadeIn delay={50}>
          <View style={dynamic.header}>
            <Text style={dynamic.brandText}>FitnexCal</Text>
            
            <View style={dynamic.headerRight}>
              <View style={dynamic.dateSelector}>
                <TouchableOpacity style={dynamic.dateArrow}>
                  <ChevronLeft size={20} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
                <View style={dynamic.dateContent}>
                  <Calendar size={20} color={theme.colors.primary700} />
                  <Text style={dynamic.dateText}>{selectedDate}</Text>
                </View>
                <TouchableOpacity style={dynamic.dateArrow}>
                  <ChevronRight size={20} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity 
                style={dynamic.profileButton}
                onPress={() => router.push('/edit-profile')}
              >
                <User size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedFadeIn>





        <AnimatedFadeIn delay={120}>
          <View style={dynamic.calorieCircleContainer}>
            <CircularProgress 
              size={256} 
              strokeWidth={20} 
              progress={calorieProgress} 
              color={theme.colors.primary700} 
              backgroundColor="rgba(56, 189, 248, 0.15)"
            >
              <View style={dynamic.calorieCircleContent}>
                <Text style={dynamic.calorieCircleLabel}>Calories Remaining</Text>
                <Text style={dynamic.calorieCircleValue}>{Math.round(remainingCalories)}</Text>
                <Text style={dynamic.calorieCircleSubtext}>
                  Consumed: {Math.round(dailyNutrition.total_calories)}/{dailyNutrition.goal_calories} kcal
                </Text>
              </View>
            </CircularProgress>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={180}>
          <View style={dynamic.macrosRow}>
            <View style={dynamic.macroItem}>
              <View style={dynamic.macroCircleWrapper}>
                <CircularProgress 
                  size={96} 
                  strokeWidth={8} 
                  progress={user.goal_protein > 0 ? Math.min(1, dailyNutrition.total_protein / user.goal_protein) : 0}
                  color="#ec4899" 
                  backgroundColor="rgba(255, 255, 255, 0.1)"
                >
                  <View style={dynamic.macroCircleContent}>
                    <Text style={dynamic.macroValue}>{Math.round(dailyNutrition.total_protein)}g</Text>
                    <Text style={dynamic.macroGoal}>/{user.goal_protein}g</Text>
                  </View>
                </CircularProgress>
              </View>
              <Text style={dynamic.macroLabel}>Protein</Text>
            </View>

            <View style={dynamic.macroItem}>
              <View style={dynamic.macroCircleWrapper}>
                <CircularProgress 
                  size={96} 
                  strokeWidth={8} 
                  progress={user.goal_carbs > 0 ? Math.min(1, dailyNutrition.total_carbs / user.goal_carbs) : 0}
                  color="#f97316" 
                  backgroundColor="rgba(255, 255, 255, 0.1)"
                >
                  <View style={dynamic.macroCircleContent}>
                    <Text style={dynamic.macroValue}>{Math.round(dailyNutrition.total_carbs)}g</Text>
                    <Text style={dynamic.macroGoal}>/{user.goal_carbs}g</Text>
                  </View>
                </CircularProgress>
              </View>
              <Text style={dynamic.macroLabel}>Carbs</Text>
            </View>

            <View style={dynamic.macroItem}>
              <View style={dynamic.macroCircleWrapper}>
                <CircularProgress 
                  size={96} 
                  strokeWidth={8} 
                  progress={user.goal_fat > 0 ? Math.min(1, dailyNutrition.total_fat / user.goal_fat) : 0}
                  color="#eab308" 
                  backgroundColor="rgba(255, 255, 255, 0.1)"
                >
                  <View style={dynamic.macroCircleContent}>
                    <Text style={dynamic.macroValue}>{Math.round(dailyNutrition.total_fat)}g</Text>
                    <Text style={dynamic.macroGoal}>/{user.goal_fat}g</Text>
                  </View>
                </CircularProgress>
              </View>
              <Text style={dynamic.macroLabel}>Fats</Text>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={240}>
          <View style={dynamic.aiInsightCard}>
            <View style={dynamic.aiInsightIcon}>
              <Lightbulb size={24} color={theme.colors.primary700} />
            </View>
            <View style={dynamic.aiInsightContent}>
              <Text style={dynamic.aiInsightTitle}>Low on Protein Today?</Text>
              <Text style={dynamic.aiInsightMessage}>Consider adding a Greek yogurt snack to meet your daily goal.</Text>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={300}>
          <View style={dynamic.mealsSection}>
            <Text style={dynamic.mealsSectionTitle}>Today&apos;s Meals</Text>
            
            {(['breakfast', 'lunch', 'dinner'] as const).map((mealType) => {
              const meals = mealsByType[mealType];
              const totalCalories = getTotalCaloriesForMeal(meals);
              const icon = mealType === 'breakfast' ? '🍳' : mealType === 'lunch' ? '🥗' : '🍽️';
              
              return (
                <TouchableOpacity 
                  key={mealType} 
                  style={dynamic.mealRow}
                  onPress={() => router.push('/(tabs)/scan')}
                >
                  <View style={dynamic.mealRowLeft}>
                    <View style={dynamic.mealIcon}>
                      <Text style={dynamic.mealIconText}>{icon}</Text>
                    </View>
                    <Text style={dynamic.mealName}>
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </Text>
                  </View>
                  <Text style={dynamic.mealCalories}>{Math.round(totalCalories)} kcal</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </AnimatedFadeIn>
      </ScrollView>

      <TouchableOpacity 
        style={[dynamic.fabButton, { bottom: insets.bottom + 24, right: 24 }]}
        onPress={handleAddFood}
      >
        <Plus size={40} color="#0f172a" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  initialLoadingText: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dateArrow: {
    padding: 4,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    letterSpacing: -0.5,
  },
  appLogo: {
    width: 56,
    height: 56,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: -0.3,
  },
  calorieCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  calorieCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieCircleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.primary700,
    marginBottom: 4,
  },
  calorieCircleValue: {
    fontSize: 60,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 72,
  },
  calorieCircleSubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  macroCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  macroGoal: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  aiInsightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 16,
    backgroundColor: `${Theme.colors.primary700}33`,
    borderWidth: 1,
    borderColor: `${Theme.colors.primary700}33`,
  },
  aiInsightIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Theme.colors.primary700}33`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiInsightContent: {
    flex: 1,
    gap: 4,
  },
  aiInsightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
  },
  aiInsightMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  mealsSection: {
    marginHorizontal: 20,
    marginBottom: 120,
  },
  mealsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mealRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Theme.colors.primary700}1A`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealIconText: {
    fontSize: 24,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  fabButton: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary700,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 0,
    gap: 6,
  },
  dayItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 64,
    borderRadius: 12,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  dayItemActive: {
    backgroundColor: Theme.colors.primary700,
    borderColor: Theme.colors.primary700,
  },
  dayInitial: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    marginBottom: 6,
  },
  dayInitialActive: {
    color: '#fff',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  dayNumberActive: {
    color: '#fff',
  },
  calorieCard: {
    backgroundColor: Theme.colors.primary700,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  calorieContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remainingCalories: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: -0.5,
  },
  remainingLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  calorieStats: {
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    minWidth: 60,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bufferCard: {
    backgroundColor: Theme.colors.primary700,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  bufferHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bufferTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  bufferControlsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 8 },
  bufferActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  bufferInput: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    color: Theme.colors.text,
    fontSize: 14,
  },
  bufferMoveBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Theme.colors.primary700, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  bufferMoveText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  macrosCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.primary700,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    paddingVertical: 18,
    gap: 10,
    shadowColor: Theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickAddText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  suggestionCard: {
    width: 280,
    marginLeft: 20,
  },
  mealsCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 24,
    paddingVertical: 16,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  mealSection: {
    paddingTop: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    marginTop: 4,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.2,
  },
  emptyMealText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'left',
    fontStyle: 'italic',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginHorizontal: 20,
    marginTop: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text,
  },
  barcodeButton: {
    padding: 4,
  },
  searchResults: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 12,
  },
  searchResultItem: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },

  addRectButton: {
    marginTop: 8,
    marginHorizontal: 12,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.primary700,
    backgroundColor: Theme.colors.primary700,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: 0.15,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  addRectText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.2,
  },
  mealPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: -8,
    marginBottom: 12,
  },
  mealPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Theme.colors.accent,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  mealPillActive: {
    backgroundColor: '#EEF4FF',
    borderColor: Theme.colors.primary700,
  },
  mealPillText: {
    fontSize: 12,
    color: Theme.colors.text,
    fontWeight: '600',
  },
  mealPillTextActive: {
    color: Theme.colors.primary700,
  },
  scanPill: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#eef5ff',
    borderWidth: 1,
    borderColor: Theme.colors.primary700,
  },
  scanPillText: {
    fontSize: 12,
    color: Theme.colors.primary700,
    fontWeight: '700',
  },
  resultActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  primaryAddButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Theme.colors.primary700,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryAddButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryScanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  secondaryScanButtonText: {
    color: Theme.colors.primary700,
    fontSize: 14,
    fontWeight: '700',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 12,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  workoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutIcon: {
    fontSize: 24,
  },
  workoutContent: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 6,
  },
  workoutDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  workoutDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutDetailText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  workoutCalories: {
    alignItems: 'flex-end',
  },
  workoutTime: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 6,
  },
  caloriesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  caloriesIcon: {
    fontSize: 12,
  },
  caloriesText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },

  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
    alignSelf: 'stretch',
  },
  modalLogo: {
    width: 32,
    height: 32,
  },
  modalBrandText: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.primary700,
    flex: 1,
  },
  modalStreakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalStreakEmoji: {
    fontSize: 14,
  },
  modalStreakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EA580C',
  },
  fireIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  fireIcon: {
    fontSize: 120,
  },
  fireNumber: {
    position: 'absolute',
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streakTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#F97316',
    marginBottom: 32,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 0,
    gap: 8,
  },
  weekDayItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  weekDayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.textMuted,
  },
  weekDayLabelActive: {
    color: '#F97316',
  },
  weekDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  weekDayCircleActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  weekDayCheck: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  streakMessage: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  continueButton: {
    backgroundColor: '#000',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  alertsCard: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  alertsTitle: { fontSize: 16, fontWeight: '800', color: '#9A3412' },
  alertsClearBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#9A3412' },
  alertsClearText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  alertPill: { width: 260, marginRight: 10, borderRadius: 12, padding: 12 },
  alertPillWarn: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  alertPillCritical: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5' },
  alertPillTitle: { fontSize: 14, fontWeight: '800', color: Theme.colors.text, marginBottom: 4 },
  alertPillDesc: { fontSize: 12, color: Theme.colors.textMuted, marginBottom: 6 },
  alertFoodName: { fontSize: 12, color: Theme.colors.text, fontStyle: 'italic' },

  voiceModalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  voiceModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  voiceModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Theme.colors.text,
  },
  voiceModalLabel: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  voiceInput: {
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    minHeight: 96,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  voiceModalButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  voiceSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    backgroundColor: Theme.colors.surface,
  },
  voiceSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary700,
  },
  voicePrimaryBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary700,
  },
  voicePrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
