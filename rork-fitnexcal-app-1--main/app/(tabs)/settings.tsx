import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions, Platform, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Info, LogOut, ChevronRight, TrendingUp, Activity, Flame, Target, Lock, Trash2, FileText, Shield, Gift, AlertTriangle, Camera } from 'lucide-react-native';
import { useUser } from '@/hooks/user-store';
import { useNutrition } from '@/hooks/nutrition-store';
import { useWorkout } from '@/hooks/workout-store';
import { useSleep } from '@/hooks/sleep-store';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/theme';
import Svg, { Rect, Line, Circle, Path, G, Text as SvgText } from 'react-native-svg';
import AnimatedFadeIn from '@/components/AnimatedFadeIn';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

interface DayStat {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}



function weekdayLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function SettingsScreen() {
  console.log('[SettingsScreen] render');
  const { user, signOut, authUser, updateUser } = useUser();
  const { width: screenW } = useWindowDimensions();
  const { loadHistoryRange, weeklySettings, updateWeeklySettings, weeklySummary } = useNutrition();
  const { workouts } = useWorkout();
  const { getSleepHistory, getAverageSleep } = useSleep();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const days = 7;
  const [data, setData] = useState<DayStat[]>([]);
  const [workoutData, setWorkoutData] = useState<{ date: string; calories: number }[]>([]);
  const [sleepData, setSleepData] = useState<{ date: string; hours: number }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'90days' | '6months' | '1year' | 'alltime'>('90days');
  const [selectedWeek, setSelectedWeek] = useState<'thisweek' | 'lastweek' | '2weeks' | '3weeks'>('thisweek');
  const [showAvatarPicker, setShowAvatarPicker] = useState<boolean>(false);

  const reloadTrends = useCallback(async () => {
    console.log('[SettingsScreen] reloadTrends');
    try {
      const hist = await loadHistoryRange(days);
      setData(
        hist.map((h) => ({
          date: h.label,
          calories: h.calories,
          protein: h.protein,
          carbs: h.carbs,
          fat: h.fat,
        }))
      );

      const workoutHist: { date: string; calories: number }[] = [];
      for (let i = days - 1; i >= 0; i -= 1) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toDateString();
        const dayWorkouts = workouts.filter((w) => new Date(w.timestamp).toDateString() === dateStr);
        const totalCals = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
        workoutHist.push({
          date: d.toLocaleDateString('en-US', { weekday: 'short' }),
          calories: totalCals,
        });
      }
      setWorkoutData(workoutHist);

      const sleepHist = getSleepHistory(days);
      setSleepData(sleepHist);
    } catch (error) {
      console.error('reload trends error', error);
    }
  }, [days, loadHistoryRange, workouts, getSleepHistory]);

  useEffect(() => {
    reloadTrends();
  }, [reloadTrends]);


  const contentHorizontalMargin = 20;
  const chartWidth = Math.max(280, Math.round(screenW - contentHorizontalMargin * 2 - 0));

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

  const handleUpgradeToPremium = () => {
    router.push('/paywall');
  };

  const handleAbout = () => {
    Alert.alert(
      'About FitnexCal',
      'FitnexCal is an AI-powered calorie tracking app that makes nutrition logging effortless. Simply take photos of your meals and let our AI do the rest!\n\nVersion 1.0.0',
      [{ text: 'OK' }]
    );
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

  const handleReferFriend = () => {
    Alert.alert('Refer a Friend', 'Share FitnexCal with your friends and earn rewards!');
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



  const currentWeight = user.weight || 72;
  const goalWeight = user.weightGoal || 78;
  const weightDiff = Math.abs(currentWeight - goalWeight);
  const initialDiff = Math.abs((user.weight || 72) - goalWeight);
  const weightProgress = initialDiff > 0 ? (initialDiff - weightDiff) / initialDiff : 0;
  const progressPercent = Math.round(weightProgress * 100);

  const height = user.height || 175;
  const bmi = (currentWeight / ((height / 100) ** 2)).toFixed(1);
  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Healthy';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };
  const bmiStatus = getBMIStatus(parseFloat(bmi));

  const totalWorkoutCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const avgCaloriesPerDay = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.calories, 0) / data.length) : 0;
  const totalProtein = data.reduce((sum, d) => sum + d.protein, 0);
  const totalCarbs = data.reduce((sum, d) => sum + d.carbs, 0);
  const avgSleepHours = getAverageSleep(days);

  return (
    <View style={[dynamic.container, { paddingTop: insets.top }]}>
      <View style={dynamic.header}>
        <Text style={dynamic.title}>More</Text>
      </View>

      <ScrollView style={dynamic.content} showsVerticalScrollIndicator={false} testID="more-scroll">
        <AnimatedFadeIn delay={40}>
          <View style={dynamic.profileSection}>
            <View style={dynamic.profileCard}>
              <TouchableOpacity
                style={dynamic.profileAvatar}
                onPress={() => setShowAvatarPicker(true)}
                testID="change-avatar"
              >
                {user.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={dynamic.profileAvatarImg} contentFit="cover" />
                ) : (
                  <Text style={dynamic.profileAvatarText}>{user.name?.charAt(0).toUpperCase() || 'A'}</Text>
                )}
                <View style={dynamic.cameraBadge} pointerEvents="none" testID="avatar-camera-indicator">
                  <Camera size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={dynamic.profileName}>{user.name || 'Alex Smith'}</Text>
              <Text style={dynamic.profileEmail}>{authUser?.email || 'user@example.com'}</Text>
              <TouchableOpacity style={dynamic.editProfileButton} onPress={handleEditProfile}>
                <Text style={dynamic.editProfileButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={60}>
          <View style={dynamic.sectionContainer}>
            <Text style={dynamic.sectionHeader}>Health & Dietary settings</Text>
            <View style={dynamic.cardContainer}>
              <View style={dynamic.menuItem}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Shield size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Diabetes</Text>
                </View>
                <TouchableOpacity
                  style={dynamic.tRefreshButton}
                  onPress={() => updateUser({ medical_conditions: { ...(user.medical_conditions ?? {}), diabetes: !user.medical_conditions?.diabetes } })}
                  testID="toggle-diabetes"
                >
                  <Text style={dynamic.tRefreshText}>{user.medical_conditions?.diabetes ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
              </View>

              <View style={dynamic.divider} />

              <View style={dynamic.menuItem}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Shield size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Chronic kidney disease</Text>
                </View>
                <TouchableOpacity
                  style={dynamic.tRefreshButton}
                  onPress={() => updateUser({ medical_conditions: { ...(user.medical_conditions ?? {}), kidney_disease: !user.medical_conditions?.kidney_disease } })}
                  testID="toggle-kidney"
                >
                  <Text style={dynamic.tRefreshText}>{user.medical_conditions?.kidney_disease ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
              </View>

              <View style={dynamic.divider} />

              <View style={dynamic.menuItem}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Shield size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Celiac / gluten-free</Text>
                </View>
                <TouchableOpacity
                  style={dynamic.tRefreshButton}
                  onPress={() => updateUser({ medical_conditions: { ...(user.medical_conditions ?? {}), celiac: !user.medical_conditions?.celiac } })}
                  testID="toggle-celiac"
                >
                  <Text style={dynamic.tRefreshText}>{user.medical_conditions?.celiac ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
              </View>

              <View style={dynamic.divider} />

              <View style={dynamic.menuItem}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Shield size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Hypertension</Text>
                </View>
                <TouchableOpacity
                  style={dynamic.tRefreshButton}
                  onPress={() => updateUser({ medical_conditions: { ...(user.medical_conditions ?? {}), hypertension: !user.medical_conditions?.hypertension } })}
                  testID="toggle-hypertension"
                >
                  <Text style={dynamic.tRefreshText}>{user.medical_conditions?.hypertension ? 'On' : 'Off'}</Text>
                </TouchableOpacity>
              </View>

              <View style={dynamic.divider} />

              <View style={dynamic.menuItem}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Info size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Allergies (comma separated)</Text>
                </View>
              </View>
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                <Text
                  style={{
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    color: theme.colors.text,
                  }}
                  testID="allergies-text"
                >{(user.allergies ?? []).join(', ')}</Text>
                <TouchableOpacity
                  style={[dynamic.tRefreshButton, { marginTop: 8, alignSelf: 'flex-start' }]}
                  onPress={() => {
                    const proposed = (user.allergies ?? []).join(', ');
                    const next = prompt?.('Enter allergies (comma separated)', proposed) ?? proposed;
                    const arr = next.split(',').map((s) => s.trim()).filter(Boolean);
                    updateUser({ allergies: arr });
                  }}
                  testID="edit-allergies"
                >
                  <Text style={dynamic.tRefreshText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={dynamic.divider} />

              <View style={dynamic.menuItem}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <TrendingUp size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Key lab values</Text>
                </View>
                <TouchableOpacity
                  style={dynamic.chipButton}
                  onPress={() => {
                    const current = user.lab_values ?? {};
                    const a1c = Number(prompt?.('A1C %', String(current.a1c ?? '')) ?? current.a1c ?? '');
                    const fg = Number(prompt?.('Fasting glucose (mg/dL)', String(current.fasting_glucose ?? '')) ?? current.fasting_glucose ?? '');
                    const ldl = Number(prompt?.('LDL (mg/dL)', String(current.ldl ?? '')) ?? current.ldl ?? '');
                    const hdl = Number(prompt?.('HDL (mg/dL)', String(current.hdl ?? '')) ?? current.hdl ?? '');
                    const tg = Number(prompt?.('Triglycerides (mg/dL)', String(current.triglycerides ?? '')) ?? current.triglycerides ?? '');
                    const cr = Number(prompt?.('Creatinine (mg/dL)', String(current.creatinine ?? '')) ?? current.creatinine ?? '');
                    const eg = Number(prompt?.('eGFR (mL/min/1.73m2)', String(current.egfr ?? '')) ?? current.egfr ?? '');
                    updateUser({ lab_values: { ...current, a1c: isNaN(a1c) ? current.a1c : a1c, fasting_glucose: isNaN(fg) ? current.fasting_glucose : fg, ldl: isNaN(ldl) ? current.ldl : ldl, hdl: isNaN(hdl) ? current.hdl : hdl, triglycerides: isNaN(tg) ? current.triglycerides : tg, creatinine: isNaN(cr) ? current.creatinine : cr, egfr: isNaN(eg) ? current.egfr : eg } });
                  }}
                  testID="edit-labs"
                >
                  <Text style={dynamic.chipButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={dynamic.infoRows}>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>A1C %</Text><Text style={dynamic.infoValue}>{user.lab_values?.a1c ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>Fasting glucose mg/dL</Text><Text style={dynamic.infoValue}>{user.lab_values?.fasting_glucose ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>LDL mg/dL</Text><Text style={dynamic.infoValue}>{user.lab_values?.ldl ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>HDL mg/dL</Text><Text style={dynamic.infoValue}>{user.lab_values?.hdl ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>Triglycerides mg/dL</Text><Text style={dynamic.infoValue}>{user.lab_values?.triglycerides ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>Creatinine mg/dL</Text><Text style={dynamic.infoValue}>{user.lab_values?.creatinine ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>eGFR mL/min</Text><Text style={dynamic.infoValue}>{user.lab_values?.egfr ?? '-'}</Text></View>
              </View>

              <View style={dynamic.divider} />

              <View style={dynamic.menuItem}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Target size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Nutrition preferences</Text>
                </View>
                <TouchableOpacity
                  style={dynamic.chipButton}
                  onPress={() => {
                    const current = user.nutrition_preferences ?? {};
                    const tcarb = Number(prompt?.('Per-meal carbs target (g)', String(current.target_carb_g_per_meal ?? '')) ?? current.target_carb_g_per_meal ?? '');
                    const sugar = Number(prompt?.('Max added sugar per serving (g)', String(current.max_added_sugar_g_per_serving ?? '')) ?? current.max_added_sugar_g_per_serving ?? '');
                    const sodium = Number(prompt?.('Daily sodium limit (mg)', String(current.sodium_mg_daily_limit ?? '')) ?? current.sodium_mg_daily_limit ?? '');
                    updateUser({ nutrition_preferences: { ...current, target_carb_g_per_meal: isNaN(tcarb) ? current.target_carb_g_per_meal : tcarb, max_added_sugar_g_per_serving: isNaN(sugar) ? current.max_added_sugar_g_per_serving : sugar, sodium_mg_daily_limit: isNaN(sodium) ? current.sodium_mg_daily_limit : sodium } });
                  }}
                  testID="edit-nutrition-prefs"
                >
                  <Text style={dynamic.chipButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
              <View style={dynamic.infoRows}>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>Per-meal carbs target (g)</Text><Text style={dynamic.infoValue}>{user.nutrition_preferences?.target_carb_g_per_meal ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>Max added sugar per serving (g)</Text><Text style={dynamic.infoValue}>{user.nutrition_preferences?.max_added_sugar_g_per_serving ?? '-'}</Text></View>
                <View style={dynamic.infoRow}><Text style={dynamic.infoLabel}>Daily sodium limit (mg)</Text><Text style={dynamic.infoValue}>{user.nutrition_preferences?.sodium_mg_daily_limit ?? '-'}</Text></View>
              </View>
            </View>
          </View>

          <View style={dynamic.sectionContainer}>
            <Text style={dynamic.sectionHeader}>Account</Text>
            <View style={dynamic.cardContainer}>
              <TouchableOpacity style={dynamic.menuItem} onPress={handleChangePassword}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Lock size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Change Password</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <View style={dynamic.divider} />

              <TouchableOpacity style={dynamic.menuItem} onPress={handleDeleteAccount}>
                <View style={dynamic.menuItemLeft}>
                  <View style={[dynamic.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <Trash2 size={20} color="#EF4444" />
                  </View>
                  <Text style={[dynamic.menuItemText, { color: '#EF4444' }]}>Delete Account</Text>
                </View>
                <AlertTriangle size={20} color="#EF4444" />
              </TouchableOpacity>

              <View style={dynamic.divider} />

              <TouchableOpacity style={dynamic.menuItem} onPress={handleSignOut}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <LogOut size={20} color={theme.colors.textMuted} />
                  </View>
                  <Text style={dynamic.menuItemText}>Log Out</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={80}>
          <View style={dynamic.sectionContainer}>
            <Text style={dynamic.sectionHeader}>App Info & Legal</Text>
            <View style={dynamic.cardContainer}>
              <TouchableOpacity style={dynamic.menuItem} onPress={handlePrivacyPolicy}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Shield size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Privacy Policy</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <View style={dynamic.divider} />

              <TouchableOpacity style={dynamic.menuItem} onPress={handleTermsOfService}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <FileText size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>Terms of Service</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>

              <View style={dynamic.divider} />

              <TouchableOpacity style={dynamic.menuItem} onPress={handleReferences}>
                <View style={dynamic.menuItemLeft}>
                  <View style={dynamic.iconCircle}>
                    <Info size={20} color={theme.colors.primary700} />
                  </View>
                  <Text style={dynamic.menuItemText}>References</Text>
                </View>
                <ChevronRight size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={100}>
          <View style={dynamic.sectionContainer}>
            <TouchableOpacity style={dynamic.referCard} onPress={handleReferFriend}>
              <View style={dynamic.referIconContainer}>
                <Gift size={24} color="#fff" />
              </View>
              <View style={dynamic.referContent}>
                <Text style={dynamic.referTitle}>Refer a Friend</Text>
                <Text style={dynamic.referSubtitle}>Share FitnexCal and earn rewards</Text>
              </View>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={120}>
          <View style={dynamic.sectionContainer}>
            <Text style={dynamic.sectionHeader}>Trends & Data Tracker</Text>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={125}>
          <View style={dynamic.goalsCard}>
            <View style={dynamic.goalRow}>
              <Text style={dynamic.goalLabel}>Weekly goals mode</Text>
              <TouchableOpacity
                style={[dynamic.tRefreshButton, { paddingVertical: 6 }]}
                onPress={() => updateWeeklySettings({ enabled: !weeklySettings.enabled })}
                testID="toggle-weekly-goal"
              >
                <Text style={dynamic.tRefreshText}>{weeklySettings.enabled ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>
            <View style={dynamic.goalRow}>
              <Text style={dynamic.goalLabel}>Buffer enabled</Text>
              <TouchableOpacity
                style={[dynamic.tRefreshButton, { paddingVertical: 6 }]}
                onPress={() => updateWeeklySettings({ buffer_enabled: !weeklySettings.buffer_enabled })}
                testID="toggle-buffer"
              >
                <Text style={dynamic.tRefreshText}>{weeklySettings.buffer_enabled ? 'On' : 'Off'}</Text>
              </TouchableOpacity>
            </View>
            <View style={dynamic.goalRow}>
              <Text style={dynamic.goalLabel}>Weekly target (cal)</Text>
              <TouchableOpacity
                style={[dynamic.tRefreshButton, { paddingVertical: 6 }]}
                onPress={() => {
                  const proposed = (weeklySettings.weekly_target_calories ?? (user?.goal_calories ?? 2000) * 7).toString();
                  const next = Number(prompt?.('Weekly calories target', proposed) ?? proposed);
                  if (!isNaN(next) && next > 0) updateWeeklySettings({ weekly_target_calories: Math.round(next) });
                }}
                testID="edit-weekly-target"
              >
                <Text style={dynamic.tRefreshText}>{(weeklySettings.weekly_target_calories ?? (user?.goal_calories ?? 2000) * 7).toLocaleString()}</Text>
              </TouchableOpacity>
            </View>
            {weeklySummary && (
              <View style={[dynamic.goalRow, { marginTop: 6 }]}> 
                <Text style={dynamic.goalLabel}>Buffer balance</Text>
                <Text style={[dynamic.goalValue, { color: weeklySummary.buffer_balance >= 0 ? '#10B981' : '#EF4444' }]}>{weeklySummary.buffer_balance}</Text>
              </View>
            )}
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={60}>
          <View style={dynamic.statsGrid}>
            <View style={dynamic.statCard}>
              <View style={dynamic.statIconContainer}>
                <Target size={24} color="#FF6B6B" />
              </View>
              <Text style={dynamic.statValue}>{currentWeight} kg</Text>
              <Text style={dynamic.statLabel}>Current Weight</Text>
              <Text style={dynamic.statSubtext}>Goal: {goalWeight} kg</Text>
            </View>

            <View style={dynamic.statCard}>
              <View style={dynamic.statIconContainer}>
                <Flame size={24} color="#FF9500" />
              </View>
              <Text style={dynamic.statValue}>{avgCaloriesPerDay}</Text>
              <Text style={dynamic.statLabel}>Avg Calories</Text>
              <Text style={dynamic.statSubtext}>Per day</Text>
            </View>

            <View style={dynamic.statCard}>
              <View style={dynamic.statIconContainer}>
                <Activity size={24} color="#4A90E2" />
              </View>
              <Text style={dynamic.statValue}>{totalWorkoutCalories}</Text>
              <Text style={dynamic.statLabel}>Calories Burned</Text>
              <Text style={dynamic.statSubtext}>Total workouts</Text>
            </View>

            <View style={dynamic.statCard}>
              <View style={dynamic.statIconContainer}>
                <TrendingUp size={24} color="#10B981" />
              </View>
              <Text style={dynamic.statValue}>{progressPercent}%</Text>
              <Text style={dynamic.statLabel}>Goal Progress</Text>
              <Text style={dynamic.statSubtext}>Keep going!</Text>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={100}>
          <View style={dynamic.periodFilters}>
            <TouchableOpacity
              style={[dynamic.periodButton, selectedPeriod === '90days' && dynamic.periodButtonActive]}
              onPress={() => setSelectedPeriod('90days')}
            >
              <Text style={[dynamic.periodButtonText, selectedPeriod === '90days' && dynamic.periodButtonTextActive]}>90 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamic.periodButton, selectedPeriod === '6months' && dynamic.periodButtonActive]}
              onPress={() => setSelectedPeriod('6months')}
            >
              <Text style={[dynamic.periodButtonText, selectedPeriod === '6months' && dynamic.periodButtonTextActive]}>6 Months</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamic.periodButton, selectedPeriod === '1year' && dynamic.periodButtonActive]}
              onPress={() => setSelectedPeriod('1year')}
            >
              <Text style={[dynamic.periodButtonText, selectedPeriod === '1year' && dynamic.periodButtonTextActive]}>1 Year</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamic.periodButton, selectedPeriod === 'alltime' && dynamic.periodButtonActive]}
              onPress={() => setSelectedPeriod('alltime')}
            >
              <Text style={[dynamic.periodButtonText, selectedPeriod === 'alltime' && dynamic.periodButtonTextActive]}>All time</Text>
            </TouchableOpacity>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={140}>
          <View style={dynamic.tCard}>
            <View style={dynamic.goalProgressHeader}>
              <Text style={dynamic.tCardTitle}>Weight Progress</Text>
              <View style={dynamic.goalProgressBadge}>
                <Text style={dynamic.goalProgressBadgeText}>{weightDiff.toFixed(1)} kg to goal</Text>
              </View>
            </View>
            <WeightProgressChart currentWeight={currentWeight} goalWeight={goalWeight} height={220} width={chartWidth} themeColors={theme} />
            <Text style={dynamic.motivationText}>You&apos;re on the right track! Keep it up!</Text>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={180}>
          <View style={dynamic.weekFilters}>
            <TouchableOpacity
              style={[dynamic.weekButton, selectedWeek === 'thisweek' && dynamic.weekButtonActive]}
              onPress={() => setSelectedWeek('thisweek')}
            >
              <Text style={[dynamic.weekButtonText, selectedWeek === 'thisweek' && dynamic.weekButtonTextActive]}>This week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamic.weekButton, selectedWeek === 'lastweek' && dynamic.weekButtonActive]}
              onPress={() => setSelectedWeek('lastweek')}
            >
              <Text style={[dynamic.weekButtonText, selectedWeek === 'lastweek' && dynamic.weekButtonTextActive]}>Last week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamic.weekButton, selectedWeek === '2weeks' && dynamic.weekButtonActive]}
              onPress={() => setSelectedWeek('2weeks')}
            >
              <Text style={[dynamic.weekButtonText, selectedWeek === '2weeks' && dynamic.weekButtonTextActive]}>2 wks ago</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamic.weekButton, selectedWeek === '3weeks' && dynamic.weekButtonActive]}
              onPress={() => setSelectedWeek('3weeks')}
            >
              <Text style={[dynamic.weekButtonText, selectedWeek === '3weeks' && dynamic.weekButtonTextActive]}>3 wks ago</Text>
            </TouchableOpacity>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={220}>
          <View style={dynamic.tCard}>
            <Text style={dynamic.tCardTitle}>Nutrition Intake</Text>
            <Text style={dynamic.totalCaloriesValue}>{data.reduce((sum, d) => sum + d.calories, 0).toLocaleString()} <Text style={dynamic.totalCaloriesUnit}>cals</Text></Text>
            <StackedBarChart data={data.length ? data : getEmpty(days)} height={240} width={chartWidth} themeColors={theme} />
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={240}>
          <View style={dynamic.tCard}>
            <Text style={dynamic.tCardTitle}>Workout Activity</Text>
            <Text style={dynamic.totalCaloriesValue}>{workoutData.reduce((sum, d) => sum + d.calories, 0).toLocaleString()} <Text style={dynamic.totalCaloriesUnit}>cals</Text></Text>
            <WorkoutBarChart data={workoutData.length ? workoutData : getEmptyWorkout(days)} height={240} width={chartWidth} themeColors={theme} />
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={245}>
          <View style={dynamic.tCard}>
            <View style={dynamic.sleepHeader}>
              <Text style={dynamic.tCardTitle}>Sleep Tracking</Text>
              <View style={dynamic.sleepAvgBadge}>
                <Text style={dynamic.sleepAvgText}>{avgSleepHours.toFixed(1)}h avg</Text>
              </View>
            </View>
            <Text style={dynamic.totalCaloriesValue}>{sleepData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)} <Text style={dynamic.totalCaloriesUnit}>hours</Text></Text>
            <SleepBarChart data={sleepData.length ? sleepData : getEmptySleep(days)} height={240} width={chartWidth} themeColors={theme} />
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={250}>
          <View style={dynamic.macroCardsRow}>
            <View style={dynamic.macroCard}>
              <View style={[dynamic.macroColorBar, { backgroundColor: '#D0021B' }]} />
              <Text style={dynamic.macroCardValue}>{totalProtein.toFixed(0)}g</Text>
              <Text style={dynamic.macroCardLabel}>Protein</Text>
            </View>
            <View style={dynamic.macroCard}>
              <View style={[dynamic.macroColorBar, { backgroundColor: '#F5A623' }]} />
              <Text style={dynamic.macroCardValue}>{totalCarbs.toFixed(0)}g</Text>
              <Text style={dynamic.macroCardLabel}>Carbs</Text>
            </View>
            <View style={dynamic.macroCard}>
              <View style={[dynamic.macroColorBar, { backgroundColor: '#4A90E2' }]} />
              <Text style={dynamic.macroCardValue}>{data.reduce((sum, d) => sum + d.fat, 0).toFixed(0)}g</Text>
              <Text style={dynamic.macroCardLabel}>Fats</Text>
            </View>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={260}>
          <View style={dynamic.tCard}>
            <View style={dynamic.bmiHeader}>
              <Text style={dynamic.tCardTitle}>Your BMI</Text>
              <TouchableOpacity style={dynamic.bmiInfoButton}>
                <Info size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={dynamic.bmiContent}>
              <Text style={dynamic.bmiValue}>{bmi}</Text>
              <View style={dynamic.bmiStatusContainer}>
                <Text style={dynamic.bmiStatusLabel}>Your weight is </Text>
                <View style={dynamic.bmiStatusBadge}>
                  <Text style={dynamic.bmiStatusText}>{bmiStatus}</Text>
                </View>
              </View>
            </View>
            <View style={dynamic.bmiScale}>
              <View style={[dynamic.bmiScaleSegment, { backgroundColor: '#4A90E2', flex: 1 }]} />
              <View style={[dynamic.bmiScaleSegment, { backgroundColor: '#7ED321', flex: 1 }]} />
              <View style={[dynamic.bmiScaleSegment, { backgroundColor: '#F5A623', flex: 1 }]} />
              <View style={[dynamic.bmiScaleSegment, { backgroundColor: '#D0021B', flex: 1 }]} />
              <View style={[dynamic.bmiIndicator, { left: `${Math.min(95, Math.max(5, ((parseFloat(bmi) - 15) / 25) * 100))}%` }]} />
            </View>
            <View style={dynamic.bmiLegend}>
              <View style={dynamic.bmiLegendItem}>
                <View style={[dynamic.bmiLegendDot, { backgroundColor: '#4A90E2' }]} />
                <Text style={dynamic.bmiLegendText}>Underweight</Text>
              </View>
              <View style={dynamic.bmiLegendItem}>
                <View style={[dynamic.bmiLegendDot, { backgroundColor: '#7ED321' }]} />
                <Text style={dynamic.bmiLegendText}>Healthy</Text>
              </View>
              <View style={dynamic.bmiLegendItem}>
                <View style={[dynamic.bmiLegendDot, { backgroundColor: '#F5A623' }]} />
                <Text style={dynamic.bmiLegendText}>Overweight</Text>
              </View>
              <View style={dynamic.bmiLegendItem}>
                <View style={[dynamic.bmiLegendDot, { backgroundColor: '#D0021B' }]} />
                <Text style={dynamic.bmiLegendText}>Obese</Text>
              </View>
            </View>
          </View>
        </AnimatedFadeIn>

        <View style={dynamic.section}>
          <View style={dynamic.appInfo}>
            <Text style={dynamic.appName}>FitnexCal</Text>
            <Text style={dynamic.appVersion}>Version 1.0.0</Text>
            <Text style={dynamic.appDescription}>
              AI-powered nutrition tracking made simple
            </Text>
          </View>
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
                  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
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
                    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
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

function getEmpty(days: number): DayStat[] {
  const arr: DayStat[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    arr.push({ date: weekdayLabel(i), calories: 0, protein: 0, carbs: 0, fat: 0 });
  }
  return arr;
}

function getEmptyWorkout(days: number): { date: string; calories: number }[] {
  const arr: { date: string; calories: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    arr.push({ date: weekdayLabel(i), calories: 0 });
  }
  return arr;
}

function getEmptySleep(days: number): { date: string; hours: number }[] {
  const arr: { date: string; hours: number }[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    arr.push({ date: weekdayLabel(i), hours: 0 });
  }
  return arr;
}

function WeightProgressChart({ currentWeight, goalWeight, height, width, themeColors }: { currentWeight: number; goalWeight: number; height: number; width: number; themeColors: { colors: any } }) {
  const padding = 24;
  const chartW = Math.max(200, width) - padding * 2;
  const chartH = height - 60;
  
  const weightData = [
    { day: 'Mon', weight: 72 },
    { day: 'Tue', weight: 73 },
  ];
  
  const minWeight = Math.min(...weightData.map(d => d.weight), goalWeight) - 2;
  const maxWeight = Math.max(...weightData.map(d => d.weight), currentWeight) + 2;
  
  const points = weightData.map((d, i) => {
    const xPos = weightData.length > 1 ? (i / (weightData.length - 1)) * chartW : chartW / 2;
    const weightRange = maxWeight - minWeight;
    const yPos = weightRange > 0 ? chartH - ((d.weight - minWeight) / weightRange) * chartH : chartH / 2;
    return {
      x: isNaN(xPos) || !isFinite(xPos) ? 0 : xPos,
      y: isNaN(yPos) || !isFinite(yPos) ? chartH / 2 : yPos,
    };
  });
  
  const pathFrom = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
  
  const yLabels = [maxWeight, maxWeight - 1, maxWeight - 2, maxWeight - 3, minWeight];
  
  return (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <Svg width={Math.max(200, width)} height={height}>
        <G x={padding} y={10}>
          {yLabels.map((label, i) => {
            const y = (i / (yLabels.length - 1)) * chartH;
            return (
              <G key={`ylabel-${i}`}>
                <Line x1={-10} y1={y} x2={chartW} y2={y} stroke={themeColors.colors.border} strokeWidth={1} strokeDasharray="4,4" />
                <SvgText x={-15} y={y + 4} fontSize={10} fill={themeColors.colors.textMuted} textAnchor="end">
                  {label.toFixed(1)}
                </SvgText>
              </G>
            );
          })}
          
          <Path d={pathFrom(points)} stroke={themeColors.colors.text} strokeWidth={2} fill="none" />
          
          {points.map((p, i) => {
            const cx = isNaN(p.x) || !isFinite(p.x) ? 0 : p.x;
            const cy = isNaN(p.y) || !isFinite(p.y) ? 0 : p.y;
            return (
              <Circle key={`point-${i}`} cx={cx} cy={cy} r={4} fill={themeColors.colors.text} />
            );
          })}
          
          {weightData.map((d, i) => {
            const xPos = weightData.length > 1 ? (i / (weightData.length - 1)) * chartW : chartW / 2;
            const x = isNaN(xPos) || !isFinite(xPos) ? 0 : xPos;
            return (
              <SvgText key={`label-${i}`} x={x} y={chartH + 18} fontSize={12} fill={themeColors.colors.textMuted} textAnchor="middle">
                {d.day}
              </SvgText>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

function StackedBarChart({ data, height, width, themeColors }: { data: DayStat[]; height: number; width: number; themeColors: { colors: any } }) {
  const padding = 24;
  const chartW = Math.max(200, width) - padding * 2;
  const chartH = height - 80;
  const max = Math.max(...data.map((d) => d.calories), 1500);
  const gap = 16;
  const barW = Math.max(30, chartW / data.length - gap);
  
  const yLabels = [1500, 1000, 500, 0];

  return (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <Svg width={Math.max(200, width)} height={height}>
        <G x={padding} y={10}>
          {yLabels.map((label, i) => {
            const y = (i / (yLabels.length - 1)) * chartH;
            return (
              <G key={`ylabel-${i}`}>
                <Line x1={-10} y1={y} x2={chartW} y2={y} stroke={themeColors.colors.border} strokeWidth={1} strokeDasharray="4,4" />
                <SvgText x={-15} y={y + 4} fontSize={10} fill={themeColors.colors.textMuted} textAnchor="end">
                  {label.toLocaleString()}
                </SvgText>
              </G>
            );
          })}
          
          {data.map((d, i) => {
            const totalHeight = Math.max(2, (d.calories / max) * chartH);
            const totalCalories = d.calories || 1;
            const proteinHeight = d.calories > 0 ? ((d.protein * 4 / totalCalories) * totalHeight) : 0;
            const carbsHeight = d.calories > 0 ? ((d.carbs * 4 / totalCalories) * totalHeight) : 0;
            const fatHeight = d.calories > 0 ? ((d.fat * 9 / totalCalories) * totalHeight) : 0;
            
            const x = i * (barW + gap);
            const yBase = chartH;
            
            const safeProteinHeight = isNaN(proteinHeight) || !isFinite(proteinHeight) ? 0 : proteinHeight;
            const safeCarbsHeight = isNaN(carbsHeight) || !isFinite(carbsHeight) ? 0 : carbsHeight;
            const safeFatHeight = isNaN(fatHeight) || !isFinite(fatHeight) ? 0 : fatHeight;
            
            return (
              <G key={`${d.date}-${i}`}>
                {safeFatHeight > 0 && <Rect x={x} y={yBase - safeFatHeight} width={barW} height={safeFatHeight} fill="#4A90E2" />}
                {safeCarbsHeight > 0 && <Rect x={x} y={yBase - safeFatHeight - safeCarbsHeight} width={barW} height={safeCarbsHeight} fill="#F5A623" />}
                {safeProteinHeight > 0 && <Rect x={x} y={yBase - safeFatHeight - safeCarbsHeight - safeProteinHeight} width={barW} height={safeProteinHeight} rx={4} fill="#D0021B" />}
                <SvgText x={x + barW / 2} y={chartH + 18} fontSize={10} fill={themeColors.colors.textMuted} textAnchor="middle">
                  {d.date}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
      <View style={stylesBase.tLegendRow}>
        <LegendDot color={'#D0021B'} label={'Protein'} themeColors={themeColors} />
        <LegendDot color={'#F5A623'} label={'Carbs'} themeColors={themeColors} />
        <LegendDot color={'#4A90E2'} label={'Fats'} themeColors={themeColors} />
      </View>
    </View>
  );
}

function LegendDot({ color, label, themeColors }: { color: string; label: string; themeColors: { colors: any } }) {
  return (
    <View style={stylesBase.tLegendItem}>
      <View style={[stylesBase.tLegendDot, { backgroundColor: color }]} />
      <Text style={[stylesBase.tLegendText, { color: themeColors.colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function WorkoutBarChart({ data, height, width, themeColors }: { data: { date: string; calories: number }[]; height: number; width: number; themeColors: { colors: any } }) {
  const padding = 24;
  const chartW = Math.max(200, width) - padding * 2;
  const chartH = height - 80;
  const max = Math.max(...data.map((d) => d.calories), 500);
  const gap = 16;
  const barW = Math.max(30, chartW / data.length - gap);
  
  const yLabels = [max, Math.round(max * 0.66), Math.round(max * 0.33), 0];

  return (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <Svg width={Math.max(200, width)} height={height}>
        <G x={padding} y={10}>
          {yLabels.map((label, i) => {
            const y = (i / (yLabels.length - 1)) * chartH;
            return (
              <G key={`ylabel-${i}`}>
                <Line x1={-10} y1={y} x2={chartW} y2={y} stroke={themeColors.colors.border} strokeWidth={1} strokeDasharray="4,4" />
                <SvgText x={-15} y={y + 4} fontSize={10} fill={themeColors.colors.textMuted} textAnchor="end">
                  {label.toLocaleString()}
                </SvgText>
              </G>
            );
          })}
          
          {data.map((d, i) => {
            const barHeight = max > 0 ? Math.max(2, (d.calories / max) * chartH) : 2;
            const x = i * (barW + gap);
            const yBase = chartH;
            
            const safeHeight = isNaN(barHeight) || !isFinite(barHeight) ? 0 : barHeight;
            
            return (
              <G key={`${d.date}-${i}`}>
                {safeHeight > 0 && <Rect x={x} y={yBase - safeHeight} width={barW} height={safeHeight} rx={4} fill="#10B981" />}
                <SvgText x={x + barW / 2} y={chartH + 18} fontSize={10} fill={themeColors.colors.textMuted} textAnchor="middle">
                  {d.date}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

function SleepBarChart({ data, height, width, themeColors }: { data: { date: string; hours: number }[]; height: number; width: number; themeColors: { colors: any } }) {
  const padding = 24;
  const chartW = Math.max(200, width) - padding * 2;
  const chartH = height - 80;
  const max = Math.max(...data.map((d) => d.hours), 10);
  const gap = 16;
  const barW = Math.max(30, chartW / data.length - gap);
  
  const yLabels = [10, 8, 6, 4, 2, 0];

  return (
    <View style={{ alignItems: 'center', marginTop: 16 }}>
      <Svg width={Math.max(200, width)} height={height}>
        <G x={padding} y={10}>
          {yLabels.map((label, i) => {
            const y = (i / (yLabels.length - 1)) * chartH;
            return (
              <G key={`ylabel-${i}`}>
                <Line x1={-10} y1={y} x2={chartW} y2={y} stroke={themeColors.colors.border} strokeWidth={1} strokeDasharray="4,4" />
                <SvgText x={-15} y={y + 4} fontSize={10} fill={themeColors.colors.textMuted} textAnchor="end">
                  {`${label}h`}
                </SvgText>
              </G>
            );
          })}
          
          {data.map((d, i) => {
            const barHeight = max > 0 ? Math.max(2, (d.hours / max) * chartH) : 2;
            const x = i * (barW + gap);
            const yBase = chartH;
            
            const safeHeight = isNaN(barHeight) || !isFinite(barHeight) ? 0 : barHeight;
            
            return (
              <G key={`${d.date}-${i}`}>
                {safeHeight > 0 && <Rect x={x} y={yBase - safeHeight} width={barW} height={safeHeight} rx={4} fill="#6366F1" />}
                <SvgText x={x + barW / 2} y={chartH + 18} fontSize={10} fill={themeColors.colors.textMuted} textAnchor="middle">
                  {d.date}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const stylesBase = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  tLegendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 8 },
  tLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tLegendDot: { width: 10, height: 10, borderRadius: 5 },
  tLegendText: { fontSize: 12 },
});

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: Theme.colors.primary700, textAlign: 'center' },
  content: { flex: 1 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Theme.colors.textMuted,
    marginBottom: 2,
  },
  statSubtext: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  macroCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  macroCard: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  macroColorBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  macroCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  macroCardLabel: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  tCaloriesContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  tCaloriesLeft: {
    alignItems: 'center',
  },
  tCaloriesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  tCaloriesGoal: {
    fontSize: 11,
    color: Theme.colors.textMuted,
  },
  tCaloriesRight: {
    flex: 1,
    gap: 8,
  },
  tMacroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tMacroLabel: {
    fontSize: 13,
    color: Theme.colors.textMuted,
  },
  tMacroValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  tCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: 16,
  },
  tCardTitle: { fontSize: 18, fontWeight: '700', color: Theme.colors.text },
  tHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  tRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primary700,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: Theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tRefreshText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  periodFilters: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.textMuted,
  },
  periodButtonTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  goalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgressBadge: {
    backgroundColor: Theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalProgressBadgeText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  motivationText: {
    fontSize: 14,
    color: '#10B981',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
  weekFilters: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  weekButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    alignItems: 'center',
  },
  weekButtonActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  weekButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Theme.colors.textMuted,
  },
  weekButtonTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  totalCaloriesValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginTop: 8,
  },
  totalCaloriesUnit: {
    fontSize: 20,
    fontWeight: 'normal',
    color: Theme.colors.textMuted,
  },
  bmiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bmiInfoButton: {
    padding: 4,
  },
  bmiContent: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bmiValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  bmiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bmiStatusLabel: {
    fontSize: 16,
    color: Theme.colors.textMuted,
  },
  bmiStatusBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bmiStatusText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  bmiScale: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  bmiScaleSegment: {
    height: '100%',
  },
  bmiIndicator: {
    position: 'absolute',
    top: -4,
    width: 2,
    height: 20,
    backgroundColor: '#000',
  },
  bmiLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  bmiLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bmiLegendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bmiLegendText: {
    fontSize: 12,
    color: Theme.colors.textMuted,
  },
  sleepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepAvgBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sleepAvgText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
  },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Theme.colors.text, marginHorizontal: 20, marginBottom: 12 },
  profileSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: Theme.colors.primary700,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.primary700,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: Theme.colors.primary700,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  profileAvatarImg: { width: '100%', height: '100%' },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.primary700,
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary700,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  editProfileButton: {
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  editProfileButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: Theme.colors.surface,
    borderRadius: 16,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginHorizontal: 16,
  },
  chipButton: {
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipButtonText: { color: Theme.colors.text, fontSize: 12, fontWeight: '600' },
  infoRows: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, color: Theme.colors.textMuted },
  infoValue: { fontSize: 13, fontWeight: '600', color: Theme.colors.text },
  referCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 20,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  referIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  referContent: {
    flex: 1,
  },
  referTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  referSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff8e1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  premiumText: { fontSize: 12, fontWeight: '600', color: '#f57c00' },
  profileStats: { flexDirection: 'row', gap: 20 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  settingText: { fontSize: 16, color: Theme.colors.text },
  goalsCard: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: Theme.shadow.soft.shadowColor,
    shadowOffset: Theme.shadow.soft.shadowOffset,
    shadowOpacity: Theme.shadow.soft.shadowOpacity,
    shadowRadius: Theme.shadow.soft.shadowRadius,
    elevation: Theme.shadow.soft.elevation,
  },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  goalLabel: { fontSize: 16, color: Theme.colors.textMuted },
  goalValue: { fontSize: 16, fontWeight: '600', color: Theme.colors.text },
  appInfo: { alignItems: 'center', paddingHorizontal: 20 },
  appName: { fontSize: 20, fontWeight: 'bold', color: Theme.colors.primary700, marginBottom: 4 },
  appVersion: { fontSize: 14, color: Theme.colors.textMuted, marginBottom: 8 },
  appDescription: { fontSize: 14, color: Theme.colors.textMuted, textAlign: 'center', fontStyle: 'italic' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    borderColor: Theme.colors.border,
    borderWidth: 1,
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.text, marginBottom: 8, textAlign: 'center' },
  modalAction: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Theme.colors.background,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginTop: 8,
    alignItems: 'center',
  },
  modalActionText: { fontSize: 15, fontWeight: '600', color: Theme.colors.text },
});
