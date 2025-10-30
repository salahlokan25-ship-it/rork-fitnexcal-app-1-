import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { FileText } from 'lucide-react-native';

export default function TermsOfServiceScreen() {
  const { theme } = useTheme();
  const dynamic = stylesWithTheme(theme);

  return (
    <View style={dynamic.container}>
      <Stack.Screen
        options={{
          title: 'Terms of Service',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false}>
        <View style={dynamic.header}>
          <View style={dynamic.iconContainer}>
            <FileText size={32} color={theme.colors.primary700} />
          </View>
          <Text style={dynamic.headerTitle}>Terms of Service</Text>
          <Text style={dynamic.headerSubtitle}>Last updated: January 2025</Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={dynamic.paragraph}>
            By accessing and using FitnexCal, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our app.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>2. Description of Service</Text>
          <Text style={dynamic.paragraph}>
            FitnexCal is an AI-powered nutrition tracking application that helps users monitor their food intake, track calories and macronutrients, and achieve their health goals. The service includes:
          </Text>
          <Text style={dynamic.bulletPoint}>• AI-powered food recognition from photos</Text>
          <Text style={dynamic.bulletPoint}>• Calorie and macro tracking</Text>
          <Text style={dynamic.bulletPoint}>• Personalized nutrition recommendations</Text>
          <Text style={dynamic.bulletPoint}>• Exercise logging and tracking</Text>
          <Text style={dynamic.bulletPoint}>• Progress analytics and insights</Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>3. User Responsibilities</Text>
          <Text style={dynamic.paragraph}>
            You agree to:
          </Text>
          <Text style={dynamic.bulletPoint}>• Provide accurate and complete information</Text>
          <Text style={dynamic.bulletPoint}>• Keep your account credentials secure</Text>
          <Text style={dynamic.bulletPoint}>• Use the app in compliance with all applicable laws</Text>
          <Text style={dynamic.bulletPoint}>• Not misuse or attempt to hack the service</Text>
          <Text style={dynamic.bulletPoint}>• Not share inappropriate or harmful content</Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>4. Medical Disclaimer</Text>
          <Text style={dynamic.paragraph}>
            FitnexCal is not a medical device and should not be used as a substitute for professional medical advice, diagnosis, or treatment. The nutritional information and recommendations provided are estimates and may not be 100% accurate. Always consult with a qualified healthcare provider before making significant changes to your diet or exercise routine.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>5. AI Accuracy</Text>
          <Text style={dynamic.paragraph}>
            While we strive for accuracy, our AI food recognition system may not always correctly identify foods or estimate nutritional values. Users should verify important nutritional information and use their judgment when relying on AI-generated data.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>6. Premium Features</Text>
          <Text style={dynamic.paragraph}>
            Some features of FitnexCal may require a premium subscription. Premium subscriptions are billed on a recurring basis and will automatically renew unless cancelled. Refunds are subject to our refund policy.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>7. Intellectual Property</Text>
          <Text style={dynamic.paragraph}>
            All content, features, and functionality of FitnexCal are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of our service.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={dynamic.paragraph}>
            FitnexCal and its creators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. We do not guarantee that the service will be error-free or uninterrupted.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>9. Account Termination</Text>
          <Text style={dynamic.paragraph}>
            We reserve the right to suspend or terminate your account if you violate these terms or engage in behavior that we deem harmful to other users or the service. You may also delete your account at any time through the app settings.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>10. Changes to Terms</Text>
          <Text style={dynamic.paragraph}>
            We may modify these terms at any time. We will notify users of significant changes via email or in-app notification. Continued use of the service after changes constitutes acceptance of the new terms.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>11. Contact Information</Text>
          <Text style={dynamic.paragraph}>
            For questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={dynamic.contactText}>support@fitnexcal.com</Text>
        </View>

        <View style={dynamic.footer}>
          <Text style={dynamic.footerText}>
            By using FitnexCal, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
  },
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 24,
    marginLeft: 8,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 15,
    color: theme.colors.primary700,
    fontWeight: '600',
    marginTop: 8,
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
    fontStyle: 'italic',
  },
});
