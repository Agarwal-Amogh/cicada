import { addDays } from '@/domain/dates';
import type { DayKey, DaySignals, EntryWithTags } from '@/domain/types';

import { findPatterns, type Pattern } from './patterns';

export type WeekNote = {
  label: string;
  sentence: string;
  /** The pattern it comes from, for "See why". */
  patternId: string;
  /** This week's days behind it, for the receipts. */
  days: DayKey[];
};

/** How far back the finder looks for patterns: about a month. */
export const PATTERN_WINDOW_DAYS = 28;

/**
 * The one note on top of the Journal screen (Decision 0009). It names the
 * strongest pattern that showed up at least twice in the last seven days,
 * in words about this week. Patterns about feelings win over sleep-only
 * ones, because tying feelings to the body is Cicada's point.
 */
export function weekNote(entries: EntryWithTags[], days: DaySignals[], today: DayKey): WeekNote | null {
  const weekFrom = addDays(today, -6);
  const patterns = findPatterns(entries, days, addDays(today, -(PATTERN_WINDOW_DAYS - 1)), today);
  const candidates = patterns
    .map((p) => ({ p, week: p.receipts.filter((r) => r.day >= weekFrom && r.day <= today) }))
    .filter(({ week }) => week.length >= 2)
    .sort((a, b) => Number(b.p.kind !== 'late-screen-sleep') - Number(a.p.kind !== 'late-screen-sleep'));
  const top = candidates[0];
  if (!top) return null;
  return {
    label: 'Noticed this week',
    sentence: weekSentence(top.p, top.week),
    patternId: top.p.id,
    days: top.week.map((r) => r.day),
  };
}

function weekSentence(p: Pattern, week: Pattern['receipts']): string {
  const n = week.length;
  const held = week.filter((r) =>
    r.mood === null ? false : p.direction === 'good' ? r.mood >= 1 : r.mood <= -1,
  ).length;
  switch (p.kind) {
    case 'short-sleep':
      return held === n
        ? `You wrote angrier on the ${n} days after sleeping under six hours.`
        : `You wrote angrier on ${held} of the ${n} days after sleeping under six hours.`;
    case 'late-screen-sleep':
      return `${n} nights this week you were on your phone past midnight, and slept under six hours after.`;
    case 'active-days':
      return `Your ${n} most active days this week were also your calmest.`;
    case 'person':
      return `Your best entries this week mention ${p.title.replace('Time with ', '')}.`;
    case 'trigger':
      return `${p.title.split(' ')[0]} came up ${n} times this week, each time with a tense entry.`;
  }
}
