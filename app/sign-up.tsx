import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useUser } from '@/hooks/user-store';

export default function SignUpScreen() {
  const { signUp } = useUser();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const isValid = useMemo(() => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email.trim()) && password.trim().length >= 6, [email, password]);

  const onSubmit = useCallback(async () => {
    if (!isValid) {
      Alert.alert('Invalid details', 'Enter a valid email and a 6+ character password.');
      return;
    }
    try {
      setLoading(true);
      await signUp(email.trim().toLowerCase(), password.trim());
      router.replace('/onboarding');
    } catch (e: unknown) {
      console.error('[SignUp] error', e);
      Alert.alert('Sign up failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, isValid, signUp]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.center}>
        <Image source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/cvvbh4f5lffvyapplk4fu' }} style={styles.logo} resizeMode="contain" />
        <Text style={styles.brand}>FitnexCal</Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#A0B8FF"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            testID="signup-email"
          />
        </View>
        <View style={styles.inputWrap}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#A0B8FF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            testID="signup-password"
          />
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={loading}
          style={[styles.primaryButton, (!isValid || loading) && styles.disabled]}
          testID="signup-submit"
        >
          <Text style={styles.primaryButtonText}>{loading ? 'PLEASE WAIT…' : 'SIGN UP FOR FREE'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace('/log-in')} style={styles.linkTouch}>
          <Text style={styles.linkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Theme.colors.primary700 },
  center: { alignItems: 'center', paddingTop: 48, paddingBottom: 8 },
  logo: { width: 96, height: 96, marginBottom: 8 },
  brand: { color: '#fff', fontSize: 28, fontWeight: '800' },
  formCard: { flex: 1, paddingTop: 24, paddingHorizontal: 20 },
  inputWrap: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  input: { color: '#fff', fontSize: 16 },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryButtonText: { color: Theme.colors.primary700, fontSize: 16, fontWeight: '800', letterSpacing: 0.4 },
  disabled: { opacity: 0.6 },
  linkTouch: { alignItems: 'center', paddingVertical: 18 },
  linkText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
