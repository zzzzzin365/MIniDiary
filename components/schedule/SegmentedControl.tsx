import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { theme } from '@/src/theme';

export type ViewMode = 'month' | 'week' | 'day';

interface SegmentedControlProps {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

const SEGMENTS: { key: ViewMode; label: string }[] = [
  { key: 'month', label: '月' },
  { key: 'week', label: '周' },
  { key: 'day', label: '日' },
];

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {SEGMENTS.map((segment) => {
        const isActive = value === segment.key;
        return (
          <Pressable
            key={segment.key}
            style={[styles.segment, isActive && styles.segmentActive]}
            onPress={() => onChange(segment.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 225, 241, 0.3)',
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: theme.colors.marks.terracotta,
  },
  label: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: theme.colors.ink.secondary,
  },
  labelActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

