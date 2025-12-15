import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { theme } from '@/src/theme';
import { SegmentedControl, ViewMode } from '@/components/schedule/SegmentedControl';
import { useMindLogStore, ScheduleEvent } from '@/src/store/useMindLogStore';
import { useSystemCalendar, SystemCalendarEvent } from '@/src/hooks/useSystemCalendar';

// Time slots for Day View
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => 
  `${String(i).padStart(2, '0')}:00`
);

// Unified event type for display
type DisplayEvent = 
  | (ScheduleEvent & { isSystemEvent: false })
  | (SystemCalendarEvent & { isSystemEvent: true });

export default function CalendarScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  // Local events
  const events = useMindLogStore((state) => state.events);
  
  // System calendar events
  const { systemEvents, isSyncEnabled } = useSystemCalendar();

  // Get current month/year for header
  const currentDate = new Date(selectedDate);
  const headerText = currentDate.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
  });

  // Generate marked dates from both local and system events
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    
    // Local events
    events.forEach((event) => {
      if (!marks[event.date]) {
        marks[event.date] = { dots: [] };
      }
      const color = event.type === 'schedule' 
        ? theme.colors.marks.sage 
        : theme.colors.marks.terracotta;
      
      const existing = marks[event.date].dots;
      if (!existing.find((d: any) => d.color === color)) {
        existing.push({ key: event.id, color });
      }
    });

    // System events (grey dot)
    if (isSyncEnabled) {
      systemEvents.forEach((event) => {
        if (!marks[event.date]) {
          marks[event.date] = { dots: [] };
        }
        const existing = marks[event.date].dots;
        // Add grey dot for system events if not already present
        if (!existing.find((d: any) => d.color === '#8E8E93')) {
          existing.push({ key: `sys-${event.id}`, color: '#8E8E93' });
        }
      });
    }

    // Add selection
    if (marks[selectedDate]) {
      marks[selectedDate].selected = true;
      marks[selectedDate].selectedColor = 'rgba(255, 182, 193, 0.3)';
    } else {
      marks[selectedDate] = {
        selected: true,
        selectedColor: 'rgba(255, 182, 193, 0.3)',
        dots: [],
      };
    }

    return marks;
  }, [events, systemEvents, selectedDate, isSyncEnabled]);

  // Merged events for selected date
  const selectedDateEvents = useMemo((): DisplayEvent[] => {
    const localEvents: DisplayEvent[] = events
      .filter((e) => e.date === selectedDate)
      .map(e => ({ ...e, isSystemEvent: false as const }));
    
    const sysEvents: DisplayEvent[] = isSyncEnabled 
      ? systemEvents
          .filter((e) => e.date === selectedDate)
          .map(e => ({ ...e, isSystemEvent: true as const }))
      : [];
    
    return [...localEvents, ...sysEvents]
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, systemEvents, selectedDate, isSyncEnabled]);

  // Week View Data
  const weekDates = useMemo(() => {
    const d = new Date(selectedDate);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  }, [selectedDate]);

  // Handle event press
  const handleEventPress = (event: DisplayEvent) => {
    if (event.isSystemEvent) {
      const sysEvent = event as SystemCalendarEvent;
      Alert.alert(
        '系统日历事件',
        `${sysEvent.title}\n\n时间: ${sysEvent.startTime}${sysEvent.endTime ? ' - ' + sysEvent.endTime : ''}\n\n来源: ${sysEvent.calendarName || '系统日历'}${sysEvent.location ? '\n地点: ' + sysEvent.location : ''}`,
        [{ text: '确定', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{headerText}</Text>
          <SegmentedControl value={viewMode} onChange={setViewMode} />
        </View>

        {/* Month View */}
        {viewMode === 'month' && (
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
              markingType="multi-dot"
              markedDates={markedDates}
              enableSwipeMonths
              theme={{
                calendarBackground: 'transparent',
                textSectionTitleColor: theme.colors.ink.watermark,
                selectedDayBackgroundColor: theme.colors.marks.terracotta,
                todayTextColor: theme.colors.marks.terracotta,
                dayTextColor: theme.colors.ink.secondary,
                textDisabledColor: theme.colors.ink.watermark,
                monthTextColor: theme.colors.ink.main,
                textMonthFontFamily: theme.typography.serif,
                textDayHeaderFontFamily: theme.typography.sans,
                textDayFontFamily: theme.typography.serif,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 12,
                textDayFontSize: 15,
              }}
            />

            {/* Events List for Selected Date */}
            <View style={styles.eventsList}>
              <Text style={styles.eventsHeader}>
                {new Date(selectedDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}
              </Text>
              <ScrollView style={styles.eventsScroll}>
                {selectedDateEvents.length === 0 ? (
                  <Text style={styles.emptyText}>暂无安排</Text>
                ) : (
                  selectedDateEvents.map((event) => (
                    <Pressable 
                      key={event.isSystemEvent ? `sys-${event.id}` : event.id} 
                      style={[
                        styles.eventItem,
                        event.isSystemEvent && styles.systemEventItem,
                      ]}
                      onPress={() => handleEventPress(event)}
                    >
                      <View style={[
                        styles.eventDot, 
                        { 
                          backgroundColor: event.isSystemEvent 
                            ? '#8E8E93' 
                            : ('type' in event && event.type === 'schedule' 
                                ? theme.colors.marks.sage 
                                : theme.colors.marks.terracotta)
                        }
                      ]} />
                      <Text style={[
                        styles.eventTime,
                        event.isSystemEvent && styles.systemEventText,
                      ]}>{event.startTime}</Text>
                      <Text style={[
                        styles.eventTitle,
                        event.isSystemEvent && styles.systemEventText,
                      ]}>
                        {event.title}
                        {event.isSystemEvent && ' 📅'}
                      </Text>
                    </Pressable>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Week View */}
        {viewMode === 'week' && (
          <ScrollView style={styles.weekContainer}>
            {/* Week Header */}
            <View style={styles.weekHeader}>
              {weekDates.map((date) => {
                const d = new Date(date);
                const isToday = date === today;
                const isSelected = date === selectedDate;
                return (
                  <Pressable
                    key={date}
                    style={[styles.weekDay, isSelected && styles.weekDaySelected]}
                    onPress={() => setSelectedDate(date)}
                  >
                    <Text style={[styles.weekDayName, isToday && styles.weekDayToday]}>
                      {d.toLocaleDateString('zh-CN', { weekday: 'short' })}
                    </Text>
                    <Text style={[styles.weekDayNum, isToday && styles.weekDayToday]}>
                      {d.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Time Slots */}
            {TIME_SLOTS.map((time) => {
              const slotEvents = selectedDateEvents.filter((e) => 
                e.startTime.startsWith(time.substring(0, 2))
              );
              return (
                <View key={time} style={styles.timeSlot}>
                  <Text style={styles.timeLabel}>{time}</Text>
                  <View style={styles.slotContent}>
                    {slotEvents.map((event) => (
                      <Pressable 
                        key={event.isSystemEvent ? `sys-${event.id}` : event.id} 
                        style={[
                          styles.highlighterEvent,
                          event.isSystemEvent && styles.systemHighlighterEvent,
                        ]}
                        onPress={() => handleEventPress(event)}
                      >
                        <Text style={[
                          styles.highlighterText,
                          event.isSystemEvent && styles.systemEventText,
                        ]}>
                          {event.title}
                          {event.isSystemEvent && ' 📅'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Day View */}
        {viewMode === 'day' && (
          <ScrollView style={styles.dayContainer}>
            <Text style={styles.dayHeader}>
              {new Date(selectedDate).toLocaleDateString('zh-CN', { 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
              })}
            </Text>
            
            {TIME_SLOTS.map((time) => {
              const slotEvents = selectedDateEvents.filter((e) => 
                e.startTime.startsWith(time.substring(0, 2))
              );
              return (
                <View key={time} style={styles.daySlot}>
                  <Text style={styles.dayTimeLabel}>{time}</Text>
                  <View style={styles.daySlotLine} />
                  <View style={styles.daySlotContent}>
                    {slotEvents.map((event) => (
                      <Pressable 
                        key={event.isSystemEvent ? `sys-${event.id}` : event.id} 
                        style={[
                          styles.dayEvent,
                          event.isSystemEvent && styles.systemDayEvent,
                        ]}
                        onPress={() => handleEventPress(event)}
                      >
                        <Text style={[
                          styles.dayEventTitle,
                          event.isSystemEvent && styles.systemEventText,
                        ]}>
                          {event.title}
                          {event.isSystemEvent && ' 📅'}
                        </Text>
                        <Text style={[
                          styles.dayEventTime,
                          event.isSystemEvent && styles.systemEventText,
                        ]}>
                          {event.startTime} - {event.endTime || ''}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.paper.bg,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: theme.typography.serif,
    fontSize: 22,
    color: theme.colors.ink.main,
  },
  calendarContainer: {
    flex: 1,
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  eventsHeader: {
    fontFamily: theme.typography.serif,
    fontSize: 16,
    color: theme.colors.ink.main,
    marginBottom: 12,
  },
  eventsScroll: {
    flex: 1,
  },
  emptyText: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.watermark,
    textAlign: 'center',
    marginTop: 20,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 225, 241, 0.3)',
  },
  systemEventItem: {
    opacity: 0.7,
  },
  eventDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  eventTime: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: theme.colors.ink.secondary,
    width: 50,
  },
  eventTitle: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.main,
    flex: 1,
  },
  systemEventText: {
    color: '#8E8E93',
  },

  // Week View
  weekContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 225, 241, 0.3)',
    marginBottom: 8,
  },
  weekDay: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekDaySelected: {
    backgroundColor: 'rgba(255, 182, 193, 0.3)',
  },
  weekDayName: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.secondary,
  },
  weekDayNum: {
    fontFamily: theme.typography.serif,
    fontSize: 16,
    color: theme.colors.ink.main,
    marginTop: 2,
  },
  weekDayToday: {
    color: theme.colors.marks.terracotta,
    fontWeight: '600',
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 225, 241, 0.2)',
  },
  timeLabel: {
    width: 50,
    fontFamily: theme.typography.sans,
    fontSize: 11,
    color: theme.colors.ink.watermark,
    paddingTop: 4,
  },
  slotContent: {
    flex: 1,
    paddingVertical: 4,
  },
  highlighterEvent: {
    backgroundColor: 'rgba(212, 225, 241, 0.4)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.marks.sage,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  systemHighlighterEvent: {
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    borderLeftColor: '#8E8E93',
  },
  highlighterText: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: theme.colors.ink.main,
  },

  // Day View
  dayContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dayHeader: {
    fontFamily: theme.typography.serif,
    fontSize: 18,
    color: theme.colors.ink.main,
    paddingVertical: 16,
    textAlign: 'center',
  },
  daySlot: {
    flexDirection: 'row',
    minHeight: 60,
  },
  dayTimeLabel: {
    width: 50,
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.watermark,
  },
  daySlotLine: {
    width: 1,
    backgroundColor: 'rgba(212, 225, 241, 0.5)',
    marginRight: 12,
  },
  daySlotContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 225, 241, 0.2)',
    paddingBottom: 8,
  },
  dayEvent: {
    backgroundColor: 'rgba(255, 182, 193, 0.2)',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.marks.terracotta,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  systemDayEvent: {
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    borderLeftColor: '#8E8E93',
  },
  dayEventTitle: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.main,
  },
  dayEventTime: {
    fontFamily: theme.typography.sans,
    fontSize: 11,
    color: theme.colors.ink.secondary,
    marginTop: 2,
  },
});
