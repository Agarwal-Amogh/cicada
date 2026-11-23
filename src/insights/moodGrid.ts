import { addDays, daysBetween, startOfDay, weekStart } from '@/domain/dates';
import type { DayKey, EntryWithTags } from '@/domain/types';

export type GridCell = {
  day: DayKey;
  /** -2..2 from the tags, or the one-tap mood mapped to that scale. Null if nothing written. */
  mood: number | null;
  inMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
};

/** The first day of the month a day falls in. */
export function monthStart(day: DayKey): DayKey {
  return `${day.slice(0, 7)}-01`;
}

export function shiftMonth(month: DayKey, by: number): DayKey {
  const d = startOfDay(month);
  d.setMonth(d.getMonth() + by, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/**
 * "Mood at a glance" (Board 2, 4C): the month as weeks of seven days,
 * Monday first, each day's mood averaged from its entries.
 */
export function moodGrid(month: DayKey, entries: EntryWithTags[], today: DayKey): GridCell[][] {
  const first = monthStart(month);
  const last = addDays(shiftMonth(first, 1), -1);
  const moods = new Map<DayKey, number[]>();
  for (const e of entries) {
    const m = e.tags ? e.tags.mood : e.mood !== null ? e.mood - 3 : null;
    if (m === null) continue;
    moods.set(e.day, [...(moods.get(e.day) ?? []), m]);
  }
  const cells = daysBetween(weekStart(first), addDays(weekStart(last), 6)).map((day) => {
    const ms = moods.get(day);
    return {
      day,
      mood: ms ? ms.reduce((a, b) => a + b, 0) / ms.length : null,
      inMonth: day >= first && day <= last,
      isToday: day === today,
      isFuture: day > today,
    };
  });
  const weeks: GridCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
