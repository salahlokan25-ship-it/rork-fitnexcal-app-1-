import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { ArrowLeft, Calendar, Lightbulb } from 'lucide-react-native';
import { useSleep } from '@/hooks/sleep-store';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';

type TimeMode = 'bedtime' | 'wakeup';
type SleepQuality = 'deep' | 'calm' | 'restless';

export default function TrackSleepScreen() {
  const { theme } = useTheme();
  const { logSleep, getSleepHistory } = useSleep();

  const [timeMode, setTimeMode] = useState<TimeMode>('bedtime');
  const [bedtimeHour, setBedtimeHour] = useState<number>(11);
  const [bedtimeMinute, setBedtimeMinute] = useState<number>(30);
  const [bedtimePeriod, setBedtimePeriod] = useState<'AM' | 'PM'>('PM');
  const [wakeupHour, setWakeupHour] = useState<number>(7);
  const [wakeupMinute, setWakeupMinute] = useState<number>(0);
  const [wakeupPeriod, setWakeupPeriod] = useState<'AM' | 'PM'>('AM');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('deep');

  const currentHour = timeMode === 'bedtime' ? bedtimeHour : wakeupHour;
  const currentMinute = timeMode === 'bedtime' ? bedtimeMinute : wakeupMinute;
  const currentPeriod = timeMode === 'bedtime' ? bedtimePeriod : wakeupPeriod;

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const periods = useMemo(() => ['AM', 'PM'] as const, []);

  const weeklyData = getSleepHistory(7);

  const dynamic = stylesWithTheme(theme);

  useEffect(() => {
    setTimeout(() => {
      const hour = timeMode === 'bedtime' ? bedtimeHour : wakeupHour;
      const minute = timeMode === 'bedtime' ? bedtimeMinute : wakeupMinute;
      const period = timeMode === 'bedtime' ? bedtimePeriod : wakeupPeriod;

      hourScrollRef.current?.scrollTo({ y: (hour - 1) * 48, animated: false });
      minuteScrollRef.current?.scrollTo({ y: minute * 48, animated: false });
      periodScrollRef.current?.scrollTo({ y: period === 'PM' ? 48 : 0, animated: false });
    }, 100);
  }, [timeMode, bedtimeHour, bedtimeMinute, bedtimePeriod, wakeupHour, wakeupMinute, wakeupPeriod]);

  const handleHourScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 48);
    const newHour = hours[index];
    if (newHour !== undefined) {
      if (timeMode === 'bedtime') {
        setBedtimeHour(newHour);
      } else {
        setWakeupHour(newHour);
      }
    }
  }, [hours, timeMode]);

  const handleMinuteScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 48);
    const newMinute = minutes[index];
    if (newMinute !== undefined) {
      if (timeMode === 'bedtime') {
        setBedtimeMinute(newMinute);
      } else {
        setWakeupMinute(newMinute);
      }
    }
  }, [minutes, timeMode]);

  const handlePeriodScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / 48);
    const newPeriod = periods[index];
    if (newPeriod !== undefined) {
      if (timeMode === 'bedtime') {
        setBedtimePeriod(newPeriod);
      } else {
        setWakeupPeriod(newPeriod);
      }
    }
  }, [periods, timeMode]);

  const calculateTotalSleep = useCallback(() => {
    const bedtime24 = bedtimePeriod === 'PM' && bedtimeHour !== 12 ? bedtimeHour + 12 : bedtimePeriod === 'AM' && bedtimeHour === 12 ? 0 : bedtimeHour;
    const wakeup24 = wakeupPeriod === 'PM' && wakeupHour !== 12 ? wakeupHour + 12 : wakeupPeriod === 'AM' && wakeupHour === 12 ? 0 : wakeupHour;
    
    const bedtimeInMinutes = bedtime24 * 60 + bedtimeMinute;
    const wakeupInMinutes = wakeup24 * 60 + wakeupMinute;
    
    let diffMinutes = wakeupInMinutes - bedtimeInMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60;
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return { hours, minutes, totalHours: diffMinutes / 60 };
  }, [bedtimeHour, bedtimeMinute, bedtimePeriod, wakeupHour, wakeupMinute, wakeupPeriod]);

  const totalSleep = useMemo(() => calculateTotalSleep(), [calculateTotalSleep]);

  const handleLogSleep = useCallback(async () => {
    try {
      const { totalHours } = totalSleep;
      await logSleep(totalHours);
      console.log(`[TrackSleep] Logged ${totalHours.toFixed(1)} hours with quality: ${sleepQuality}`);
      router.back();
    } catch (error) {
      console.error('[TrackSleep] Error logging sleep:', error);
    }
  }, [logSleep, sleepQuality, totalSleep]);

  const maxBarHeight = useMemo(() => {
    return Math.max(...weeklyData.map(d => d.hours), 8);
  }, [weeklyData]);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Track Your Sleep',
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTitleStyle: {
            fontSize: 18,
            fontWeight: '700',
            color: theme.colors.text,
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={{ paddingLeft: 16 }}
              testID="back-button"
            >
              <ArrowLeft size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => {}}
              style={{ paddingRight: 16 }}
            >
              <Calendar size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={dynamic.container}>
        <ScrollView style={dynamic.scrollView} showsVerticalScrollIndicator={false}>
          <View style={dynamic.content}>
            <AnimatedFadeIn delay={0}>
              <View style={dynamic.segmentedControl}>
                <TouchableOpacity
                  style={[
                    dynamic.segmentButton,
                    timeMode === 'bedtime' && dynamic.segmentButtonActive
                  ]}
                  onPress={() => setTimeMode('bedtime')}
                  testID="bedtime-segment"
                >
                  <Text style={[
                    dynamic.segmentButtonText,
                    timeMode === 'bedtime' && dynamic.segmentButtonTextActive
                  ]}>Bedtime</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    dynamic.segmentButton,
                    timeMode === 'wakeup' && dynamic.segmentButtonActive
                  ]}
                  onPress={() => setTimeMode('wakeup')}
                  testID="wakeup-segment"
                >
                  <Text style={[
                    dynamic.segmentButtonText,
                    timeMode === 'wakeup' && dynamic.segmentButtonTextActive
                  ]}>Wake-up Time</Text>
                </TouchableOpacity>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={50}>
              <View style={dynamic.wheelPickerContainer}>
                <View style={dynamic.wheelPickerOverlay} />
                <View style={dynamic.wheelPicker}>
                  <ScrollView
                    ref={hourScrollRef}
                    style={dynamic.wheelScrollView}
                    contentContainerStyle={dynamic.wheelScrollContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={48}
                    decelerationRate="fast"
                    onScroll={handleHourScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={handleHourScroll}
                    testID="hour-picker"
                  >
                    {hours.map((h) => (
                      <View key={h} style={dynamic.wheelItemWrapper}>
                        <Text style={h === currentHour ? dynamic.wheelItemActive : dynamic.wheelItemInactive}>
                          {h}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                  <Text style={dynamic.wheelColon}>:</Text>
                  <ScrollView
                    ref={minuteScrollRef}
                    style={dynamic.wheelScrollView}
                    contentContainerStyle={dynamic.wheelScrollContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={48}
                    decelerationRate="fast"
                    onScroll={handleMinuteScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={handleMinuteScroll}
                    testID="minute-picker"
                  >
                    {minutes.map((m) => (
                      <View key={m} style={dynamic.wheelItemWrapper}>
                        <Text style={m === currentMinute ? dynamic.wheelItemActive : dynamic.wheelItemInactive}>
                          {m.toString().padStart(2, '0')}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                  <ScrollView
                    ref={periodScrollRef}
                    style={dynamic.wheelScrollView}
                    contentContainerStyle={dynamic.wheelScrollContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={48}
                    decelerationRate="fast"
                    onScroll={handlePeriodScroll}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={handlePeriodScroll}
                    testID="period-picker"
                  >
                    {periods.map((p) => (
                      <View key={p} style={dynamic.wheelItemWrapper}>
                        <Text style={p === currentPeriod ? dynamic.wheelItemActive : dynamic.wheelItemInactive}>
                          {p}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={100}>
              <View style={dynamic.totalSleepCard}>
                <Text style={dynamic.totalSleepLabel}>Total Sleep</Text>
                <Text style={dynamic.totalSleepValue}>{totalSleep.hours}h {totalSleep.minutes}m</Text>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={150}>
              <View style={dynamic.qualitySection}>
                <Text style={dynamic.sectionTitle}>Sleep Quality</Text>
                <View style={dynamic.qualityGrid}>
                  <TouchableOpacity
                    style={[
                      dynamic.qualityButton,
                      sleepQuality === 'deep' && dynamic.qualityButtonActive
                    ]}
                    onPress={() => setSleepQuality('deep')}
                    testID="quality-deep"
                  >
                    <Text style={dynamic.qualityEmoji}>😴</Text>
                    <Text style={dynamic.qualityLabel}>Deep</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      dynamic.qualityButton,
                      sleepQuality === 'calm' && dynamic.qualityButtonActive
                    ]}
                    onPress={() => setSleepQuality('calm')}
                    testID="quality-calm"
                  >
                    <Text style={dynamic.qualityEmoji}>😊</Text>
                    <Text style={dynamic.qualityLabel}>Calm</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      dynamic.qualityButton,
                      sleepQuality === 'restless' && dynamic.qualityButtonActive
                    ]}
                    onPress={() => setSleepQuality('restless')}
                    testID="quality-restless"
                  >
                    <Text style={dynamic.qualityEmoji}>🥱</Text>
                    <Text style={dynamic.qualityLabel}>Restless</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={200}>
              <TouchableOpacity
                style={dynamic.logButton}
                onPress={handleLogSleep}
                testID="log-sleep-button"
              >
                <Text style={dynamic.logButtonText}>Log Sleep</Text>
              </TouchableOpacity>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={250}>
              <View style={dynamic.trendSection}>
                <Text style={dynamic.sectionTitle}>Your Weekly Sleep Trend</Text>
                <View style={dynamic.chartCard}>
                  <View style={dynamic.chartContainer}>
                    {weeklyData.map((day, index) => {
                      const barHeight = day.hours > 0 ? (day.hours / maxBarHeight) * 100 : 0;
                      return (
                        <View key={index} style={dynamic.barWrapper}>
                          <View style={dynamic.barBackground}>
                            <View style={[dynamic.barFill, { height: `${barHeight}%` }]} />
                          </View>
                          <Text style={dynamic.barLabel}>{day.date}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={300}>
              <View style={dynamic.insightsSection}>
                <Text style={dynamic.sectionTitle}>Sleep &amp; Nutrition Insights</Text>
                <View style={dynamic.insightCard}>
                  <View style={dynamic.insightIcon}>
                    <Lightbulb size={24} color="#4A90E2" />
                  </View>
                  <Text style={dynamic.insightText}>
                    We noticed you crave more carbs on days after less than 6 hours of sleep. Try aiming for 7-8 hours to help manage cravings.
                  </Text>
                </View>
              </View>
            </AnimatedFadeIn>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
    height: 48,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#4A90E2',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textMuted,
  },
  segmentButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  wheelPickerContainer: {
    marginTop: 32,
    marginBottom: 32,
    position: 'relative',
  },
  wheelPickerOverlay: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: '50%',
    marginTop: -24,
    height: 48,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
  },
  wheelPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  wheelScrollView: {
    flex: 1,
    height: 144,
  },
  wheelScrollContent: {
    paddingVertical: 48,
  },
  wheelItemWrapper: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelColon: {
    fontSize: 36,
    fontWeight: '700',
    color: Theme.colors.text,
    paddingBottom: 4,
  },
  wheelItemActive: {
    fontSize: 36,
    fontWeight: '700',
    color: Theme.colors.text,
    height: 48,
    lineHeight: 48,
    textAlign: 'center',
  },
  wheelItemInactive: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.textMuted,
    opacity: 0.4,
    height: 48,
    lineHeight: 48,
    textAlign: 'center',
  },
  totalSleepCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  totalSleepLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text,
  },
  totalSleepValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4A90E2',
  },
  qualitySection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  qualityGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  qualityButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: Theme.colors.border,
  },
  qualityButtonActive: {
    borderColor: '#4A90E2',
    borderWidth: 2,
  },
  qualityEmoji: {
    fontSize: 32,
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text,
  },
  logButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trendSection: {
    marginTop: 32,
  },
  chartCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: 8,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 192,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barBackground: {
    width: '100%',
    height: '60%',
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 100,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 100,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.textMuted,
  },
  insightsSection: {
    marginTop: 32,
    marginBottom: 16,
  },
  insightCard: {
    flexDirection: 'row',
    gap: 16,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  insightIcon: {
    paddingTop: 4,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.colors.text,
  },
});
