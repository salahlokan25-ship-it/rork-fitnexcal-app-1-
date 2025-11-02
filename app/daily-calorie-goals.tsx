import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme';
import { useUser } from '@/hooks/user-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function DailyCalorieGoalsScreen() {
  const { theme } = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();
  const [calorieGoal, setCalorieGoal] = useState<string>(user?.goal_calories?.toString() || '2000');

  const dynamic = stylesWithTheme(theme);

  const handleSave = async () => {
    const goal = parseInt(calorieGoal, 10);
    if (isNaN(goal) || goal < 1000 || goal > 5000) {
      Alert.alert('Invalid Value', 'Please enter a calorie goal between 1000 and 5000 kcal.');
      return;
    }
    await updateUser({ goal_calories: goal });
    Alert.alert('Success', 'Daily calorie goal updated successfully!', [
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
        <Text style={dynamic.title}>Daily Calorie Goals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={dynamic.content} contentContainerStyle={dynamic.scrollContent}>
        <Text style={dynamic.description}>
          Set your daily calorie target based on your goals (weight loss, maintenance, or muscle gain).
        </Text>

        <View style={dynamic.inputSection}>
          <Text style={dynamic.label}>Daily Calorie Goal (kcal)</Text>
          <TextInput
            style={dynamic.input}
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            keyboardType="numeric"
            placeholder="2000"
            placeholderTextColor={theme.colors.textMuted}
          />
          <Text style={dynamic.hint}>Recommended: 1500-2500 kcal for most adults</Text>
        </View>

        <View style={dynamic.infoCard}>
          <Text style={dynamic.infoTitle}>💡 Tip</Text>
          <Text style={dynamic.infoText}>
            Your calorie goal should align with your activity level and health objectives. Consult with a nutritionist for personalized recommendations.
          </Text>
        </View>

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
    marginBottom: 24,
    lineHeight: 22,
  },
  inputSection: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Theme.colors.text,
    marginBottom: 6,
  },
  hint: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
  infoCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    marginBottom: 24,
  },
  infoTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, marginBottom: 8 },
  infoText: { fontSize: 14, color: Theme.colors.textMuted, lineHeight: 20 },
  saveButton: {
    backgroundColor: Theme.colors.primary700,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
