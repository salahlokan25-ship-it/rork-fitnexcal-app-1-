import React, { useMemo, useRef, useState, useCallback } from 'react';
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

type PlanKey = 'monthly' | 'annual' | 'premium-monthly' | 'premium-annual';

const PLAN_PRICING: Record<PlanKey, { title: string; price: string; note: string; badge?: string }> = {
  monthly: { title: 'Monthly', price: '$9.99', note: '/month' },
  annual: { title: 'Annual', price: '$59.99', note: '/year', badge: 'Most Popular' },
  'premium-monthly': { title: 'Premium Monthly', price: '$14.99', note: '/month' },
  'premium-annual': { title: 'Premium Annual', price: '$99.99', note: '/year' },
};

export default function PlanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(1)).current;

  const [selected, setSelected] = useState<PlanKey>('annual');

  const onPressIn = () => {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const styles = useMemo(() => createStyles(), []);
  console.log('[PlanScreen] render');

  const onSelect = useCallback((key: PlanKey) => {
    console.log('[PlanScreen] select plan', key);
    setSelected(key);
  }, []);

  const selectedPlan = PLAN_PRICING[selected];

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
                'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/rjd1ufj7f6cgcp251ckqk',
            }}
            contentFit="cover"
            style={styles.heroImage}
            accessible
            accessibilityLabel="Abstract AI food orbit illustration"
          />
          <View style={styles.crownWrap}>
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/rff1g14cqdaitsy65qwit' }}
                style={styles.crown}
                contentFit="contain"
                accessibilityLabel="Premium crown"
              />
            </View>
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

        <View style={styles.planPicker}>
          {(Object.keys(PLAN_PRICING) as PlanKey[]).map((key) => {
            const p = PLAN_PRICING[key];
            const active = key === selected;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => onSelect(key)}
                activeOpacity={0.9}
                style={[styles.planCard, active ? styles.planCardActive : null]}
                testID={`plan-card-${key}`}
              >
                <View style={styles.planCardTop}>
                  <Text style={[styles.planTitle, active ? styles.planTitleActive : null]}>{p.title}</Text>
                  <View style={styles.planPriceRow}>
                    <Text style={[styles.planPrice, active ? styles.planPriceActive : null]}>{p.price}</Text>
                    <Text style={[styles.planNote, active ? styles.planNoteActive : null]}>{p.note}</Text>
                  </View>
                </View>
                {p.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      <View style={styles.footer} testID="plan-footer">
        <Animated.View style={[styles.ctaWrap, { transform: [{ scale }] }]}> 
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            onPress={() => {
              const target = `/sign-up?plan=${encodeURIComponent(selected)}`;
              console.log('[PlanScreen] Start Free Trial pressed', target);
              router.push(target as never);
            }}
            testID="start-trial-button"
          >
            <View style={styles.ctaBtn}> 
              <Text style={styles.ctaText}>Start Free Trial</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          onPress={() => {
            console.log('[PlanScreen] continue with free tier');
            router.replace('/(tabs)/home');
          }}
          activeOpacity={0.8}
          testID="continue-free-tier"
        >
          <View style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Continue with limited features</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.prices}>
          <Text style={styles.priceText}>Monthly subscription: US $9.99</Text>
          <Text style={styles.priceText}>Annual subscription: US $59.99</Text>
          <Text style={styles.priceText}>Premium upgrade: Monthly US $14.99, Annual US $99.99</Text>
          <Text style={styles.priceText}>Free tier available with limited features to drive adoption</Text>
          <Text style={styles.trialNote}>
            7-day free trial, then {selectedPlan.price}/{selectedPlan.note.replace('/', '')}
          </Text>
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
    heroImage: { width: '100%', height: 220, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
    crownWrap: {
      position: 'absolute',
      top: 12,
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    crown: { width: 56, height: 56, opacity: 0.95 },

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

    planPicker: { paddingHorizontal: 16, paddingTop: 16, gap: 12 as unknown as number },
    planCard: {
      backgroundColor: Theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: Theme.colors.cardBorder,
    },
    planCardActive: {
      borderColor: Theme.colors.primary500,
      shadowColor: Theme.colors.cardShadow,
      shadowOpacity: Platform.OS === 'web' ? 0.2 : 0.35,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 14,
    },
    planCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    planTitle: { color: Theme.colors.text, fontSize: 16, fontWeight: '700' },
    planTitleActive: { color: '#FFFFFF' },
    planPriceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 as unknown as number },
    planPrice: { color: Theme.colors.textMuted, fontSize: 22, fontWeight: '800' },
    planPriceActive: { color: '#FFFFFF' },
    planNote: { color: Theme.colors.textMuted, fontSize: 12 },
    planNoteActive: { color: Theme.colors.primary300 },
    badge: {
      position: 'absolute',
      top: -10,
      left: 14,
      backgroundColor: Theme.colors.primary,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

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

    secondaryBtn: {
      marginTop: 10,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: Theme.colors.border,
      backgroundColor: Theme.colors.surface,
    },
    secondaryBtnText: { color: Theme.colors.text, fontSize: 14, fontWeight: '700' },

    prices: { paddingTop: 12, gap: 6 as unknown as number, alignItems: 'center' },
    priceText: { color: 'rgba(255,255,255,0.65)', fontSize: 12, textAlign: 'center' },
    trialNote: { marginTop: 4, color: '#9DB7FF', fontSize: 12, textAlign: 'center', fontWeight: '700' },

    loginLinkWrap: { paddingTop: 10, alignItems: 'center' },
    loginLink: { color: '#9DB7FF', fontSize: 14, fontWeight: '600' },
  });
