import type { DayKey } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/** The local calendar day of a moment. */
export function dayKey(date: Date): DayKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local midnight at the start of a day. */
export function startOfDay(day: DayKey): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(day: DayKey, n: number): DayKey {
  const date = startOfDay(day);
  date.setDate(date.getDate() + n);
  return dayKey(date);
}

/** Every day from `from` to `to`, both included. */
export function daysBetween(from: DayKey, to: DayKey): DayKey[] {
  const out: DayKey[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}
