import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Event Types
export interface ScheduleEvent {
  id: string;
  type: 'schedule' | 'diary';
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  title: string;
  description?: string;
  isCompleted?: boolean;
  // Reminder
  reminderMinutes?: number; // 0 = no reminder, 5 = 5 min before, etc.
  notificationId?: string; // For cancellation
  // For diary entries
  questionId?: string;
  diaryContent?: string;
}

// Store State
interface MindLogState {
  events: ScheduleEvent[];
  // Actions
  addEvent: (event: Omit<ScheduleEvent, 'id'>) => string; // Returns the new event ID
  updateEvent: (id: string, updates: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleComplete: (id: string) => void;
  setNotificationId: (eventId: string, notificationId: string | null) => void;
  // Selectors
  getEventsForDate: (date: string) => ScheduleEvent[];
  getEventsForMonth: (year: number, month: number) => ScheduleEvent[];
  getEventById: (id: string) => ScheduleEvent | undefined;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useMindLogStore = create<MindLogState>()(
  persist(
    (set, get) => ({
      events: [
        // Sample data
        {
          id: 'sample-1',
          type: 'schedule',
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          title: 'Morning Review',
          isCompleted: false,
          reminderMinutes: 10,
        },
        {
          id: 'sample-2',
          type: 'schedule',
          date: new Date().toISOString().split('T')[0],
          startTime: '14:00',
          endTime: '15:30',
          title: 'Deep Work Session',
          isCompleted: false,
          reminderMinutes: 30,
        },
      ],

      addEvent: (eventData) => {
        const newId = generateId();
        const newEvent: ScheduleEvent = {
          ...eventData,
          id: newId,
        };
        set((state) => ({
          events: [...state.events, newEvent],
        }));
        return newId;
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          ),
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      toggleComplete: (id) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, isCompleted: !event.isCompleted } : event
          ),
        }));
      },

      setNotificationId: (eventId, notificationId) => {
        set((state) => ({
          events: state.events.map((event) =>
            event.id === eventId 
              ? { ...event, notificationId: notificationId || undefined } 
              : event
          ),
        }));
      },

      getEventsForDate: (date) => {
        return get().events.filter((event) => event.date === date);
      },

      getEventsForMonth: (year, month) => {
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        return get().events.filter((event) => event.date.startsWith(monthStr));
      },

      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },
    }),
    {
      name: 'mindlog-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
