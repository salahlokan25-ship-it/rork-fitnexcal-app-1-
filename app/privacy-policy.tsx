import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { Shield } from 'lucide-react-native';

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const dynamic = stylesWithTheme(theme);

  return (
    <View style={dynamic.container}>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false}>
        <View style={dynamic.header}>
          <View style={dynamic.iconContainer}>
            <Shield size={32} color={theme.colors.primary700} />
          </View>
          <Text style={dynamic.headerTitle}>Privacy Policy</Text>
          <Text style={dynamic.headerSubtitle}>Last updated: January 2025</Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>1. Information We Collect</Text>
          <Text style={dynamic.paragraph}>
            FitnexCal collects information you provide directly to us, including your name, email address, age, weight, height, and dietary preferences. We also collect information about your food intake and exercise activities when you use our app.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={dynamic.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={dynamic.bulletPoint}>• Provide personalized nutrition tracking and recommendations</Text>
          <Text style={dynamic.bulletPoint}>• Calculate your daily calorie and macro goals</Text>
          <Text style={dynamic.bulletPoint}>• Analyze your food photos using AI technology</Text>
          <Text style={dynamic.bulletPoint}>• Improve our services and develop new features</Text>
          <Text style={dynamic.bulletPoint}>• Send you updates and notifications about your progress</Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>3. Data Storage and Security</Text>
          <Text style={dynamic.paragraph}>
            Your data is stored locally on your device and securely in the cloud. We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or destruction.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>4. AI and Image Processing</Text>
          <Text style={dynamic.paragraph}>
            When you take photos of your meals, these images are processed by our AI system to identify food items and estimate nutritional content. Images are processed securely and are not shared with third parties.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>5. Data Sharing</Text>
          <Text style={dynamic.paragraph}>
            We do not sell your personal information to third parties. We may share anonymized, aggregated data for research purposes or to improve our AI models, but this data cannot be used to identify you personally.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>6. Your Rights</Text>
          <Text style={dynamic.paragraph}>
            You have the right to:
          </Text>
          <Text style={dynamic.bulletPoint}>• Access your personal data</Text>
          <Text style={dynamic.bulletPoint}>• Correct inaccurate information</Text>
          <Text style={dynamic.bulletPoint}>• Request deletion of your account and data</Text>
          <Text style={dynamic.bulletPoint}>• Export your data</Text>
          <Text style={dynamic.bulletPoint}>• Opt out of marketing communications</Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>7. Children's Privacy</Text>
          <Text style={dynamic.paragraph}>
            FitnexCal is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={dynamic.paragraph}>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={dynamic.section}>
          <Text style={dynamic.sectionTitle}>9. Contact Us</Text>
          <Text style={dynamic.paragraph}>
            If you have any questions about this privacy policy or our data practices, please contact us at:
          </Text>
          <Text style={dynamic.contactText}>privacy@fitnexcal.com</Text>
        </View>

        <View style={dynamic.footer}>
          <Text style={dynamic.footerText}>
            By using FitnexCal, you agree to this privacy policy.
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
