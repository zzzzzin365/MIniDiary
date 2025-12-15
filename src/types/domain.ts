import { IVEvent } from './ical';

/**
 * Domain Layer Models
 *
 * These types represent the "Business View" of the data, derived from IVEvent.
 * The UI consumes these, NOT the raw IVEvent.
 */

export type EventType = 'schedule' | 'diary' | 'virtual-lottery';

export interface TimelineEvent {
  // --- Derived from IVEvent Core ---
  id: string; // Maps to IVEvent.uid
  title: string; // Maps to IVEvent.summary
  startTime: string; // ISO string derived from dtStart
  endTime?: string; // ISO string derived from dtEnd
  isAllDay: boolean; // Derived from dtStart value type (DATE vs DATE-TIME)

  // --- Domain Logic ---
  type: EventType;
  status: 'active' | 'completed' | 'cancelled'; // Derived from IVEvent.status + custom logic

  // --- Diary Specific (Flattened from X-Props) ---
  diaryContent?: string; // From X-MINIDIARY-DAILY-REFLECTION
  question?: {
    id: string; // From X-MINIDIARY-QUESTION-ID
    text: string; // From X-MINIDIARY-QUESTION-TEXT
    category: 'self' | 'past' | 'imagination'; // From X-MINIDIARY-QUESTION-CATEGORY
  };

  // --- UI Metadata (Flattened from X-Props) ---
  moodColor?: string; // From X-MINIDIARY-MOOD-COLOR
  lunarDate?: string; // From X-MINIDIARY-LUNAR-DATE

  // --- Reference to original raw data (for update logic) ---
  _raw: IVEvent;
}

