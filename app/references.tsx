import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { Info, ExternalLink, BookOpen, Database, Brain } from 'lucide-react-native';

export default function ReferencesScreen() {
  const { theme } = useTheme();
  const dynamic = stylesWithTheme(theme);

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={dynamic.container}>
      <Stack.Screen
        options={{
          title: 'References',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false}>
        <View style={dynamic.header}>
          <View style={dynamic.iconContainer}>
            <Info size={32} color={theme.colors.primary700} />
          </View>
          <Text style={dynamic.headerTitle}>References & Sources</Text>
          <Text style={dynamic.headerSubtitle}>
            Scientific foundations and data sources used in FitnexCal
          </Text>
        </View>

        <View style={dynamic.section}>
          <View style={dynamic.categoryHeader}>
            <BookOpen size={24} color={theme.colors.primary700} />
            <Text style={dynamic.categoryTitle}>Nutritional Guidelines</Text>
          </View>

          <TouchableOpacity
            style={dynamic.referenceCard}
            onPress={() => openLink('https://www.who.int/nutrition')}
          >
            <View style={dynamic.referenceContent}>
              <Text style={dynamic.referenceTitle}>World Health Organization (WHO)</Text>
              <Text style={dynamic.referenceDescription}>
                Global nutrition guidelines and recommendations
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamic.referenceCard}
            onPress={() => openLink('https://www.usda.gov/nutrition')}
          >
            <View style={dynamic.referenceContent}>
              <Text style={dynamic.referenceTitle}>USDA Dietary Guidelines</Text>
              <Text style={dynamic.referenceDescription}>
                Evidence-based nutritional guidance for Americans
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={dynamic.section}>
          <View style={dynamic.categoryHeader}>
            <Database size={24} color={theme.colors.primary700} />
            <Text style={dynamic.categoryTitle}>Food Databases</Text>
          </View>

          <TouchableOpacity
            style={dynamic.referenceCard}
            onPress={() => openLink('https://fdc.nal.usda.gov/')}
          >
            <View style={dynamic.referenceContent}>
              <Text style={dynamic.referenceTitle}>USDA FoodData Central</Text>
              <Text style={dynamic.referenceDescription}>
                Comprehensive nutrient database for foods
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={dynamic.referenceCard}
            onPress={() => openLink('https://www.nutritionix.com/')}
          >
            <View style={dynamic.referenceContent}>
              <Text style={dynamic.referenceTitle}>Nutritionix API</Text>
              <Text style={dynamic.referenceDescription}>
                Detailed nutritional information for foods and brands
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={dynamic.section}>
          <View style={dynamic.categoryHeader}>
            <Brain size={24} color={theme.colors.primary700} />
            <Text style={dynamic.categoryTitle}>AI & Machine Learning</Text>
          </View>

          <View style={dynamic.referenceCard}>
            <View style={dynamic.referenceContent}>
              <Text style={dynamic.referenceTitle}>OpenAI GPT-4 Vision</Text>
              <Text style={dynamic.referenceDescription}>
                Advanced AI model for food image recognition and analysis
              </Text>
            </View>
          </View>

          <View style={dynamic.referenceCard}>
            <View style={dynamic.referenceContent}>
              <Text style={dynamic.referenceTitle}>Google Gemini</Text>
              <Text style={dynamic.referenceDescription}>
                Multimodal AI for nutritional content estimation
              </Text>
            </View>
          </View>
        </View>

        <View style={dynamic.section}>
          <View style={dynamic.categoryHeader}>
            <BookOpen size={24} color={theme.colors.primary700} />
            <Text style={dynamic.categoryTitle}>Scientific Research</Text>
          </View>

          <View style={dynamic.infoCard}>
            <Text style={dynamic.infoTitle}>BMR Calculation</Text>
            <Text style={dynamic.infoText}>
              Mifflin-St Jeor Equation (1990) - Most accurate method for calculating Basal Metabolic Rate
            </Text>
          </View>

          <View style={dynamic.infoCard}>
            <Text style={dynamic.infoTitle}>Activity Multipliers</Text>
            <Text style={dynamic.infoText}>
              Based on research from the American College of Sports Medicine (ACSM)
            </Text>
          </View>

          <View style={dynamic.infoCard}>
            <Text style={dynamic.infoTitle}>Macro Distribution</Text>
            <Text style={dynamic.infoText}>
              Recommendations based on the Acceptable Macronutrient Distribution Ranges (AMDR) by the Institute of Medicine
            </Text>
          </View>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.disclaimerTitle}>Disclaimer</Text>
          <Text style={dynamic.disclaimerText}>
            While FitnexCal uses scientifically-backed methods and reliable data sources, the information provided should not replace professional medical or nutritional advice. Individual nutritional needs vary, and we recommend consulting with healthcare professionals for personalized guidance.
          </Text>
        </View>

        <View style={dynamic.footer}>
          <Text style={dynamic.footerText}>
            FitnexCal is committed to providing accurate, evidence-based nutritional information to help you achieve your health goals.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const stylesWithTheme = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  referenceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  referenceContent: {
    flex: 1,
    marginRight: 12,
  },
  referenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  referenceDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  disclaimerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  footer: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
