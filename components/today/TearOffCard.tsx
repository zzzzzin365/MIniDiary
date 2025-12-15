import { Question } from '@/src/services/questionService';
import { theme } from '@/src/theme';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// --- Configuration ---
const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;
const CARD_HEIGHT = 280; // Adjusted for our design
const STRIP_HEIGHT = 50; // Height of the tear strip
const TEAR_THRESHOLD = CARD_WIDTH * 0.4; // Drag distance to snap

// --- 1. Jagged Line Generator (SVG) ---
// type: 'top' (teeth point up) | 'bottom' (teeth point down)
const JaggedLine = ({ width, height, color, type }: { width: number; height: number; color: string; type: 'top' | 'bottom' }) => {
  const toothWidth = 10;
  const steps = Math.ceil(width / toothWidth);
  
  // Starting point
  let d = `M0,${type === 'bottom' ? 0 : height}`;
  
  const yBase = type === 'bottom' ? 0 : height;

  for (let i = 0; i < steps; i++) {
    const x = (i + 0.5) * toothWidth;
    const xNext = (i + 1) * toothWidth;
    // If bottom: peak is at height (down), base at 0
    // If top: peak is at 0 (up), base at height
    const yPeak = type === 'bottom' ? height : 0;
    
    d += ` L${x},${yPeak} L${xNext},${yBase}`;
  }
  
  // Close the path
  d += ` L${width},${yBase} V${type === 'bottom' ? 0 : height} H0 Z`;

  return (
    <View style={{ width, height, overflow: 'hidden' }}>
      <Svg width={width} height={height}>
        <Path d={d} fill={color} />
      </Svg>
    </View>
  );
};

interface TearOffCardProps {
  question: Question;
  onTearComplete?: () => void;
}

export function TearOffCard({ question, onTearComplete }: TearOffCardProps) {
  const [isTorn, setIsTorn] = useState(false);

  // Animation Values
  const translateX = useSharedValue(0);
  const stripOpacity = useSharedValue(1);
  const coverGap = useSharedValue(0); // Gap between top/bottom covers after tear
  const contextX = useSharedValue(0); // Context for gesture

  const triggerHaptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  const handleTearComplete = () => {
    setIsTorn(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Separate the top and bottom covers to reveal content
    coverGap.value = withTiming(160, { duration: 600 });
    if (onTearComplete) onTearComplete();
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      // Only allow dragging right
      const nextX = contextX.value + event.translationX;
      if (nextX > 0) {
        translateX.value = nextX;
      }
    })
    .onEnd(() => {
      if (translateX.value > TEAR_THRESHOLD) {
        // Success: Fly off screen
        translateX.value = withTiming(CARD_WIDTH + 200, { duration: 300 });
        stripOpacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) runOnJS(handleTearComplete)();
        });
      } else {
        // Snap back
        translateX.value = withSpring(0);
      }
    });

  const stripStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      // Slight rotation for realism
      { rotateZ: `${interpolate(translateX.value, [0, CARD_WIDTH], [0, 5])}deg` }
    ],
    opacity: stripOpacity.value,
  }));

  // Top Cover Animation (Moves Up)
  const topCoverStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -coverGap.value }],
  }));

  // Bottom Cover Animation (Moves Down)
  const bottomCoverStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: coverGap.value }],
  }));

  const getCategoryLabel = (cat: string) => {
     switch (cat) {
       case 'self': return '自我探索';
       case 'past': return '回忆往昔';
       case 'imagination': return '想象未来';
       default: return '每日一问';
     }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      
      {/* === 1. Bottom Layer: The Secret Content (Data Driven) === */}
      <View style={styles.cardBase}>
        <View style={styles.contentPadding}>
          <Text style={styles.category}>{getCategoryLabel(question.category)}</Text>
          <Text style={styles.questionText}>
            {question.text}
          </Text>
          
          <Pressable style={styles.actionButton}>
             <Text style={styles.actionButtonText}>写下答案</Text>
          </Pressable>

          {isTorn && (
             <View style={styles.stamp}>
                <Text style={styles.stampText}>已阅</Text>
             </View>
          )}
        </View>
      </View>

      {/* === 2. Top Layer: Covers === */}
      <View style={styles.coverOverlay} pointerEvents="box-none">
        
        {/* Top Cover Half */}
        <Animated.View style={[styles.coverHalf, styles.coverTop, topCoverStyle]}>
           <Text style={styles.coverTitle}>DAILY MOOD</Text>
           <View style={{ position: 'absolute', bottom: 0 }}>
             <JaggedLine width={CARD_WIDTH} height={6} color={theme.colors.glass.overlay} type="top" />
           </View>
        </Animated.View>

        {/* Bottom Cover Half */}
        <Animated.View style={[styles.coverHalf, styles.coverBottom, bottomCoverStyle]}>
           <View style={{ position: 'absolute', top: 0 }}>
             <JaggedLine width={CARD_WIDTH} height={6} color={theme.colors.glass.overlay} type="bottom" />
           </View>
           <Text style={styles.coverSubtitle}>SEALED FOR YOU</Text>
        </Animated.View>

        {/* === 3. Middle: Zipper Strip === */}
        {/* Only visible/interactive if not torn yet (or fading out) */}
        {!isTorn && (
          <View style={styles.stripWrapper}>
            {/* Shadow gap behind the strip */}
            <View style={styles.stripShadowGap} />
            
            <GestureDetector gesture={panGesture}>
              <Animated.View style={[styles.stripContainer, stripStyle]}>
                {/* Strip Body Background */}
                <View style={styles.stripBody}>
                  <Text style={styles.stripText}>PULL TO OPEN ➔</Text>
                </View>

            {/* Top Teeth (to mask the gap above) */}
            <View style={{ position: 'absolute', top: -6 }}>
              <JaggedLine width={CARD_WIDTH + 40} height={6} color={theme.colors.glass.overlay} type="top" />
            </View>

            {/* Bottom Teeth (to mask the gap below) */}
            <View style={{ position: 'absolute', bottom: -6 }}>
              <JaggedLine width={CARD_WIDTH + 40} height={6} color={theme.colors.glass.overlay} type="bottom" />
            </View>
              </Animated.View>
            </GestureDetector>
          </View>
        )}

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    position: 'relative',
  },
  // Base Card (Content)
  cardBase: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.glass.card, // Frosted
    borderRadius: 24, // Softer
    shadowColor: theme.shadows.glass.shadowColor,
    shadowOffset: theme.shadows.glass.shadowOffset,
    shadowOpacity: theme.shadows.glass.shadowOpacity,
    shadowRadius: theme.shadows.glass.shadowRadius,
    elevation: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  contentPadding: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  category: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.marks.terracotta,
    letterSpacing: 2,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  questionText: { 
    fontFamily: theme.typography.serif,
    fontSize: 22, 
    color: theme.colors.ink.main, 
    lineHeight: 34, 
    textAlign: 'center',
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: theme.colors.ink.main,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30,
    zIndex: 20,
  },
  actionButtonText: {
    color: theme.colors.paper.bg,
    fontFamily: theme.typography.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  stamp: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderWidth: 2,
    borderColor: theme.colors.marks.vermilion,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.6,
    transform: [{rotate: '-15deg'}]
  },
  stampText: { 
    color: theme.colors.marks.vermilion, 
    fontSize: 14, 
    fontWeight: 'bold' 
  },

  // Cover Overlay
  coverOverlay: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    zIndex: 10,
  },
  coverHalf: {
    position: 'absolute',
    width: '100%',
    backgroundColor: theme.colors.glass.overlay, // Vellum/Tracing Paper
    left: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glass.border,
  },
  coverTop: {
    top: 0,
    height: (CARD_HEIGHT - STRIP_HEIGHT) / 2 + 1, // +1 to overlap slightly
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  coverBottom: {
    bottom: 0,
    height: (CARD_HEIGHT - STRIP_HEIGHT) / 2 + 1,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingTop: 20,
  },
  coverTitle: { 
    fontFamily: theme.typography.serif,
    fontSize: 16, 
    color: '#A6A095', 
    letterSpacing: 4, 
    fontWeight: '600' 
  },
  coverSubtitle: { 
    fontFamily: theme.typography.sans,
    fontSize: 10, 
    color: '#B0AA9E', 
    letterSpacing: 2, 
    marginTop: 10 
  },

  // Zipper Strip
  stripWrapper: {
    height: STRIP_HEIGHT,
    width: CARD_WIDTH + 20,
    alignSelf: 'center',
    zIndex: 20,
    justifyContent: 'center',
  },
  stripShadowGap: {
    position: 'absolute',
    width: '100%',
    height: STRIP_HEIGHT - 10,
    backgroundColor: 'rgba(0,0,0,0.1)',
    top: 5,
    left: 10, // Adjust for the wider wrapper
  },
  stripContainer: {
    width: '100%',
    height: STRIP_HEIGHT,
    justifyContent: 'center',
  },
  stripBody: {
    width: '100%',
    height: STRIP_HEIGHT - 12, // Minus teeth height
    backgroundColor: 'rgba(255,255,255,0.9)', // Clean white strip
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  stripText: {
    fontFamily: theme.typography.sans,
    fontSize: 10,
    color: '#8A8070',
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});
