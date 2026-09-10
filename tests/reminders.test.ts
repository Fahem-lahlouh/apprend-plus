import { describe, expect, it } from 'vitest';
import { dueReminders, nextOccurrence, todaysReminders } from '@/services/reminders';
import { describeDays, describeNextOccurrence } from '@/utils/date';
import type { Reminder } from '@/models';

const base: Reminder = {
  id: 'r1', title: 'Cours Java', days: [1, 2, 3, 4, 5], time: '18:00',
  durationMin: 20, enabled: true, createdAt: '',
};

// Thursday 10 September 2026, 09:00 local time.
const thursdayMorning = new Date(2026, 8, 10, 9, 0, 0);

describe('reminders', () => {
  it('finds today occurrence when the time has not passed', () => {
    const next = nextOccurrence(base, thursdayMorning)!;
    expect(next.getDate()).toBe(10);
    expect(next.getHours()).toBe(18);
  });

  it('rolls over to the next matching day once the time has passed', () => {
    const evening = new Date(2026, 8, 10, 19, 0, 0);
    const next = nextOccurrence(base, evening)!;
    expect(next.getDate()).toBe(11); // Friday
  });

  it('skips the weekend for a weekday reminder', () => {
    const fridayEvening = new Date(2026, 8, 11, 19, 0, 0);
    const next = nextOccurrence(base, fridayEvening)!;
    expect(next.getDay()).toBe(1); // Monday
  });

  it('returns nothing for a disabled reminder', () => {
    expect(nextOccurrence({ ...base, enabled: false }, thursdayMorning)).toBeNull();
  });

  it('treats an empty day list as every day', () => {
    const daily = { ...base, days: [] };
    const saturday = new Date(2026, 8, 12, 9, 0, 0);
    expect(nextOccurrence(daily, saturday)!.getDate()).toBe(12);
  });

  it('lists only reminders whose time has passed today and were not fired', () => {
    const evening = new Date(2026, 8, 10, 18, 30, 0);
    const since = new Date(2026, 8, 10, 0, 0, 0);
    expect(dueReminders([base], since, evening)).toHaveLength(1);

    const alreadyFired = { ...base, lastFiredAt: new Date(2026, 8, 10, 18, 0, 0).toISOString() };
    expect(dueReminders([alreadyFired], since, evening)).toHaveLength(0);
  });

  it('filters today reminders by weekday', () => {
    const saturday = new Date(2026, 8, 12, 9, 0, 0);
    expect(todaysReminders([base], saturday)).toHaveLength(0);
    expect(todaysReminders([base], thursdayMorning)).toHaveLength(1);
  });

  it('describes schedules in plain French', () => {
    expect(describeDays([1, 2, 3, 4, 5])).toBe('Lun. au ven.');
    expect(describeDays([0, 1, 2, 3, 4, 5, 6])).toBe('Tous les jours');
    expect(describeNextOccurrence([0, 1, 2, 3, 4, 5, 6], '19:00')).toBe('Tous les jours à 19:00');
    expect(describeNextOccurrence([1, 2, 3, 4, 5], '18:00', thursdayMorning)).toBe("Aujourd’hui à 18:00");
  });
});
