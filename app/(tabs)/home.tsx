import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Platform, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { useQuery } from '@tanstack/react-query';
import { Plus, TrendingUp, Target, Search, BarChart3, Drumstick, Wheat, Egg, Zap, Clock, ArrowLeftRight, Wallet, Trees, HandHeart, Globe, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react-native';
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
import { useKarma } from '@/hooks/karma-store';

function getWeekDays() {
  const today = new Date();
  const currentDay = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDay);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dayInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return {
      initial: dayInitials[i],
      date: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, streakData, updateStreak } = useUser();
  const { theme } = useTheme();
  const { dailyNutrition, isLoading, removeMeal, updateGoalCalories, addMeal, weeklySummary, moveCaloriesBetweenMeals, moveCaloriesAcrossDays, healthAlerts, clearHealthAlerts } = useNutrition();
  const { todayWorkouts } = useWorkout();
  const { units_week, kcal_saved_week, last_action, daily_saved, daily_trend } = useKarma();
  const { suggestions } = useFoodSuggestions();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<MealEntry['meal_type']>('lunch');
  const [fromMeal, setFromMeal] = useState<MealType>('breakfast');
  const [toMeal, setToMeal] = useState<MealType>('dinner');
  const [moveCalories, setMoveCalories] = useState<string>('200');
  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);

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

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}> 
      <ScrollView ref={scrollRef} style={dynamic.scrollView} showsVerticalScrollIndicator={false} testID="home-scroll">
        <AnimatedFadeIn delay={50}>
          <View style={dynamic.header}>
            <View style={dynamic.brandRow}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/5gxbp9ngwu9gz1ijle4ku' }}
                style={dynamic.appLogo}
                resizeMode="contain"
                accessibilityLabel="App logo"
                testID="home-app-logo"
              />
              <Text style={dynamic.brandText} testID="brand-title" accessibilityLabel="FitnexCal brand">FitnexCal</Text>
            </View>
            <Text style={dynamic.greeting}>Hello, {user.name}!</Text>
            
            <TouchableOpacity 
              style={dynamic.streakBadge}
              onPress={() => setShowStreakModal(true)}
              testID="streak-badge"
            >
              <Text style={dynamic.streakEmoji}>🔥</Text>
              <Text style={dynamic.streakNumber}>{streakData.currentStreak}</Text>
            </TouchableOpacity>

            <View style={dynamic.calendarWeek}>
              {getWeekDays().map((day, index) => {
                const isToday = day.isToday;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[dynamic.dayItem, isToday && dynamic.dayItemActive]}
                    testID={`day-${index}`}
                  >
                    <Text style={[dynamic.dayInitial, isToday && dynamic.dayInitialActive]}>{day.initial}</Text>
                    <Text style={[dynamic.dayNumber, isToday && dynamic.dayNumberActive]}>{day.date}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </AnimatedFadeIn>

        {healthAlerts.length > 0 && (
          <AnimatedFadeIn delay={30}>
            <View style={dynamic.alertsCard} testID="health-alerts">
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={dynamic.alertsTitle}>Health alerts</Text>
                <TouchableOpacity onPress={clearHealthAlerts} style={dynamic.alertsClearBtn} testID="health-alerts-clear">
                  <Text style={dynamic.alertsClearText}>Clear</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {healthAlerts.slice(0, 4).map((a) => (
                  <View key={a.id} style={[dynamic.alertPill, a.severity === 'critical' ? dynamic.alertPillCritical : dynamic.alertPillWarn]}>
                    <Text style={dynamic.alertPillTitle}>{a.title}</Text>
                    <Text style={dynamic.alertPillDesc}>{a.message}</Text>
                    <Text style={dynamic.alertFoodName}>Item: {a.food.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </AnimatedFadeIn>
        )}

        <AnimatedFadeIn delay={120}>
          <View style={dynamic.searchContainer}>
            <View style={dynamic.searchBar}>
              <Search size={20} color="#666" />
              <TextInput
                ref={searchInputRef}
                style={dynamic.searchInput}
                placeholder="Search for a food"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                testID="home-search-input"
                accessibilityLabel="Search for a food"
              />
              <TouchableOpacity style={dynamic.barcodeButton} onPress={() => router.push({ pathname: '/(tabs)/scan', params: { mealType: selectedMealType } })}>
                <BarChart3 size={20} color={theme.colors.primary700} />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedFadeIn>

        <View style={dynamic.mealPickerRow}>
          {(['breakfast','lunch','dinner','snack'] as MealEntry['meal_type'][]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[dynamic.mealPill, selectedMealType === t ? dynamic.mealPillActive : undefined]}
              onPress={() => setSelectedMealType(t)}
              testID={`meal-pill-${t}`}
              accessibilityLabel={`Select ${t}`}
            >
              <Text style={[dynamic.mealPillText, selectedMealType === t ? dynamic.mealPillTextActive : undefined]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={dynamic.scanPill}
            onPress={() => router.push({ pathname: '/(tabs)/scan', params: { mealType: selectedMealType } })}
            testID="scan-from-search"
          >
            <BarChart3 size={16} color={theme.colors.primary700} />
            <Text style={dynamic.scanPillText}>Scan</Text>
          </TouchableOpacity>
        </View>

        {searchQuery.length > 2 && (
          <AnimatedFadeIn delay={180}>
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
                          accessibilityLabel={`Add to ${selectedMealType}`}
                        >
                          <Plus size={16} color="#fff" />
                          <Text style={dynamic.primaryAddButtonText}>Add to {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={dynamic.secondaryScanButton}
                          onPress={() => router.push({ pathname: '/(tabs)/scan', params: { mealType: selectedMealType } })}
                          testID={`scan-for-${(item as FoodItem).id}`}
                        >
                          <BarChart3 size={16} color={theme.colors.primary700} />
                          <Text style={dynamic.secondaryScanButtonText}>Scan</Text>
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
          </AnimatedFadeIn>
        )}

        <AnimatedFadeIn delay={210}>
          <View style={dynamic.karmaCard} testID="karma-card">
            <View style={dynamic.karmaHeaderRow}>
              <Text style={dynamic.karmaTitle}>Calorie Karma</Text>
              <View style={dynamic.karmaUnitsPill}>
                <Text style={dynamic.karmaUnitsText}>{units_week} u</Text>
              </View>
            </View>
            <View style={dynamic.karmaBodyRow}>
              <View style={dynamic.karmaLeft}>
                <Text style={dynamic.karmaSubtitle}>Every 100 kcal saved turns into impact</Text>
                <Text style={dynamic.karmaSavedText}>{kcal_saved_week} kcal saved this week</Text>
                <View style={dynamic.karmaTodayRow}>
                  {daily_trend === 'up' ? (<ArrowUpRight size={14} color="#10B981" />) : daily_trend === 'down' ? (<ArrowDownRight size={14} color="#EF4444" />) : (<Minus size={14} color={theme.colors.textMuted} />)}
                  <Text style={dynamic.karmaTodayText}>Today: {daily_saved} kcal</Text>
                </View>
                {last_action ? (
                  <View style={dynamic.karmaImpactRow}>
                    {last_action.action === 'reforestation' ? (
                      <Trees size={18} color="#16A34A" />
                    ) : last_action.action === 'carbon_offset' ? (
                      <Globe size={18} color="#0EA5E9" />
                    ) : (
                      <HandHeart size={18} color="#F97316" />
                    )}
                    <Text style={dynamic.karmaImpactText}>{last_action.message}</Text>
                  </View>
                ) : (
                  <View style={dynamic.karmaImpactRow}>
                    <Text style={dynamic.karmaImpactText}>Make healthy choices to unlock impact</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={220}>
          <View style={dynamic.calorieCard}>
            <Text style={dynamic.cardTitle}>Calories</Text>
            <Text style={dynamic.cardSubtitle}>Remaining = Goal - Food</Text>

            <View style={dynamic.calorieContent}>
              <CircularProgress size={130} strokeWidth={10} progress={calorieProgress} color={theme.colors.primary700} backgroundColor={theme.colors.accent}>
                <Text style={dynamic.remainingCalories}>{remainingCalories}</Text>
                <Text style={dynamic.remainingLabel}>Remaining</Text>
              </CircularProgress>

              <View style={dynamic.calorieStats}>
                <View style={dynamic.statItem}>
                  <Target size={16} color="#fff" />
                  <Text style={dynamic.statLabel}>Base Goal</Text>
                  <Text style={dynamic.statValue}>{dailyNutrition.goal_calories}</Text>
                </View>
                <View style={dynamic.statItem}>
                  <TrendingUp size={16} color="#fff" />
                  <Text style={dynamic.statLabel}>Food</Text>
                  <Text style={dynamic.statValue}>{Math.round(dailyNutrition.total_calories)}</Text>
                </View>
                {weeklySummary && (
                  <View style={dynamic.statItem}>
                    <Wallet size={16} color={weeklySummary.buffer_balance >= 0 ? '#10B981' : '#EF4444'} />
                    <Text style={dynamic.statLabel}>Weekly buffer</Text>
                    <Text style={[dynamic.statValue, { color: weeklySummary.buffer_balance >= 0 ? '#10B981' : '#EF4444' }]}>
                      {weeklySummary.buffer_balance}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={260}>
          <View style={dynamic.bufferCard}>
            <View style={dynamic.bufferHeader}>
              <Text style={dynamic.bufferTitle}>Move calories between meals</Text>
              <TouchableOpacity onPress={() => setShowCrossDayModal(true)} testID="open-cross-day">
                <Text style={{ color: '#fff', fontWeight: '700' }}>Across days</Text>
              </TouchableOpacity>
            </View>
            <View style={dynamic.bufferControlsRow}>
              {(['breakfast','lunch','dinner','snack'] as MealType[]).map((t) => (
                <TouchableOpacity key={`from-${t}`} style={[dynamic.mealPill, fromMeal === t && dynamic.mealPillActive]} onPress={() => setFromMeal(t)} testID={`from-pill-${t}`}>
                  <Text style={[dynamic.mealPillText, fromMeal === t && dynamic.mealPillTextActive]}>{t.slice(0,1).toUpperCase()+t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
              <ArrowLeftRight size={16} color={theme.colors.textMuted} />
              {(['breakfast','lunch','dinner','snack'] as MealType[]).map((t) => (
                <TouchableOpacity key={`to-${t}`} style={[dynamic.mealPill, toMeal === t && dynamic.mealPillActive]} onPress={() => setToMeal(t)} testID={`to-pill-${t}`}>
                  <Text style={[dynamic.mealPillText, toMeal === t && dynamic.mealPillTextActive]}>{t.slice(0,1).toUpperCase()+t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={dynamic.bufferActionsRow}>
              <TextInput
                style={dynamic.bufferInput}
                value={moveCalories}
                onChangeText={setMoveCalories}
                keyboardType="numeric"
                placeholder="200"
                placeholderTextColor={theme.colors.textMuted}
                testID="move-calories-input"
              />
              <TouchableOpacity
                style={dynamic.bufferMoveBtn}
                onPress={() => moveCaloriesBetweenMeals(fromMeal, toMeal, Math.max(0, parseInt(moveCalories || '0', 10)))}
                testID="move-calories-btn"
              >
                <ArrowLeftRight size={16} color="#fff" />
                <Text style={dynamic.bufferMoveText}>Move</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamic.macrosCard}>
            <MacroCircleStat
              type="protein"
              value={dailyNutrition.total_protein}
              goal={user.goal_protein}
              color="#F97373"
              accent="#F2F4F7"
              icon={<Drumstick color="#F97373" size={20} />}
              testID="macro-protein"
            />
            <MacroCircleStat
              type="carbs"
              value={dailyNutrition.total_carbs}
              goal={user.goal_carbs}
              color="#4ECDC4"
              accent="#EEF6F5"
              icon={<Wheat color="#4ECDC4" size={20} />}
              testID="macro-carbs"
            />
            <MacroCircleStat
              type="fat"
              value={dailyNutrition.total_fat}
              goal={user.goal_fat}
              color="#FFD93D"
              accent="#FFF7D6"
              icon={<Egg color="#FFD93D" size={20} />}
              testID="macro-fat"
            />
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={270}>
          <View style={dynamic.workoutButtonsContainer}>
            <TouchableOpacity 
              style={dynamic.workoutAddButton}
              onPress={() => router.push('/log-exercise')}
              testID="workout-add-button"
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={dynamic.workoutMetButton}
              onPress={() => router.push('/log-exercise')}
              testID="workout-met-button"
            >
              <Text style={dynamic.workoutMetText}>MET</Text>
            </TouchableOpacity>
          </View>
        </AnimatedFadeIn>

        <TouchableOpacity style={dynamic.quickAddButton} onPress={() => handleJumpToSearch()} testID="quick-add-button">
          <Plus size={24} color="white" />
          <Text style={dynamic.quickAddText}>Add Food</Text>
        </TouchableOpacity>

        {suggestions.length > 0 && (
          <AnimatedFadeIn delay={300}>
            <View style={dynamic.section}>
              <Text style={dynamic.sectionTitle}>Suggested Foods</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {suggestions.map((food) => (
                  <View key={food.id} style={dynamic.suggestionCard}>
                    <FoodCard food={food} onPress={() => handleAddFood(food)} />
                  </View>
                ))}
              </ScrollView>
            </View>
          </AnimatedFadeIn>
        )}

        <AnimatedFadeIn delay={340}>
          <View style={dynamic.mealsCard}>
            <Text style={dynamic.mealsTitle}>Today&apos;s Meals</Text>

            {Object.entries(mealsByType).map(([mealType, meals], index, arr) => (
              <View key={mealType} style={dynamic.mealSection}>
                <View style={dynamic.mealHeader}>
                  <Text style={dynamic.mealTitle}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</Text>
                </View>

                {meals.length === 0 ? (
                  <Text style={dynamic.emptyMealText}>No {mealType} logged yet</Text>
                ) : (
                  meals.map((meal) => (
                    <MealCard key={meal.id} meal={meal} onDelete={() => removeMeal(meal.id)} />
                  ))
                )}

                <TouchableOpacity
                  style={dynamic.addRectButton}
                  onPress={() => handleJumpToSearch(mealType as MealEntry['meal_type'])}
                  testID={`add-rect-${mealType}`}
                  accessibilityLabel={`Add to ${mealType}`}
                >
                  <Plus size={18} color="#fff" />
                  <Text style={dynamic.addRectText}>Add to Today</Text>
                </TouchableOpacity>

                {index < arr.length - 1 && <View style={dynamic.divider} />}
              </View>
            ))}
          </View>
        </AnimatedFadeIn>

        {todayWorkouts.length > 0 && (
          <AnimatedFadeIn delay={380}>
            <View style={dynamic.section}>
              <Text style={dynamic.sectionTitle}>Recently uploaded</Text>
              {todayWorkouts.slice(0, 3).map((workout) => {
                const workoutTypeLabels = {
                  run: 'Run',
                  weight_lifting: 'Weight lifting',
                  describe: 'Workout',
                  manual: 'Exercise',
                };
                const workoutTypeIcons = {
                  run: '👟',
                  weight_lifting: '🏋️',
                  describe: '✏️',
                  manual: '🔥',
                };
                const time = new Date(workout.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                });

                return (
                  <View key={workout.id} style={dynamic.workoutCard}>
                    <View style={dynamic.workoutIconContainer}>
                      <Text style={dynamic.workoutIcon}>{workoutTypeIcons[workout.type]}</Text>
                    </View>
                    <View style={dynamic.workoutContent}>
                      <Text style={dynamic.workoutTitle}>{workoutTypeLabels[workout.type]}</Text>
                      <View style={dynamic.workoutDetails}>
                        <View style={dynamic.workoutDetailItem}>
                          <Zap size={14} color={theme.colors.textMuted} />
                          <Text style={dynamic.workoutDetailText}>
                            Intensity: {workout.intensity.charAt(0).toUpperCase() + workout.intensity.slice(1)}
                          </Text>
                        </View>
                        <View style={dynamic.workoutDetailItem}>
                          <Clock size={14} color={theme.colors.textMuted} />
                          <Text style={dynamic.workoutDetailText}>{workout.duration} Mins</Text>
                        </View>
                      </View>
                    </View>
                    <View style={dynamic.workoutCalories}>
                      <Text style={dynamic.workoutTime}>{time}</Text>
                      <View style={dynamic.caloriesBadge}>
                        <Text style={dynamic.caloriesIcon}>🔥</Text>
                        <Text style={dynamic.caloriesText}>{workout.calories} calories</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </AnimatedFadeIn>
        )}
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
  karmaCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  karmaHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  karmaTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.text },
  karmaUnitsPill: { backgroundColor: Theme.colors.accent, borderWidth: 1, borderColor: Theme.colors.border, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  karmaUnitsText: { fontSize: 12, fontWeight: '800', color: Theme.colors.primary700 },
  karmaBodyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  karmaLeft: { flex: 1, paddingRight: 12 },
  karmaSubtitle: { fontSize: 12, color: Theme.colors.textMuted, marginBottom: 4 },
  karmaSavedText: { fontSize: 14, fontWeight: '700', color: Theme.colors.text, marginBottom: 6 },
  karmaImpactRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  karmaImpactText: { flex: 1, color: Theme.colors.text, fontSize: 13 },
  karmaTodayRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  karmaTodayText: { fontSize: 12, color: Theme.colors.textMuted },

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
  workoutButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  workoutAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.primary700,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  workoutMetButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  workoutMetText: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
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
