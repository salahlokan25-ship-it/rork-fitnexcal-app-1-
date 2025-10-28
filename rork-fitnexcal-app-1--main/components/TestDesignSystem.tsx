import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/theme';

export default function TestDesignSystem() {
  const { theme } = useTheme();
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { 
        color: theme.colors.primary,
      }]}>
        Design System Test
      </Text>
      <View style={[styles.box, { 
        backgroundColor: theme.colors.primary50,
        borderColor: theme.colors.primary,
      }]}>
        <Text style={[styles.text, { 
          color: theme.colors.text,
        }]}>
          This is a test of the design system
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
  },
  box: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  text: {
    fontSize: 16,
  },
});