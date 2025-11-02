import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Pressable } from 'react-native';
import { ArrowLeft, ChevronRight, MoreVertical } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { useNutrition } from '@/hooks/nutrition-store';
import { useWorkout } from '@/hooks/workout-store';
import { useSleep } from '@/hooks/sleep-store';
import { useUser } from '@/hooks/user-store';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

type PeriodType = '7D' | '1M' | '3M' | '6M';

export default function TrendsScreen() {
  const { theme, hydrated } = useTheme();
  const { width: screenW } = useWindowDimensions();
  const { loadHistoryRange, dailyNutrition } = useNutrition();
  const { workouts } = useWorkout();
  const { getSleepHistory, sleepEntries } = useSleep();
  const { user, getWeightHistory } = useUser();
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('3M');
  const [weightData, setWeightData] = useState<number[]>([]);
  const [nutritionData, setNutritionData] = useState<{ calories: number; protein: number; carbs: number }[]>([]);
  const [workoutData, setWorkoutData] = useState<{ workouts: number; time: number; calories: number }[]>([]);
  const [sleepData, setSleepData] = useState<{ avgSleep: number; quality: number; deepSleep: number }[]>([]);
  const [hasData, setHasData] = useState<{ weight: boolean; nutrition: boolean; workout: boolean; sleep: boolean }>({ weight: false, nutrition: false, workout: false, sleep: false });

  const loadData = useCallback(async () => {
    try {
      const days = selectedPeriod === '7D' ? 7 : selectedPeriod === '1M' ? 30 : selectedPeriod === '3M' ? 90 : 180;
      
      const hist = await loadHistoryRange(days);
      const hasNutritionData = hist.some(h => h.calories > 0 || h.protein > 0 || h.carbs > 0);
      
      const weightHistoryData = getWeightHistory(days);
      const weights = weightHistoryData.map(entry => entry.weight);
      const hasWeight = weights.length > 0;
      setWeightData(weights);

      const avgCalories = hist.length > 0 && hasNutritionData ? Math.round(hist.reduce((sum, h) => sum + h.calories, 0) / hist.length) : 0;
      const avgProtein = hist.length > 0 && hasNutritionData ? Math.round(hist.reduce((sum, h) => sum + h.protein, 0) / hist.length) : 0;
      const avgCarbs = hist.length > 0 && hasNutritionData ? Math.round(hist.reduce((sum, h) => sum + h.carbs, 0) / hist.length) : 0;
      
      setNutritionData([{ calories: avgCalories, protein: avgProtein, carbs: avgCarbs }]);

      const recentWorkouts = workouts.slice(-30);
      const totalWorkouts = recentWorkouts.length;
      const totalTime = recentWorkouts.reduce((sum, w) => sum + (w.duration || 45), 0);
      const totalCals = recentWorkouts.reduce((sum, w) => sum + w.calories, 0);
      
      setWorkoutData([{ workouts: totalWorkouts, time: totalTime, calories: totalCals }]);

      const sleepHistory = getSleepHistory(30);
      const hasSleepData = sleepHistory.some(s => s.hours > 0);
      const avgSleep = hasSleepData ? sleepHistory.reduce((sum, s) => sum + s.hours, 0) / sleepHistory.length : 0;
      
      setSleepData([{ avgSleep: avgSleep, quality: hasSleepData ? 85 : 0, deepSleep: hasSleepData ? 1.75 : 0 }]);

      setHasData({
        weight: hasWeight,
        nutrition: hasNutritionData,
        workout: totalWorkouts > 0,
        sleep: hasSleepData
      });
    } catch (error) {
      console.error('Error loading trends data:', error);
    }
  }, [selectedPeriod, loadHistoryRange, workouts, getSleepHistory, user, getWeightHistory]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const dynamic = stylesWithTheme(theme);

  const chartWidth = Math.min(screenW - 32, 400);
  const chartHeight = 160;

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: '#0d1117' }} />;
  }

  return (
    <View style={dynamic.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitle: 'Trends',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={{ padding: 8 }}>
              <MoreVertical size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={dynamic.periodSelector}>
        {(['7D', '1M', '3M', '6M'] as PeriodType[]).map((period) => (
          <Pressable
            key={period}
            style={[
              dynamic.periodButton,
              selectedPeriod === period && dynamic.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period)}
          >
            <Text
              style={[
                dynamic.periodButtonText,
                selectedPeriod === period && dynamic.periodButtonTextActive,
              ]}
            >
              {period}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={dynamic.content} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={dynamic.card}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Weight Progress</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          {hasData.weight ? (
            <>
              <Text style={dynamic.mainValue}>
                {weightData.length > 0 ? weightData[weightData.length - 1].toFixed(1) : user?.weight?.toFixed(1) || '0'} kg
              </Text>
              <View style={dynamic.changeRow}>
                <Text style={dynamic.changeLabelText}>Last 30 days</Text>
                {weightData.length > 1 && (
                  <Text style={weightData[0] > weightData[weightData.length - 1] ? dynamic.changeValueGreen : dynamic.changeValueRed}>
                    {weightData[0] > weightData[weightData.length - 1] ? '↓' : '↑'} {Math.abs(weightData[0] - weightData[weightData.length - 1]).toFixed(1)} kg
                  </Text>
                )}
              </View>
              <View style={{ marginTop: 16 }}>
                <WeightChart data={weightData} width={chartWidth} height={chartHeight} theme={theme} />
              </View>
            </>
          ) : (
            <View style={dynamic.emptyState}>
              <Text style={dynamic.emptyStateText}>No weight data tracked yet</Text>
              <Text style={dynamic.emptyStateSubtext}>Start tracking your weight to see progress over time</Text>
            </View>
          )}
        </View>

        <View style={dynamic.card}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Nutrition Intake</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          {hasData.nutrition ? (
            <>
              <View style={dynamic.statsGrid}>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Calories</Text>
                  <Text style={dynamic.statValue}>{nutritionData[0]?.calories || 0}</Text>
                  <Text style={dynamic.statChangeRed}>-100</Text>
                </View>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Protein</Text>
                  <Text style={dynamic.statValue}>{nutritionData[0]?.protein || 0}g</Text>
                  <Text style={dynamic.statChangeGreen}>+10g</Text>
                </View>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Carbs</Text>
                  <Text style={dynamic.statValue}>{nutritionData[0]?.carbs || 0}g</Text>
                  <Text style={dynamic.statChangeRed}>-20g</Text>
                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                <SimpleLineChart width={chartWidth} height={96} theme={theme} />
              </View>
            </>
          ) : (
            <View style={dynamic.emptyState}>
              <Text style={dynamic.emptyStateText}>No nutrition data tracked yet</Text>
              <Text style={dynamic.emptyStateSubtext}>Start logging meals to see your nutrition trends</Text>
            </View>
          )}
        </View>

        <View style={dynamic.card}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Workout Activity</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          {hasData.workout ? (
            <>
              <View style={dynamic.statsGrid}>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Workouts</Text>
                  <Text style={dynamic.statValue}>{workoutData[0]?.workouts || 0}</Text>
                  <Text style={dynamic.statChangeGreen}>+1</Text>
                </View>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Time</Text>
                  <Text style={dynamic.statValue}>{Math.floor((workoutData[0]?.time || 0) / 60)}h {(workoutData[0]?.time || 0) % 60}m</Text>
                  <Text style={dynamic.statChangeGreen}>+30m</Text>
                </View>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Calories</Text>
                  <Text style={dynamic.statValue}>{workoutData[0]?.calories || 0}</Text>
                  <Text style={dynamic.statChangeGreen}>+200</Text>
                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                <SimpleLineChart width={chartWidth} height={96} theme={theme} variant={2} />
              </View>
            </>
          ) : (
            <View style={dynamic.emptyState}>
              <Text style={dynamic.emptyStateText}>No workout data tracked yet</Text>
              <Text style={dynamic.emptyStateSubtext}>Start logging workouts to see your activity trends</Text>
            </View>
          )}
        </View>

        <View style={dynamic.card}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Sleep Tracking</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          {hasData.sleep ? (
            <>
              <View style={dynamic.statsGrid}>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Avg Sleep</Text>
                  <Text style={dynamic.statValue}>{sleepData[0]?.avgSleep > 0 ? Math.floor(sleepData[0].avgSleep) : 0}h 30m</Text>
                  <Text style={dynamic.statChangeGreen}>+15m</Text>
                </View>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Quality</Text>
                  <Text style={dynamic.statValue}>{sleepData[0]?.quality || 0}%</Text>
                  <Text style={dynamic.statChangeGreen}>+5%</Text>
                </View>
                <View style={dynamic.statItem}>
                  <Text style={dynamic.statLabel}>Deep Sleep</Text>
                  <Text style={dynamic.statValue}>{sleepData[0]?.deepSleep > 0 ? Math.floor(sleepData[0].deepSleep) : 0}h 45m</Text>
                  <Text style={dynamic.statChangeGreen}>+10m</Text>
                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                <SimpleLineChart width={chartWidth} height={96} theme={theme} variant={3} />
              </View>
            </>
          ) : (
            <View style={dynamic.emptyState}>
              <Text style={dynamic.emptyStateText}>No sleep data tracked yet</Text>
              <Text style={dynamic.emptyStateSubtext}>Start logging sleep to see your sleep quality trends</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function WeightChart({ data, width, height }: { data: number[]; width: number; height: number; theme: any }) {
  if (data.length === 0) return null;

  const chartWidth = width;
  const chartHeight = height;

  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((value - min) / range) * chartHeight;
    return { x, y };
  });

  const pathData = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[index - 1];
    const controlPoint1X = prevPoint.x + (point.x - prevPoint.x) / 3;
    const controlPoint1Y = prevPoint.y;
    const controlPoint2X = prevPoint.x + (2 * (point.x - prevPoint.x)) / 3;
    const controlPoint2Y = point.y;
    return `C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${point.x} ${point.y}`;
  }).join(' ');

  const fillPath = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3b82f6" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={fillPath} fill="url(#weightGradient)" />
      <Path d={pathData} fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

function SimpleLineChart({ width, height, variant = 1 }: { width: number; height: number; theme: any; variant?: number }) {
  const data = Array.from({ length: 15 }, (_, i) => {
    const base = 50;
    const wave = Math.sin(i / 2) * 30;
    const noise = (Math.random() - 0.5) * 10;
    return base + wave + noise + (variant * 5);
  });

  const min = 0;
  const max = 100;
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return { x, y };
  });

  const pathData = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prevPoint = points[index - 1];
    const controlPoint1X = prevPoint.x + (point.x - prevPoint.x) / 3;
    const controlPoint1Y = prevPoint.y;
    const controlPoint2X = prevPoint.x + (2 * (point.x - prevPoint.x)) / 3;
    const controlPoint2Y = point.y;
    return `C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${point.x} ${point.y}`;
  }).join(' ');

  const fillPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id={`gradient${variant}`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3b82f6" stopOpacity="0.3" />
          <Stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={fillPath} fill={`url(#gradient${variant})`} />
      <Path d={pathData} fill="none" stroke="#3b82f6" strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  periodSelector: {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: 16,
    marginBottom: 0,
    padding: 4,
    borderRadius: 12,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  periodButtonActive: {
    backgroundColor: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Theme.colors.textMuted,
  },
  periodButtonTextActive: {
    color: Theme.colors.text,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#1f2937',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Theme.colors.text,
  },
  mainValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Theme.colors.text,
    marginTop: 4,
  },
  changeRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginTop: 4,
  },
  changeLabelText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },
  changeValueGreen: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#10B981',
  },
  changeValueRed: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#EF4444',
  },
  statsGrid: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  statChangeGreen: {
    fontSize: 12,
    color: '#10B981',
  },
  statChangeRed: {
    fontSize: 12,
    color: '#EF4444',
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Theme.colors.text,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    textAlign: 'center' as const,
    maxWidth: 260,
  },
});
