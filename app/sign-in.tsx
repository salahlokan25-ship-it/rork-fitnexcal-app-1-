import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Theme } from '@/constants/theme';

export default function AuthWelcomeScreen() {
  const goSignup = useCallback(() => {
    router.push('/sign-up');
  }, []);

  const goLogin = useCallback(() => {
    router.push('/log-in');
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.center}>
        <Image
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/3tf5xha5m2jv5vgyjfs64' }}
          style={styles.logo}
          resizeMode="contain"
          testID="app-logo"
        />
        <Text style={styles.brand} testID="brand-text">FitnexCal</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={goSignup}
          activeOpacity={0.8}
          style={styles.primaryButton}
          testID="cta-signup"
        >
          <Text style={styles.primaryButtonText}>SIGN UP FOR FREE</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goLogin} style={styles.loginLink} testID="cta-login">
          <Text style={styles.loginText}>LOG IN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Theme.colors.primary700,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'web' ? 24 : 32,
  },
  primaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: Theme.colors.primary700,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginLink: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
