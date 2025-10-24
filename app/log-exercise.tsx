import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';
import { useWorkout } from '@/hooks/workout-store';
import { Flame, Clock, Zap } from 'lucide-react-native';
import { WorkoutType, WorkoutIntensity, WorkoutTypeOption } from '@/types/workout';

const WORKOUT_OPTIONS: WorkoutTypeOption[] = [
  {
    id: 'run',
    title: 'Run',
    description: 'Running, jogging, sprinting, etc.',
    icon: '👟',
  },
  {
    id: 'weight_lifting',
    title: 'Weight lifting',
    description: 'Machines, free weights, etc.',
    icon: '🏋️',
  },
  {
    id: 'describe',
    title: 'Describe',
    description: 'Write your workout in text',
    icon: '✏️',
  },
  {
    id: 'manual',
    title: 'Manual',
    description: 'Enter exactly how many calories you burned',
    icon: '🔥',
  },
];

const DURATION_OPTIONS = [15, 30, 60, 90];

export default function LogExerciseScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { addWorkout } = useWorkout();

  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const [intensity, setIntensity] = useState<WorkoutIntensity>('medium');
  const [duration, setDuration] = useState<number>(15);
  const [customDuration, setCustomDuration] = useState<string>('15');
  const [manualCalories, setManualCalories] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const dynamic = stylesWithTheme(theme);

  const handleContinue = async () => {
    if (!selectedType) return;

    setIsSubmitting(true);
    try {
      const finalDuration = parseInt(customDuration) || duration;
      const finalCalories = selectedType === 'manual' ? parseInt(manualCalories) || 0 : undefined;

      await addWorkout(
        selectedType,
        intensity,
        finalDuration,
        finalCalories,
        description || undefined,
      );

      router.back();
    } catch (error) {
      console.error('[LogExercise] Error adding workout:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeSelection = () => (
    <View style={dynamic.section}>
      <Text style={dynamic.sectionTitle}>Log Exercise</Text>
      <View style={dynamic.optionsContainer}>
        {WORKOUT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              dynamic.optionCard,
              selectedType === option.id && dynamic.optionCardSelected,
            ]}
            onPress={() => setSelectedType(option.id)}
            testID={`workout-type-${option.id}`}
          >
            <View style={dynamic.optionIcon}>
              <Text style={dynamic.optionEmoji}>{option.icon}</Text>
            </View>
            <View style={dynamic.optionContent}>
              <Text style={dynamic.optionTitle}>{option.title}</Text>
              <Text style={dynamic.optionDescription}>{option.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderIntensitySelection = () => {
    if (!selectedType || selectedType === 'manual') return null;

    return (
      <View style={dynamic.section}>
        <View style={dynamic.sectionHeader}>
          <Zap size={20} color={theme.colors.text} />
          <Text style={dynamic.sectionTitleSmall}>Set intensity</Text>
        </View>

        <View style={dynamic.intensityContainer}>
          <View style={dynamic.intensityLabels}>
            <TouchableOpacity
              style={[dynamic.intensityOption, intensity === 'high' && dynamic.intensityActive]}
              onPress={() => setIntensity('high')}
              testID="intensity-high"
            >
              <Text
                style={[
                  dynamic.intensityLabel,
                  intensity === 'high' && dynamic.intensityLabelActive,
                ]}
              >
                High
              </Text>
              <Text style={dynamic.intensityDesc}>Training to failure, breathing heavily</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamic.intensityOption, intensity === 'medium' && dynamic.intensityActive]}
              onPress={() => setIntensity('medium')}
              testID="intensity-medium"
            >
              <Text
                style={[
                  dynamic.intensityLabel,
                  intensity === 'medium' && dynamic.intensityLabelActive,
                ]}
              >
                Medium
              </Text>
              <Text style={dynamic.intensityDesc}>Breaking a sweat, many reps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[dynamic.intensityOption, intensity === 'low' && dynamic.intensityActive]}
              onPress={() => setIntensity('low')}
              testID="intensity-low"
            >
              <Text
                style={[
                  dynamic.intensityLabel,
                  intensity === 'low' && dynamic.intensityLabelActive,
                ]}
              >
                Low
              </Text>
              <Text style={dynamic.intensityDesc}>Not breaking a sweat, giving little effort</Text>
            </TouchableOpacity>
          </View>

          <View style={dynamic.intensitySlider}>
            <View
              style={[
                dynamic.intensityIndicator,
                intensity === 'high' && dynamic.intensityIndicatorHigh,
                intensity === 'medium' && dynamic.intensityIndicatorMedium,
                intensity === 'low' && dynamic.intensityIndicatorLow,
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderDurationSelection = () => {
    if (!selectedType) return null;

    return (
      <View style={dynamic.section}>
        <View style={dynamic.sectionHeader}>
          <Clock size={20} color={theme.colors.text} />
          <Text style={dynamic.sectionTitleSmall}>Duration</Text>
        </View>

        <View style={dynamic.durationButtons}>
          {DURATION_OPTIONS.map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                dynamic.durationButton,
                duration === mins && dynamic.durationButtonActive,
              ]}
              onPress={() => {
                setDuration(mins);
                setCustomDuration(mins.toString());
              }}
              testID={`duration-${mins}`}
            >
              <Text
                style={[
                  dynamic.durationButtonText,
                  duration === mins && dynamic.durationButtonTextActive,
                ]}
              >
                {mins} mins
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={dynamic.durationInput}
          value={customDuration}
          onChangeText={(text) => {
            setCustomDuration(text);
            const num = parseInt(text);
            if (!isNaN(num)) {
              setDuration(num);
            }
          }}
          keyboardType="number-pad"
          placeholder="Enter custom duration"
          placeholderTextColor={theme.colors.textMuted}
          testID="duration-input"
        />
      </View>
    );
  };

  const renderManualCalories = () => {
    if (selectedType !== 'manual') return null;

    return (
      <View style={dynamic.section}>
        <View style={dynamic.sectionHeader}>
          <Flame size={20} color={theme.colors.text} />
          <Text style={dynamic.sectionTitleSmall}>Calories Burned</Text>
        </View>

        <TextInput
          style={dynamic.caloriesInput}
          value={manualCalories}
          onChangeText={setManualCalories}
          keyboardType="number-pad"
          placeholder="Enter calories burned"
          placeholderTextColor={theme.colors.textMuted}
          testID="manual-calories-input"
        />
      </View>
    );
  };

  const renderDescription = () => {
    if (selectedType !== 'describe') return null;

    return (
      <View style={dynamic.section}>
        <View style={dynamic.sectionHeader}>
          <Text style={dynamic.sectionTitleSmall}>Describe your workout</Text>
        </View>

        <TextInput
          style={dynamic.descriptionInput}
          value={description}
          onChangeText={setDescription}
          placeholder="E.g., 30 minutes of running in the park"
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          testID="description-input"
        />
      </View>
    );
  };

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Exercise',
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
          headerTintColor: theme.colors.text,
        }}
      />

      <ScrollView style={dynamic.scrollView} showsVerticalScrollIndicator={false}>
        {renderTypeSelection()}
        {renderIntensitySelection()}
        {renderDurationSelection()}
        {renderManualCalories()}
        {renderDescription()}
      </ScrollView>

      {selectedType && (
        <View style={[dynamic.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[dynamic.continueButton, isSubmitting && dynamic.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={isSubmitting}
            testID="continue-button"
          >
            <Text style={dynamic.continueButtonText}>
              {isSubmitting ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const stylesWithTheme = (Theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: Theme.colors.text,
      marginBottom: 20,
      letterSpacing: -0.5,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    },
    sectionTitleSmall: {
      fontSize: 18,
      fontWeight: '700',
      color: Theme.colors.text,
      letterSpacing: -0.3,
    },
    optionsContainer: {
      gap: 12,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: Theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      gap: 16,
      borderWidth: 2,
      borderColor: Theme.colors.border,
    },
    optionCardSelected: {
      borderColor: Theme.colors.primary700,
      backgroundColor: '#EEF5FF',
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: Theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionEmoji: {
      fontSize: 24,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: Theme.colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 14,
      color: Theme.colors.textMuted,
    },
    intensityContainer: {
      flexDirection: 'row',
      gap: 16,
    },
    intensityLabels: {
      flex: 1,
      gap: 12,
    },
    intensityOption: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: Theme.colors.surface,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    intensityActive: {
      backgroundColor: '#EEF5FF',
      borderColor: Theme.colors.primary700,
    },
    intensityLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: Theme.colors.text,
      marginBottom: 4,
    },
    intensityLabelActive: {
      color: Theme.colors.primary700,
    },
    intensityDesc: {
      fontSize: 13,
      color: Theme.colors.textMuted,
    },
    intensitySlider: {
      width: 8,
      backgroundColor: Theme.colors.accent,
      borderRadius: 4,
      position: 'relative' as const,
    },
    intensityIndicator: {
      position: 'absolute' as const,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: Theme.colors.primary700,
      left: -4,
    },
    intensityIndicatorHigh: {
      top: 0,
    },
    intensityIndicatorMedium: {
      top: '50%',
      marginTop: -8,
    },
    intensityIndicatorLow: {
      bottom: 0,
    },
    durationButtons: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    durationButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: Theme.colors.surface,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      alignItems: 'center',
    },
    durationButtonActive: {
      backgroundColor: Theme.colors.text,
      borderColor: Theme.colors.text,
    },
    durationButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: Theme.colors.text,
    },
    durationButtonTextActive: {
      color: Theme.colors.surface,
    },
    durationInput: {
      backgroundColor: Theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: Theme.colors.text,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    caloriesInput: {
      backgroundColor: Theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: Theme.colors.text,
      borderWidth: 1,
      borderColor: Theme.colors.border,
    },
    descriptionInput: {
      backgroundColor: Theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: Theme.colors.text,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      minHeight: 120,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 16,
      backgroundColor: Theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,
    },
    continueButton: {
      backgroundColor: Theme.colors.text,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
    continueButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: Theme.colors.surface,
    },
  });
