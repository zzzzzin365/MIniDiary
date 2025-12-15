/**
 * ICS File Generator
 * Generates RFC 5545 compliant iCalendar (.ics) files
 */

import { ScheduleEvent } from '../store/useMindLogStore';

/**
 * Format date to iCalendar DTSTART/DTEND format (YYYYMMDDTHHMMSS)
 */
function formatICSDateTime(date: string, time: string): string {
  const [year, month, day] = date.split('-');
  const [hour, minute] = time.split(':');
  return `${year}${month}${day}T${hour}${minute}00`;
}

/**
 * Format date to iCalendar date-only format (YYYYMMDD)
 */
function formatICSDate(date: string): string {
  return date.replace(/-/g, '');
}

/**
 * Escape special characters for iCalendar text fields
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long lines according to RFC 5545 (max 75 octets)
 */
function foldLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  const result: string[] = [];
  let remaining = line;

  while (remaining.length > 0) {
    if (result.length === 0) {
      result.push(remaining.substring(0, maxLength));
      remaining = remaining.substring(maxLength);
    } else {
      // Continuation lines start with a space
      result.push(' ' + remaining.substring(0, maxLength - 1));
      remaining = remaining.substring(maxLength - 1);
    }
  }

  return result.join('\r\n');
}

/**
 * Generate a unique UID for each event
 */
function generateUID(eventId: string): string {
  return `${eventId}@mindlog.app`;
}

/**
 * Get current timestamp in iCalendar format
 */
function getICSTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Generate VEVENT component for a single event
 */
function generateVEvent(event: ScheduleEvent): string {
  const lines: string[] = [];
  
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:${generateUID(event.id)}`);
  lines.push(`DTSTAMP:${getICSTimestamp()}`);
  
  // Start time
  if (event.startTime) {
    lines.push(`DTSTART:${formatICSDateTime(event.date, event.startTime)}`);
  } else {
    // All-day event
    lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.date)}`);
  }
  
  // End time
  if (event.endTime) {
    lines.push(`DTEND:${formatICSDateTime(event.date, event.endTime)}`);
  } else if (event.startTime) {
    // Default 1 hour duration
    const [h, m] = event.startTime.split(':').map(Number);
    const endH = String((h + 1) % 24).padStart(2, '0');
    const endM = String(m).padStart(2, '0');
    lines.push(`DTEND:${formatICSDateTime(event.date, `${endH}:${endM}`)}`);
  }
  
  // Summary (Title)
  lines.push(foldLine(`SUMMARY:${escapeICSText(event.title)}`));
  
  // Description
  if (event.description) {
    lines.push(foldLine(`DESCRIPTION:${escapeICSText(event.description)}`));
  }
  
  // Status (completed = COMPLETED, otherwise CONFIRMED)
  if (event.isCompleted) {
    lines.push('STATUS:COMPLETED');
  } else {
    lines.push('STATUS:CONFIRMED');
  }
  
  // Custom X-fields for MindLog-specific data
  if (event.type === 'diary') {
    lines.push('X-MINDLOG-TYPE:DIARY');
    if (event.questionId) {
      lines.push(`X-MINDLOG-QUESTION-ID:${event.questionId}`);
    }
    if (event.diaryContent) {
      lines.push(foldLine(`X-MINDLOG-DIARY-CONTENT:${escapeICSText(event.diaryContent)}`));
    }
  } else {
    lines.push('X-MINDLOG-TYPE:SCHEDULE');
  }
  
  // Alarm/Reminder
  if (event.reminderMinutes && event.reminderMinutes > 0) {
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:${escapeICSText(event.title)}`);
    // RFC 5545: Negative trigger = before event
    const triggerMinutes = event.reminderMinutes === 1 ? 0 : event.reminderMinutes;
    lines.push(`TRIGGER:-PT${triggerMinutes}M`);
    lines.push('END:VALARM');
  }
  
  lines.push('END:VEVENT');
  
  return lines.join('\r\n');
}

/**
 * Generate a complete ICS file string from an array of events
 * @param events Array of ScheduleEvent objects
 * @returns RFC 5545 compliant iCalendar string
 */
export function generateICSString(events: ScheduleEvent[]): string {
  const lines: string[] = [];
  
  // VCALENDAR header
  lines.push('BEGIN:VCALENDAR');
  lines.push('VERSION:2.0');
  lines.push('PRODID:-//MindLog//MindLog Calendar//EN');
  lines.push('CALSCALE:GREGORIAN');
  lines.push('METHOD:PUBLISH');
  lines.push('X-WR-CALNAME:MindLog Schedule');
  
  // Add each event as VEVENT
  for (const event of events) {
    if (event.type === 'schedule') {
      lines.push(generateVEvent(event));
    }
  }
  
  // VCALENDAR footer
  lines.push('END:VCALENDAR');
  
  // RFC 5545 requires CRLF line endings
  return lines.join('\r\n');
}

/**
 * Get filename with current date
 */
export function getICSFilename(): string {
  const today = new Date().toISOString().split('T')[0];
  return `MindLog_Schedule_${today}.ics`;
}

