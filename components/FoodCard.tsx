import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ViewStyle } from 'react-native';
import { FoodItem } from '@/types/nutrition';
import { Theme } from '@/constants/theme';

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  showAddButton?: boolean;
  variant?: 'list' | 'grid';
  containerStyle?: ViewStyle;
}

export default function FoodCard({ food, onPress, showAddButton = true, variant = 'list', containerStyle }: FoodCardProps) {
  const isGrid = variant === 'grid';
  return (
    <TouchableOpacity
      testID={`food-card-${food.id}`}
      style={[isGrid ? styles.containerGrid : styles.containerList, containerStyle]}
      onPress={onPress}
    >
      <Image
        source={{ uri: food.image_url || 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=600&h=400&fit=crop' }}
        style={isGrid ? styles.imageGrid : styles.imageList}
      />
      <View style={styles.content}>
        <Text style={isGrid ? styles.nameGrid : styles.name} numberOfLines={2}>{food.name}</Text>
        <Text style={styles.calories}>{food.calories} cal</Text>
        <Text style={styles.serving}>{food.serving_size}</Text>
        <View style={styles.macros}>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{food.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{food.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macro}>
            <Text style={styles.macroValue}>{food.fat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerList: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  containerGrid: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  imageList: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageGrid: {
    width: '100%',
    height: 110,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  nameGrid: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  calories: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Theme.colors.primary700,
    marginBottom: 2,
  },
  serving: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginBottom: 10,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macro: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Theme.colors.text,
  },
  macroLabel: {
    fontSize: 11,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
});