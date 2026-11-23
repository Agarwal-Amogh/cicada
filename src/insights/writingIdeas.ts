import { addDays, startOfDay } from '@/domain/dates';
import type { DayKey, DaySignals, EntryWithTags } from '@/domain/types';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekday = (day: DayKey) => WEEKDAYS[startOfDay(day).getDay()];
const hm = (minutes: number) => `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} m`;

// Used when Cicada hasn't learned enough yet, or to fill up to three.
const GENERAL = [
  'What took most of your energy today?',
  'What is one thing from today you want to remember?',
  'Who did you talk to today, and how did it feel?',
  'What is on your mind that you have not said out loud?',
];

/**
 * Up to three things to write about, from what Cicada has learned
 * (Decision 0008: ideas only when asked, never a chat). Entries newest first.
 */
export function writingIdeas(entries: EntryWithTags[], days: DaySignals[], today: DayKey): string[] {
  const ideas: string[] = [];
  const recent = entries.filter((e) => e.day >= addDays(today, -14) && e.day < today && e.tags);

  // Last night's sleep, if it was short.
  const lastNight = days.find((d) => d.day === today)?.sleepMinutes;
  if (lastNight != null && lastNight < 6 * 60) {
    ideas.push(`You slept ${hm(lastNight)} last night. How is today going so far?`);
  }

  // The calmest recent day: what was different?
  const calm = recent.find((e) => e.tags!.mood >= 2);
  if (calm) ideas.push(`${weekday(calm.day)} was one of your calmest days. What was different?`);

  // Someone who used to come up but hasn't lately.
  const lastSeen = new Map<string, DayKey>();
  for (const e of entries) {
    for (const p of e.tags?.people ?? []) if (!lastSeen.has(p)) lastSeen.set(p, e.day);
  }
  const counts = new Map<string, number>();
  for (const e of entries) for (const p of e.tags?.people ?? []) counts.set(p, (counts.get(p) ?? 0) + 1);
  const faded = [...lastSeen.entries()]
    .filter(([p, day]) => day <= addDays(today, -3) && (counts.get(p) ?? 0) >= 3)
    .sort((a, b) => (counts.get(b[0]) ?? 0) - (counts.get(a[0]) ?? 0))[0];
  if (faded) ideas.push(`You haven't written about ${faded[0]} since ${weekday(faded[1])}.`);

  for (const g of GENERAL) {
    if (ideas.length >= 3) break;
    ideas.push(g);
  }
  return ideas.slice(0, 3);
}
