import React, { useMemo, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Camera, Goal, LineChart } from 'lucide-react-native';
import { Theme } from '@/constants/theme';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ color: string; size: number }>;
};

const FEATURES: Feature[] = [
  { id: 'recognition', title: 'AI Food Recognition', description: 'Simply snap a photo to log your meals.', icon: Camera },
  { id: 'insights', title: 'Personalized Insights', description: 'Receive AI-driven advice based on your habits.', icon: LineChart },
  { id: 'goals', title: 'Smart Goal Setting', description: 'Let our AI help you set and adjust realistic goals.', icon: Goal },
];

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const styles = useMemo(() => createStyles(), []);
  console.log('[PlanScreen] render');

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom - 6, 0) }]} testID="plan-container">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        bounces
        testID="plan-scroll"
      >
        <View style={styles.heroWrapper}>
          <Image
            testID="plan-hero-image"
            source={{
              uri:
                'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/1fpycg1leyfjbn8mrrg54',
            }}
            contentFit="cover"
            style={styles.heroImage}
            accessible
            accessibilityLabel="Abstract AI food orbit illustration"
          />
          <View style={styles.pagerDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={[styles.dot, styles.dotInactive]} />
            <View style={[styles.dot, styles.dotInactive]} />
          </View>
        </View>

        <View style={styles.headerBlock}>
          <Text style={styles.title} testID="plan-title">Your Smart Nutrition Assistant</Text>
          <Text style={styles.subtitle} testID="plan-subtitle">
            Effortless calorie tracking powered by AI, designed to help you reach your health goals faster.
          </Text>
        </View>

        <View style={styles.features} testID="plan-features">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <View key={f.id} style={styles.featureCard} testID={`feature-${f.id}`}>
                <View style={styles.featureIconWrap}>
                  <Icon color={Theme.colors.primary300} size={22} />
                </View>
                <View style={styles.featureTexts}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureDesc}>{f.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 180 }} />
      </ScrollView>

      <View style={styles.footer} testID="plan-footer">
        <Animated.View style={[styles.ctaWrap, { transform: [{ scale }] }]}> 
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => {
              console.log('[PlanScreen] Create My Plan pressed');
              router.push('/paywall');
            }}
            testID="create-plan-button"
          >
            <View style={styles.ctaBtn}> 
              <Text style={styles.ctaText}>Create My Plan</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.prices}>
          <Text style={styles.priceText}>Pro Monthly: ~ US $9.99 / month</Text>
          <Text style={styles.priceText}>Pro Annual: ~ US $52.99 / year (which equates to = US $4.99/mo, ~50% discount)</Text>
          <Text style={styles.priceText}>Premium Monthly: ~ US $14.99 / month</Text>
          <Text style={styles.priceText}>Premium Annual: ~ US $99 / year (= US $8.33/mo)</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/log-in')}
          style={styles.loginLinkWrap}
          testID="login-link"
        >
          <Text style={styles.loginLink}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Theme.colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: 24 },

    heroWrapper: {
      width: '100%',
      backgroundColor: '#0b1b24',
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      overflow: 'hidden',
    },
    heroImage: { width: '100%', height: 260 },
    pagerDots: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8 as unknown as number,
      paddingVertical: 16,
      backgroundColor: Theme.colors.surface,
    },
    dot: { height: 8, borderRadius: 8 },
    dotActive: { width: 22, backgroundColor: Theme.colors.primary },
    dotInactive: { width: 8, backgroundColor: 'rgba(255,255,255,0.22)' },

    headerBlock: { paddingHorizontal: 16, paddingTop: 18 },
    title: {
      color: Theme.colors.text,
      fontSize: 28,
      fontWeight: '800',
      textAlign: 'center',
    },
    subtitle: {
      marginTop: 8,
      color: Theme.colors.textMuted,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },

    features: { paddingHorizontal: 16, paddingTop: 12, gap: 12 as unknown as number },
    featureCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 16,
      backgroundColor: Theme.colors.surface,
      borderWidth: 1,
      borderColor: Theme.colors.cardBorder,
      shadowColor: Theme.colors.cardShadow,
      shadowOpacity: Platform.OS === 'web' ? 0.2 : 0.35,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 12,
      gap: 12 as unknown as number,
    },
    featureIconWrap: {
      height: 44,
      width: 44,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(59,130,246,0.12)',
    },
    featureTexts: { flex: 1 },
    featureTitle: { color: Theme.colors.text, fontSize: 16, fontWeight: '700' },
    featureDesc: { marginTop: 3, color: Theme.colors.textMuted, fontSize: 13 },

    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 18,
      backgroundColor: Theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: Theme.colors.border,
    },
    ctaWrap: { width: '100%' },
    ctaBtn: {
      width: '100%',
      backgroundColor: Theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },

    prices: { paddingTop: 12, gap: 6 as unknown as number, alignItems: 'center' },
    priceText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, textAlign: 'center' },

    loginLinkWrap: { paddingTop: 10, alignItems: 'center' },
    loginLink: { color: '#9DB7FF', fontSize: 14, fontWeight: '600' },
  });
