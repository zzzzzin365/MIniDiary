/**
 * Export Service
 * Handles exporting calendar data to .ics files
 */

import { File, Paths } from 'expo-file-system';
import { shareAsync, isAvailableAsync } from 'expo-sharing';
import { generateICSString, getICSFilename } from '../utils/icsGenerator';
import { ScheduleEvent } from '../store/useMindLogStore';

export interface ExportResult {
  success: boolean;
  message: string;
  filePath?: string;
}

/**
 * Export events to an .ics file and open share sheet
 * @param events Array of ScheduleEvent to export
 * @returns ExportResult with success status and message
 */
export async function exportToICS(events: ScheduleEvent[]): Promise<ExportResult> {
  try {
    // Filter to only schedule events (not diary entries)
    const scheduleEvents = events.filter(e => e.type === 'schedule');
    
    if (scheduleEvents.length === 0) {
      return {
        success: false,
        message: '没有可导出的日程',
      };
    }

    // Generate ICS content
    const icsContent = generateICSString(scheduleEvents);
    const filename = getICSFilename();
    
    // Create file in cache directory
    const file = new File(Paths.cache, filename);
    file.write(icsContent);
    
    const filePath = file.uri;

    // Check if sharing is available
    const sharingAvailable = await isAvailableAsync();
    if (!sharingAvailable) {
      return {
        success: false,
        message: '此设备不支持分享功能',
        filePath,
      };
    }

    // Open share sheet
    await shareAsync(filePath, {
      mimeType: 'text/calendar',
      dialogTitle: '导出日程',
      UTI: 'public.calendar', // iOS UTI for calendar files
    });

    return {
      success: true,
      message: `已导出 ${scheduleEvents.length} 个日程`,
      filePath,
    };
  } catch (error) {
    console.error('Export failed:', error);
    return {
      success: false,
      message: '导出失败，请重试',
    };
  }
}

/**
 * Clean up exported files from cache
 */
export async function cleanupExportedFiles(): Promise<void> {
  try {
    const cacheDir = Paths.cache;
    const contents = cacheDir.list();
    
    for (const item of contents) {
      if (item instanceof File && item.name.endsWith('.ics')) {
        item.delete();
      }
    }
  } catch (error) {
    console.warn('Cleanup failed:', error);
  }
}
