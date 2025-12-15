import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { DeskCalendar } from '@/components/calendar/DeskCalendar';
import { DayEventList } from '@/components/calendar/DayEventList'; // We can reuse this for Day View
import { SegmentedControl } from '@/components/calendar/SegmentedControl';
import { useMindLogStore } from '@/src/store/useMindLogStore';

type ViewMode = 'Month' | 'Week' | 'Day';

export default function CalendarScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('Month');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Connect to store (in future, pass events to calendar)
  const events = useMindLogStore((state) => state.events);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.yearText}>2024</Text>
          <Text style={styles.monthText}>December</Text>
        </View>
        <SegmentedControl 
          values={['月', '周', '日']} 
          selectedIndex={['Month', 'Week', 'Day'].indexOf(viewMode)}
          onChange={(i) => setViewMode(['Month', 'Week', 'Day'][i] as ViewMode)}
        />
      </View>

      <View style={styles.content}>
        {viewMode === 'Month' && (
          <>
            <DeskCalendar 
              selectedDate={selectedDate}
              onDaySelect={setSelectedDate}
            />
            <DayEventList selectedDate={selectedDate} />
          </>
        )}

        {viewMode === 'Week' && (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Week View Coming Soon</Text>
          </View>
        )}

        {viewMode === 'Day' && (
          <ScrollView style={{ flex: 1 }}>
             {/* Reusing DayEventList as the Day View for MVP */}
             <DayEventList selectedDate={selectedDate} />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  yearText: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.watermark,
  },
  monthText: {
    fontFamily: theme.typography.serif,
    fontSize: 24,
    color: theme.colors.ink.main,
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: theme.typography.serif,
    color: theme.colors.ink.watermark,
  }
});
