/**
 * RFC 5545 Strict Data Model
 *
 * This file defines the shape of the data as it exists in the storage/sync layer.
 * All fields map 1:1 to iCalendar properties.
 */

// 1. Primitive Types (RFC 5545)
export type ICalDateTime = string; // "YYYYMMDDTHHMMSS" or "YYYYMMDDTHHMMSSZ"
export type ICalDate = string; // "YYYYMMDD"
export type ICalDuration = string; // "P1D", "-PT15M"
export type ICalRRULE = string; // "FREQ=DAILY;INTERVAL=1"
export type ICalTrigger = ICalDuration | ICalDateTime;

// 2. Constants for Status and Action
export type ICalEventStatus = 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED';
export type ICalAlarmAction = 'AUDIO' | 'DISPLAY' | 'EMAIL';

/**
 * 3. VALARM Component
 * RFC 5545 Section 3.6.6
 */
export interface IVAlarm {
  action: ICalAlarmAction;
  trigger: ICalTrigger;
  description?: string; // Display message
  duration?: ICalDuration;
  repeat?: number;
}

/**
 * 4. VEVENT Component
 * RFC 5545 Section 3.6.1
 */
export interface IVEvent {
  // --- Identity & Change Tracking ---
  uid: string; // Persistent, globally unique ID
  dtStamp: ICalDateTime; // Creation/Sequence timestamp
  lastModified?: ICalDateTime; // Last update timestamp
  sequence: number; // Revision number (0, 1, 2...)

  // --- Scheduling Semantics ---
  dtStart: ICalDateTime | ICalDate;
  dtEnd?: ICalDateTime | ICalDate; // Optional if duration is implied or set
  duration?: ICalDuration;
  rrule?: ICalRRULE;
  exDate?: (ICalDateTime | ICalDate)[]; // Exceptions to the rule
  status?: ICalEventStatus;
  transp?: 'OPAQUE' | 'TRANSPARENT'; // Blocking time or free

  // --- Content ---
  summary: string; // Title / Short description
  description?: string; // Detailed notes
  location?: string;
  categories?: string[];

  // --- Sub-components ---
  alarms?: IVAlarm[];

  // --- Extended Properties (X-Fields) ---
  // Stored in a strict Record structure to preserve unknown extensions during sync
  xProps?: Record<string, string>;
}

/**
 * 5. VCALENDAR Component
 * RFC 5545 Section 3.4
 */
export interface IVCalendar {
  version: '2.0';
  prodId: string; // "-//MyCorp//Minidiary 1.0//EN"
  calScale?: 'GREGORIAN';
  method?: 'PUBLISH' | 'REQUEST';
  events: IVEvent[];
  timezones?: IVTimezone[]; // We will need to define this for multi-TZ support
}

/**
 * 6. VTIMEZONE Component (Simplified for internal model)
 * RFC 5545 Section 3.6.5
 */
export interface IVTimezone {
  tzId: string;
  // Complex definitions (STANDARD/DAYLIGHT) omitted for high-level model,
  // but required for full .ics export generation.
}

