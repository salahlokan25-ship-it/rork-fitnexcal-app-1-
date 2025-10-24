import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Minus, Flame, Egg, Wheat, Droplets, ChevronLeft, Coffee, Sun, Moon, Cookie } from 'lucide-react-native';
import { useNutrition } from '@/hooks/nutrition-store';
import { FoodItem, MealEntry } from '@/types/nutrition';



type AnalyzedFood = { name: string; calories: number; protein: number; carbs: number; fat: number; serving_size: string; confidence?: number; ingredients?: string[] };

type AnalysisPayload = { foods: AnalyzedFood[] };

export default function FoodAnalysisScreen() {
  const { analysis: analysisParam, imageUri } = useLocalSearchParams();
  const { addMeal } = useNutrition();
  
  const [selectedMealType, setSelectedMealType] = useState<MealEntry['meal_type']>('breakfast');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isAdding, setIsAdding] = useState(false);

  const analysis: AnalysisPayload = useMemo(() => {
    if (!analysisParam) {
      return { foods: [] };
    }
    try {
      return JSON.parse(analysisParam as string) as AnalysisPayload;
    } catch (error) {
      console.error('Error parsing analysis:', error);
      return { foods: [] };
    }
  }, [analysisParam]);

  // Initialize quantities only once when analysis changes
  React.useEffect(() => {
    if (analysis.foods && analysis.foods.length > 0) {
      const initialQuantities: Record<string, number> = {};
      analysis.foods.forEach((food: AnalyzedFood, index: number) => {
        initialQuantities[index.toString()] = 1;
      });
      setQuantities(initialQuantities);
    }
  }, [analysis.foods.length]); // Only depend on the length to avoid infinite loops

  if (!analysisParam) {
    return null;
  }

  const updateQuantity = (foodIndex: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [foodIndex]: Math.max(0.5, (prev[foodIndex] || 1) + delta)
    }));
  };



  const handleAddToLog = async () => {
    setIsAdding(true);
    
    try {
      for (let i = 0; i < analysis.foods.length; i++) {
        const food = analysis.foods[i];
        const quantity = quantities[i.toString()] || 1;
        
        const foodItem: FoodItem = {
          id: `analyzed_${Date.now()}_${i}`,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          serving_size: food.serving_size,
        };

        await addMeal(foodItem, quantity, selectedMealType, imageUri as string);
      }

      router.replace('/(tabs)/scan');
    } catch (error) {
      console.error('Error adding meals:', error);
      Alert.alert('Error', 'Failed to add food items. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} testID="analysis-scroll">
        {imageUri && (
          <View style={styles.imageHeader}>
            <Image source={{ uri: imageUri as string }} style={styles.foodImage} />
            <SafeAreaView style={styles.imageOverlay}>
              <View style={styles.headerRow}>
                <TouchableOpacity accessibilityRole="button" testID="back-btn" onPress={() => router.back()} style={styles.backBtn}>
                  <ChevronLeft size={22} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nutrition</Text>
                <View style={styles.headerPlaceholder} />
              </View>
            </SafeAreaView>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          </View>

          {analysis.foods.map((food, index) => (
            <View key={`food-${index}`}>
              <Text style={styles.cardTitle} numberOfLines={2} testID={`food-name-${index}`}>{food.name}</Text>
              <View style={styles.qtyControl}>
                <TouchableOpacity accessibilityRole="button" testID={`dec-${index}`} onPress={() => updateQuantity(index.toString(), -1)} style={styles.qtyBtn}>
                  <Minus size={18} color="#111" />
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{(quantities[index.toString()] ?? 1).toFixed(0)}</Text>
                <TouchableOpacity accessibilityRole="button" testID={`inc-${index}`} onPress={() => updateQuantity(index.toString(), 1)} style={styles.qtyBtn}>
                  <Plus size={18} color="#111" />
                </TouchableOpacity>
              </View>

              <View style={styles.caloriesPill} testID={`cal-pill-${index}`}>
                <Flame size={22} color="#111" />
                <View style={styles.spacer12} />
                <Text style={styles.caloriesBig}>{Math.round(food.calories * (quantities[index.toString()] || 1))}</Text>
                <Text style={styles.caloriesLabel}>Calories</Text>
              </View>

              <View style={styles.macrosRow}>
                <View style={styles.macroChip}>
                  <Egg size={16} color="#ec4899" />
                  <Text style={styles.macroLabel}>Protein</Text>
                  <Text style={styles.macroValue}>{Math.round(food.protein * (quantities[index.toString()] || 1))}g</Text>
                </View>
                <View style={styles.macroChip}>
                  <Wheat size={16} color="#f59e0b" />
                  <Text style={styles.macroLabel}>Carbs</Text>
                  <Text style={styles.macroValue}>{Math.round(food.carbs * (quantities[index.toString()] || 1))}g</Text>
                </View>
                <View style={styles.macroChip}>
                  <Droplets size={16} color="#3b82f6" />
                  <Text style={styles.macroLabel}>Fats</Text>
                  <Text style={styles.macroValue}>{Math.round(food.fat * (quantities[index.toString()] || 1))}g</Text>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Ingredients</Text>
                <TouchableOpacity accessibilityRole="button" onPress={() => {}} testID="add-more-ingredients">
                  <Text style={styles.addMore}>Add more</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ingredientsCard}>
                {(food.ingredients ?? food.name.split(' ').slice(0, 4).map(w => w.toLowerCase())).map((ing, i) => (
                  <View key={`ing-${index}-${i}`} style={styles.ingredientRow}>
                    <Text style={styles.ingredientName}>{ing}</Text>
                    <Text style={styles.ingredientQty}>{food.serving_size}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer} pointerEvents="auto" testID="footer-actions">
        <View style={styles.mealTypeSelector}>
          <TouchableOpacity
            style={[styles.mealTypeBtn, selectedMealType === 'breakfast' && styles.mealTypeBtnActive]}
            onPress={() => setSelectedMealType('breakfast')}
            accessibilityRole="button"
            testID="meal-type-breakfast"
          >
            <Coffee size={18} color={selectedMealType === 'breakfast' ? '#fff' : '#666'} />
            <Text style={[styles.mealTypeLabel, selectedMealType === 'breakfast' && styles.mealTypeLabelActive]}>Breakfast</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mealTypeBtn, selectedMealType === 'lunch' && styles.mealTypeBtnActive]}
            onPress={() => setSelectedMealType('lunch')}
            accessibilityRole="button"
            testID="meal-type-lunch"
          >
            <Sun size={18} color={selectedMealType === 'lunch' ? '#fff' : '#666'} />
            <Text style={[styles.mealTypeLabel, selectedMealType === 'lunch' && styles.mealTypeLabelActive]}>Lunch</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mealTypeBtn, selectedMealType === 'dinner' && styles.mealTypeBtnActive]}
            onPress={() => setSelectedMealType('dinner')}
            accessibilityRole="button"
            testID="meal-type-dinner"
          >
            <Moon size={18} color={selectedMealType === 'dinner' ? '#fff' : '#666'} />
            <Text style={[styles.mealTypeLabel, selectedMealType === 'dinner' && styles.mealTypeLabelActive]}>Dinner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mealTypeBtn, selectedMealType === 'snack' && styles.mealTypeBtnActive]}
            onPress={() => setSelectedMealType('snack')}
            accessibilityRole="button"
            testID="meal-type-snack"
          >
            <Cookie size={18} color={selectedMealType === 'snack' ? '#fff' : '#666'} />
            <Text style={[styles.mealTypeLabel, selectedMealType === 'snack' && styles.mealTypeLabelActive]}>Snack</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.fixBtn} onPress={() => router.replace('/(tabs)/scan')} accessibilityRole="button" testID="fix-results">
            <Plus size={16} color="#111" />
            <Text style={styles.fixText}>Fix Results</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.doneBtn, isAdding && styles.doneBtnDisabled]}
            onPress={handleAddToLog}
            disabled={isAdding}
            accessibilityRole="button"
            testID="done-btn"
          >
            <Text style={styles.doneText}>{isAdding ? 'Adding...' : 'Done'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 160,
  },
  imageHeader: {
    position: 'relative',
  },
  foodImage: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
    height: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeBadge: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginTop: 12,
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    minWidth: 24,
    textAlign: 'center',
  },
  caloriesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  spacer12: {
    width: 12,
    height: 1,
  },
  caloriesBig: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    marginRight: 8,
  },
  caloriesLabel: {
    fontSize: 14,
    color: '#666',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  macroChip: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    gap: 4,
  },
  macroLabel: {
    fontSize: 12,
    color: '#666',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addMore: {
    color: '#007AFF',
    fontWeight: '600',
  },
  ingredientsCard: {
    backgroundColor: '#f7f7f8',
    borderRadius: 16,
    padding: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  ingredientName: {
    fontSize: 14,
    color: '#111',
  },
  ingredientQty: {
    fontSize: 12,
    color: '#666',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  confidence: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  servingSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionItem: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  quantityButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    minWidth: 50,
    textAlign: 'center',
  },
  totalCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  mealTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    gap: 8,
  },
  mealTypeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  mealTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  mealTypeTextActive: {
    color: 'white',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  mealTypeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  mealTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
    gap: 4,
  },
  mealTypeBtnActive: {
    backgroundColor: '#007AFF',
  },
  mealTypeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  mealTypeLabelActive: {
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  fixBtn: {
    flex: 1,
    backgroundColor: '#f4f4f5',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  fixText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnDisabled: {
    backgroundColor: '#888',
  },
  doneText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  addButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});