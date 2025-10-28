import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { MealEntry } from '@/types/nutrition';
import { Theme } from '@/constants/theme';

interface MealCardProps {
  meal: MealEntry;
  onDelete: () => void;
}

export default function MealCard({ meal, onDelete }: MealCardProps) {
  const totalCalories = Math.round(meal.food_item.calories * meal.quantity);
  const totalProtein = Math.round(meal.food_item.protein * meal.quantity);
  const totalCarbs = Math.round(meal.food_item.carbs * meal.quantity);
  const totalFat = Math.round(meal.food_item.fat * meal.quantity);

  return (
    <View style={styles.container} testID="meal-card">
      <Image
        source={{
          uri:
            meal.image_url ||
            meal.food_item.image_url ||
            'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=300&h=200&fit=crop',
        }}
        style={styles.image}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {meal.food_item.name}
          </Text>
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton} accessibilityLabel="Delete meal" testID="delete-meal">
            <Trash2 size={18} color={Theme.colors.danger} />
          </TouchableOpacity>
        </View>

        <Text style={styles.quantity}>
          {meal.quantity}x {meal.food_item.serving_size}
        </Text>

        <View style={styles.nutrition}>
          <View style={styles.calBadge}>
            <Text style={styles.calBadgeText}>{totalCalories} cal</Text>
          </View>
          <View style={styles.macros}>
            <Text style={styles.macro}>P {totalProtein}g</Text>
            <View style={styles.dot} />
            <Text style={styles.macro}>C {totalCarbs}g</Text>
            <View style={styles.dot} />
            <Text style={styles.macro}>F {totalFat}g</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  image: {
    width: 68,
    height: 68,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.12)',
  },
  quantity: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  nutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  calBadge: {
    backgroundColor: Theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  calBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.primary700,
    letterSpacing: -0.1,
  },
  macros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macro: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.border,
  },
});
