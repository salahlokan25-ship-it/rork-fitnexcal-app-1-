import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Platform, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { useQuery } from '@tanstack/react-query';
import { Plus, TrendingUp, Target, Search, BarChart3, Drumstick, Wheat, Egg, Zap, Clock, ArrowLeftRight, Wallet, Settings, Mic, ChevronLeft, ChevronRight, ChevronDown, ScanBarcode } from 'lucide-react-native';
import { useUser } from '@/hooks/user-store';
import { useNutrition } from '@/hooks/nutrition-store';
import { useWorkout } from '@/hooks/workout-store';
import { useFoodSuggestions } from '@/hooks/food-suggestions';
import { searchFoods } from '@/services/food-api';
import CircularProgress from '@/components/CircularProgress';
import MacroCircleStat from '@/components/MacroCircleStat';
import FoodCard from '@/components/FoodCard';
import MealCard from '@/components/MealCard';
import { router } from 'expo-router';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';
import type { FoodItem, MealEntry, MealType } from '@/types/nutrition';


function getWeekDays() {
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayInitials = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return {
      initial: dayInitials[i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

function getMonthYear() {
  const today = new Date();
  return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, streakData, updateStreak } = useUser();
  const { theme } = useTheme();
  const { dailyNutrition, isLoading, removeMeal, updateGoalCalories, addMeal, weeklySummary, moveCaloriesBetweenMeals, moveCaloriesAcrossDays, healthAlerts, clearHealthAlerts } = useNutrition();
  const { todayWorkouts } = useWorkout();
  const { suggestions } = useFoodSuggestions();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealEntry['meal_type']>('lunch');
  const [fromMeal, setFromMeal] = useState<MealType>('breakfast');
  const [toMeal, setToMeal] = useState<MealType>('dinner');
  const [moveCalories, setMoveCalories] = useState<string>('200');
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [expandedMeal, setExpandedMeal] = useState<MealType | null>(null);

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [crossDayCalories, setCrossDayCalories] = useState<string>('200');
  const [showCrossDayModal, setShowCrossDayModal] = useState<boolean>(false);

  const scrollRef = useRef<ScrollView | null>(null);
  const searchInputRef = useRef<TextInput | null>(null);

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['food-search-home', searchQuery],
    queryFn: () => searchFoods(searchQuery),
    enabled: searchQuery.length > 2,
  });

  useEffect(() => {
    if (user?.goal_calories && dailyNutrition?.goal_calories && user.goal_calories !== dailyNutrition.goal_calories) {
      updateGoalCalories(user.goal_calories);
    }
  }, [user?.goal_calories, dailyNutrition?.goal_calories, updateGoalCalories]);

  useEffect(() => {
    if (dailyNutrition && dailyNutrition.meals.length > 0) {
      updateStreak();
    }
  }, [dailyNutrition, updateStreak]);

  const handleJumpToSearch = useCallback((mealType?: MealEntry['meal_type']) => {
    if (mealType) setSelectedMealType(mealType);
    try {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      setTimeout(() => {
        searchInputRef.current?.focus?.();
      }, Platform.OS === 'web' ? 0 : 250);
    } catch (e) {
      console.log('Scroll to search failed', e);
    }
  }, []);

  const handleAddFood = useCallback(async (food: FoodItem) => {
    try {
      await addMeal(food, 1, selectedMealType);
      console.log(`[AddFood] Added ${food.name} to ${selectedMealType}`);
    } catch (e) {
      console.log('Add food failed', e);
    }
  }, [addMeal, selectedMealType]);

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
    snack: dailyNutrition.meals.filter((m) => m.meal_type === 'snack'),
  } as const;

  const mealIcons = {
    breakfast: '🍳',
    lunch: '🥗',
    dinner: '🍝',
    snack: '🥨',
  } as const;

  const getMealCalories = (mealType: MealType) => {
    return mealsByType[mealType].reduce((sum, meal) => sum + (meal.food_item?.calories || 0) * meal.quantity, 0);
  };

  return (
    <View style={[dynamic.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}> 
      <View style={dynamic.headerBar}>
        <View style={dynamic.logoWrapper}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/yvqsxa2lgqrnlzwq04xdx' }} 
            style={dynamic.appLogo} 
            resizeMode="contain"
          />
        </View>
        <Text style={dynamic.headerTitle}>Home</Text>
        <TouchableOpacity 
          style={dynamic.settingsBtn}
          onPress={() => router.push('/(tabs)/settings')}
          testID="settings-btn"
        >
          <Settings size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={dynamic.scrollView} showsVerticalScrollIndicator={false} testID="home-scroll" contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={dynamic.calendarSection}>
          <View style={dynamic.monthHeader}>
            <Text style={dynamic.monthText}>{getMonthYear()}</Text>
            <View style={dynamic.monthNav}>
              <TouchableOpacity style={dynamic.monthNavBtn}>
                <ChevronLeft size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity style={dynamic.monthNavBtn}>
                <ChevronRight size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={dynamic.calendarWeek}>
            {getWeekDays().map((day, index) => {
              const isToday = day.isToday;
              return (
                <View key={index} style={dynamic.dayColumn}>
                  <Text style={dynamic.dayInitial}>{day.initial}</Text>
                  <TouchableOpacity
                    style={[dynamic.dayCircle, isToday && dynamic.dayCircleActive]}
                    testID={`day-${index}`}
                  >
                    <Text style={[dynamic.dayNumber, isToday && dynamic.dayNumberActive]}>{day.date}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <View style={dynamic.progressCard}>
          <View style={dynamic.progressHeader}>
            <Text style={dynamic.progressTitle}>Daily Progress</Text>
            <View style={dynamic.progressActions}>
              <TouchableOpacity 
                style={dynamic.addBtn}
                onPress={() => handleJumpToSearch()}
                testID="add-food-btn"
              >
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamic.progressCircleWrapper}>
            <CircularProgress size={160} strokeWidth={12} progress={calorieProgress} color={theme.colors.primary700} backgroundColor={theme.colors.cardBorder}>
              <Text style={dynamic.bigCalories}>{Math.round(dailyNutrition.total_calories)}</Text>
              <Text style={dynamic.goalCalories}>/ {dailyNutrition.goal_calories} kcal</Text>
            </CircularProgress>
          </View>

          <View style={dynamic.macrosRow}>
            <View style={dynamic.macroItem}>
              <View style={dynamic.macroCircleWrapper}>
                <CircularProgress size={80} strokeWidth={12} progress={dailyNutrition.total_carbs / user.goal_carbs} color="#F59E0B" backgroundColor={theme.colors.cardBorder}>
                  <Text style={dynamic.macroValue}>{Math.round(dailyNutrition.total_carbs)}g</Text>
                </CircularProgress>
              </View>
              <Text style={dynamic.macroLabel}>Carbs</Text>
              <Text style={dynamic.macroGoal}>of {user.goal_carbs}g</Text>
            </View>

            <View style={dynamic.macroItem}>
              <View style={dynamic.macroCircleWrapper}>
                <CircularProgress size={80} strokeWidth={12} progress={dailyNutrition.total_protein / user.goal_protein} color="#EF4444" backgroundColor={theme.colors.cardBorder}>
                  <Text style={dynamic.macroValue}>{Math.round(dailyNutrition.total_protein)}g</Text>
                </CircularProgress>
              </View>
              <Text style={dynamic.macroLabel}>Protein</Text>
              <Text style={dynamic.macroGoal}>of {user.goal_protein}g</Text>
            </View>

            <View style={dynamic.macroItem}>
              <View style={dynamic.macroCircleWrapper}>
                <CircularProgress size={80} strokeWidth={12} progress={dailyNutrition.total_fat / user.goal_fat} color="#10B981" backgroundColor={theme.colors.cardBorder}>
                  <Text style={dynamic.macroValue}>{Math.round(dailyNutrition.total_fat)}g</Text>
                </CircularProgress>
              </View>
              <Text style={dynamic.macroLabel}>Fat</Text>
              <Text style={dynamic.macroGoal}>of {user.goal_fat}g</Text>
            </View>
          </View>
        </View>

        <View style={dynamic.searchSection}>
          <View style={dynamic.newSearchBar}>
            <Search size={20} color="#666" style={dynamic.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={dynamic.newSearchInput}
              placeholder="Search and scan food"
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              testID="home-search-input"
            />
            <TouchableOpacity 
              style={dynamic.scanIconBtn}
              onPress={() => router.push({ pathname: '/(tabs)/scan', params: { mealType: selectedMealType } })}
            >
              <ScanBarcode size={20} color={theme.colors.primary700} />
            </TouchableOpacity>
          </View>
        </View>

        {searchQuery.length > 2 && (
          <View style={dynamic.searchResults}>
            <Text style={dynamic.searchResultsTitle}>Search Results</Text>
            {isSearching ? (
              <Text style={dynamic.loadingText}>Searching...</Text>
            ) : searchResults.length === 0 ? (
              <Text style={dynamic.emptyText}>No foods found for &quot;{searchQuery}&quot;</Text>
            ) : (
              <FlatList
                data={searchResults.slice(0, 8)}
                renderItem={({ item }) => (
                  <View style={dynamic.searchResultItem}>
                    <FoodCard food={item as FoodItem} onPress={() => handleAddFood(item as FoodItem)} />
                    <View style={dynamic.resultActionsRow}>
                      <TouchableOpacity
                        style={dynamic.primaryAddButton}
                        onPress={() => handleAddFood(item as FoodItem)}
                        testID={`add-${selectedMealType}-${(item as FoodItem).id}`}
                      >
                        <Plus size={16} color="#fff" />
                        <Text style={dynamic.primaryAddButtonText}>Add to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                keyExtractor={(item) => (item as FoodItem).id}
                showsVerticalScrollIndicator={false}
                testID="home-search-results"
              />
            )}
          </View>
        )}

        <View style={dynamic.moveCaloriesCard}>
          <View style={dynamic.moveCaloriesRow}>
            <View style={dynamic.swapIcon}>
              <ArrowLeftRight size={20} color={theme.colors.primary700} />
            </View>
            <View style={dynamic.moveCaloriesText}>
              <Text style={dynamic.moveCaloriesTitle}>Move Calories</Text>
              <Text style={dynamic.moveCaloriesSubtitle}>Between Meals</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCrossDayModal(true)} testID="open-cross-day">
              <Text style={dynamic.moveBtn}>Move</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={dynamic.todayMealsCard}>
          <Text style={dynamic.todayMealsTitle}>Today&apos;s Meals</Text>
          
          {Object.entries(mealsByType).map(([mealType, meals]) => {
            const isExpanded = expandedMeal === mealType;
            const totalCalories = getMealCalories(mealType as MealType);
            const progress = totalCalories / (dailyNutrition.goal_calories / 4);

            return (
              <View key={mealType} style={dynamic.mealAccordion}>
                <TouchableOpacity 
                  style={dynamic.mealAccordionHeader}
                  onPress={() => setExpandedMeal(isExpanded ? null : mealType as MealType)}
                  testID={`meal-header-${mealType}`}
                >
                  <View style={dynamic.mealHeaderLeft}>
                    <Text style={dynamic.mealEmoji}>{mealIcons[mealType as MealType]}</Text>
                    <View style={dynamic.mealInfo}>
                      <Text style={dynamic.mealName}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                      <View style={dynamic.mealStats}>
                        <Text style={dynamic.mealCalories}>{Math.round(totalCalories)} kcal</Text>
                        <View style={dynamic.mealProgressBar}>
                          <View style={[dynamic.mealProgressFill, { width: `${Math.min(progress * 100, 100)}%` }]} />
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={dynamic.mealHeaderRight}>
                    <TouchableOpacity 
                      style={dynamic.mealAddBtn}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleJumpToSearch(mealType as MealEntry['meal_type']);
                      }}
                      testID={`add-to-${mealType}`}
                    >
                      <Plus size={16} color="#fff" />
                    </TouchableOpacity>
                    <ChevronDown 
                      size={20} 
                      color={theme.colors.textMuted} 
                      style={[dynamic.chevron, isExpanded && dynamic.chevronExpanded]}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && meals.length > 0 && (
                  <View style={dynamic.mealContent}>
                    {meals.map((meal) => (
                      <View key={meal.id} style={dynamic.mealItem}>
                        <Text style={dynamic.mealItemName}>{meal.food_item.name}</Text>
                        <Text style={dynamic.mealItemCalories}>{Math.round(meal.food_item.calories * meal.quantity)} kcal</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {suggestions.length > 0 && (
          <View style={dynamic.suggestionsSection}>
            <Text style={dynamic.suggestionsTitle}>Today&apos;s AI Suggestions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={dynamic.suggestionsScroll}>
              {suggestions.slice(0, 5).map((food) => (
                <TouchableOpacity 
                  key={food.id} 
                  style={dynamic.suggestionCard}
                  onPress={() => handleAddFood(food)}
                >
                  {food.image_url ? (
                    <Image source={{ uri: food.image_url }} style={dynamic.suggestionImage} />
                  ) : (
                    <View style={dynamic.suggestionImagePlaceholder}>
                      <Text style={dynamic.suggestionEmoji}>🍽️</Text>
                    </View>
                  )}
                  <View style={dynamic.suggestionInfo}>
                    <Text style={dynamic.suggestionName} numberOfLines={1}>{food.name}</Text>
                    <Text style={dynamic.suggestionCalories}>~ {Math.round(food.calories)} kcal</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={dynamic.progressJourney}>
          <Text style={dynamic.progressJourneyTitle}>Your Progress Journey</Text>
          <View style={dynamic.progressJourneyContent}>
            <View style={dynamic.trendingIcon}>
              <TrendingUp size={32} color={theme.colors.primary700} />
            </View>
            <View style={dynamic.progressJourneyText}>
              <Text style={dynamic.progressJourneyHeading}>On track to reach your goal!</Text>
              <Text style={dynamic.progressJourneySubtitle}>2 weeks to next milestone</Text>
            </View>
            <TouchableOpacity>
              <Text style={dynamic.viewReportLink}>View Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showStreakModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStreakModal(false)}
      >
        <TouchableOpacity 
          style={dynamic.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStreakModal(false)}
        >
          <View style={dynamic.modalContent}>
            <View style={dynamic.modalHeader}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5gxbp9ngwu9gz1ijle4ku' }}
                style={dynamic.modalLogo}
                resizeMode="contain"
              />
              <Text style={dynamic.modalBrandText}>FitnexCal</Text>
              <View style={dynamic.modalStreakBadge}>
                <Text style={dynamic.modalStreakEmoji}>🔥</Text>
                <Text style={dynamic.modalStreakNumber}>{streakData.currentStreak}</Text>
              </View>
            </View>

            <View style={dynamic.fireIconContainer}>
              <Text style={dynamic.fireIcon}>🔥</Text>
              <Text style={dynamic.fireNumber}>{streakData.currentStreak}</Text>
            </View>

            <Text style={dynamic.streakTitle}>{streakData.currentStreak} Day streak</Text>

            <View style={dynamic.weekDaysRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                const isLogged = streakData.weeklyLogs[index];
                const isToday = new Date().getDay() === index;
                return (
                  <View key={index} style={dynamic.weekDayItem}>
                    <Text style={[dynamic.weekDayLabel, isToday && dynamic.weekDayLabelActive]}>{day}</Text>
                    <View style={[dynamic.weekDayCircle, isLogged && dynamic.weekDayCircleActive]}>
                      {isLogged && <Text style={dynamic.weekDayCheck}>✓</Text>}
                    </View>
                  </View>
                );
              })}
            </View>

            <Text style={dynamic.streakMessage}>
              You&apos;re on fire! Every day matters for hitting your goal!
            </Text>

            <TouchableOpacity
              style={dynamic.continueButton}
              onPress={() => setShowStreakModal(false)}
              testID="streak-continue"
            >
              <Text style={dynamic.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showCrossDayModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCrossDayModal(false)}
      >
        <TouchableOpacity style={dynamic.modalOverlay} activeOpacity={1} onPress={() => setShowCrossDayModal(false)}>
          <TouchableOpacity style={dynamic.voiceModalContent} activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={dynamic.voiceModalHeader}>
              <ArrowLeftRight size={24} color={theme.colors.primary700} />
              <Text style={dynamic.voiceModalTitle}>Move calories across days</Text>
            </View>
            <Text style={dynamic.voiceModalLabel}>From date (YYYY-MM-DD)</Text>
            <TextInput
              style={dynamic.voiceInput}
              value={fromDate}
              onChangeText={setFromDate}
              placeholder={dailyNutrition.date}
              placeholderTextColor={theme.colors.textMuted}
              testID="from-date-input"
            />
            <Text style={dynamic.voiceModalLabel}>To date (YYYY-MM-DD)</Text>
            <TextInput
              style={dynamic.voiceInput}
              value={toDate}
              onChangeText={setToDate}
              placeholder={dailyNutrition.date}
              placeholderTextColor={theme.colors.textMuted}
              testID="to-date-input"
            />
            <Text style={dynamic.voiceModalLabel}>Calories to move</Text>
            <TextInput
              style={dynamic.voiceInput}
              value={crossDayCalories}
              onChangeText={setCrossDayCalories}
              keyboardType="numeric"
              placeholder="200"
              placeholderTextColor={theme.colors.textMuted}
              testID="cross-calories-input"
            />
            <View style={dynamic.voiceModalButtons}>
              <TouchableOpacity
                style={dynamic.voiceSecondaryBtn}
                onPress={() => setShowCrossDayModal(false)}
                testID="cross-cancel"
              >
                <Text style={dynamic.voiceSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={dynamic.voicePrimaryBtn}
                onPress={async () => {
                  const cals = Math.max(0, parseInt(crossDayCalories || '0', 10));
                  if (!fromDate || !toDate || cals <= 0) return;
                  await moveCaloriesAcrossDays(fromDate, toDate, cals);
                  setShowCrossDayModal(false);
                }}
                testID="cross-move"
              >
                <Text style={dynamic.voicePrimaryText}>Move</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    letterSpacing: -0.5,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: Theme.colors.primary700,
    letterSpacing: -0.3,
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

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  } as const,
  logoWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  appLogo: {
    width: 48,
    height: 48,
  } as const,
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    flex: 1,
    textAlign: 'center',
  } as const,
  settingsBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,

  calendarSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  } as const,
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as const,
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  } as const,
  monthNav: {
    flexDirection: 'row',
    gap: 8,
  } as const,
  monthNavBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  } as const,
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  } as const,
  dayCircleActive: {
    backgroundColor: Theme.colors.primary700,
  } as const,

  progressCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as const,
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  } as const,
  progressTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
  } as const,
  progressActions: {
    flexDirection: 'row',
    gap: 8,
  } as const,
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.primary700,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  } as const,
  progressCircleWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  } as const,
  bigCalories: {
    fontSize: 32,
    fontWeight: '700',
    color: Theme.colors.text,
  } as const,
  goalCalories: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 4,
  } as const,
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  } as const,
  macroItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  } as const,
  macroCircleWrapper: {
    marginBottom: 4,
  } as const,
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
  } as const,
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text,
  } as const,
  macroGoal: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  } as const,

  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 0,
  } as const,
  newSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 999,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as const,
  searchIcon: {
    marginRight: 8,
  } as const,
  newSearchInput: {
    flex: 1,
    fontSize: 14,
    color: Theme.colors.text,
  } as const,
  scanIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,

  moveCaloriesCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as const,
  moveCaloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as const,
  swapIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  moveCaloriesText: {
    flex: 1,
  } as const,
  moveCaloriesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
  } as const,
  moveCaloriesSubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  } as const,
  moveBtn: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary700,
  } as const,

  todayMealsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as const,
  todayMealsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 16,
  } as const,
  mealAccordion: {
    marginBottom: 4,
  } as const,
  mealAccordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  } as const,
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  } as const,
  mealEmoji: {
    fontSize: 32,
  } as const,
  mealInfo: {
    flex: 1,
  } as const,
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  } as const,
  mealStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as const,
  mealCalories: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  } as const,
  mealProgressBar: {
    width: 80,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.cardBorder,
    overflow: 'hidden',
  } as const,
  mealProgressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary700,
    borderRadius: 2,
  } as const,
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as const,
  mealAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  chevron: {
    transform: [{ rotate: '0deg' }],
  } as const,
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  } as const,
  mealContent: {
    paddingLeft: 44,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    marginTop: 8,
  } as const,
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  } as const,
  mealItemName: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  } as const,
  mealItemCalories: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text,
  } as const,

  suggestionsSection: {
    marginTop: 16,
    marginBottom: 16,
  } as const,
  suggestionsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    paddingHorizontal: 16,
    marginBottom: 16,
  } as const,
  suggestionsScroll: {
    paddingLeft: 16,
  } as const,
  suggestionImage: {
    width: '100%',
    height: 112,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  } as const,
  suggestionImagePlaceholder: {
    width: '100%',
    height: 112,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: Theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  suggestionEmoji: {
    fontSize: 48,
  } as const,
  suggestionInfo: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  } as const,
  suggestionName: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 2,
  } as const,
  suggestionCalories: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  } as const,

  progressJourney: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  } as const,
  progressJourneyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 16,
  } as const,
  progressJourneyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  } as const,
  trendingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(19, 127, 236, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  } as const,
  progressJourneyText: {
    flex: 1,
  } as const,
  progressJourneyHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  } as const,
  progressJourneySubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  } as const,
  viewReportLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary700,
  } as const,
});
