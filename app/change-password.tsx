import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { Lock, Eye, EyeOff } from 'lucide-react-native';

export default function ChangePasswordScreen() {
  const { theme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const dynamic = stylesWithTheme(theme);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      setIsSaving(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      Alert.alert('Success', 'Password changed successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={dynamic.container}>
      <Stack.Screen
        options={{
          title: 'Change Password',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
        }}
      />

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false}>
        <View style={dynamic.section}>
          <Text style={dynamic.description}>
            Choose a strong password to keep your account secure. Your password should be at least 6 characters long.
          </Text>

          <View style={dynamic.inputGroup}>
            <View style={dynamic.inputLabel}>
              <Lock size={20} color={theme.colors.primary700} />
              <Text style={dynamic.labelText}>Current Password</Text>
            </View>
            <View style={dynamic.passwordContainer}>
              <TextInput
                style={dynamic.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity
                style={dynamic.eyeButton}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? (
                  <EyeOff size={20} color={theme.colors.textMuted} />
                ) : (
                  <Eye size={20} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamic.inputGroup}>
            <View style={dynamic.inputLabel}>
              <Lock size={20} color={theme.colors.primary700} />
              <Text style={dynamic.labelText}>New Password</Text>
            </View>
            <View style={dynamic.passwordContainer}>
              <TextInput
                style={dynamic.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity
                style={dynamic.eyeButton}
                onPress={() => setShowNew(!showNew)}
              >
                {showNew ? (
                  <EyeOff size={20} color={theme.colors.textMuted} />
                ) : (
                  <Eye size={20} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamic.inputGroup}>
            <View style={dynamic.inputLabel}>
              <Lock size={20} color={theme.colors.primary700} />
              <Text style={dynamic.labelText}>Confirm New Password</Text>
            </View>
            <View style={dynamic.passwordContainer}>
              <TextInput
                style={dynamic.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity
                style={dynamic.eyeButton}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? (
                  <EyeOff size={20} color={theme.colors.textMuted} />
                ) : (
                  <Eye size={20} color={theme.colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamic.tipsCard}>
            <Text style={dynamic.tipsTitle}>Password Tips:</Text>
            <Text style={dynamic.tipText}>• Use at least 6 characters</Text>
            <Text style={dynamic.tipText}>• Mix uppercase and lowercase letters</Text>
            <Text style={dynamic.tipText}>• Include numbers and symbols</Text>
            <Text style={dynamic.tipText}>• Avoid common words or patterns</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[dynamic.saveButton, isSaving && dynamic.saveButtonDisabled]}
          onPress={handleChangePassword}
          disabled={isSaving}
        >
          <Text style={dynamic.saveButtonText}>
            {isSaving ? 'Changing Password...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
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
  section: {
    marginHorizontal: 20,
    marginTop: 24,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tipsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  saveButton: {
    backgroundColor: theme.colors.primary700,
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
