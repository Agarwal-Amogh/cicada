import type { DayKey, DaySignals, EntryWithTags } from '@/domain/types';

/**
 * One row per day: what the user wrote (from the tags) beside what their
 * body and phone did. Pattern finding works on these rows only, so a new
 * data source is just a new column (Vision: "How much data the model handles").
 */
export type DayRow = {
  day: DayKey;
  /** Average tagged mood of that day's entries, -2..2. Null if nothing tagged. */
  mood: number | null;
  /** Each tagged entry's mood, with its id, for receipts. */
  entries: { id: string; mood: number; body: string }[];
  emotions: string[];
  triggers: string[];
  people: string[];
  sleepMinutes: number | null;
  lateScreenMinutes: number | null;
  screenMinutes: number | null;
  socialMinutes: number | null;
  steps: number | null;
};

export function dailyRows(entries: EntryWithTags[], days: DaySignals[]): DayRow[] {
  const signals = new Map(days.map((d) => [d.day, d]));
  const allDays = new Set([...days.map((d) => d.day), ...entries.map((e) => e.day)]);
  const rows: DayRow[] = [];
  for (const day of [...allDays].sort()) {
    const tagged = entries.filter((e) => e.day === day && e.tags);
    const s = signals.get(day);
    rows.push({
      day,
      mood: tagged.length ? tagged.reduce((a, e) => a + e.tags!.mood, 0) / tagged.length : null,
      entries: tagged.map((e) => ({ id: e.id, mood: e.tags!.mood, body: e.body })),
      emotions: unique(tagged.flatMap((e) => e.tags!.emotions)),
      triggers: unique(tagged.flatMap((e) => e.tags!.triggers)),
      people: unique(tagged.flatMap((e) => e.tags!.people)),
      sleepMinutes: s?.sleepMinutes ?? null,
      lateScreenMinutes: s?.lateScreenMinutes ?? null,
      screenMinutes: s?.screenMinutes ?? null,
      socialMinutes: s?.socialMinutes ?? null,
      steps: s?.steps ?? null,
    });
  }
  return rows;
}

const unique = (xs: string[]) => [...new Set(xs)];
