import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/src/theme';
import { useMindLogStore } from '@/src/store/useMindLogStore';
import { ScheduleItem } from './ScheduleItem';
import { ScheduleBottomSheet } from './ScheduleBottomSheet';
import { TimelineEvent } from '@/src/types/domain';
import { Plus } from 'lucide-react-native'; // Ensure lucide is installed or use fallback

export function ScheduleList() {
  const events = useMindLogStore((state) => state.events);
  const addEvent = useMindLogStore((state) => state.addEvent);
  const deleteEvent = useMindLogStore((state) => state.deleteEvent);

  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  // Filter today's events and sort by time
  const todaysEvents = events
    .filter(e => e.startTime.startsWith(todayStr))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const handleAdd = () => {
    setEditingEvent(null);
    setIsSheetVisible(true);
  };

  const handleSave = (data: { title: string; startTime: string; endTime?: string }) => {
    // Currently only supporting ADD, update logic would go here
    addEvent({
      type: 'schedule',
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      isAllDay: false,
      status: 'active',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Today's Focus</Text>
        <Pressable style={styles.addButton} onPress={handleAdd}>
           <Text style={styles.plusIcon}>+</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {todaysEvents.length === 0 ? (
          <Text style={styles.emptyText}>No focus items yet.</Text>
        ) : (
          todaysEvents.map((event) => (
            <ScheduleItem 
              key={event.id} 
              event={event} 
              onPress={() => { /* Edit logic future */ }}
              onDelete={() => deleteEvent(event.id)}
            />
          ))
        )}
      </View>

      <ScheduleBottomSheet 
        isVisible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onSave={handleSave}
        initialEvent={editingEvent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.layout.margin,
    marginTop: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.paper.pressed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusIcon: {
    fontSize: 18,
    color: theme.colors.ink.main,
    lineHeight: 20,
  },
  list: {
    gap: 10,
  },
  emptyText: {
    fontFamily: theme.typography.serif,
    fontSize: 14,
    color: theme.colors.ink.watermark,
    fontStyle: 'italic',
    marginTop: 10,
  },
});
