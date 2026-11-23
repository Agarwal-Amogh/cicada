import type { DayKey, DaySignals, EntryWithTags } from '@/domain/types';

import { type DayRow, dailyRows } from './dailyRows';

// Cicada's pattern finder. Plain statistics over daily rows, no model:
// the model only tags entries and writes words around what this finds
// (Decision 0010). Every pattern carries its receipts, the days behind it.
//
// A pattern speaks only when it is solid (Vision: "Only solid patterns"):
// at least MIN_DAYS days on each side, a clear difference in mood, and it
// held on most of the days it is about, with enough days to be worth saying.

export type Receipt = {
  day: DayKey;
  /** The signal's value that day (minutes, steps), if the pattern has one. */
  value: number | null;
  /** That day's mood, -2..2, if written. */
  mood: number | null;
  /** The first line of what was written, for the receipt list. */
  excerpt: string | null;
};

export type PatternKind = 'short-sleep' | 'late-screen-sleep' | 'active-days' | 'person' | 'trigger';

/** Which daily number a chart should plot against mood. */
export type ChartSignal = 'sleepMinutes' | 'lateScreenMinutes' | 'steps' | null;

export type Pattern = {
  id: string;
  kind: PatternKind;
  /** Good for the user, or hard on them. */
  direction: 'good' | 'hard';
  title: string;
  sentence: string;
  /** How often it held: `held` of `of` days. */
  held: number;
  of: number;
  /** Difference in average mood (or minutes of sleep for late-screen-sleep). */
  effect: number;
  /** Used to rank patterns; higher is stronger. */
  strength: number;
  receipts: Receipt[];
  chart: ChartSignal;
  /** The one small thing to try (Vision: Experiment). */
  experiment: string;
};

export const MIN_DAYS = 3;
const MIN_MOOD_GAP = 0.8;
const MIN_HELD = 0.66;
/** Below this a pattern is too thin to show (e.g. 2 of 3 days). */
export const MIN_STRENGTH = 2;
const SHORT_NIGHT = 6 * 60;
const LATE_SCREEN = 60;
const ACTIVE_STEPS = 9000;

// Triggers that are the same thing in different words.
const TRIGGER_ALIASES: Record<string, string> = { exam: 'deadline' };
// Triggers already covered by a signal pattern.
const SKIP_TRIGGERS = new Set(['late night']);
const TRIGGER_NAMES: Record<string, { name: string; title: string }> = {
  deadline: { name: 'deadlines and exams', title: 'Deadlines weigh on you' },
};

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const hm = (m: number) => `${Math.floor(m / 60)} h ${String(Math.round(m % 60)).padStart(2, '0')} m`;
const excerpt = (row: DayRow) => row.entries[0]?.body.split(/(?<=[.!?])\s/)[0] ?? null;

type Split = { inside: DayRow[]; outside: DayRow[] };

/**
 * Compares mood on days where `test` holds against the rest. Returns null
 * unless the gap is clear and it held on most days.
 */
function moodGap(rows: DayRow[], test: (r: DayRow) => boolean | null) {
  const written = rows.filter((r) => r.mood !== null);
  const split: Split = { inside: [], outside: [] };
  for (const r of written) {
    const t = test(r);
    if (t === null) continue;
    (t ? split.inside : split.outside).push(r);
  }
  if (split.inside.length < MIN_DAYS || split.outside.length < MIN_DAYS) return null;
  const gap = mean(split.inside.map((r) => r.mood!)) - mean(split.outside.map((r) => r.mood!));
  if (Math.abs(gap) < MIN_MOOD_GAP) return null;
  const direction: Pattern['direction'] = gap > 0 ? 'good' : 'hard';
  const heldRows = split.inside.filter((r) => (direction === 'good' ? r.mood! >= 1 : r.mood! <= -1));
  const held = heldRows.length / split.inside.length;
  if (held < MIN_HELD) return null;
  return { split, gap, direction, held: heldRows.length, of: split.inside.length };
}

const strengthOf = (gap: number, held: number, of: number) => Math.abs(gap) * (held / of) * Math.sqrt(of);

/** Every solid pattern between `from` and `to` (both included), strongest first. */
export function findPatterns(entries: EntryWithTags[], days: DaySignals[], from: DayKey, to: DayKey): Pattern[] {
  const rows = dailyRows(
    entries.filter((e) => e.day >= from && e.day <= to),
    days.filter((d) => d.day >= from && d.day <= to),
  );
  const patterns: Pattern[] = [];
  const receiptsFor = (rs: DayRow[], value: (r: DayRow) => number | null): Receipt[] =>
    rs.map((r) => ({ day: r.day, value: value(r), mood: r.mood, excerpt: excerpt(r) }));

  // 1. Last night's sleep and today's mood.
  const sleep = moodGap(rows, (r) => (r.sleepMinutes === null ? null : r.sleepMinutes < SHORT_NIGHT));
  if (sleep && sleep.direction === 'hard') {
    patterns.push({
      id: 'short-sleep',
      kind: 'short-sleep',
      direction: 'hard',
      title: 'Short nights, short temper',
      sentence: `After nights under six hours, your entries were rougher ${sleep.held} of ${sleep.of} times.`,
      held: sleep.held,
      of: sleep.of,
      effect: sleep.gap,
      strength: strengthOf(sleep.gap, sleep.held, sleep.of),
      receipts: receiptsFor(sleep.split.inside, (r) => r.sleepMinutes),
      chart: 'sleepMinutes',
      experiment: 'Aim for lights out by 12:30 on weeknights.',
    });
  }

  // 2. Late-night phone use and that night's sleep (signal to signal).
  const withBoth = rows.filter((r) => r.lateScreenMinutes !== null && r.sleepMinutes !== null);
  const late = withBoth.filter((r) => r.lateScreenMinutes! > LATE_SCREEN);
  const early = withBoth.filter((r) => r.lateScreenMinutes! <= LATE_SCREEN);
  if (late.length >= MIN_DAYS && early.length >= MIN_DAYS) {
    const lateSleep = mean(late.map((r) => r.sleepMinutes!));
    const earlySleep = mean(early.map((r) => r.sleepMinutes!));
    const gap = earlySleep - lateSleep;
    const heldRows = late.filter((r) => r.sleepMinutes! < SHORT_NIGHT);
    if (gap >= 60 && heldRows.length / late.length >= MIN_HELD) {
      patterns.push({
        id: 'late-screen-sleep',
        kind: 'late-screen-sleep',
        direction: 'hard',
        title: 'Late scrolling, short nights',
        sentence: `On nights with over an hour on your phone after midnight, you slept ${hm(lateSleep)}, against ${hm(earlySleep)} otherwise.`,
        held: heldRows.length,
        of: late.length,
        effect: gap,
        // Minutes, so scale to sit beside mood gaps (an hour ~ one mood step).
        strength: strengthOf(gap / 60, heldRows.length, late.length),
        receipts: receiptsFor(late, (r) => r.lateScreenMinutes),
        chart: 'lateScreenMinutes',
        experiment: 'Phone down by 12:30 on weeknights. Charge it away from the bed.',
      });
    }
  }

  // 3. Active days.
  const active = moodGap(rows, (r) => (r.steps === null ? null : r.steps >= ACTIVE_STEPS));
  if (active && active.direction === 'good') {
    patterns.push({
      id: 'active-days',
      kind: 'active-days',
      direction: 'good',
      title: 'Moving helps',
      sentence: `On days with over 9,000 steps, your entries were calmer and brighter ${active.held} of ${active.of} times.`,
      held: active.held,
      of: active.of,
      effect: active.gap,
      strength: strengthOf(active.gap, active.held, active.of),
      receipts: receiptsFor(active.split.inside, (r) => r.steps),
      chart: 'steps',
      experiment: 'A 20-minute walk or run before class, three mornings this week.',
    });
  }

  // 4. People. Only good patterns: Cicada doesn't blame people (Vision: patterns, never diagnoses).
  const people = new Set(rows.flatMap((r) => r.people));
  for (const person of people) {
    const p = moodGap(rows, (r) => r.people.includes(person));
    if (!p || p.direction !== 'good') continue;
    patterns.push({
      id: `person-${person.toLowerCase()}`,
      kind: 'person',
      direction: 'good',
      title: `Time with ${person}`,
      sentence: `Entries that mention ${person} were among your best, good ${p.held} of ${p.of} times.`,
      held: p.held,
      of: p.of,
      effect: p.gap,
      strength: strengthOf(p.gap, p.held, p.of),
      receipts: receiptsFor(p.split.inside, () => null),
      chart: null,
      experiment: `Make time for ${person} this week.`,
    });
  }

  // 5. Triggers the user wrote about.
  const norm = (t: string) => TRIGGER_ALIASES[t] ?? t;
  const triggers = new Set(rows.flatMap((r) => r.triggers.map(norm)).filter((t) => !SKIP_TRIGGERS.has(t)));
  for (const trigger of triggers) {
    const t = moodGap(rows, (r) => r.triggers.map(norm).includes(trigger));
    if (!t || t.direction !== 'hard') continue;
    const name = TRIGGER_NAMES[trigger]?.name ?? trigger;
    const title = TRIGGER_NAMES[trigger]?.title ?? `${trigger[0].toUpperCase()}${trigger.slice(1)} weighs on you`;
    patterns.push({
      id: `trigger-${trigger.replace(/\s+/g, '-')}`,
      kind: 'trigger',
      direction: 'hard',
      title,
      sentence: `When you wrote about ${name}, the entry was tense ${t.held} of ${t.of} times.`,
      held: t.held,
      of: t.of,
      effect: t.gap,
      strength: strengthOf(t.gap, t.held, t.of),
      receipts: receiptsFor(t.split.inside, () => null),
      chart: null,
      experiment: 'Split the next deadline into one small piece a day, starting today.',
    });
  }

  return patterns.filter((p) => p.strength >= MIN_STRENGTH).sort((a, b) => b.strength - a.strength);
}
