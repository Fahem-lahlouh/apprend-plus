import { db } from './db';
import type { CardSchedule, Id } from '@/models';

export const srsRepository = {
  get(cardId: Id) {
    return db.schedules.get(cardId);
  },
  getMany(cardIds: Id[]) {
    return db.schedules.bulkGet(cardIds).then((rows) => rows.filter(Boolean) as CardSchedule[]);
  },
  put(schedule: CardSchedule) {
    return db.schedules.put(schedule);
  },
  list() {
    return db.schedules.toArray();
  },
  async due(now = new Date()): Promise<CardSchedule[]> {
    const all = await db.schedules.toArray();
    return all.filter((s) => new Date(s.dueAt).getTime() <= now.getTime());
  },
  clear() {
    return db.schedules.clear();
  },
};
