import { theme } from '@/src/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MineScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mine Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.paper.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontFamily: theme.typography.serif,
    color: theme.colors.ink.secondary,
  },
});

