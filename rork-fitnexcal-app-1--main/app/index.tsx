import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Text, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useUser } from '@/hooks/user-store';
import { Theme } from '@/constants/theme';

export default function IndexScreen() {
  const { isLoading, hasCompletedOnboarding, user, isAuthenticated } = useUser();
  const [showSplash, setShowSplash] = useState<boolean>(true);

  const textScale = useRef<Animated.Value>(new Animated.Value(0.9)).current;
  const textOpacity = useRef<Animated.Value>(new Animated.Value(0)).current;

  const logoOpacity = useRef<Animated.Value>(new Animated.Value(0)).current;
  const logoScale = useRef<Animated.Value>(new Animated.Value(0.7)).current;
  const logoRotate = useRef<Animated.Value>(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLoading) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(textScale, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 350,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.delay(700),
    ]).start(() => {
      setShowSplash(false);
      if (!isAuthenticated) {
        router.replace('/sign-in');
        return;
      }
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding');
      } else if (!user?.is_premium) {
        router.replace('/paywall');
      } else {
        router.replace('/(tabs)/home');
      }
    });
  }, [isLoading, isAuthenticated, hasCompletedOnboarding, user, textOpacity, textScale, logoOpacity, logoScale, logoRotate]);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {showSplash ? (
        <SafeAreaView style={styles.splashRoot} testID="splash-root">
          <View style={styles.splashCenter}>
            <Animated.View
              style={{
                position: 'absolute',
                opacity: textOpacity,
                transform: [{ scale: textScale }],
              }}
              testID="splash-brand-wrapper"
            >
              <Text style={styles.splashText} accessibilityRole="header" testID="splash-brand">FitnexCal</Text>
            </Animated.View>

            <Animated.View
              style={{
                opacity: logoOpacity,
                transform: [{ scale: logoScale }, { rotate: rotateInterpolate }],
              }}
              testID="splash-logo-wrapper"
            >
              <Image
                source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/ao6dpw1jgh0i6gq6fseo0' }}
                style={styles.logo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            </Animated.View>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView style={styles.container}>
          <View style={styles.content} />
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  content: {
    flex: 1,
  },
  splashRoot: {
    flex: 1,
    backgroundColor: Theme.colors.primary700,
  },
  splashCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    fontSize: 36,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 24,
  },
});