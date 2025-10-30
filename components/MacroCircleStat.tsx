import React, { memo, isValidElement } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CircularProgress from '@/components/CircularProgress';

export type MacroType = 'protein' | 'carbs' | 'fat';

interface MacroCircleStatProps {
  type: MacroType;
  value: number;
  goal: number;
  color: string;
  accent?: string;
  icon?: React.ReactNode;
  testID?: string;
}

const MacroCircleStat = memo(function MacroCircleStat({
  type,
  value,
  goal,
  color,
  accent = '#eef2f7',
  icon,
  testID,
}: MacroCircleStatProps) {
  const progress = Math.max(0, Math.min(1, goal > 0 ? value / goal : 0));
  const over = value > goal;
  const remaining = Math.max(0, goal - value);

  const titleValue = `${Math.round(value)}g`;
  const label = over ? 'over' : 'left';
  const typeLabel = type === 'protein' ? 'Protein' : type === 'carbs' ? 'Carbs' : 'Fats';

  return (
    <View style={styles.card} testID={testID ?? `macro-card-${type}`}>
      <Text style={styles.valueText}>{titleValue}</Text>
      <Text style={styles.labelText}>{typeLabel} {label}</Text>
      <View style={styles.ringWrap}>
        <CircularProgress size={84} strokeWidth={10} progress={progress} color={color} backgroundColor={accent}>
          <View style={[styles.innerIcon, { backgroundColor: '#fff' }]}>
            {isValidElement(icon) ? icon : null}
          </View>
        </CircularProgress>
      </View>
      <View style={styles.helperRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.helperText} numberOfLines={1}>
          {over ? `${Math.round(value - goal)}g over` : `${Math.round(remaining)}g left`}
        </Text>
      </View>
    </View>
  );
});

export default MacroCircleStat;

const styles = StyleSheet.create({
  card: {
    width: 120,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  labelText: {
    marginTop: 2,
    fontSize: 12,
    color: '#6B7280',
  },
  ringWrap: {
    marginTop: 8,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  innerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  helperText: {
    fontSize: 11,
    color: '#6B7280',
  },
});
