import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Edit, ChevronRight, TrendingUp, Flame, Target, Activity, Key, Trash2, FileText, Shield, Info, PieChart, Droplets, Dumbbell, Beaker, Sprout } from 'lucide-react-native';
import { useUser } from '@/hooks/user-store';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

export default function SettingsScreen() {
  console.log('[SettingsScreen] render');
  const { user, signOut, authUser, updateUser } = useUser();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View style={stylesBase.loadingContainer}>
          <Text style={[stylesBase.loadingText, { color: theme.colors.textMuted }]}>Loading settings...</Text>
        </View>
      </View>
    );
  }

  const dynamic = stylesWithTheme(theme);

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  const handleChangePassword = () => {
    router.push('/change-password');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Account Deleted', 'Your account and all data have been permanently deleted.', [
                { text: 'OK', onPress: () => router.replace('/sign-in') }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy-policy');
  };

  const handleTermsOfService = () => {
    router.push('/terms-of-service');
  };

  const handleReferences = () => {
    router.push('/references');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will be saved locally.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/sign-in');
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
    );
  };

  const handleViewTrends = () => {
    router.push('/trends');
  };

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}>
      <View style={dynamic.header}>
        <View style={{ width: 40, height: 40 }} />
        <Text style={dynamic.title}>Settings</Text>
        <View style={{ width: 40, height: 40 }} />
      </View>

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false} testID="more-scroll">
        <View style={dynamic.profileSection}>
          <View style={dynamic.profileRow}>
            <TouchableOpacity
              style={dynamic.profileAvatar}
              onPress={() => setShowAvatarPicker(true)}
              testID="change-avatar"
            >
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={dynamic.profileAvatarImg} contentFit="cover" />
              ) : (
                <Text style={dynamic.profileAvatarText}>{user.name?.charAt(0).toUpperCase() || 'C'}</Text>
              )}
            </TouchableOpacity>
            <View style={dynamic.profileInfo}>
              <Text style={dynamic.profileName}>{user.name || 'Cameron Wilson'}</Text>
              <Text style={dynamic.profileEmail}>{authUser?.email || 'cameron.wilson@email.com'}</Text>
            </View>
          </View>
          <TouchableOpacity style={dynamic.editProfileButton} onPress={handleEditProfile}>
            <Edit size={16} color={theme.colors.text} />
            <Text style={dynamic.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={dynamic.sectionContainer}>
          <Text style={dynamic.sectionHeader}>Health & Dietary</Text>
          <View style={dynamic.cardContainer}>
            <TouchableOpacity style={dynamic.menuItem} onPress={() => router.push('/daily-calorie-goals')}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: 'rgba(75, 144, 226, 0.2)' }]}>
                  <Flame size={20} color={theme.colors.primary700} />
                </View>
                <Text style={dynamic.menuItemText}>Daily Calorie Goals</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={dynamic.divider} />

            <TouchableOpacity style={dynamic.menuItem} onPress={() => router.push('/macronutrient-targets')}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: 'rgba(75, 144, 226, 0.2)' }]}>
                  <PieChart size={20} color={theme.colors.primary700} />
                </View>
                <Text style={dynamic.menuItemText}>Macronutrient Targets</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={dynamic.divider} />

            <TouchableOpacity style={dynamic.menuItem} onPress={() => router.push('/activity-level')}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: 'rgba(75, 144, 226, 0.2)' }]}>
                  <Dumbbell size={20} color={theme.colors.primary700} />
                </View>
                <Text style={dynamic.menuItemText}>Activity Level</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={dynamic.divider} />

            <TouchableOpacity style={dynamic.menuItem} onPress={() => router.push('/dietary-restrictions')}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: 'rgba(75, 144, 226, 0.2)' }]}>
                  <Sprout size={20} color={theme.colors.primary700} />
                </View>
                <Text style={dynamic.menuItemText}>Dietary Restrictions</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={dynamic.sectionContainer}>
          <Text style={dynamic.sectionHeader}>Lab Values & Preferences</Text>
          <View style={dynamic.cardContainer}>
            <TouchableOpacity style={dynamic.menuItem} onPress={() => Alert.alert('Key Health Metrics', 'Track A1c, Cholesterol, and more')}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: 'rgba(75, 144, 226, 0.2)' }]}>
                  <Droplets size={20} color={theme.colors.primary700} />
                </View>
                <Text style={dynamic.menuItemText}>Key Health Metrics (A1c, Cholesterol)</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={dynamic.divider} />

            <TouchableOpacity style={dynamic.menuItem} onPress={() => Alert.alert('Micronutrient Preferences', 'Set your vitamin and mineral preferences')}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: 'rgba(75, 144, 226, 0.2)' }]}>
                  <Beaker size={20} color={theme.colors.primary700} />
                </View>
                <Text style={dynamic.menuItemText}>Micronutrient Preferences</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={dynamic.sectionContainer}>
          <Text style={dynamic.sectionHeader}>Account</Text>
          <View style={dynamic.cardContainer}>
            <TouchableOpacity style={dynamic.menuItem} onPress={handleChangePassword}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: theme.colors.surface }]}>
                  <Key size={20} color={theme.colors.textMuted} />
                </View>
                <Text style={dynamic.menuItemText}>Change Password</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          <View style={dynamic.logoutDeleteRow}>
            <TouchableOpacity style={dynamic.logOutButton} onPress={handleSignOut}>
              <Text style={dynamic.logOutButtonText}>Log Out</Text>
            </TouchableOpacity>
            <TouchableOpacity style={dynamic.deleteButton} onPress={handleDeleteAccount}>
              <Text style={dynamic.deleteButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={dynamic.sectionContainer}>
          <Text style={dynamic.sectionHeader}>App Info & Legal</Text>
          <View style={dynamic.cardContainer}>
            <TouchableOpacity style={dynamic.menuItem} onPress={handlePrivacyPolicy}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: theme.colors.surface }]}>
                  <Shield size={20} color={theme.colors.textMuted} />
                </View>
                <Text style={dynamic.menuItemText}>Privacy Policy</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={dynamic.divider} />

            <TouchableOpacity style={dynamic.menuItem} onPress={handleTermsOfService}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: theme.colors.surface }]}>
                  <FileText size={20} color={theme.colors.textMuted} />
                </View>
                <Text style={dynamic.menuItemText}>Terms of Service</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <View style={dynamic.divider} />

            <TouchableOpacity style={dynamic.menuItem} onPress={handleReferences}>
              <View style={dynamic.menuItemLeft}>
                <View style={[dynamic.iconCircle, { backgroundColor: theme.colors.surface }]}>
                  <Info size={20} color={theme.colors.textMuted} />
                </View>
                <Text style={dynamic.menuItemText}>References</Text>
              </View>
              <ChevronRight size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[dynamic.sectionContainer, { marginBottom: 20 }]}>
          <TouchableOpacity style={dynamic.trendsCard} onPress={handleViewTrends}>
            <View style={[dynamic.iconCircle, { backgroundColor: 'rgba(75, 144, 226, 0.2)' }]}>
              <TrendingUp size={20} color={theme.colors.primary700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={dynamic.trendsTitle}>View Your Trends</Text>
              <Text style={dynamic.trendsSubtitle}>Analyze your nutrition and progress.</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={showAvatarPicker}
        animationType="fade"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <View style={dynamic.modalBackdrop}>
          <View style={dynamic.modalSheet} testID="avatar-picker-sheet">
            <Text style={dynamic.modalTitle}>Profile Photo</Text>
            <TouchableOpacity
              style={dynamic.modalAction}
              onPress={async () => {
                try {
                  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (!perm.granted && Platform.OS !== 'web') { Alert.alert('Permission required', 'Please allow photo library access.'); return; }
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images' as any], quality: 0.8 });
                  if (!res.canceled && res.assets?.[0]?.uri) { await updateUser({ avatar_url: res.assets[0].uri }); }
                  setShowAvatarPicker(false);
                } catch (e) {
                  Alert.alert('Error', 'Could not pick image.');
                }
              }}
              testID="avatar-upload"
            >
              <Text style={dynamic.modalActionText}>Upload Image</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={dynamic.modalAction}
              onPress={async () => {
                try {
                  if (Platform.OS === 'web') {
                    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images' as any], quality: 0.8 });
                    if (!res.canceled && res.assets?.[0]?.uri) { await updateUser({ avatar_url: res.assets[0].uri }); }
                    setShowAvatarPicker(false);
                    return;
                  }
                  const camPerm = await ImagePicker.requestCameraPermissionsAsync();
                  if (!camPerm.granted) { Alert.alert('Permission required', 'Please allow camera access.'); return; }
                  const res = await ImagePicker.launchCameraAsync({ quality: 0.8 });
                  if (!res.canceled && res.assets?.[0]?.uri) { await updateUser({ avatar_url: res.assets[0].uri }); }
                  setShowAvatarPicker(false);
                } catch (e) {
                  Alert.alert('Error', 'Could not take photo.');
                }
              }}
              testID="avatar-camera"
            >
              <Text style={dynamic.modalActionText}>Take Photo</Text>
            </TouchableOpacity>

            {user.avatar_url ? (
              <TouchableOpacity
                style={dynamic.modalAction}
                onPress={async () => {
                  try {
                    await updateUser({ avatar_url: undefined });
                    setShowAvatarPicker(false);
                  } catch (e) {
                    Alert.alert('Error', 'Could not remove photo.');
                  }
                }}
                testID="avatar-remove"
              >
                <Text style={[dynamic.modalActionText, { color: '#EF4444' }]}>Remove Photo</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={[dynamic.modalAction, { marginTop: 4 }]} onPress={() => setShowAvatarPicker(false)} testID="avatar-cancel">
              <Text style={dynamic.modalActionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const stylesBase = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
});

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { paddingHorizontal: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  title: { fontSize: 18, fontWeight: '700' as const, color: Theme.colors.text, textAlign: 'center' as const },
  content: { flex: 1 },

  profileSection: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  profileRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    overflow: 'hidden' as const,
  },
  profileAvatarImg: { width: '100%', height: '100%' },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: Theme.colors.text,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: { fontSize: 20, fontWeight: '700' as const, color: Theme.colors.text, marginBottom: 4 },
  profileEmail: { fontSize: 14, color: Theme.colors.textMuted },
  editProfileButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    backgroundColor: Theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editProfileButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Theme.colors.text,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Theme.colors.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  cardContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden' as const,
  },
  menuItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Theme.colors.text,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginHorizontal: 16,
  },
  logoutDeleteRow: {
    flexDirection: 'column' as const,
    gap: 12,
    marginTop: 16,
  },
  logOutButton: {
    backgroundColor: Theme.colors.primary700,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  logOutButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#D0021B',
  },
  trendsCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    padding: 16,
  },
  trendsTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Theme.colors.text,
    marginBottom: 2,
  },
  trendsSubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
  },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' as const },
  modalSheet: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '700' as const, color: Theme.colors.text, marginBottom: 8, textAlign: 'center' as const },
  modalAction: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: 8,
    alignItems: 'center' as const,
  },
  modalActionText: { fontSize: 15, fontWeight: '600' as const, color: Theme.colors.text },
});
