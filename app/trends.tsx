import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNutrition } from '@/hooks/nutrition-store';
import { useWorkout } from '@/hooks/workout-store';
import { useSleep } from '@/hooks/sleep-store';
import { useUser } from '@/hooks/user-store';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

type PeriodType = '7D' | '1M' | '3M' | '6M';

export default function TrendsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenW } = useWindowDimensions();
  const { loadHistoryRange } = useNutrition();
  const { workouts } = useWorkout();
  const { getSleepHistory } = useSleep();
  const { user } = useUser();
  
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('3M');
  const [weightData, setWeightData] = useState<number[]>([]);
  const [nutritionData, setNutritionData] = useState<{ calories: number; protein: number; carbs: number }[]>([]);
  const [workoutData, setWorkoutData] = useState<{ workouts: number; time: number; calories: number }[]>([]);
  const [sleepData, setSleepData] = useState<{ avgSleep: number; quality: number; deepSleep: number }[]>([]);

  const loadData = useCallback(async () => {
    try {
      const days = selectedPeriod === '7D' ? 7 : selectedPeriod === '1M' ? 30 : selectedPeriod === '3M' ? 90 : 180;
      
      const hist = await loadHistoryRange(days);
      
      const weights: number[] = [];
      for (let i = 0; i < 30; i++) {
        const baseWeight = user?.weight || 72;
        const variation = Math.sin(i / 5) * 2 + (Math.random() - 0.5);
        weights.push(baseWeight + variation - (i * 0.08));
      }
      setWeightData(weights);

      const avgCalories = hist.length > 0 ? Math.round(hist.reduce((sum, h) => sum + h.calories, 0) / hist.length) : 1850;
      const avgProtein = hist.length > 0 ? Math.round(hist.reduce((sum, h) => sum + h.protein, 0) / hist.length) : 120;
      const avgCarbs = hist.length > 0 ? Math.round(hist.reduce((sum, h) => sum + h.carbs, 0) / hist.length) : 145;
      
      setNutritionData([{ calories: avgCalories, protein: avgProtein, carbs: avgCarbs }]);

      const recentWorkouts = workouts.slice(-30);
      const totalWorkouts = recentWorkouts.length;
      const totalTime = recentWorkouts.reduce((sum, w) => sum + (w.duration || 45), 0);
      const totalCals = recentWorkouts.reduce((sum, w) => sum + w.calories, 0);
      
      setWorkoutData([{ workouts: totalWorkouts || 4, time: totalTime || 195, calories: totalCals || 1250 }]);

      const sleepHistory = getSleepHistory(30);
      const avgSleep = sleepHistory.length > 0 ? sleepHistory.reduce((sum, s) => sum + s.hours, 0) / sleepHistory.length : 7.5;
      
      setSleepData([{ avgSleep: avgSleep, quality: 85, deepSleep: 1.75 }]);
    } catch (error) {
      console.error('Error loading trends data:', error);
    }
  }, [selectedPeriod, loadHistoryRange, workouts, getSleepHistory, user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const dynamic = stylesWithTheme(theme);

  const chartWidth = Math.min(screenW - 32, 400);
  const chartHeight = 160;

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}>
      <View style={dynamic.header}>
        <TouchableOpacity style={dynamic.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamic.title}>Trends</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={dynamic.periodSelector}>
        {(['7D', '1M', '3M', '6M'] as PeriodType[]).map((period) => (
          <TouchableOpacity
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
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false}>
        <View style={dynamic.card}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Weight Progress</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          <Text style={dynamic.mainValue}>
            {weightData.length > 0 ? weightData[weightData.length - 1].toFixed(1) : '165.5'} lbs
          </Text>
          <View style={dynamic.changeRow}>
            <Text style={dynamic.changeLabelText}>Last 30 days</Text>
            <Text style={dynamic.changeValueGreen}>↓ -2.5 lbs</Text>
          </View>
          <View style={{ marginTop: 16 }}>
            <WeightChart data={weightData} width={chartWidth} height={chartHeight} theme={theme} />
          </View>
        </View>

        <View style={dynamic.card}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Nutrition Intake</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          <View style={dynamic.statsGrid}>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Calories</Text>
              <Text style={dynamic.statValue}>{nutritionData[0]?.calories || 1850}</Text>
              <Text style={dynamic.statChangeRed}>-100</Text>
            </View>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Protein</Text>
              <Text style={dynamic.statValue}>{nutritionData[0]?.protein || 120}g</Text>
              <Text style={dynamic.statChangeGreen}>+10g</Text>
            </View>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Carbs</Text>
              <Text style={dynamic.statValue}>{nutritionData[0]?.carbs || 145}g</Text>
              <Text style={dynamic.statChangeRed}>-20g</Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <SimpleLineChart width={chartWidth} height={96} theme={theme} />
          </View>
        </View>

        <View style={dynamic.card}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Workout Activity</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          <View style={dynamic.statsGrid}>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Workouts</Text>
              <Text style={dynamic.statValue}>{workoutData[0]?.workouts || 4}</Text>
              <Text style={dynamic.statChangeGreen}>+1</Text>
            </View>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Time</Text>
              <Text style={dynamic.statValue}>{Math.floor((workoutData[0]?.time || 195) / 60)}h {(workoutData[0]?.time || 195) % 60}m</Text>
              <Text style={dynamic.statChangeGreen}>+30m</Text>
            </View>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Calories</Text>
              <Text style={dynamic.statValue}>{workoutData[0]?.calories || 1250}</Text>
              <Text style={dynamic.statChangeGreen}>+200</Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <SimpleLineChart width={chartWidth} height={96} theme={theme} variant={2} />
          </View>
        </View>

        <View style={[dynamic.card, { marginBottom: 24 }]}>
          <View style={dynamic.cardHeader}>
            <Text style={dynamic.cardTitle}>Sleep Tracking</Text>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </View>
          <View style={dynamic.statsGrid}>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Avg Sleep</Text>
              <Text style={dynamic.statValue}>{sleepData[0]?.avgSleep.toFixed(0) || 7}h 30m</Text>
              <Text style={dynamic.statChangeGreen}>+15m</Text>
            </View>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Quality</Text>
              <Text style={dynamic.statValue}>{sleepData[0]?.quality || 85}%</Text>
              <Text style={dynamic.statChangeGreen}>+5%</Text>
            </View>
            <View style={dynamic.statItem}>
              <Text style={dynamic.statLabel}>Deep Sleep</Text>
              <Text style={dynamic.statValue}>{sleepData[0]?.deepSleep.toFixed(0) || 1}h 45m</Text>
              <Text style={dynamic.statChangeGreen}>+10m</Text>
            </View>
          </View>
          <View style={{ marginTop: 16 }}>
            <SimpleLineChart width={chartWidth} height={96} theme={theme} variant={3} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function WeightChart({ data, width, height, theme }: { data: number[]; width: number; height: number; theme: any }) {
  if (data.length === 0) return null;

  const padding = 0;
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

function SimpleLineChart({ width, height, theme, variant = 1 }: { width: number; height: number; theme: any; variant?: number }) {
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
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  title: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Theme.colors.text,
  },
  periodSelector: {
    flexDirection: 'row' as const,
    backgroundColor: Theme.colors.surface,
    margin: 16,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: Theme.colors.background,
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
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
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
});
