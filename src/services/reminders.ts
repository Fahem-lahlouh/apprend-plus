import type { Reminder } from '@/models';

/** Next date/time this reminder should fire, or null when it never will. */
export function nextOccurrence(reminder: Reminder, now = new Date()): Date | null {
  if (!reminder.enabled) return null;
  const [hours, minutes] = reminder.time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  const days = reminder.days.length > 0 ? reminder.days : [0, 1, 2, 3, 4, 5, 6];
  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(hours, minutes, 0, 0);
    if (candidate.getTime() <= now.getTime()) continue;
    if (!days.includes(candidate.getDay())) continue;
    return candidate;
  }
  return null;
}

/**
 * Reminders whose time has passed since `since` and that have not been fired
 * for that occurrence yet. Used to surface in-app reminder cards, which always
 * work, even when system notifications are unavailable.
 */
export function dueReminders(reminders: Reminder[], since: Date, now = new Date()): Reminder[] {
  return reminders.filter((reminder) => {
    if (!reminder.enabled) return false;
    const [hours, minutes] = reminder.time.split(':').map(Number);
    const occurrence = new Date(now);
    occurrence.setHours(hours, minutes, 0, 0);
    if (occurrence.getTime() > now.getTime()) return false;
    const days = reminder.days.length > 0 ? reminder.days : [0, 1, 2, 3, 4, 5, 6];
    if (!days.includes(occurrence.getDay())) return false;
    if (occurrence.getTime() < since.getTime()) return false;
    if (reminder.lastFiredAt && new Date(reminder.lastFiredAt).getTime() >= occurrence.getTime()) return false;
    return true;
  });
}

/** Reminders planned for today, sorted by time - shown on the home screen. */
export function todaysReminders(reminders: Reminder[], now = new Date()): Reminder[] {
  const weekday = now.getDay();
  return reminders
    .filter((r) => r.days.length === 0 || r.days.includes(weekday))
    .sort((a, b) => a.time.localeCompare(b.time));
}
