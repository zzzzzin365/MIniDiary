import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated as RNAnimated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { theme } from '@/src/theme';
import { TimelineEvent } from '@/src/types/domain';
import * as Haptics from 'expo-haptics';

interface ScheduleItemProps {
  event: TimelineEvent;
  onPress: () => void;
  onDelete: () => void;
}

export function ScheduleItem({ event, onPress, onDelete }: ScheduleItemProps) {
  const startTime = new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteContainer}>
        <RNAnimated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
          Delete
        </RNAnimated.Text>
      </View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onDelete();
      }}
    >
      <Pressable style={styles.container} onPress={onPress}>
        {/* Time Column */}
        <View style={styles.timeCol}>
          <Text style={styles.timeText}>{startTime}</Text>
        </View>

        {/* Bracket Visual */}
        <View style={styles.bracketContainer}>
          <View style={styles.bracketTop} />
          <View style={styles.bracketVertical} />
          <View style={styles.bracketBottom} />
        </View>

        {/* Content Column */}
        <View style={styles.contentCol}>
          <Text style={styles.titleText}>{event.title}</Text>
          <View style={styles.dot} />
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.colors.paper.bg, // Ensure bg covers delete action
    paddingVertical: 12,
  },
  deleteContainer: {
    backgroundColor: theme.colors.marks.vermilion,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 100,
    paddingRight: 20,
    height: '100%',
  },
  deleteText: {
    color: 'white',
    fontWeight: '600',
    fontFamily: theme.typography.sans,
  },
  // Reused styles from original ScheduleList
  timeCol: {
    width: 50,
    alignItems: 'flex-end',
    paddingRight: 10,
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  timeText: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.secondary,
    fontVariant: ['tabular-nums'],
  },
  bracketContainer: {
    width: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  bracketVertical: {
    width: 1,
    flex: 1,
    backgroundColor: theme.colors.ink.pencil,
    opacity: 0.5,
  },
  bracketTop: {
    width: 4,
    height: 1,
    backgroundColor: theme.colors.ink.pencil,
    alignSelf: 'flex-start',
    opacity: 0.5,
  },
  bracketBottom: {
    width: 4,
    height: 1,
    backgroundColor: theme.colors.ink.pencil,
    alignSelf: 'flex-start',
    opacity: 0.5,
  },
  contentCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  titleText: {
    fontFamily: theme.typography.sans,
    fontSize: 16,
    color: theme.colors.ink.pencil,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.marks.sage,
    marginTop: 6,
  },
});

