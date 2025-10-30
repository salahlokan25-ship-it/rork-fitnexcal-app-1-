import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '@/types/nutrition';
import { ACTIVITY_MULTIPLIERS, GOAL_ADJUSTMENTS, MACRO_RATIOS } from '@/constants/nutrition';

type AuthUser = { email: string } | null;

type StreakData = {
  currentStreak: number;
  lastLogDate: string;
  weeklyLogs: boolean[];
};

const AUTH_KEY = 'auth_user';
const ONBOARDING_KEY = 'onboarding_completed';
const USER_PROFILE_KEY = 'user_profile';
const STREAK_KEY = 'user_streak';

const onboardingKeyFor = (email: string) => `${ONBOARDING_KEY}:${email.toLowerCase()}`;

const calculateBMR = (weight: number, height: number, age: number, gender: 'male' | 'female' | 'other') => {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
  }
};

const calculateCalorieGoal = (
  profile: Pick<
    UserProfile,
    'weight' | 'height' | 'age' | 'gender' | 'activity_level' | 'goal'
  >,
) => {
  const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
  const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity_level];
  const goalCalories = tdee + GOAL_ADJUSTMENTS[profile.goal];

  return {
    goal_calories: Math.round(goalCalories),
    goal_protein: Math.round((goalCalories * MACRO_RATIOS.protein) / 4),
    goal_carbs: Math.round((goalCalories * MACRO_RATIOS.carbs) / 4),
    goal_fat: Math.round((goalCalories * MACRO_RATIOS.fat) / 9),
  };
};

export const [UserProvider, useUser] = createContextHook(() => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    lastLogDate: '',
    weeklyLogs: [false, false, false, false, false, false, false],
  });

  const loadState = useCallback(async () => {
    console.log('[UserStore] Loading state');
    try {
      const authRaw = await AsyncStorage.getItem(AUTH_KEY);

      if (authRaw) {
        const parsed: AuthUser = JSON.parse(authRaw);
        setAuthUser(parsed);

        if (parsed?.email) {
          const perUserOnboarding = await AsyncStorage.getItem(onboardingKeyFor(parsed.email));
          if (perUserOnboarding === null) {
            const legacy = await AsyncStorage.getItem(ONBOARDING_KEY);
            const legacyBool = legacy === 'true';
            await AsyncStorage.setItem(onboardingKeyFor(parsed.email), legacyBool ? 'true' : 'false');
            setHasCompletedOnboarding(legacyBool);
          } else {
            setHasCompletedOnboarding(perUserOnboarding === 'true');
          }
        }

        const storedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
        if (storedProfile) {
          setUser(JSON.parse(storedProfile));
        } else {
          setUser(null);
        }

        const storedStreak = await AsyncStorage.getItem(STREAK_KEY);
        if (storedStreak) {
          setStreakData(JSON.parse(storedStreak));
        }
      } else {
        setAuthUser(null);
        setUser(null);
        const legacy = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(legacy === 'true');
      }
    } catch (error) {
      console.error('[UserStore] Error loading state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required');
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const auth: AuthUser = { email: normalizedEmail };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      await AsyncStorage.setItem(onboardingKeyFor(normalizedEmail), 'false');
      setAuthUser(auth);
      setHasCompletedOnboarding(false);
      return auth;
    } catch (e) {
      console.error('[UserStore] signUp error', e);
      throw e;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      throw new Error('Email and password are required');
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const auth: AuthUser = { email: normalizedEmail };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
      setAuthUser(auth);
      const perUserOnboarding = await AsyncStorage.getItem(onboardingKeyFor(normalizedEmail));
      if (perUserOnboarding === null) {
        await AsyncStorage.setItem(onboardingKeyFor(normalizedEmail), 'false');
        setHasCompletedOnboarding(false);
      } else {
        setHasCompletedOnboarding(perUserOnboarding === 'true');
      }
      return auth;
    } catch (e) {
      console.error('[UserStore] signIn error', e);
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
      setAuthUser(null);
    } catch (e) {
      console.error('[UserStore] signOut error', e);
    }
  }, []);

  const createUser = useCallback(
    async (
      profileData: Omit<
        UserProfile,
        'id' | 'goal_calories' | 'goal_protein' | 'goal_carbs' | 'goal_fat' | 'is_premium'
      > & { weightGoal?: number },
    ) => {
      if (!profileData.name?.trim() || !profileData.age || !profileData.weight || !profileData.height) {
        throw new Error('Invalid profile data');
      }

      try {
        const goals = calculateCalorieGoal(profileData);
        const newUser: UserProfile = {
          ...profileData,
          ...goals,
          id: Date.now().toString(),
          is_premium: false,
        };

        await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newUser));
        setUser(newUser);
        return newUser;
      } catch (error) {
        console.error('[UserStore] Error creating user:', error);
        throw error;
      }
    },
    [],
  );

  const updateUser = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;

      try {
        const updatedUser = { ...user, ...updates } as UserProfile;

        if (
          updates.weight !== undefined ||
          updates.height !== undefined ||
          updates.age !== undefined ||
          updates.activity_level !== undefined ||
          updates.goal !== undefined
        ) {
          const goals = calculateCalorieGoal(updatedUser);
          Object.assign(updatedUser, goals);
        }

        await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
      } catch (error) {
        console.error('[UserStore] Error updating user:', error);
        throw error;
      }
    },
    [user],
  );

  const completeOnboarding = useCallback(async () => {
    try {
      const email = authUser?.email;
      if (email) {
        await AsyncStorage.setItem(onboardingKeyFor(email), 'true');
      } else {
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      }
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('[UserStore] Error completing onboarding:', error);
    }
  }, [authUser]);

  const upgradeToPremium = useCallback(async () => {
    if (user) {
      await updateUser({ is_premium: true });
    }
  }, [user, updateUser]);

  const isAuthenticated = useMemo(() => authUser !== null, [authUser]);

  const updateStreak = useCallback(async () => {
    try {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = streakData.currentStreak;
      let newWeeklyLogs = [...streakData.weeklyLogs];

      if (streakData.lastLogDate !== today) {
        if (streakData.lastLogDate === yesterday) {
          newStreak += 1;
        } else if (streakData.lastLogDate === '') {
          newStreak = 1;
        } else {
          newStreak = 1;
        }

        const dayOfWeek = new Date().getDay();
        newWeeklyLogs = [false, false, false, false, false, false, false];
        newWeeklyLogs[dayOfWeek] = true;

        const newStreakData: StreakData = {
          currentStreak: newStreak,
          lastLogDate: today,
          weeklyLogs: newWeeklyLogs,
        };

        await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(newStreakData));
        setStreakData(newStreakData);
      }
    } catch (error) {
      console.error('[UserStore] Error updating streak:', error);
    }
  }, [streakData]);

  return useMemo(
    () => ({
      user,
      isLoading,
      hasCompletedOnboarding,
      isAuthenticated,
      authUser,
      streakData,
      signIn,
      signUp,
      signOut,
      createUser,
      updateUser,
      completeOnboarding,
      upgradeToPremium,
      updateStreak,
    }),
    [
      user,
      isLoading,
      hasCompletedOnboarding,
      isAuthenticated,
      authUser,
      streakData,
      signIn,
      signUp,
      signOut,
      createUser,
      updateUser,
      completeOnboarding,
      upgradeToPremium,
      updateStreak,
    ],
  );
});