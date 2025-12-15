import { theme } from '@/src/theme';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScheduleBottomSheet } from '@/components/schedule/ScheduleBottomSheet';
import { ScheduleItem } from '@/components/schedule/ScheduleItem';
import { Header } from '@/components/today/Header';
import { TearOffCard } from '@/components/today/TearOffCard';
import { SystemCalendarEvent, useSystemCalendar } from '@/src/hooks/useSystemCalendar';
import {
  calculateReminderTrigger,
  cancelEventReminder,
  requestNotificationPermissions,
  scheduleEventReminder,
} from '@/src/services/notificationService';
import { getDailyQuestions } from '@/src/services/questionService';
import { ScheduleEvent, useMindLogStore } from '@/src/store/useMindLogStore';

// Background image
const backgroundImage = require('@/assets/images/today-bg.png');

export default function TodayScreen() {
  const today = new Date().toISOString().split('T')[0];
  
  // Store
  const events = useMindLogStore((state) => state.events);
  const addEvent = useMindLogStore((state) => state.addEvent);
  const updateEvent = useMindLogStore((state) => state.updateEvent);
  const deleteEvent = useMindLogStore((state) => state.deleteEvent);
  const toggleComplete = useMindLogStore((state) => state.toggleComplete);
  const setNotificationId = useMindLogStore((state) => state.setNotificationId);

  // System calendar
  const { systemEvents, isSyncEnabled, getSystemEventsForDate } = useSystemCalendar();

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  // Today's local events
  const todayEvents = useMemo(() => {
    return events
      .filter((e) => e.date === today && e.type === 'schedule')
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, today]);

  // Today's system events
  const todaySystemEvents = useMemo(() => {
    if (!isSyncEnabled) return [];
    return getSystemEventsForDate(today);
  }, [isSyncEnabled, getSystemEventsForDate, today]);

  // Question of the day
  const todaysQuestions = getDailyQuestions(new Date(), 1);
  const questionOfTheDay = todaysQuestions[0];

  // Bottom sheet state
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);

  const handleAddNew = () => {
    setEditingEvent(null);
    setSheetVisible(true);
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setSheetVisible(true);
  };

  const handleSystemEventPress = (event: SystemCalendarEvent) => {
    Alert.alert(
      '系统日历事件',
      `${event.title}\n\n时间: ${event.startTime}${event.endTime ? ' - ' + event.endTime : ''}\n\n来源: ${event.calendarName || '系统日历'}${event.location ? '\n地点: ' + event.location : ''}`,
      [{ text: '确定', style: 'default' }]
    );
  };

  const handleSave = async (data: { 
    title: string; 
    startTime: string; 
    endTime?: string; 
    description?: string;
    reminderMinutes?: number;
  }) => {
    let eventId: string;
    
    if (editingEvent) {
      // Cancel old notification if exists
      if (editingEvent.notificationId) {
        await cancelEventReminder(editingEvent.notificationId);
      }
      // Update existing
      updateEvent(editingEvent.id, data);
      eventId = editingEvent.id;
    } else {
      // Create new
      eventId = addEvent({
        type: 'schedule',
        date: today,
        ...data,
        isCompleted: false,
      });
    }

    // Schedule notification if reminder is set
    if (data.reminderMinutes && data.reminderMinutes > 0) {
      const triggerDate = calculateReminderTrigger(today, data.startTime, data.reminderMinutes);
      
      // Only schedule if it's in the future
      if (triggerDate.getTime() > Date.now()) {
        const notificationId = await scheduleEventReminder(
          eventId,
          data.title,
          `${data.reminderMinutes === 1 ? '现在开始' : `${data.reminderMinutes}分钟后开始`}`,
          triggerDate
        );
        
        if (notificationId) {
          setNotificationId(eventId, notificationId);
        }
      }
    }
  };

  const handleDelete = async (event: ScheduleEvent) => {
    // Cancel notification if exists
    if (event.notificationId) {
      await cancelEventReminder(event.notificationId);
    }
    deleteEvent(event.id);
  };

  const hasAnyEvents = todayEvents.length > 0 || todaySystemEvents.length > 0;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ImageBackground 
        source={backgroundImage} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Header (Date & Lunar) */}
            <Header />

            {/* Section 2: Tear-Off Card */}
            {questionOfTheDay && (
              <View style={styles.cardWrapper}>
                <TearOffCard question={questionOfTheDay} />
              </View>
            )}

            {/* Section 3: Today's Focus */}
            <View style={styles.scheduleSection}>
              {/* Section Header */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today's Focus</Text>
                <Pressable style={styles.addButton} onPress={handleAddNew}>
                  <Text style={styles.addButtonText}>+</Text>
                </Pressable>
              </View>

              {/* Schedule List */}
              {!hasAnyEvents ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>今天还没有安排</Text>
                  <Text style={styles.emptySubtext}>点击 + 添加第一个日程</Text>
                </View>
              ) : (
                <View style={styles.eventsList}>
                  {/* Local Events */}
                  {todayEvents.map((event) => (
                    <ScheduleItem
                      key={event.id}
                      event={event}
                      onPress={() => handleEditEvent(event)}
                      onDelete={() => handleDelete(event)}
                      onToggleComplete={() => toggleComplete(event.id)}
                    />
                  ))}

                  {/* System Events (Read-only) */}
                  {todaySystemEvents.length > 0 && (
                    <>
                      {todayEvents.length > 0 && (
                        <View style={styles.sectionDivider}>
                          <View style={styles.dividerLine} />
                          <Text style={styles.dividerText}>系统日历</Text>
                          <View style={styles.dividerLine} />
                        </View>
                      )}
                      {todaySystemEvents.map((event) => (
                        <SystemEventItem
                          key={`sys-${event.id}`}
                          event={event}
                          onPress={() => handleSystemEventPress(event)}
                        />
                      ))}
                    </>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Sheet */}
          <ScheduleBottomSheet
            visible={sheetVisible}
            onClose={() => setSheetVisible(false)}
            onSave={handleSave}
            editingEvent={editingEvent}
          />
        </SafeAreaView>
      </ImageBackground>
    </GestureHandlerRootView>
  );
}

// System Event Item Component (Read-only)
function SystemEventItem({ 
  event, 
  onPress 
}: { 
  event: SystemCalendarEvent; 
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.systemEventCard} onPress={onPress}>
      <View style={styles.systemTimeColumn}>
        <Text style={styles.systemTimeText}>{event.startTime}</Text>
        {event.endTime && (
          <Text style={styles.systemTimeTextEnd}>{event.endTime}</Text>
        )}
      </View>
      <View style={styles.systemContentColumn}>
        <Text style={styles.systemTitle} numberOfLines={1}>
          {event.title} 📅
        </Text>
        {event.calendarName && (
          <Text style={styles.systemCalendarName} numberOfLines={1}>
            {event.calendarName}
          </Text>
        )}
      </View>
      <View style={styles.readOnlyBadge}>
        <Text style={styles.readOnlyText}>只读</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
  },
  cardWrapper: {
    alignItems: 'center',
  },
  scheduleSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: theme.typography.serif,
    fontSize: 18,
    color: theme.colors.ink.main,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.marks.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.marks.terracotta,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '300',
    marginTop: -2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 182, 193, 0.3)',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontFamily: theme.typography.serif,
    fontSize: 16,
    color: theme.colors.ink.watermark,
    marginBottom: 6,
  },
  emptySubtext: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.watermark,
    opacity: 0.7,
  },
  eventsList: {
    gap: 0,
  },

  // Section Divider
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
  },
  dividerText: {
    fontFamily: theme.typography.sans,
    fontSize: 11,
    color: '#8E8E93',
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // System Event Card
  systemEventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(142, 142, 147, 0.2)',
    borderStyle: 'dashed',
  },
  systemTimeColumn: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  systemTimeText: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: '#8E8E93',
  },
  systemTimeTextEnd: {
    fontFamily: theme.typography.sans,
    fontSize: 11,
    color: '#AEAEB2',
  },
  systemContentColumn: {
    flex: 1,
  },
  systemTitle: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  systemCalendarName: {
    fontFamily: theme.typography.sans,
    fontSize: 11,
    color: '#AEAEB2',
  },
  readOnlyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(142, 142, 147, 0.15)',
    borderRadius: 8,
  },
  readOnlyText: {
    fontFamily: theme.typography.sans,
    fontSize: 10,
    color: '#8E8E93',
  },
});
