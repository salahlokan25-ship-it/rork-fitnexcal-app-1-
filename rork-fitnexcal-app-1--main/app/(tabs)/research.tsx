import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Search, Globe, Filter, X } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { searchFoods, getFoodsByCountry, searchFoodsByCategory, searchNutritionXFoods } from '@/services/food-api';
import { COUNTRIES_FOODS } from '@/constants/nutrition';
import FoodCard from '@/components/FoodCard';
import { useTheme } from '@/hooks/theme';


export default function ResearchScreen() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<{
    maxCalories?: number;
    minProtein?: number;
    category?: string;
  }>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['food-search', searchQuery, searchFilters],
    queryFn: () => {
      if (Object.keys(searchFilters).length > 0) {
        return searchNutritionXFoods(searchQuery, searchFilters);
      }
      return searchFoods(searchQuery);
    },
    enabled: searchQuery.length > 2,
  });

  const { data: categoryResults = [], isLoading: isLoadingCategory } = useQuery({
    queryKey: ['category-search', searchFilters.category],
    queryFn: () => searchFoodsByCategory(searchFilters.category!),
    enabled: !!searchFilters.category && !searchQuery,
  });

  const { data: countryFoods = [], isLoading: isLoadingCountry } = useQuery({
    queryKey: ['country-foods', selectedCountry],
    queryFn: () => getFoodsByCountry(selectedCountry!),
    enabled: !!selectedCountry,
  });

  const handleFoodPress = () => {
    console.log('Food pressed');
  };

  const dynamic = stylesWithTheme(theme);

  const renderCountryButton = ({ item }: { item: typeof COUNTRIES_FOODS[0] }) => (
    <TouchableOpacity
      testID={`country-${item.code}`}
      style={[
        dynamic.countryButton,
        selectedCountry === item.code && dynamic.countryButtonActive
      ]}
      onPress={() => setSelectedCountry(item.code)}
    >
      <Text style={dynamic.countryFlag}>{item.flag}</Text>
      <Text style={[
        dynamic.countryName,
        selectedCountry === item.code && dynamic.countryNameActive
      ]}>
        {item.country}
      </Text>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }: { item: any }) => (
    <FoodCard
      food={item}
      onPress={handleFoodPress}
    />
  );

  return (
    <View style={dynamic.container}>
      <View style={dynamic.header}>
        <Text style={dynamic.title}>Food Research</Text>
        <Text style={dynamic.subtitle}>Discover foods from around the world</Text>
      </View>

      <View style={dynamic.searchContainer}>
        <View style={dynamic.searchBar}>
          <Search size={20} color="#666" />
          <TextInput
            style={dynamic.searchInput}
            placeholder="Search for foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          <TouchableOpacity 
            style={dynamic.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} color={showFilters ? "#0066FF" : "#666"} />
          </TouchableOpacity>
        </View>
        
        {showFilters && (
          <View style={dynamic.filtersContainer}>
            <Text style={dynamic.filtersTitle}>Filters</Text>
            
            <View style={dynamic.filterRow}>
              <Text style={dynamic.filterLabel}>Max Calories:</Text>
              <TextInput
                style={dynamic.filterInput}
                placeholder="e.g. 300"
                value={searchFilters.maxCalories?.toString() || ''}
                onChangeText={(text) => setSearchFilters(prev => ({
                  ...prev,
                  maxCalories: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={dynamic.filterRow}>
              <Text style={dynamic.filterLabel}>Min Protein (g):</Text>
              <TextInput
                style={dynamic.filterInput}
                placeholder="e.g. 10"
                value={searchFilters.minProtein?.toString() || ''}
                onChangeText={(text) => setSearchFilters(prev => ({
                  ...prev,
                  minProtein: text ? parseInt(text) : undefined
                }))}
                keyboardType="numeric"
              />
            </View>
            
            <View style={dynamic.filterRow}>
              <Text style={dynamic.filterLabel}>Category:</Text>
              <TextInput
                style={dynamic.filterInput}
                placeholder="e.g. dairy, meat, vegetables"
                value={searchFilters.category || ''}
                onChangeText={(text) => setSearchFilters(prev => ({
                  ...prev,
                  category: text || undefined
                }))}
              />
            </View>
            
            <TouchableOpacity 
              style={dynamic.clearFiltersButton}
              onPress={() => setSearchFilters({})}
            >
              <X size={16} color="#666" />
              <Text style={dynamic.clearFiltersText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {searchQuery.length > 2 && (
        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>
            Search Results {Object.keys(searchFilters).length > 0 && '(Filtered)'}
          </Text>
          {isSearching ? (
            <Text style={dynamic.loadingText}>Searching...</Text>
          ) : searchResults.length === 0 ? (
            <Text style={dynamic.emptyText}>No foods found for &quot;{searchQuery}&quot;</Text>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderFoodItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={dynamic.searchResultsList}
            />
          )}
        </View>
      )}
      
      {!searchQuery && searchFilters.category && (
        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>
            {searchFilters.category.charAt(0).toUpperCase() + searchFilters.category.slice(1)} Foods
          </Text>
          {isLoadingCategory ? (
            <Text style={dynamic.loadingText}>Loading category foods...</Text>
          ) : categoryResults.length === 0 ? (
            <Text style={dynamic.emptyText}>No foods found in this category</Text>
          ) : (
            <FlatList
              data={categoryResults}
              renderItem={renderFoodItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={dynamic.searchResultsList}
            />
          )}
        </View>
      )}

      {searchQuery.length <= 2 && !searchFilters.category && (
        <>
          <View style={dynamic.section}>
            <View style={dynamic.sectionHeader}>
              <Globe size={24} color="#0066FF" />
              <Text style={dynamic.sectionTitle}>Explore by Country</Text>
            </View>
            
            <FlatList
              data={COUNTRIES_FOODS}
              renderItem={renderCountryButton}
              keyExtractor={(item) => item.code}
              numColumns={2}
              columnWrapperStyle={dynamic.countryRow}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {selectedCountry && (
            <View style={dynamic.section}>
              <Text style={dynamic.sectionTitle}>
                {COUNTRIES_FOODS.find(c => c.code === selectedCountry)?.country} Foods
              </Text>
              
              {isLoadingCountry ? (
                <Text style={dynamic.loadingText}>Loading foods...</Text>
              ) : countryFoods.length === 0 ? (
                <Text style={dynamic.emptyText}>No foods available for this country yet.</Text>
              ) : (
                <FlatList
                  data={countryFoods}
                  renderItem={renderFoodItem}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          )}
        </>
      )}
    </View>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Theme.colors.text,
  },
  section: {
    flex: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  countryRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  countryButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.primary700,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 2,
    borderColor: Theme.colors.primary700,
  },
  countryButtonActive: {
    borderColor: Theme.colors.primary500,
    backgroundColor: Theme.colors.primary600,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  countryNameActive: {
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
    fontStyle: 'italic',
  },
  searchResultsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#0066FF20',
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  filtersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.primary700,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    color: Theme.colors.text,
    width: 120,
    fontWeight: '500',
  },
  filterInput: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  clearFiltersText: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },
});
