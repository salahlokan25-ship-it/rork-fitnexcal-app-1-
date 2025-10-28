import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { FoodItem } from '@/types/nutrition';
import { Theme } from '@/constants/theme';

interface FoodCardProps {
  food: FoodItem;
  onPress: () => void;
  showAddButton?: boolean;
}

export default function FoodCard({ food, onPress, showAddButton = true }: FoodCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image 
        source={{ uri: food.image_url || 'https://images.unsplash.com/photo-1546554137-f86b9593a222?w=300&h=200&fit=crop' }} 
        style={styles.image}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{food.name}</Text>
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
  container: {
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
  image: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    padding: 18,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  calories: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.primary700,
    marginBottom: 2,
  },
  serving: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginBottom: 12,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macro: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  macroLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
});