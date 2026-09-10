import { db } from './db';
import type { Id, Reminder } from '@/models';

export const reminderRepository = {
  async list(): Promise<Reminder[]> {
    const all = await db.reminders.toArray();
    return all.sort((a, b) => a.time.localeCompare(b.time));
  },
  get(id: Id) {
    return db.reminders.get(id);
  },
  put(reminder: Reminder) {
    return db.reminders.put(reminder);
  },
  delete(id: Id) {
    return db.reminders.delete(id);
  },
};
