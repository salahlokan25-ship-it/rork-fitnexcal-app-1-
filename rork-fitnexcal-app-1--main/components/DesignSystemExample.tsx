import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/theme';
import CircularProgress from '@/components/CircularProgress';

export default function DesignSystemExample() {
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { 
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.primary,
      }]}>
        Design System Examples
      </Text>
      
      {/* Buttons Section */}
      <Text style={[styles.sectionTitle, { 
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.primary,
        marginTop: theme.spacing['6'],
      }]}>
        Buttons
      </Text>
      
      <View style={[styles.card, { 
        backgroundColor: theme.colors.card,
        borderRadius: theme.radii.xl,
        padding: theme.spacing['5'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }]}>
        <TouchableOpacity style={[styles.button, { 
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.lg,
          paddingVertical: theme.spacing['3'],
          paddingHorizontal: theme.spacing['6'],
        }]}>
          <Text style={[styles.buttonText, { 
            color: theme.colors.white,
            fontWeight: '600',
          }]}>
            Primary Button
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, { 
          backgroundColor: theme.colors.white,
          borderRadius: theme.radii.lg,
          paddingVertical: theme.spacing['3'],
          paddingHorizontal: theme.spacing['6'],
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
          marginTop: theme.spacing['3'],
        }]}>
          <Text style={[styles.buttonText, { 
            color: theme.colors.primary,
            fontWeight: '600',
          }]}>
            Secondary Button
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, { 
          backgroundColor: 'transparent',
          borderRadius: theme.radii.lg,
          paddingVertical: theme.spacing['3'],
          paddingHorizontal: theme.spacing['6'],
          marginTop: theme.spacing['3'],
        }]}>
          <Text style={[styles.buttonText, { 
            color: theme.colors.primary,
            fontWeight: '600',
          }]}>
            Ghost Button
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Inputs Section */}
      <Text style={[styles.sectionTitle, { 
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.primary,
        marginTop: theme.spacing['6'],
      }]}>
        Inputs
      </Text>
      
      <View style={[styles.card, { 
        backgroundColor: theme.colors.card,
        borderRadius: theme.radii.xl,
        padding: theme.spacing['5'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }]}>
        <TextInput 
          style={[styles.input, {
            backgroundColor: theme.colors.white,
            borderWidth: 1.5,
            borderColor: theme.colors.borderLight,
            borderRadius: theme.radii.lg,
            paddingVertical: theme.spacing['3'],
            paddingHorizontal: theme.spacing['4'],
            color: theme.colors.text,
          }]}
          placeholder="Default Input"
          placeholderTextColor={theme.colors.gray500}
        />
        
        <TextInput 
          style={[styles.input, {
            backgroundColor: theme.colors.gray100,
            borderRadius: theme.radii['2xl'],
            paddingVertical: theme.spacing['2'],
            paddingLeft: theme.spacing['10'],
            paddingRight: theme.spacing['4'],
            marginTop: theme.spacing['3'],
          }]}
          placeholder="Search Input"
          placeholderTextColor={theme.colors.gray500}
        />
      </View>
      
      {/* Badges Section */}
      <Text style={[styles.sectionTitle, { 
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.primary,
        marginTop: theme.spacing['6'],
      }]}>
        Badges
      </Text>
      
      <View style={[styles.card, { 
        backgroundColor: theme.colors.card,
        borderRadius: theme.radii.xl,
        padding: theme.spacing['5'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row', 
        alignItems: 'center' 
      }]}>
        <View style={[styles.badge, {
          backgroundColor: theme.colors.primary50,
          borderRadius: theme.radii.sm,
          paddingVertical: theme.spacing['1'],
          paddingHorizontal: theme.spacing['2'],
        }]}>
          <Text style={[styles.badgeText, {
            color: theme.colors.primary700,
            fontSize: 11,
            fontWeight: '600',
          }]}>
            Default
          </Text>
        </View>
        
        <View style={[styles.badge, {
          backgroundColor: theme.colors.primary50,
          borderRadius: theme.radii.full,
          paddingVertical: theme.spacing['1'],
          paddingHorizontal: theme.spacing['3'],
          marginLeft: theme.spacing['3'],
        }]}>
          <Text style={[styles.badgeText, {
            color: theme.colors.primary700,
            fontSize: 13,
            fontWeight: '500',
          }]}>
            Pill Badge
          </Text>
        </View>
        
        <View style={[styles.dotBadge, {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radii.full,
          width: 8,
          height: 8,
          marginLeft: theme.spacing['3'],
        }]} />
      </View>
      
      {/* Progress Section */}
      <Text style={[styles.sectionTitle, { 
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.primary,
        marginTop: theme.spacing['6'],
      }]}>
        Progress Indicators
      </Text>
      
      <View style={[styles.card, { 
        backgroundColor: theme.colors.card,
        borderRadius: theme.radii.xl,
        padding: theme.spacing['5'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }]}>
        <View style={[styles.progressBarContainer, {
          height: 8,
          backgroundColor: theme.colors.gray300,
          borderRadius: theme.radii.full,
          overflow: 'hidden',
        }]}>
          <View style={[styles.progressBarFill, {
            backgroundColor: theme.colors.primary,
            height: '100%',
            width: '75%', // 75% progress
            borderRadius: theme.radii.full,
          }]} />
        </View>
        
        <View style={{ alignItems: 'center', marginTop: theme.spacing['4'] }}>
          <CircularProgress 
            size={120} 
            strokeWidth={8} 
            progress={0.75} 
            color={theme.colors.primary}
            backgroundColor={theme.colors.gray300}
          >
            <Text style={[styles.progressText, { 
              color: theme.colors.text,
              fontWeight: '600',
              fontSize: 18,
            }]}>
              75%
            </Text>
          </CircularProgress>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    marginBottom: 24,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
  },
  input: {
    width: '100%',
    fontSize: 15,
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    textAlign: 'center',
  },
  dotBadge: {
  },
  progressBarContainer: {
    width: '100%',
  },
  progressBarFill: {
  },
  progressText: {
    textAlign: 'center',
  },
});