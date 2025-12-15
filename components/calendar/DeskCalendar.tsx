import { theme } from '@/src/theme';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';

// Configure Chinese locale
LocaleConfig.locales['zh'] = {
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天',
};
LocaleConfig.defaultLocale = 'zh';

// Mock data for demonstration
const MOCK_MARKED_DATES: Record<string, { hasSchedule?: boolean; hasDiary?: boolean }> = {
  '2024-12-10': { hasSchedule: true },
  '2024-12-12': { hasDiary: true },
  '2024-12-14': { hasSchedule: true, hasDiary: true },
  '2024-12-15': { hasSchedule: true },
  '2024-12-18': { hasDiary: true },
  '2024-12-20': { hasSchedule: true },
  '2024-12-25': { hasSchedule: true, hasDiary: true },
};

interface DeskCalendarProps {
  onDaySelect: (date: string) => void;
  selectedDate: string;
}

export function DeskCalendar({ onDaySelect, selectedDate }: DeskCalendarProps) {
  const today = new Date().toISOString().split('T')[0];

  // Custom day component for "Desk Calendar" aesthetic
  const renderDay = useCallback(({ date, state }: { date?: DateData; state?: string }) => {
    if (!date) return null;
    
    const dateString = date.dateString;
    const isToday = dateString === today;
    const isSelected = dateString === selectedDate;
    const isDisabled = state === 'disabled';
    const marks = MOCK_MARKED_DATES[dateString];

    return (
      <Pressable
        onPress={() => !isDisabled && onDaySelect(dateString)}
        style={[
          styles.dayContainer,
          isSelected && styles.daySelected,
        ]}
      >
        {/* Today's "hand-drawn circle" */}
        {isToday && <View style={styles.todayCircle} />}
        
        {/* Date number - Letterpress style */}
        <Text
          style={[
            styles.dayText,
            isDisabled && styles.dayTextDisabled,
            isToday && styles.dayTextToday,
            isSelected && styles.dayTextSelected,
          ]}
        >
          {date.day}
        </Text>

        {/* Event indicators */}
        <View style={styles.indicatorRow}>
          {/* Schedule: Sage Green pencil dot */}
          {marks?.hasSchedule && (
            <View style={styles.scheduleDot} />
          )}
          {/* Diary: Terracotta ink smudge */}
          {marks?.hasDiary && (
            <View style={styles.diarySmudge} />
          )}
        </View>
      </Pressable>
    );
  }, [selectedDate, today, onDaySelect]);

  // Custom header for elegant look
  const renderHeader = useCallback((date?: Date) => {
    if (!date) return null;
    const month = date.toLocaleDateString('zh-CN', { month: 'long' });
    const year = date.getFullYear();
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.headerYear}>{year}</Text>
        <Text style={styles.headerMonth}>{month}</Text>
      </View>
    );
  }, []);

  // Custom arrow for navigation
  const renderArrow = useCallback((direction: 'left' | 'right') => (
    <View style={styles.arrow}>
      <Text style={styles.arrowText}>{direction === 'left' ? '‹' : '›'}</Text>
    </View>
  ), []);

  return (
    <View style={styles.container}>
      {/* Paper texture overlay simulation */}
      <View style={styles.paperCrease} />
      
      <Calendar
        current={selectedDate}
        onDayPress={(day) => onDaySelect(day.dateString)}
        dayComponent={renderDay}
        renderHeader={renderHeader}
        renderArrow={renderArrow}
        hideExtraDays={false}
        enableSwipeMonths={true}
        theme={{
          calendarBackground: 'transparent',
          textSectionTitleColor: theme.colors.ink.watermark,
          selectedDayBackgroundColor: theme.colors.marks.sage,
          todayTextColor: theme.colors.marks.vermilion,
          dayTextColor: theme.colors.ink.secondary,
          textDisabledColor: theme.colors.ink.watermark,
          monthTextColor: theme.colors.ink.main,
          textMonthFontFamily: theme.typography.serif,
          textDayHeaderFontFamily: theme.typography.sans,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.paper.bg,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    // Soft shadow for paper depth
    shadowColor: theme.colors.ink.main,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  paperCrease: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.ink.watermark,
    opacity: 0.15,
  },
  calendar: {
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  // Header
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerYear: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.watermark,
    letterSpacing: 2,
  },
  headerMonth: {
    fontFamily: theme.typography.serif,
    fontSize: 24,
    color: theme.colors.ink.main,
    marginTop: 2,
  },
  // Arrows
  arrow: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
    color: theme.colors.ink.secondary,
    fontWeight: '300',
  },
  // Day cells
  dayContainer: {
    width: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
    position: 'relative',
  },
  daySelected: {
    backgroundColor: 'rgba(116, 139, 117, 0.1)', // Sage with transparency
    borderRadius: 8,
  },
  dayText: {
    fontFamily: theme.typography.serif,
    fontSize: 16,
    color: theme.colors.ink.secondary,
  },
  dayTextDisabled: {
    color: theme.colors.ink.watermark,
    opacity: 0.4,
  },
  dayTextToday: {
    color: theme.colors.marks.vermilion,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: theme.colors.marks.sage,
    fontWeight: '600',
  },
  // Today's "hand-drawn circle"
  todayCircle: {
    position: 'absolute',
    top: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: theme.colors.marks.vermilion,
    opacity: 0.7,
    // Simulate hand-drawn imperfection
    transform: [{ rotate: '-3deg' }],
  },
  // Event indicators
  indicatorRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 3,
  },
  // Schedule: precise pencil dot
  scheduleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: theme.colors.marks.sage,
  },
  // Diary: organic ink smudge
  diarySmudge: {
    width: 7,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.marks.terracotta,
    opacity: 0.8,
    // Simulate watercolor bleed
    transform: [{ scaleX: 1.2 }, { rotate: '5deg' }],
  },
});

