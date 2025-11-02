import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme';
import { useUser } from '@/hooks/user-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_LEVELS = [
  { id: 'sedentary' as ActivityLevel, label: 'Sedentary', description: 'Little or no exercise' },
  { id: 'light' as ActivityLevel, label: 'Lightly Active', description: 'Exercise 1-3 days/week' },
  { id: 'moderate' as ActivityLevel, label: 'Moderately Active', description: 'Exercise 3-5 days/week' },
  { id: 'active' as ActivityLevel, label: 'Active', description: 'Exercise 6-7 days/week' },
  { id: 'very_active' as ActivityLevel, label: 'Very Active', description: 'Intense exercise daily' },
];

export default function ActivityLevelScreen() {
  const { theme } = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<ActivityLevel>(user?.activity_level || 'moderate');

  const dynamic = stylesWithTheme(theme);

  const handleSave = async () => {
    await updateUser({ activity_level: selected });
    Alert.alert('Success', 'Activity level updated successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={dynamic.header}>
        <TouchableOpacity onPress={() => router.back()} style={dynamic.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamic.title}>Activity Level</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={dynamic.content} contentContainerStyle={dynamic.scrollContent}>
        <Text style={dynamic.description}>
          Select your typical weekly activity level to help calculate your calorie needs.
        </Text>

        {ACTIVITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              dynamic.optionCard,
              selected === level.id && dynamic.optionCardSelected,
            ]}
            onPress={() => setSelected(level.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={dynamic.optionLabel}>{level.label}</Text>
              <Text style={dynamic.optionDescription}>{level.description}</Text>
            </View>
            {selected === level.id && (
              <View style={dynamic.checkCircle}>
                <Check size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={dynamic.saveButton} onPress={handleSave}>
          <Text style={dynamic.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: Theme.colors.text },
  content: { flex: 1 },
  scrollContent: { padding: 16 },
  description: {
    fontSize: 15,
    color: Theme.colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
  optionCard: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionCardSelected: {
    borderColor: Theme.colors.primary700,
    backgroundColor: Theme.colors.surface,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary700,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Theme.colors.primary700,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
