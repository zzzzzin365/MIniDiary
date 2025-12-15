import { theme } from '@/src/theme';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Animated, {
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSystemCalendar } from '@/src/hooks/useSystemCalendar';
import { exportToICS } from '@/src/services/exportService';
import { useMindLogStore } from '@/src/store/useMindLogStore';

export default function MineScreen() {
  const events = useMindLogStore((state) => state.events);
  const { 
    isSyncEnabled, 
    isLoading, 
    systemEvents,
    toggleSync,
    error,
  } = useSystemCalendar();

  const [isExporting, setIsExporting] = useState(false);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportToICS(events);
      if (!result.success) {
        Alert.alert('提示', result.message);
      }
    } catch (err) {
      Alert.alert('错误', '导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle sync toggle
  const handleSyncToggle = async () => {
    const success = await toggleSync();
    if (!success && error) {
      Alert.alert('权限请求', error);
    }
  };

  // Count stats
  const scheduleCount = events.filter(e => e.type === 'schedule').length;
  const systemEventCount = systemEvents.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>我的</Text>
          <Text style={styles.headerSubtitle}>设置与数据管理</Text>
        </View>

        {/* Stats Card */}
        <Animated.View 
          entering={FadeIn.delay(100)}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{scheduleCount}</Text>
            <Text style={styles.statLabel}>本地日程</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{systemEventCount}</Text>
            <Text style={styles.statLabel}>系统日历</Text>
          </View>
        </Animated.View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>数据管理</Text>

          {/* Export Card - Manila Envelope Style */}
          <Animated.View entering={FadeIn.delay(200)}>
            <Pressable
              style={({ pressed }) => [
                styles.exportCard,
                pressed && styles.cardPressed,
              ]}
              onPress={handleExport}
              disabled={isExporting}
            >
              {/* Envelope Flap */}
              <View style={styles.envelopeFlap} />
              
              <View style={styles.exportContent}>
                <View style={styles.exportIcon}>
                  {isExporting ? (
                    <ActivityIndicator color={theme.colors.ink.secondary} />
                  ) : (
                    <Text style={styles.iconText}>📤</Text>
                  )}
                </View>
                <View style={styles.exportTextContainer}>
                  <Text style={styles.exportTitle}>导出日程 (.ics)</Text>
                  <Text style={styles.exportDescription}>
                    备份到其他日历应用
                  </Text>
                </View>
                <Text style={styles.arrowIcon}>→</Text>
              </View>

              {/* Envelope Bottom Seal */}
              <View style={styles.envelopeSeal}>
                <View style={styles.sealLine} />
              </View>
            </Pressable>
          </Animated.View>
        </View>

        {/* Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>日历同步</Text>

          <Animated.View 
            entering={FadeIn.delay(300)}
            style={styles.syncCard}
          >
            <View style={styles.syncContent}>
              <View style={styles.syncIcon}>
                <Text style={styles.iconText}>📅</Text>
              </View>
              <View style={styles.syncTextContainer}>
                <Text style={styles.syncTitle}>同步系统日历</Text>
                <Text style={styles.syncDescription}>
                  {isSyncEnabled 
                    ? `已同步 ${systemEventCount} 个事件` 
                    : '显示设备日历中的事件'}
                </Text>
              </View>
              
              {/* Custom Toggle */}
              {isLoading ? (
                <ActivityIndicator color={theme.colors.marks.sage} />
              ) : (
                <CustomToggle 
                  value={isSyncEnabled} 
                  onValueChange={handleSyncToggle} 
                />
              )}
            </View>

            {/* Sync Status */}
            {isSyncEnabled && (
              <View style={styles.syncStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>实时同步中</Text>
              </View>
            )}
          </Animated.View>

          {/* Info Note */}
          <View style={styles.infoNote}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              系统日历事件为只读状态，无法在本应用中编辑
            </Text>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>MindLog</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Custom Toggle Component (Paperclip Style)
function CustomToggle({ 
  value, 
  onValueChange 
}: { 
  value: boolean; 
  onValueChange: () => void;
}) {
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, {
      damping: 15,
      stiffness: 120,
    });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['rgba(212, 225, 241, 0.6)', 'rgba(116, 139, 117, 0.3)']
    ),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 20 }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ['#C0C0C0', theme.colors.marks.sage]
    ),
  }));

  return (
    <Pressable onPress={onValueChange}>
      <Animated.View style={[styles.toggleTrack, trackStyle]}>
        <Animated.View style={[styles.toggleThumb, thumbStyle]}>
          {/* Paperclip detail */}
          <View style={styles.clipDetail} />
        </Animated.View>
      </Animated.View>
    </Pressable>
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
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    paddingVertical: 24,
  },
  headerTitle: {
    fontFamily: theme.typography.serif,
    fontSize: 28,
    color: theme.colors.ink.main,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: theme.typography.sans,
    fontSize: 14,
    color: theme.colors.ink.secondary,
  },

  // Stats Card
  statsCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 182, 193, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: theme.typography.serif,
    fontSize: 32,
    color: theme.colors.ink.main,
  },
  statLabel: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.secondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(212, 225, 241, 0.5)',
    marginVertical: 8,
  },

  // Section
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: theme.typography.serif,
    fontSize: 16,
    color: theme.colors.ink.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Export Card (Manila Envelope)
  exportCard: {
    backgroundColor: '#E6E0D4', // Manila envelope color
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  envelopeFlap: {
    height: 20,
    backgroundColor: '#D4CEC2',
    borderBottomWidth: 2,
    borderBottomColor: '#C4BEB2',
  },
  exportContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconText: {
    fontSize: 22,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    fontFamily: theme.typography.sans,
    fontSize: 16,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 2,
  },
  exportDescription: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: '#6B6B6B',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#8B8B8B',
  },
  envelopeSeal: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sealLine: {
    height: 2,
    backgroundColor: '#C4BEB2',
    borderRadius: 1,
  },

  // Sync Card
  syncCard: {
    backgroundColor: theme.colors.paper.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 225, 241, 0.5)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  syncContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 225, 241, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  syncTextContainer: {
    flex: 1,
  },
  syncTitle: {
    fontFamily: theme.typography.sans,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.ink.main,
    marginBottom: 2,
  },
  syncDescription: {
    fontFamily: theme.typography.sans,
    fontSize: 13,
    color: theme.colors.ink.secondary,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 225, 241, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.marks.sage,
    marginRight: 8,
  },
  statusText: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.marks.sage,
  },

  // Custom Toggle
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 4,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  clipDetail: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Info Note
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  infoIcon: {
    fontSize: 12,
    marginRight: 6,
    marginTop: 1,
  },
  infoText: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.watermark,
    flex: 1,
    lineHeight: 18,
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 225, 241, 0.3)',
  },
  appName: {
    fontFamily: theme.typography.serif,
    fontSize: 18,
    color: theme.colors.ink.watermark,
  },
  appVersion: {
    fontFamily: theme.typography.sans,
    fontSize: 12,
    color: theme.colors.ink.watermark,
    marginTop: 4,
  },
});
