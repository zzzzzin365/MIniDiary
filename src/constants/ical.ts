/**
 * Minidiary X-Field Extension Registry
 *
 * These constants define the custom data fields stored inside VEVENT xProps.
 * They are "Non-Standard Properties" in RFC 5545 terms.
 */

export const EXT_PREFIX = 'X-MINIDIARY';

export const ICalExtensions = {
  // --- Daily Reflection (Virtual Event) ---
  /**
   * Type of question for the day.
   * Values: 'self' | 'past' | 'imagination'
   */
  QUESTION_CATEGORY: `${EXT_PREFIX}-QUESTION-CATEGORY`,

  /**
   * Unique ID of the question from the question database.
   */
  QUESTION_ID: `${EXT_PREFIX}-QUESTION-ID`,

  /**
   * The actual text of the question (snapshot).
   */
  QUESTION_TEXT: `${EXT_PREFIX}-QUESTION-TEXT`,

  /**
   * The user's journal entry/answer.
   * Stored as escaped string.
   */
  DAILY_REFLECTION: `${EXT_PREFIX}-DAILY-REFLECTION`,

  // --- Lunar / Environmental Data (Display Only) ---
  /**
   * Lunar date string (e.g., "冬月十五").
   */
  LUNAR_DATE: `${EXT_PREFIX}-LUNAR-DATE`,

  /**
   * Lunar festival (e.g., "Mid-Autumn Festival").
   */
  LUNAR_FESTIVAL: `${EXT_PREFIX}-LUNAR-FESTIVAL`,

  // --- UI State Persisted in Domain ---
  /**
   * Mood color or emotional tag associated with the entry.
   * e.g., "#E89F71"
   */
  MOOD_COLOR: `${EXT_PREFIX}-MOOD-COLOR`,

  /**
   * Conflict tracking for sync.
   * Stores the UID of the event this one conflicts with.
   */
  CONFLICT_OF: `${EXT_PREFIX}-CONFLICT-OF`,
} as const;

