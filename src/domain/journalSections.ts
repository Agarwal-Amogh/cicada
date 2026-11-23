import { addDays, daysBetween, monthTitle, weekStart } from './dates';
import type { DayKey, EntryWithTags } from './types';

export type JournalSection = { title: string; data: EntryWithTags[] };

/**
 * Groups entries (newest first) for the Journal screen: "This week",
 * "Last week", then one section per month.
 */
export function journalSections(entries: EntryWithTags[], today: DayKey): JournalSection[] {
  const thisWeek = weekStart(today);
  const lastWeek = addDays(thisWeek, -7);
  const sections: JournalSection[] = [];
  for (const entry of entries) {
    const title =
      entry.day >= thisWeek ? 'This week' : entry.day >= lastWeek ? 'Last week' : monthTitle(entry.day);
    const last = sections.at(-1);
    if (last?.title === title) last.data.push(entry);
    else sections.push({ title, data: [entry] });
  }
  return sections;
}

export type WeekDay = { day: DayKey; written: boolean; isToday: boolean; isFuture: boolean };

/** Monday to Sunday of this week, with whether the user wrote each day. */
export function weekStrip(entries: EntryWithTags[], today: DayKey): WeekDay[] {
  const start = weekStart(today);
  const written = new Set(entries.map((e) => e.day));
  return daysBetween(start, addDays(start, 6)).map((day) => ({
    day,
    written: written.has(day),
    isToday: day === today,
    isFuture: day > today,
  }));
}
