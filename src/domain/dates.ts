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

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Monday of the week a day falls in. Weeks start on Monday. */
export function weekStart(day: DayKey): DayKey {
  const offset = (startOfDay(day).getDay() + 6) % 7;
  return addDays(day, -offset);
}

/** "Sat 22 Nov · 11:40 PM" */
export function formatEntryTime(ms: number): string {
  const d = new Date(ms);
  const h = d.getHours() % 12 || 12;
  const ampm = d.getHours() < 12 ? 'AM' : 'PM';
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${h}:${pad(d.getMinutes())} ${ampm}`;
}

/** "November 2026" */
export function monthTitle(day: DayKey): string {
  const d = startOfDay(day);
  return `${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

/** "M", "T", "W"… */
export function weekdayLetter(day: DayKey): string {
  return WEEKDAYS[startOfDay(day).getDay()][0];
}

/** The day of the month, as a number. */
export function dayOfMonth(day: DayKey): number {
  return startOfDay(day).getDate();
}

/** "Sat 22 Nov" */
export function formatDay(day: DayKey): string {
  const d = startOfDay(day);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** "22 Nov" */
export function shortDate(day: DayKey): string {
  const d = startOfDay(day);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
