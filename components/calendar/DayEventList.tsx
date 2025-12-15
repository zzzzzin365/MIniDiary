import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { theme } from '@/src/theme';
import { useMindLogStore } from '@/src/store/useMindLogStore';

interface DayEventListProps {
  selectedDate: string;
}

export function DayEventList({ selectedDate }: DayEventListProps) {
  // Fetch real events from store
  const allEvents = useMindLogStore((state) => state.events);
  
  const events = allEvents.filter(e => e.startTime.startsWith(selectedDate))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { 
      month: 'long', 
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {/* Date header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        <View style={styles.headerLine} />
      </View>

      {/* Events list */}
      <ScrollView 
        style={styles.eventList}
        showsVerticalScrollIndicator={false}
      >
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>这一天还没有记录</Text>
            <Text style={styles.emptySubtext}>轻触"+"添加日程或回答每日问题</Text>
          </View>
        ) : (
          events.map((event) => (
            <Pressable 
              key={event.id} 
              style={({ pressed }) => [
                styles.eventCard,
                event.type === 'diary' ? styles.diaryCard : styles.scheduleCard,
                pressed && styles.eventCardPressed,
              ]}
            >
              {/* Time bracket for schedules */}
              {event.type === 'schedule' && (
                <View style={styles.timeBracket}>
                  <View style={styles.bracketTop} />
                  <Text style={styles.timeText}>{formatTime(event.startTime)}</Text>
                  <View style={styles.bracketBottom} />
                </View>
              )}

              {/* Content */}
              <View style={styles.eventContent}>
                <Text style={[
                  styles.eventTitle,
                  event.type === 'diary' && styles.diaryTitle,
                ]}>
                  {event.title}
                </Text>
                
                {/* Content preview if exists */}
                {/* {event.content && ( ... )} */}
              </View>

              {/* Type indicator */}
              <View style={[
                styles.typeIndicator,
                event.type === 'diary' ? styles.diaryIndicator : styles.scheduleIndicator,
              ]} />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  // Date header with "ruling" line
  dateHeader: {
    marginBottom: 16,
  },
  dateText: {
    fontFamily: theme.typography.serif,
    fontSize: 18,
    color: theme.colors.ink.main,
    marginBottom: 8,
  },
  headerLine: {
    height: 1,
    backgroundColor: theme.colors.marks.blueGrey,
    opacity: 0.5,
  },
  // Event list
  eventList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: theme.typography.serif,
    fontSize: 16,
    color: theme.colors.ink.watermark,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.watermark,
    opacity: 0.7,
  },
  // Event cards
  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 10,
    position: 'relative',
  },
  eventCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  // Schedule card: pencil sketch style
  scheduleCard: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.ink.watermark,
    borderStyle: 'dashed',
  },
  // Diary card: Post-it / watercolor style
  diaryCard: {
    backgroundColor: 'rgba(232, 159, 113, 0.12)', // Terracotta tint
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.marks.terracotta,
  },
  // Time bracket (hand-drawn style)
  timeBracket: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  bracketTop: {
    width: 8,
    height: 1,
    backgroundColor: theme.colors.ink.pencil,
    opacity: 0.5,
    marginBottom: 2,
  },
  timeText: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.secondary,
    fontVariant: ['tabular-nums'],
  },
  bracketBottom: {
    width: 8,
    height: 1,
    backgroundColor: theme.colors.ink.pencil,
    opacity: 0.5,
    marginTop: 2,
  },
  // Event content
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: theme.typography.sans,
    fontSize: 15,
    color: theme.colors.ink.pencil,
    marginBottom: 4,
  },
  diaryTitle: {
    fontFamily: theme.typography.serif,
    fontStyle: 'italic',
    color: theme.colors.ink.main,
  },
  eventPreview: {
    fontFamily: theme.typography.serif,
    fontSize: 13,
    color: theme.colors.ink.secondary,
    lineHeight: 18,
    opacity: 0.8,
  },
  // Type indicator (dot or smudge)
  typeIndicator: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  scheduleIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.marks.sage,
  },
  diaryIndicator: {
    width: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.marks.terracotta,
    opacity: 0.7,
    transform: [{ rotate: '10deg' }],
  },
});
