import type { DayKey } from '@/models';

export function toDayKey(date: Date | string | number = new Date()): DayKey {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function dayKeyOffset(key: DayKey, days: number): DayKey {
  return toDayKey(addDays(fromDayKey(key), days));
}

/** Whole days between two day keys (b - a). */
export function daysBetween(a: DayKey, b: DayKey): number {
  const ms = fromDayKey(b).getTime() - fromDayKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${`${m}`.padStart(2, '0')}`;
}

export function formatMinutes(minutes: number): string {
  return formatDuration(minutes * 60);
}

const WEEKDAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const WEEKDAYS_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export function weekdayName(index: number): string {
  return WEEKDAYS[index] ?? '';
}
export function weekdayShort(index: number): string {
  return WEEKDAYS_SHORT[index] ?? '';
}

/** Human label for a reminder schedule: "Tous les jours", "Lun-Ven", "Mardi". */
export function describeDays(days: number[]): string {
  if (days.length === 0) return 'Une seule fois';
  if (days.length === 7) return 'Tous les jours';
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.join(',') === '1,2,3,4,5') return 'Lun. au ven.';
  if (sorted.join(',') === '0,6') return 'Week-end';
  return sorted.map((d) => weekdayName(d).slice(0, 3) + '.').join(' ');
}

/** "Aujourd’hui à 18:00", "Demain à 08:00", "Tous les jours à 19:00". */
export function describeNextOccurrence(days: number[], time: string, now = new Date()): string {
  if (days.length === 7) return `Tous les jours à ${time}`;
  if (days.length === 0) return `A ${time}`;
  const [h, m] = time.split(':').map(Number);
  for (let offset = 0; offset < 8; offset += 1) {
    const candidate = addDays(now, offset);
    if (!days.includes(candidate.getDay())) continue;
    candidate.setHours(h, m, 0, 0);
    if (offset === 0 && candidate.getTime() <= now.getTime()) continue;
    if (offset === 0) return `Aujourd’hui à ${time}`;
    if (offset === 1) return `Demain à ${time}`;
    return `${weekdayName(candidate.getDay())} à ${time}`;
  }
  return `A ${time}`;
}

export function monthLabel(year: number, month: number): string {
  const names = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  return `${names[month]} ${year}`;
}
