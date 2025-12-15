import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '@/src/theme';
import { ScheduleEvent } from '@/src/store/useMindLogStore';

const DELETE_THRESHOLD = -80;

interface ScheduleItemProps {
  event: ScheduleEvent;
  onPress: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}

export function ScheduleItem({ event, onPress, onDelete, onToggleComplete }: ScheduleItemProps) {
  const translateX = useSharedValue(0);
  const itemHeight = useSharedValue(70);
  const opacity = useSharedValue(1);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = Math.max(e.translationX, -100);
      }
    })
    .onEnd(() => {
      if (translateX.value < DELETE_THRESHOLD) {
        // Trigger delete animation
        translateX.value = withTiming(-400, { duration: 300 });
        itemHeight.value = withTiming(0, { duration: 300 });
        opacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(onDelete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    height: itemHeight.value,
    opacity: opacity.value,
    marginBottom: itemHeight.value > 0 ? 12 : 0,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Delete Button (Behind) */}
      <View style={styles.deleteBackground}>
        <Text style={styles.deleteText}>删除</Text>
      </View>

      {/* Main Card */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Pressable onPress={onPress} style={styles.cardContent}>
            {/* Time Bracket */}
            <View style={styles.timeColumn}>
              <View style={styles.bracketTop} />
              <Text style={styles.timeText}>{event.startTime}</Text>
              {event.endTime && (
                <Text style={styles.timeTextEnd}>{event.endTime}</Text>
              )}
              <View style={styles.bracketBottom} />
            </View>

            {/* Content */}
            <View style={styles.contentColumn}>
              <View style={styles.titleRow}>
                <Text
                  style={[
                    styles.title,
                    event.isCompleted && styles.titleCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {event.title}
                </Text>
                {event.reminderMinutes && event.reminderMinutes > 0 && (
                  <Text style={styles.reminderBadge}>🔔</Text>
                )}
              </View>
              {event.description && (
                <Text style={styles.description} numberOfLines={1}>
                  {event.description}
                </Text>
              )}
            </View>

            {/* Completion Toggle */}
            <Pressable
              style={[styles.checkbox, event.isCompleted && styles.checkboxChecked]}
              onPress={onToggleComplete}
            >
              {event.isCompleted && <Text style={styles.checkmark}>✓</Text>}
            </Pressable>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: '#D64C4C',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  deleteText: {
    color: '#fff',
    fontFamily: theme.typography.sans,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: theme.colors.paper.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 225, 241, 0.5)',
    shadowColor: theme.colors.marks.blueGrey,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  timeColumn: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  bracketTop: {
    width: 8,
    height: 1,
    backgroundColor: theme.colors.marks.blueGrey,
    marginBottom: 4,
  },
  bracketBottom: {
    width: 8,
    height: 1,
    backgroundColor: theme.colors.marks.blueGrey,
    marginTop: 4,
  },
  timeText: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: theme.colors.ink.secondary,
    fontVariant: ['tabular-nums'],
  },
  timeTextEnd: {
    fontFamily: theme.typography.sans,
    fontSize: 11,
    color: theme.colors.ink.watermark,
    fontVariant: ['tabular-nums'],
  },
  contentColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: theme.typography.sans,
    fontSize: 15,
    color: theme.colors.ink.main,
    marginBottom: 2,
    flexShrink: 1,
  },
  reminderBadge: {
    fontSize: 12,
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.ink.watermark,
  },
  description: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.secondary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.marks.blueGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.marks.terracotta,
    borderColor: theme.colors.marks.terracotta,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

