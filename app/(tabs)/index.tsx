import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/src/theme';
import { Header } from '@/components/today/Header';
import { TearOffCard } from '@/components/today/TearOffCard';
import { ScheduleList } from '@/components/today/ScheduleList';
import { getDailyQuestions } from '@/src/services/questionService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TodayScreen() {
  const todaysQuestions = getDailyQuestions(new Date(), 1);
  const questionOfTheDay = todaysQuestions[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Root view for Swipeables */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Header />

          {/* Tear-Off Card */}
          {questionOfTheDay && (
            <TearOffCard question={questionOfTheDay} />
          )}

          {/* Schedule Management (Now with CRUD) */}
          <ScheduleList />
          
        </ScrollView>
      </GestureHandlerRootView>
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
  content: {
    paddingBottom: 100,
    alignItems: 'center',
  },
});
