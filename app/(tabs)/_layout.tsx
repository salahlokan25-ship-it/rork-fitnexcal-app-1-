import { Tabs } from 'expo-router';
import { Home, Camera, Search, MessageCircle, Settings, Plus, Heart, Brain } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/theme';

function CustomTabBar({ state, descriptors, navigation }: any) {
  console.log('[CustomTabBar] render', { index: state.index, routes: state.routes.map((r: any) => r.name) });
  const { theme } = useTheme();
  const styles = stylesWithTheme(theme);
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#5B8FF9', '#3B82F6', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      <View style={styles.tabBarInner} testID="custom-tab-bar">
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label: string =
            options.tabBarLabel !== undefined
              ? (options.tabBarLabel as string)
              : options.title !== undefined
              ? (options.title as string)
              : (route.name as string);

          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const inactiveColor = 'rgba(255,255,255,0.6)' as const;
          const activeColor = '#FFFFFF' as const;
          const color = isFocused ? activeColor : inactiveColor;
          const iconSize = 24 as const;
          const Icon = options.tabBarIcon as
            | ((props: { color: string; size: number }) => React.ReactNode)
            | undefined;

          if (route.name === 'scan') {
            return (
              <View key={route.key} style={styles.centerSlot}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  testID="tab-item-scan"
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={styles.centerButtonWrapper}
                >
                  <View style={styles.centerButton}>
                    <Plus color="#FFFFFF" size={32} strokeWidth={3} />
                  </View>
                  <Text style={styles.centerLabel}>Scan</Text>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={`tab-item-${route.name}`}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItemWrapper}
            >
              <View style={styles.tabItem}>
                {isFocused && <View style={styles.activeIndicator} />}
                <View style={styles.iconWrapper}>
                  {Icon ? Icon({ color, size: iconSize }) : null}
                </View>
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
}

function RootLayoutNav() {
  const screenOptions = useMemo(() => {
    return {
      headerShown: false,
      tabBarShowLabel: true,
    } as const;
  }, []);

  return (
    <Tabs screenOptions={screenOptions} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: 'Wellness',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="mind"
        options={{
          title: 'Mindfulness',
          tabBarIcon: ({ color, size }) => <Brain color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="research"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'More',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

const stylesWithTheme = (Theme: any) => StyleSheet.create({
  tabBarContainer: {
    borderTopWidth: 0,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 16,
    elevation: 12,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  tabItemWrapper: {
    flex: 1,
    paddingHorizontal: 2,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
  },
  centerLabel: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  iconWrapper: {
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default function TabLayout() {
  return <RootLayoutNav />;
}
