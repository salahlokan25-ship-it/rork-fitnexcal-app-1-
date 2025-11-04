import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { Moon, Settings, Play, Sparkles, Activity } from 'lucide-react-native';
import { useSleep } from '@/hooks/sleep-store';
import { useUser } from '@/hooks/user-store';

import AnimatedFadeIn from '@/components/AnimatedFadeIn';
import Svg, { Circle } from 'react-native-svg';

export default function WellnessScreen() {
  const { theme, mode } = useTheme();
  const { getTodaySleep, logSleep } = useSleep();
  const { user } = useUser();
  const [showSleepModal, setShowSleepModal] = useState<boolean>(false);
  const [sleepHours, setSleepHours] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  const dynamic = stylesWithTheme(theme);

  useEffect(() => {
    const todaySleep = getTodaySleep();
    if (todaySleep > 0) {
      setSleepHours(todaySleep.toString());
    }
  }, [getTodaySleep]);

  const handleSaveSleep = useCallback(async () => {
    try {
      const hours = parseFloat(sleepHours);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        return;
      }
      await logSleep(hours);
      setShowSleepModal(false);
      console.log(`[Sleep] Logged ${hours} hours`);
    } catch (e) {
      console.log('Log sleep failed', e);
    }
  }, [sleepHours, logSleep]);

  const todaySleep = getTodaySleep();
  const sleepQuality = 85;
  const currentWeight = user?.weight || 165;
  const goalWeight = (user as any)?.weightGoal || 155;
  
  const sleepProgress = Math.min((todaySleep / 8) * 100, 100);
  const circumference = 2 * Math.PI * 16;
  const strokeDashoffset = circumference - (sleepProgress / 100) * circumference;

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Wellness',
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
            >
              <Text style={{ fontSize: 24, color: theme.colors.text }}>←</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push('/settings')}
              style={{ paddingRight: 16 }}
            >
              <Settings size={24} color={theme.colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={dynamic.container}>
        <ScrollView style={dynamic.scrollView} showsVerticalScrollIndicator={false} testID="wellness-scroll">
          <View style={dynamic.periodSelector}>
            <View style={dynamic.periodSelectorInner}>
              <TouchableOpacity 
                style={[dynamic.periodOption, selectedPeriod === 'Daily' && dynamic.periodOptionActive]}
                onPress={() => setSelectedPeriod('Daily')}
              >
                <Text style={[dynamic.periodText, selectedPeriod === 'Daily' && dynamic.periodTextActive]}>Daily</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[dynamic.periodOption, selectedPeriod === 'Weekly' && dynamic.periodOptionActive]}
                onPress={() => setSelectedPeriod('Weekly')}
              >
                <Text style={[dynamic.periodText, selectedPeriod === 'Weekly' && dynamic.periodTextActive]}>Weekly</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[dynamic.periodOption, selectedPeriod === 'Monthly' && dynamic.periodOptionActive]}
                onPress={() => setSelectedPeriod('Monthly')}
              >
                <Text style={[dynamic.periodText, selectedPeriod === 'Monthly' && dynamic.periodTextActive]}>Monthly</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamic.content}>
            <AnimatedFadeIn delay={50}>
              <View style={dynamic.sleepCard}>
                <View style={dynamic.sleepContent}>
                  <Text style={dynamic.cardLabel}>Sleep</Text>
                  <Text style={dynamic.cardValue}>{todaySleep}h 30m</Text>
                  <Text style={dynamic.cardSubtext}>Quality: {sleepQuality}% - Good</Text>
                  <TouchableOpacity 
                    style={dynamic.primaryButton}
                    onPress={() => setShowSleepModal(true)}
                    testID="sleep-card"
                  >
                    <Text style={dynamic.primaryButtonText}>Track your sleep</Text>
                  </TouchableOpacity>
                </View>
                <View style={dynamic.sleepCircle}>
                  <Svg width={96} height={96} viewBox="0 0 36 36">
                    <Circle
                      cx={18}
                      cy={18}
                      r={16}
                      stroke={mode === 'dark' ? '#374151' : '#E5E7EB'}
                      strokeWidth={2}
                      fill="none"
                    />
                    <Circle
                      cx={18}
                      cy={18}
                      r={16}
                      stroke="#A855F7"
                      strokeWidth={2}
                      fill="none"
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    />
                  </Svg>
                  <View style={dynamic.circleIcon}>
                    <Moon size={32} color="#A855F7" />
                  </View>
                </View>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={100}>
              <TouchableOpacity 
                style={dynamic.metCard}
                onPress={() => router.push('/log-exercise')}
                testID="met-card"
              >
                <View style={dynamic.metContent}>
                  <Text style={dynamic.cardLabel}>MET Calculator</Text>
                  <Text style={dynamic.cardValue}>10 Mins</Text>
                  <Text style={dynamic.cardSubtext}>Streak: 5 days</Text>
                  <TouchableOpacity style={dynamic.secondaryButton}>
                    <Play size={16} color="#fff" fill="#fff" />
                    <Text style={dynamic.secondaryButtonText}>Start a Session</Text>
                  </TouchableOpacity>
                </View>
                <View style={dynamic.metIcon}>
                  <Activity size={48} color="#50E3C2" />
                </View>
              </TouchableOpacity>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={150}>
              <TouchableOpacity 
                style={dynamic.vizCard}
                onPress={() => router.push('/future-visualizer')}
                testID="future-visualizer-card"
              >
                <View style={dynamic.vizContent}>
                  <Text style={dynamic.cardLabel}>Body Goals</Text>
                  <Text style={dynamic.cardValue}>Future You</Text>
                  <View>
                    <Text style={dynamic.cardSubtext}>Current: {currentWeight} lbs</Text>
                    <Text style={dynamic.cardSubtext}>Goal: {goalWeight} lbs</Text>
                  </View>
                  <TouchableOpacity style={dynamic.tertiaryButton}>
                    <Text style={dynamic.tertiaryButtonText}>See My Visualization</Text>
                  </TouchableOpacity>
                </View>
                <View style={dynamic.vizImage}>
                  <Sparkles size={48} color="#4A90E2" />
                </View>
              </TouchableOpacity>
            </AnimatedFadeIn>
          </View>
        </ScrollView>

        <Modal
          visible={showSleepModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSleepModal(false)}
        >
          <TouchableOpacity 
            style={dynamic.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowSleepModal(false)}
          >
            <TouchableOpacity 
              style={dynamic.sleepModalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={dynamic.sleepModalHeader}>
                <Moon size={32} color="#6366F1" />
                <Text style={dynamic.sleepModalTitle}>Log Sleep</Text>
              </View>

              <Text style={dynamic.sleepModalLabel}>How many hours did you sleep?</Text>
              <TextInput
                style={dynamic.sleepInput}
                value={sleepHours}
                onChangeText={setSleepHours}
                keyboardType="decimal-pad"
                placeholder="8.0"
                placeholderTextColor={theme.colors.textMuted}
                testID="sleep-input"
              />

              <View style={dynamic.sleepModalButtons}>
                <TouchableOpacity
                  style={dynamic.sleepCancelButton}
                  onPress={() => setShowSleepModal(false)}
                  testID="sleep-cancel"
                >
                  <Text style={dynamic.sleepCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={dynamic.sleepSaveButton}
                  onPress={handleSaveSleep}
                  testID="sleep-save"
                >
                  <Text style={dynamic.sleepSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
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
  periodSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  periodSelectorInner: {
    flexDirection: 'row' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    padding: 4,
    height: 40,
  },
  periodOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  periodOptionActive: {
    backgroundColor: '#4A90E2',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textMuted,
  },
  periodTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    padding: 16,
    paddingTop: 0,
  },
  cardLabel: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 2,
  },
  sleepCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sleepContent: {
    flex: 1,
    gap: 16,
  },
  sleepCircle: {
    width: 96,
    height: 96,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  metCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  metContent: {
    flex: 1,
    gap: 16,
  },
  metIcon: {
    width: 96,
    backgroundColor: 'rgba(80, 227, 194, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  vizCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  vizContent: {
    flex: 1,
    gap: 16,
  },
  vizImage: {
    width: 96,
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tertiaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  tertiaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sleepModalContent: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  sleepModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  sleepModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.text,
  },
  sleepModalLabel: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginBottom: 16,
  },
  sleepInput: {
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    color: Theme.colors.text,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 24,
  },
  sleepModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sleepCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  sleepCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  sleepSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  sleepSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
