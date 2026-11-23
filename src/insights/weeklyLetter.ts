import { addDays, startOfDay, weekStart } from '@/domain/dates';
import type { DayKey, DaySignals, EntryWithTags } from '@/domain/types';

import { findPatterns, type Pattern, type Receipt } from './patterns';
import { PATTERN_WINDOW_DAYS } from './weekNote';

export type WeeklyLetter = {
  /** Monday and Sunday of the week it covers. */
  from: DayKey;
  to: DayKey;
  /** Two or three short paragraphs. Empty while Cicada is still learning. */
  paragraphs: string[];
  /** The one thing to try this week, from the hardest pattern. */
  experiment: string | null;
  /** Every pattern behind the letter, strongest first, for the flashcards. */
  patterns: Pattern[];
};

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weekday = (day: DayKey) => WEEKDAYS[startOfDay(day).getDay()];
const NUMBERS = ['no', 'once', 'twice', 'three times', 'four times', 'five times', 'six times', 'every day'];
const times = (n: number) => NUMBERS[Math.min(n, NUMBERS.length - 1)];

/** The last full week, Monday to Sunday, before the one `today` is in. */
export function lastFullWeek(today: DayKey): { from: DayKey; to: DayKey } {
  const from = addDays(weekStart(today), -7);
  return { from, to: addDays(from, 6) };
}

/**
 * The Sunday letter (Board 2, 5A): short whatever happens. It covers the
 * hardest and the best pattern of the week in plain words and offers one
 * experiment; the rest wait behind "See all patterns". Written from the
 * patterns only, so every sentence has receipts. Ticket 05's on-device model
 * can later rephrase these sentences; it never adds claims of its own.
 */
export function weeklyLetter(entries: EntryWithTags[], days: DaySignals[], today: DayKey): WeeklyLetter {
  const { from, to } = lastFullWeek(today);
  const patterns = findPatterns(entries, days, addDays(to, -(PATTERN_WINDOW_DAYS - 1)), to);
  const inWeek = (p: Pattern) => p.receipts.filter((r) => r.day >= from && r.day <= to);

  const hard = patterns.find((p) => p.direction === 'hard' && p.kind !== 'late-screen-sleep' && inWeek(p).length > 0);
  const lateScreen = patterns.find((p) => p.kind === 'late-screen-sleep' && inWeek(p).length > 0);
  const good = patterns.find((p) => p.direction === 'good' && inWeek(p).length > 0);

  const paragraphs: string[] = [];
  if (hard) paragraphs.push(hardSentence(hard, inWeek(hard), lateScreen ? inWeek(lateScreen) : []));
  if (good) paragraphs.push(goodSentence(good, inWeek(good)));
  if (paragraphs.length) {
    paragraphs.push(
      patterns.length > 2
        ? `${patterns.length} patterns held over the last four weeks. Each one shows the days behind it.`
        : 'Each pattern shows the days behind it.',
    );
  }

  const experimentFrom = hard?.kind === 'short-sleep' && lateScreen ? lateScreen : hard ?? good;
  return { from, to, paragraphs, experiment: experimentFrom?.experiment ?? null, patterns };
}

function hardSentence(p: Pattern, week: Receipt[], lateNights: Receipt[]): string {
  const rough = week.filter((r) => r.mood !== null && r.mood <= -1).length;
  switch (p.kind) {
    case 'short-sleep': {
      const base = `You slept under six hours ${times(week.length)} this week`;
      const after =
        rough === week.length
          ? `and the day after each, you wrote about losing your temper.`
          : `and on ${rough} of those days you wrote about losing your temper.`;
      // Only claim the cause when every one of those nights had it.
      const late = new Set(lateNights.map((r) => r.day));
      const why = week.length >= 2 && week.every((r) => late.has(r.day))
        ? ` Each of those nights started with your phone past midnight.`
        : '';
      return `${base}, ${after}${why}`;
    }
    case 'trigger':
      return `${p.title.split(' ')[0]} came up ${times(week.length)} this week, and each time the entry was tense.`;
    default:
      return p.sentence;
  }
}

function goodSentence(p: Pattern, week: Receipt[]): string {
  const days = week.map((r) => weekday(r.day));
  const list = days.length > 1 ? `${days.slice(0, -1).join(', ')} and ${days.at(-1)}` : days[0];
  switch (p.kind) {
    case 'active-days':
      return `${list} went the other way: you moved more, and wrote some of your calmest entries.`;
    case 'person':
      return `Your best moments this week mentioned ${p.title.replace('Time with ', '')}, on ${list}.`;
    default:
      return p.sentence;
  }
}
