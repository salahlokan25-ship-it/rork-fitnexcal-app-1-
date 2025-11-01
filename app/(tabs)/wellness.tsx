import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { Moon, Sparkles, Activity } from 'lucide-react-native';
import { useSleep } from '@/hooks/sleep-store';
import { router } from 'expo-router';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';

export default function WellnessScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { getTodaySleep, logSleep } = useSleep();
  const [showSleepModal, setShowSleepModal] = useState<boolean>(false);
  const [sleepHours, setSleepHours] = useState<string>('');

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

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}>
      <ScrollView style={dynamic.scrollView} showsVerticalScrollIndicator={false} testID="wellness-scroll">
        <AnimatedFadeIn delay={50}>
          <View style={dynamic.header}>
            <Text style={dynamic.title}>Wellness</Text>
            <Text style={dynamic.subtitle}>Track your sleep, meditation & body goals</Text>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={100}>
          <TouchableOpacity 
            style={dynamic.sleepCard}
            onPress={() => setShowSleepModal(true)}
            testID="sleep-card"
          >
            <View style={dynamic.sleepIconContainer}>
              <Moon size={32} color="#6366F1" />
            </View>
            <View style={dynamic.sleepContent}>
              <Text style={dynamic.sleepTitle}>Sleep Tracker</Text>
              <Text style={dynamic.sleepSubtitle}>
                {getTodaySleep() > 0 ? `${getTodaySleep()} hours logged today` : 'Track your sleep quality'}
              </Text>
              <Text style={dynamic.sleepDescription}>
                Better sleep leads to better decisions. Log your hours and see patterns.
              </Text>
            </View>
            <View style={dynamic.sleepBadge}>
              <Text style={dynamic.sleepBadgeText}>{getTodaySleep() > 0 ? `${getTodaySleep()}h` : 'Log'}</Text>
            </View>
          </TouchableOpacity>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={150}>
          <TouchableOpacity 
            style={dynamic.metCard}
            onPress={() => router.push('/log-exercise')}
            testID="met-card"
          >
            <View style={dynamic.metIconContainer}>
              <Activity size={32} color="#F97316" />
            </View>
            <View style={dynamic.metContent}>
              <Text style={dynamic.metTitle}>MET Calculator</Text>
              <Text style={dynamic.metSubtitle}>Log your physical activities</Text>
              <Text style={dynamic.metDescription}>
                Track exercise intensity using Metabolic Equivalent of Task (MET) values.
              </Text>
            </View>
            <View style={dynamic.metBadge}>
              <Text style={dynamic.metBadgeText}>Log</Text>
            </View>
          </TouchableOpacity>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={200}>
          <TouchableOpacity 
            style={dynamic.vizCard}
            onPress={() => router.push('/future-visualizer')}
            testID="future-visualizer-card"
          >
            <View style={dynamic.vizIconContainer}>
              <Sparkles size={32} color="#0EA5E9" />
            </View>
            <View style={dynamic.vizContent}>
              <Text style={dynamic.vizTitle}>Future Body Visualizer</Text>
              <Text style={dynamic.vizSubtitle}>See your body transformation</Text>
              <Text style={dynamic.vizDescription}>
                Visualize your body evolution across different timeframes: 2 weeks, 1 month, 3 months.
              </Text>
            </View>
            <View style={dynamic.vizBadge}>
              <Text style={dynamic.vizBadgeText}>Open</Text>
            </View>
          </TouchableOpacity>
        </AnimatedFadeIn>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Theme.colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textMuted,
  },
  sleepCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 24,
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
  sleepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sleepContent: {
    marginBottom: 16,
  },
  sleepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  sleepSubtitle: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  sleepDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    lineHeight: 20,
  },
  sleepBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  sleepBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  metCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 24,
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
  metIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDBA74',
  },
  metContent: {
    marginBottom: 16,
  },
  metTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  metSubtitle: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  metDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    lineHeight: 20,
  },
  metBadge: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  metBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  vizCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    marginBottom: 24,
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
  vizIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7DD3FC',
  },
  vizContent: {
    marginBottom: 16,
  },
  vizTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  vizSubtitle: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginBottom: 8,
  },
  vizDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    lineHeight: 20,
  },
  vizBadge: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  vizBadgeText: {
    fontSize: 16,
    fontWeight: '700',
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
