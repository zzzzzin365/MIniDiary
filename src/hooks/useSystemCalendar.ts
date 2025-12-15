/**
 * useSystemCalendar Hook
 * Handles system calendar permissions, fetching, and state management
 */

import { useState, useEffect, useCallback } from 'react';
import * as Calendar from 'expo-calendar';
import AsyncStorage from '@react-native-async-storage/async-storage';

// System event interface (read-only, from device calendar)
export interface SystemCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  isAllDay: boolean;
  calendarId: string;
  calendarName?: string;
  location?: string;
  notes?: string;
  isSystemEvent: true; // Discriminator
}

const SYNC_ENABLED_KEY = 'mindlog_system_calendar_sync';

/**
 * Custom hook for system calendar integration
 */
export function useSystemCalendar() {
  const [isSyncEnabled, setIsSyncEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemEvents, setSystemEvents] = useState<SystemCalendarEvent[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load sync preference on mount
  useEffect(() => {
    loadSyncPreference();
  }, []);

  // Fetch events when sync is enabled
  useEffect(() => {
    if (isSyncEnabled && hasPermission) {
      fetchSystemEvents();
    } else if (!isSyncEnabled) {
      setSystemEvents([]);
    }
  }, [isSyncEnabled, hasPermission]);

  /**
   * Load sync preference from storage
   */
  const loadSyncPreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(SYNC_ENABLED_KEY);
      if (stored === 'true') {
        // Check if we still have permission
        const { status } = await Calendar.getCalendarPermissionsAsync();
        if (status === 'granted') {
          setHasPermission(true);
          setIsSyncEnabled(true);
        } else {
          // Permission was revoked
          await AsyncStorage.setItem(SYNC_ENABLED_KEY, 'false');
          setHasPermission(false);
          setIsSyncEnabled(false);
        }
      }
    } catch (err) {
      console.error('Failed to load sync preference:', err);
    }
  };

  /**
   * Request calendar permissions
   */
  const requestPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err) {
      console.error('Failed to request calendar permission:', err);
      setError('无法请求日历权限');
      return false;
    }
  };

  /**
   * Toggle sync on/off
   */
  const toggleSync = async (): Promise<boolean> => {
    if (!isSyncEnabled) {
      // Turning ON - request permission first
      setIsLoading(true);
      const granted = await requestPermission();
      
      if (granted) {
        setIsSyncEnabled(true);
        await AsyncStorage.setItem(SYNC_ENABLED_KEY, 'true');
        await fetchSystemEvents();
        setIsLoading(false);
        return true;
      } else {
        setError('需要日历权限才能同步');
        setIsLoading(false);
        return false;
      }
    } else {
      // Turning OFF
      setIsSyncEnabled(false);
      setSystemEvents([]);
      await AsyncStorage.setItem(SYNC_ENABLED_KEY, 'false');
      return true;
    }
  };

  /**
   * Fetch system calendar events for current month (±1 month range)
   */
  const fetchSystemEvents = useCallback(async () => {
    if (!hasPermission) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get all calendars
      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      
      // Define date range (current month ± 1 month)
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      const allEvents: SystemCalendarEvent[] = [];

      // Fetch events from all calendars
      for (const calendar of calendars) {
        try {
          const events = await Calendar.getEventsAsync(
            [calendar.id],
            startDate,
            endDate
          );

          for (const event of events) {
            const startDateTime = new Date(event.startDate);
            const endDateTime = event.endDate ? new Date(event.endDate) : null;

            allEvents.push({
              id: event.id,
              title: event.title || '(无标题)',
              date: startDateTime.toISOString().split('T')[0],
              startTime: event.allDay 
                ? '00:00' 
                : `${String(startDateTime.getHours()).padStart(2, '0')}:${String(startDateTime.getMinutes()).padStart(2, '0')}`,
              endTime: endDateTime && !event.allDay
                ? `${String(endDateTime.getHours()).padStart(2, '0')}:${String(endDateTime.getMinutes()).padStart(2, '0')}`
                : undefined,
              isAllDay: event.allDay || false,
              calendarId: calendar.id,
              calendarName: calendar.title,
              location: event.location || undefined,
              notes: event.notes || undefined,
              isSystemEvent: true,
            });
          }
        } catch (calErr) {
          console.warn(`Failed to fetch events from calendar ${calendar.title}:`, calErr);
        }
      }

      // Sort by date and time
      allEvents.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });

      setSystemEvents(allEvents);
    } catch (err) {
      console.error('Failed to fetch system events:', err);
      setError('无法获取系统日历事件');
    } finally {
      setIsLoading(false);
    }
  }, [hasPermission]);

  /**
   * Get system events for a specific date
   */
  const getSystemEventsForDate = useCallback((date: string): SystemCalendarEvent[] => {
    return systemEvents.filter(event => event.date === date);
  }, [systemEvents]);

  /**
   * Get system events for a month
   */
  const getSystemEventsForMonth = useCallback((year: number, month: number): SystemCalendarEvent[] => {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    return systemEvents.filter(event => event.date.startsWith(monthStr));
  }, [systemEvents]);

  /**
   * Refresh events (manual trigger)
   */
  const refreshEvents = async () => {
    if (isSyncEnabled && hasPermission) {
      await fetchSystemEvents();
    }
  };

  return {
    // State
    isSyncEnabled,
    isLoading,
    systemEvents,
    hasPermission,
    error,
    // Actions
    toggleSync,
    refreshEvents,
    // Selectors
    getSystemEventsForDate,
    getSystemEventsForMonth,
  };
}

