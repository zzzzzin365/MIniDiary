import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * BackgroundGradient — "Ethereal Dream" Living Background
 * 
 * Pure React Native implementation (no Skia).
 * Creates soft, layered gradient orbs using LinearGradient and Views.
 */
export function BackgroundGradient() {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Base Gradient */}
      <LinearGradient
        colors={['#fff5ee', '#fffaf5', '#fff5ee']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Pink Orb - Top Left */}
      <View style={[styles.orb, styles.pinkOrb]} />

      {/* Periwinkle Orb - Bottom Right */}
      <View style={[styles.orb, styles.periwinkleOrb]} />

      {/* White Glow - Center Top */}
      <View style={[styles.orb, styles.whiteOrb]} />

      {/* Secondary Pink - Bottom Left */}
      <View style={[styles.orb, styles.pinkOrbSecondary]} />

      {/* Secondary Periwinkle - Top Right */}
      <View style={[styles.orb, styles.periwinkleOrbSecondary]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999, // Fully round
  },
  // Pink Orb - Top Left
  pinkOrb: {
    width: width * 1.2,
    height: width * 1.2,
    top: -width * 0.5,
    left: -width * 0.4,
    backgroundColor: '#ffb6c1',
    opacity: 0.35,
    // Simulate blur with shadow (iOS) / large size (Android)
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 100,
  },
  // Periwinkle Orb - Bottom Right
  periwinkleOrb: {
    width: width * 1.4,
    height: width * 1.4,
    bottom: -width * 0.5,
    right: -width * 0.5,
    backgroundColor: '#d4e1f1',
    opacity: 0.4,
    shadowColor: '#d4e1f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 120,
  },
  // White Glow - Center
  whiteOrb: {
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.2,
    left: width * 0.1,
    backgroundColor: '#ffffff',
    opacity: 0.4,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
  },
  // Secondary Pink - Bottom Left
  pinkOrbSecondary: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: height * 0.1,
    left: -width * 0.2,
    backgroundColor: '#ffb6c1',
    opacity: 0.2,
    shadowColor: '#ffb6c1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 60,
  },
  // Secondary Periwinkle - Top Right
  periwinkleOrbSecondary: {
    width: width * 0.5,
    height: width * 0.5,
    top: height * 0.05,
    right: -width * 0.1,
    backgroundColor: '#d4e1f1',
    opacity: 0.3,
    shadowColor: '#d4e1f1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 50,
  },
});
