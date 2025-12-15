import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { theme } from '@/src/theme';
import { getDailyQuestions, Question } from '@/src/services/questionService';

const { width } = Dimensions.get('window');
const BALL_SIZE = 60;

// Pre-calculate positions for each ball
const BALL_POSITIONS = [
  { x: -40, y: -30, rotate: 15 },
  { x: 40, y: -20, rotate: -10 },
  { x: -30, y: 40, rotate: 25 },
  { x: 35, y: 50, rotate: -20 },
];

interface PaperBallProps {
  index: number;
  isSelected: boolean;
  onPress: () => void;
  isAnySelected: boolean;
}

function PaperBall({ index, isSelected, onPress, isAnySelected }: PaperBallProps) {
  const pos = BALL_POSITIONS[index];
  const expansion = useSharedValue(0);

  useEffect(() => {
    expansion.value = withSpring(isSelected ? 1 : 0, { damping: 12 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = isAnySelected && !isSelected ? withTiming(0, { duration: 300 }) : withTiming(1);
    
    const scale = interpolate(expansion.value, [0, 1], [1, 4]);
    const rotateValue = interpolate(expansion.value, [0, 1], [pos.rotate, 0]);
    const translateX = interpolate(expansion.value, [0, 1], [pos.x, 0]);
    const translateY = interpolate(expansion.value, [0, 1], [pos.y, 0]);

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotateValue}deg` },
        { scale },
      ],
      zIndex: isSelected ? 10 : 1,
    };
  });

  return (
    <Pressable onPress={onPress} disabled={isAnySelected && !isSelected}>
      <Animated.View style={[styles.ballContainer, animatedStyle]}>
        <View style={styles.ballVisual}>
           <View style={styles.crumple1} />
           <View style={styles.crumple2} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function PaperBallLottery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [revealedQuestion, setRevealedQuestion] = useState<Question | null>(null);

  // 获取今天的4个问题（每天固定）
  const dailyQuestions = useMemo(() => getDailyQuestions(new Date(), 4), []);

  const handlePress = (index: number) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
      // Simulate unfolding delay
      setTimeout(() => {
        setRevealedQuestion(dailyQuestions[index]);
      }, 600);
    }
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setRevealedQuestion(null);
  };

  // 获取分类的中文名
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'self': return '自我探索';
      case 'past': return '回忆往昔';
      case 'imagination': return '想象未来';
      default: return '每日一问';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.ballsArea}>
        {[0, 1, 2, 3].map((i) => (
          <PaperBall 
            key={i} 
            index={i} 
            isSelected={selectedIndex === i}
            onPress={() => handlePress(i)}
            isAnySelected={selectedIndex !== null}
          />
        ))}
      </View>

      {/* Expanded Content Overlay */}
      {revealedQuestion && (
        <Animated.View 
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          style={styles.cardContent}
        >
          <Text style={styles.questionCategory}>
            {getCategoryLabel(revealedQuestion.category)}
          </Text>
          <Text style={styles.questionText}>{revealedQuestion.text}</Text>
          
          <Pressable style={styles.actionButton} onPress={() => { /* Nav to WriteDiary */ }}>
            <Text style={styles.actionButtonText}>写下答案</Text>
          </Pressable>

          <Pressable style={styles.closeButton} onPress={handleClose}>
             <Text style={styles.closeText}>折回去</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  ballsArea: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballContainer: {
    width: BALL_SIZE,
    height: BALL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
  ballVisual: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.paper.pressed,
    borderWidth: 1,
    borderColor: '#E0DCD0',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  crumple1: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 30,
    height: 1,
    backgroundColor: '#D6D2C4',
    transform: [{ rotate: '45deg' }],
  },
  crumple2: {
    position: 'absolute',
    bottom: 15,
    right: 12,
    width: 20,
    height: 1,
    backgroundColor: '#D6D2C4',
    transform: [{ rotate: '-20deg' }],
  },
  cardContent: {
    position: 'absolute',
    width: width - 40,
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    backgroundColor: theme.colors.paper.bg,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  questionCategory: {
    fontFamily: theme.typography.sans,
    fontSize: 11,
    color: theme.colors.marks.terracotta,
    letterSpacing: 2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  questionText: {
    fontFamily: theme.typography.serif,
    fontSize: 22,
    color: theme.colors.ink.main,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 34,
  },
  actionButton: {
    backgroundColor: theme.colors.ink.main,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30,
    marginBottom: 16,
  },
  actionButtonText: {
    color: theme.colors.paper.bg,
    fontFamily: theme.typography.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 10,
  },
  closeText: {
    color: theme.colors.ink.secondary,
    fontFamily: theme.typography.sans,
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});
