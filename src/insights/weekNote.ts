import { addDays } from '@/domain/dates';
import type { DayKey, DaySignals, EntryWithTags } from '@/domain/types';

export type WeekNote = {
  label: string;
  sentence: string;
  /** The days it is based on, for the receipts. */
  days: DayKey[];
};

const SHORT_NIGHT = 6 * 60;

/**
 * The note on top of the Journal screen. A first, simple finder: in the last
 * seven days, did rough entries follow short nights? Ticket 06's pattern
 * finder replaces this with the full set of patterns.
 * Speaks only when it holds on at least two short nights and most of them.
 */
export function weekNote(entries: EntryWithTags[], days: DaySignals[], today: DayKey): WeekNote | null {
  const from = addDays(today, -6);
  const sleepByDay = new Map(days.map((d) => [d.day, d.sleepMinutes]));
  const shortNights = entries.filter((e) => {
    if (e.day < from || e.day > today || !e.tags) return false;
    const sleep = sleepByDay.get(e.day);
    return sleep != null && sleep < SHORT_NIGHT;
  });
  const rough = shortNights.filter((e) => e.tags!.mood <= -1);
  if (shortNights.length < 2 || rough.length / shortNights.length < 0.66) return null;

  const n = rough.length;
  const sentence =
    n === shortNights.length
      ? `You wrote angrier on the ${n} days after sleeping under six hours.`
      : `You wrote angrier on ${n} of the ${shortNights.length} days after sleeping under six hours.`;
  return { label: 'Noticed this week', sentence, days: rough.map((e) => e.day) };
}
