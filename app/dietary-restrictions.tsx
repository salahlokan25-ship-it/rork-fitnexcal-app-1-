import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/theme';
import { useUser } from '@/hooks/user-store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🌱' },
  { id: 'vegan', label: 'Vegan', emoji: '🥬' },
  { id: 'gluten_free', label: 'Gluten-Free', emoji: '🌾' },
  { id: 'lactose_free', label: 'Lactose-Free', emoji: '🥛' },
  { id: 'keto', label: 'Keto', emoji: '🥑' },
  { id: 'paleo', label: 'Paleo', emoji: '🍖' },
  { id: 'halal', label: 'Halal', emoji: '☪️' },
  { id: 'kosher', label: 'Kosher', emoji: '✡️' },
  { id: 'low_carb', label: 'Low-Carb', emoji: '🥗' },
  { id: 'low_sodium', label: 'Low-Sodium', emoji: '🧂' },
];

export default function DietaryRestrictionsScreen() {
  const { theme } = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(user?.allergies || []);

  const dynamic = stylesWithTheme(theme);

  const toggleRestriction = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    await updateUser({ allergies: selected });
    Alert.alert('Success', 'Dietary restrictions updated successfully!', [
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
        <Text style={dynamic.title}>Dietary Restrictions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={dynamic.content} contentContainerStyle={dynamic.scrollContent}>
        <Text style={dynamic.description}>
          Select all dietary preferences and restrictions that apply to you. This helps personalize your meal recommendations.
        </Text>

        <View style={dynamic.optionsGrid}>
          {DIETARY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                dynamic.optionCard,
                selected.includes(option.id) && dynamic.optionCardSelected,
              ]}
              onPress={() => toggleRestriction(option.id)}
            >
              <Text style={dynamic.optionEmoji}>{option.emoji}</Text>
              <Text style={dynamic.optionLabel}>{option.label}</Text>
              {selected.includes(option.id) && (
                <View style={dynamic.checkBadge}>
                  <Check size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
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
    marginBottom: 20,
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  optionCard: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderRadius: 12,
    padding: 16,
    width: '47%',
    alignItems: 'center',
    position: 'relative',
  },
  optionCardSelected: {
    borderColor: Theme.colors.primary700,
    backgroundColor: Theme.colors.surface,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary700,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
