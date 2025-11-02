import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme';
import { useUser } from '@/hooks/user-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MacronutrientTargetsScreen() {
  const { theme } = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();
  
  const [protein, setProtein] = useState<string>(user?.goal_protein?.toString() || '150');
  const [carbs, setCarbs] = useState<string>(user?.goal_carbs?.toString() || '200');
  const [fat, setFat] = useState<string>(user?.goal_fat?.toString() || '65');

  const dynamic = stylesWithTheme(theme);

  const handleSave = async () => {
    const p = parseInt(protein, 10);
    const c = parseInt(carbs, 10);
    const f = parseInt(fat, 10);
    
    if (isNaN(p) || isNaN(c) || isNaN(f) || p < 0 || c < 0 || f < 0) {
      Alert.alert('Invalid Values', 'Please enter valid positive numbers for all macros.');
      return;
    }
    
    await updateUser({ 
      goal_protein: p,
      goal_carbs: c,
      goal_fat: f,
    });
    
    Alert.alert('Success', 'Macronutrient targets updated successfully!', [
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
        <Text style={dynamic.title}>Macronutrient Targets</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={dynamic.content} contentContainerStyle={dynamic.scrollContent}>
        <Text style={dynamic.description}>
          Set your daily targets for protein, carbohydrates, and fats to match your dietary goals.
        </Text>

        <View style={dynamic.inputSection}>
          <Text style={dynamic.label}>Protein (g)</Text>
          <TextInput
            style={dynamic.input}
            value={protein}
            onChangeText={setProtein}
            keyboardType="numeric"
            placeholder="150"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={dynamic.inputSection}>
          <Text style={dynamic.label}>Carbohydrates (g)</Text>
          <TextInput
            style={dynamic.input}
            value={carbs}
            onChangeText={setCarbs}
            keyboardType="numeric"
            placeholder="200"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={dynamic.inputSection}>
          <Text style={dynamic.label}>Fats (g)</Text>
          <TextInput
            style={dynamic.input}
            value={fat}
            onChangeText={setFat}
            keyboardType="numeric"
            placeholder="65"
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>

        <View style={dynamic.infoCard}>
          <Text style={dynamic.infoTitle}>📊 Quick Reference</Text>
          <Text style={dynamic.infoText}>
            • Protein: 4 kcal/g{'\n'}
            • Carbs: 4 kcal/g{'\n'}
            • Fats: 9 kcal/g{'\n\n'}
            Balance your macros based on your fitness and health goals.
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
  inputSection: { marginBottom: 20 },
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
  },
  infoCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
    marginBottom: 24,
    marginTop: 4,
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
