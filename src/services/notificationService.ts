import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Android needs a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('schedule-reminders', {
      name: '日程提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ffb6c1',
    });
  }

  return true;
}

/**
 * Schedule a notification for an event
 * @param eventId - Unique event identifier
 * @param title - Event title
 * @param triggerDate - When to trigger the notification
 * @returns The notification identifier (for cancellation)
 */
export async function scheduleEventReminder(
  eventId: string,
  title: string,
  body: string,
  triggerDate: Date
): Promise<string | null> {
  // Don't schedule if the trigger time is in the past
  if (triggerDate.getTime() <= Date.now()) {
    console.log('Cannot schedule notification in the past');
    return null;
  }

  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `📅 ${title}`,
        body: body,
        data: { eventId },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    console.log(`Scheduled notification ${notificationId} for ${triggerDate.toISOString()}`);
    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 * @param notificationId - The notification identifier returned from scheduleEventReminder
 */
export async function cancelEventReminder(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`Cancelled notification ${notificationId}`);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cancelled all notifications');
}

/**
 * Get all scheduled notifications (for debugging)
 */
export async function getScheduledReminders() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Calculate the trigger date based on event time and reminder offset
 * @param date - Event date (YYYY-MM-DD)
 * @param time - Event start time (HH:mm)
 * @param reminderMinutes - Minutes before the event to trigger
 */
export function calculateReminderTrigger(
  date: string,
  time: string,
  reminderMinutes: number
): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  
  const eventDate = new Date(year, month - 1, day, hours, minutes);
  const triggerDate = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);
  
  return triggerDate;
}

// Reminder options for the UI
export const REMINDER_OPTIONS = [
  { label: '无', value: 0 },
  { label: '准时', value: 1 }, // 1 minute before (essentially "at time")
  { label: '5分钟前', value: 5 },
  { label: '10分钟前', value: 10 },
  { label: '30分钟前', value: 30 },
  { label: '1小时前', value: 60 },
] as const;

