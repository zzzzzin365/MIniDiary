import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/src/theme';

export function Header() {
  const today = new Date();
  
  // Format: "12月14日"
  const dateStr = new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(today);

  // Mock Lunar Date for MVP (In real app, use a lunar library)
  const lunarDateStr = "冬月十五";

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{dateStr}</Text>
      <Text style={styles.lunar}>{lunarDateStr}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.margin,
    paddingTop: theme.layout.margin,
    paddingBottom: theme.layout.margin,
  },
  date: {
    fontFamily: theme.typography.serif,
    fontSize: 32,
    color: theme.colors.ink.main,
    marginBottom: 4,
  },
  lunar: {
    fontFamily: theme.typography.serif,
    fontSize: 16,
    color: theme.colors.ink.watermark, // Light grey "pre-printed" look
    letterSpacing: 2,
    opacity: 0.8,
  },
});

