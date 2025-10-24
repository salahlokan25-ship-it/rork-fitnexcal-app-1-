import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider, useUser } from "@/hooks/user-store";
import { NutritionProvider } from "@/hooks/nutrition-store";
import { WorkoutProvider } from "@/hooks/workout-store";
import { SleepProvider } from "@/hooks/sleep-store";
import { ThemeProvider } from "@/hooks/theme";
import { I18nProvider } from "@/hooks/i18n";
import { MoodProvider } from "@/hooks/mood-store";
import { KarmaProvider } from "@/hooks/karma-store";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppContent() {
  const { isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="log-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="paywall" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="food-analysis" options={{ presentation: "modal" }} />
      <Stack.Screen name="add-food" options={{ presentation: "modal" }} />
      <Stack.Screen name="edit-profile" options={{ presentation: "modal" }} />
      <Stack.Screen name="log-exercise" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayoutNav() {
  return (
    <NutritionProvider>
      <WorkoutProvider>
        <SleepProvider>
          <MoodProvider>
            <KarmaProvider>
              <AppContent />
            </KarmaProvider>
          </MoodProvider>
        </SleepProvider>
      </WorkoutProvider>
    </NutritionProvider>
  );
}

export default function RootLayout() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <ErrorBoundary>
            <UserProvider>
              <ThemeProvider>
                <I18nProvider>
                  <RootLayoutNav />
                </I18nProvider>
              </ThemeProvider>
            </UserProvider>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});