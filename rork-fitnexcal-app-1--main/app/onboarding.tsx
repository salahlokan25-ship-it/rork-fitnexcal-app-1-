import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';
import { useUser } from '@/hooks/user-store';
import { useI18n } from '@/hooks/i18n';

const STEPS = [
  'language',
  'name',
  'age',
  'height',
  'weight',
  'gender',
  'goals',
  'weight_goal',
  'activity',
  'complete',
] as const;

type Step = typeof STEPS[number];

type FormState = {
  name: string;
  age: string;
  gender: '' | 'male' | 'female' | 'other';
  height: string;
  weight: string;
  weight_goal: string;
  activity_level: any;
  goal: any;
};

export default function OnboardingScreen() {
  const { createUser, completeOnboarding } = useUser();
  const { t, available, setLanguage, language } = useI18n();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    weight_goal: '',
    activity_level: 'moderate' as any,
    goal: 'maintain_weight' as any,
  });

  const progressPct = useMemo(() => ((currentStep + 1) / STEPS.length) * 100, [currentStep]);

  const ACTIVITY_LEVELS = [
    { key: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { key: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
    { key: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
    { key: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
    { key: 'very_active', label: 'Very Active', description: 'Very hard exercise, physical job' },
  ] as const;

  const GOALS = [
    { key: 'lose_weight', labelKey: 'lose_weight', description: 'Create a calorie deficit' },
    { key: 'maintain_weight', labelKey: 'maintain_weight', description: 'Stay at current weight' },
    { key: 'gain_weight', labelKey: 'gain_weight', description: 'Build muscle and mass' },
  ] as const;

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      try {
        await createUser({
          name: formData.name,
          age: parseInt(formData.age, 10),
          gender: (formData.gender === '' ? 'male' : formData.gender) as 'male' | 'female' | 'other',
          height: parseInt(formData.height, 10),
          weight: parseInt(formData.weight, 10),
          weightGoal: parseInt(formData.weight_goal, 10),
          activity_level: formData.activity_level,
          goal: formData.goal,
        });
        await completeOnboarding();
        router.replace('/paywall');
      } catch (_err) {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const isStepValid = () => {
    const step: Step = STEPS[currentStep];
    switch (step) {
      case 'language':
        return true;
      case 'name':
        return formData.name.trim().length > 0;
      case 'age':
        return /^\d+$/.test(formData.age);
      case 'height':
        return /^\d+$/.test(formData.height);
      case 'weight':
        return /^\d+$/.test(formData.weight);
      case 'gender':
        return formData.gender !== '';
      case 'goals':
        return Boolean(formData.goal);
      case 'weight_goal':
        return /^\d+$/.test(formData.weight_goal);
      case 'activity':
        return Boolean(formData.activity_level);
      default:
        return true;
    }
  };

  const renderGenderStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('onboarding_gender_title')}</Text>
      <Text style={styles.stepDescription}>{t('onboarding_gender_desc')}</Text>
      <View style={{ gap: 12 }}>
        {(['male', 'female', 'other'] as const).map((g) => {
          const map: Record<string, string> = { male: t('male'), female: t('female'), other: t('other') };
          const label = map[g];
          const selected = formData.gender === g;
          return (
            <TouchableOpacity
              key={g}
              activeOpacity={0.9}
              onPress={() => setFormData({ ...formData, gender: g })}
              style={[styles.choiceButton, selected && styles.choiceButtonActive]}
              testID={`gender-${g}`}
              accessibilityRole="button"
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );



  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('tell_about_you')}</Text>
      <Text style={styles.stepDescription}>{t('calc_personalized')}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('name')}</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder={t('name')}
          testID="onboarding-name"
        />
      </View>
    </View>
  );

  const renderAgeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('age')}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          placeholder="25"
          keyboardType="numeric"
          testID="onboarding-age"
        />
      </View>
    </View>
  );

  const renderHeightStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('height_cm')}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={formData.height}
          onChangeText={(text) => setFormData({ ...formData, height: text })}
          placeholder="170"
          keyboardType="numeric"
          testID="onboarding-height"
        />
      </View>
    </View>
  );

  const renderWeightStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('weight_kg')}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={formData.weight}
          onChangeText={(text) => setFormData({ ...formData, weight: text })}
          placeholder="70"
          keyboardType="numeric"
          testID="onboarding-weight"
        />
      </View>
    </View>
  );

  const renderGoalsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('goals_title')}</Text>
      <Text style={styles.stepDescription}>{t('goals_desc')}</Text>

      {GOALS.map((goal) => (
        <TouchableOpacity
          key={goal.key}
          style={[styles.optionCard, formData.goal === goal.key && styles.optionCardActive]}
          onPress={() => setFormData({ ...formData, goal: goal.key as any })}
          testID={`goal-${goal.key}`}
          accessibilityRole="button"
        >
          <Text style={[styles.optionTitle, formData.goal === goal.key && styles.optionTitleActive]}>
            {t(goal.labelKey)}
          </Text>
          <Text style={[styles.optionDescription, formData.goal === goal.key && styles.optionDescriptionActive]}>
            {goal.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWeightGoalStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('target_weight_title')}</Text>
      <Text style={styles.stepDescription}>{t('target_weight_desc')}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{t('target_weight_kg')}</Text>
        <TextInput
          style={styles.input}
          value={formData.weight_goal}
          onChangeText={(text) => setFormData({ ...formData, weight_goal: text })}
          placeholder="65"
          keyboardType="numeric"
        />
      </View>

      {formData.weight && formData.weight_goal && (
        <View style={styles.goalInfoCard}>
          <Text style={styles.goalInfoText}>
            {parseInt(formData.weight_goal) < parseInt(formData.weight)
              ? t('you_want_lose', { kg: parseInt(formData.weight) - parseInt(formData.weight_goal) })
              : parseInt(formData.weight_goal) > parseInt(formData.weight)
              ? t('you_want_gain', { kg: parseInt(formData.weight_goal) - parseInt(formData.weight) })
              : t('you_want_maintain')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderActivityStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('activity_level')}</Text>
      <Text style={styles.stepDescription}>{t('activity_desc')}</Text>

      {ACTIVITY_LEVELS.map((level) => (
        <TouchableOpacity
          key={level.key}
          style={[styles.optionCard, formData.activity_level === level.key && styles.optionCardActive]}
          onPress={() => setFormData({ ...formData, activity_level: level.key as any })}
          testID={`activity-${level.key}`}
          accessibilityRole="button"
        >
          <Text style={[styles.optionTitle, formData.activity_level === level.key && styles.optionTitleActive]}>
            {level.label}
          </Text>
          <Text style={[styles.optionDescription, formData.activity_level === level.key && styles.optionDescriptionActive]}>
            {level.description}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('youre_all_set')}</Text>
      <Text style={styles.stepDescription}>
        {t('summary_ready')}
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>{t('your_profile')}</Text>
        <Text style={styles.summaryText}>Name: {formData.name}</Text>
        <Text style={styles.summaryText}>Age: {formData.age} years</Text>
        <Text style={styles.summaryText}>Height: {formData.height} cm</Text>
        <Text style={styles.summaryText}>Weight: {formData.weight} kg</Text>
        <Text style={styles.summaryText}>Target Weight: {formData.weight_goal} kg</Text>
        <Text style={styles.summaryText}>Goal: {GOALS.find((g) => g.key === formData.goal)?.labelKey}</Text>
        <Text style={styles.summaryText}>Activity: {ACTIVITY_LEVELS.find((a) => a.key === formData.activity_level)?.label}</Text>
      </View>
    </View>
  );

  const renderLanguageStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{t('language_title')}</Text>
      <Text style={styles.stepDescription}>{t('language_desc')}</Text>
      <View style={{ gap: 12 }}>
        {available.map((opt) => {
          const selected = language === opt.code;
          return (
            <TouchableOpacity
              key={opt.code}
              onPress={() => setLanguage(opt.code)}
              style={[styles.choiceButton, selected && styles.choiceButtonActive]}
              testID={`lang-${opt.code}`}
            >
              <Text style={[styles.choiceText, selected && styles.choiceTextActive]}>{opt.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    const step: Step = STEPS[currentStep];
    switch (step) {
      case 'language':
        return renderLanguageStep();
      case 'name':
        return renderNameStep();
      case 'age':
        return renderAgeStep();
      case 'height':
        return renderHeightStep();
      case 'weight':
        return renderWeightStep();
      case 'gender':
        return renderGenderStep();
      case 'goals':
        return renderGoalsStep();
      case 'weight_goal':
        return renderWeightGoalStep();
      case 'activity':
        return renderActivityStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerBack} testID="onboarding-back">
          <ChevronLeft size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, !isStepValid() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isStepValid()}
          testID="onboarding-next"
        >
          <Text style={styles.nextButtonText}>
            {currentStep === STEPS.length - 1 ? t('get_started') : t('next')}
          </Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E8E8EA',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#1F6BFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingVertical: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'left',
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'left',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  optionCardActive: {
    borderColor: '#1F6BFF',
    backgroundColor: '#1F6BFF',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  optionTitleActive: {
    color: '#ffffff',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionActive: {
    color: '#E6EEFF',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'web' ? 12 : 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F6BFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    shadowColor: '#1F6BFF',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 2,
  },
  nextButtonDisabled: {
    backgroundColor: '#BFC6D3',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  choiceButton: {
    backgroundColor: '#F6F7FB',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF5',
  },
  choiceButtonActive: {
    backgroundColor: '#1F6BFF',
    borderColor: '#1F6BFF',
  },
  choiceText: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  choiceTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  goalInfoCard: {
    backgroundColor: '#E6F0FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  goalInfoText: {
    fontSize: 16,
    color: '#1F6BFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});