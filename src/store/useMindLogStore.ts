import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TimelineEvent } from '@/src/types/domain';
import { IVEvent } from '@/src/types/ical';
import { randomUUID } from 'expo-crypto';

// Helper to convert Domain Event to Internal Storage Format (IVEvent) if needed,
// but for this Store we will primarily manage TimelineEvent objects for easier UI consumption,
// and handle the serialization logic when syncing (future).
// For now, we store TimelineEvent directly as our "Database".

interface MindLogState {
  events: TimelineEvent[];
  
  // Actions
  addEvent: (event: Omit<TimelineEvent, 'id' | '_raw'>) => void;
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsByDate: (dateString: string) => TimelineEvent[];
}

export const useMindLogStore = create<MindLogState>()(
  persist(
    (set, get) => ({
      events: [],

      addEvent: (newEvent) => {
        const id = randomUUID(); // Use expo-crypto in real app, or simple random for now
        const now = new Date().toISOString();
        
        // Construct the full event
        const event: TimelineEvent = {
          id,
          ...newEvent,
          _raw: {
            uid: id,
            dtStamp: now,
            sequence: 0,
            summary: newEvent.title,
            dtStart: newEvent.startTime,
            dtEnd: newEvent.endTime,
            xProps: {}, // Populate if needed
          }
        };

        set((state) => ({
          events: [...state.events, event]
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map((e) => 
            e.id === id ? { ...e, ...updates } : e
          )
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id)
        }));
      },

      getEventsByDate: (dateString) => {
        // Simple string matching for now (YYYY-MM-DD)
        // In robust app, parse ISO dates
        return get().events.filter((e: TimelineEvent) => e.startTime.startsWith(dateString));
      },
    }),
    {
      name: 'mindlog-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

