import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { ArrowLeft, Calendar, Home, PieChart, Moon as MoonIcon, User, Lightbulb } from 'lucide-react-native';
import { useSleep } from '@/hooks/sleep-store';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';

type TimeMode = 'bedtime' | 'wakeup';
type SleepQuality = 'deep' | 'calm' | 'restless';

export default function TrackSleepScreen() {
  const { theme } = useTheme();
  const { logSleep, getSleepHistory } = useSleep();

  const [timeMode, setTimeMode] = useState<TimeMode>('bedtime');
  const [hour, setHour] = useState<number>(11);
  const [minute, setMinute] = useState<number>(30);
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('deep');

  const weeklyData = getSleepHistory(7);

  const dynamic = stylesWithTheme(theme);

  useEffect(() => {
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    const isPM = currentHour >= 12;

    setHour(currentHour % 12 || 12);
    setMinute(currentMinute);
    setPeriod(isPM ? 'PM' : 'AM');
  }, []);

  const handleLogSleep = useCallback(async () => {
    try {
      const sleepHours = 7.5;
      await logSleep(sleepHours);
      console.log(`[TrackSleep] Logged ${sleepHours} hours with quality: ${sleepQuality}`);
      router.back();
    } catch (error) {
      console.error('[TrackSleep] Error logging sleep:', error);
    }
  }, [logSleep, sleepQuality]);

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
                  <View style={dynamic.wheelColumn}>
                    <Text style={dynamic.wheelItemInactive}>{hour === 1 ? 12 : hour - 1}</Text>
                    <Text style={dynamic.wheelItemActive}>{hour}</Text>
                    <Text style={dynamic.wheelItemInactive}>{hour === 12 ? 1 : hour + 1}</Text>
                  </View>
                  <Text style={dynamic.wheelColon}>:</Text>
                  <View style={dynamic.wheelColumn}>
                    <Text style={dynamic.wheelItemInactive}>{minute === 0 ? 59 : minute - 1}</Text>
                    <Text style={dynamic.wheelItemActive}>{minute.toString().padStart(2, '0')}</Text>
                    <Text style={dynamic.wheelItemInactive}>{minute === 59 ? 0 : minute + 1}</Text>
                  </View>
                  <View style={dynamic.wheelColumn}>
                    <Text style={dynamic.wheelItemInactive}>{period === 'AM' ? 'PM' : 'AM'}</Text>
                    <Text style={dynamic.wheelItemActive}>{period}</Text>
                    <Text style={dynamic.wheelItemInactive}>{period === 'PM' ? 'AM' : 'PM'}</Text>
                  </View>
                </View>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={100}>
              <View style={dynamic.totalSleepCard}>
                <Text style={dynamic.totalSleepLabel}>Total Sleep</Text>
                <Text style={dynamic.totalSleepValue}>7h 30m</Text>
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

        <View style={dynamic.bottomNav}>
          <TouchableOpacity 
            style={dynamic.navButton}
            onPress={() => router.push('/(tabs)/home')}
            testID="nav-home"
          >
            <Home size={24} color={theme.colors.textMuted} />
            <Text style={dynamic.navButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={dynamic.navButton}
            onPress={() => {}}
            testID="nav-reports"
          >
            <PieChart size={24} color={theme.colors.textMuted} />
            <Text style={dynamic.navButtonText}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={dynamic.navButtonActive}
            testID="nav-sleep"
          >
            <MoonIcon size={24} color="#4A90E2" />
            <Text style={dynamic.navButtonTextActive}>Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={dynamic.navButton}
            onPress={() => router.push('/(tabs)/settings')}
            testID="nav-profile"
          >
            <User size={24} color={theme.colors.textMuted} />
            <Text style={dynamic.navButtonText}>Profile</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 100,
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
  wheelColumn: {
    flex: 1,
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
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 80,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navButtonActive: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.textMuted,
  },
  navButtonTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A90E2',
  },
});
