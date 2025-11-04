import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { Moon, Settings, Play, PersonStanding, Scan } from 'lucide-react-native';
import { useSleep } from '@/hooks/sleep-store';
import { useUser } from '@/hooks/user-store';

import AnimatedFadeIn from '@/components/AnimatedFadeIn';
import Svg, { Circle } from 'react-native-svg';

export default function WellnessScreen() {
  const { theme, mode } = useTheme();
  const { getTodaySleep } = useSleep();
  const { user } = useUser();


  const dynamic = stylesWithTheme(theme);

  const todaySleep = getTodaySleep();


  const sleepQuality = todaySleep > 0 ? 85 : 0;
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
          <View style={dynamic.content}>
            <AnimatedFadeIn delay={50}>
              <View style={dynamic.sleepCard}>
                <View style={dynamic.sleepContent}>
                  <Text style={dynamic.cardLabel}>Sleep</Text>
                  <Text style={dynamic.cardValue}>{todaySleep > 0 ? `${todaySleep}h 30m` : '0h 0m'}</Text>
                  <Text style={dynamic.cardSubtext}>Quality: {sleepQuality}%{sleepQuality > 0 ? ' - Good' : ''}</Text>
                  <TouchableOpacity 
                    style={dynamic.primaryButton}
                    onPress={() => router.push('/track-sleep')}
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
              <View style={dynamic.metCard}>
                <View style={dynamic.metContent}>
                  <Text style={dynamic.cardLabel}>MET Calculator</Text>
                  <Text style={dynamic.cardValue}>0 Mins</Text>
                  <Text style={dynamic.cardSubtext}>Streak: 0 days</Text>
                  <TouchableOpacity 
                    style={dynamic.secondaryButton}
                    onPress={() => router.push('/log-exercise')}
                    testID="met-card"
                  >
                    <Play size={16} color="#fff" fill="#fff" />
                    <Text style={dynamic.secondaryButtonText}>Start a Session</Text>
                  </TouchableOpacity>
                </View>
                <View style={dynamic.metIcon}>
                  <PersonStanding size={48} color="#50E3C2" />
                </View>
              </View>
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={150}>
              <View style={dynamic.vizCard}>
                <View style={dynamic.vizContent}>
                  <Text style={dynamic.cardLabel}>Body Goals</Text>
                  <Text style={dynamic.cardValue}>Future You</Text>
                  <View>
                    <Text style={dynamic.cardSubtext}>Current: {currentWeight} lbs</Text>
                    <Text style={dynamic.cardSubtext}>Goal: {goalWeight} lbs</Text>
                  </View>
                  <TouchableOpacity 
                    style={dynamic.tertiaryButton}
                    onPress={() => router.push('/future-visualizer')}
                    testID="future-visualizer-card"
                  >
                    <Text style={dynamic.tertiaryButtonText}>See My Visualization</Text>
                  </TouchableOpacity>
                </View>
                <View style={dynamic.vizImage}>
                  <Scan size={48} color="#4A90E2" />
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
    padding: 16,
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

});
