import { daysBetween } from '@/domain/dates';
import type { DayKey } from '@/domain/types';

import type { DayRow } from './dailyRows';
import type { Pattern } from './patterns';

export type ChartPoint = {
  day: DayKey;
  value: number | null;
  /** The bar is on the pattern's side of the line (a short night, an active day). */
  highlight: boolean;
  /** A dot above the bar: the day went the way the pattern says (a rough entry, a short night). */
  marker: boolean;
};

export type ChartSpec = {
  points: ChartPoint[];
  threshold: number;
  thresholdLabel: string;
  markerLabel: string;
  barLabel: string;
  max: number;
};

/**
 * What a pattern's chart shows (Decision 0009: every chart answers something).
 * Bars are the signal per day; the line is where the pattern starts; dots
 * mark the days that went the pattern's way. Null for patterns with no signal.
 */
export function chartSpec(pattern: Pattern, rows: DayRow[], from: DayKey, to: DayKey): ChartSpec | null {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const days = daysBetween(from, to);
  const rough = (r?: DayRow) => r?.mood != null && r.mood <= -1;
  const good = (r?: DayRow) => r?.mood != null && r.mood >= 1;

  let spec: Omit<ChartSpec, 'points' | 'max'> & {
    value: (r?: DayRow) => number | null;
    highlight: (v: number) => boolean;
    marker: (r?: DayRow) => boolean;
  };
  switch (pattern.chart) {
    case 'sleepMinutes':
      spec = {
        value: (r) => (r?.sleepMinutes == null ? null : r.sleepMinutes / 60),
        highlight: (v) => v < 6,
        marker: rough,
        threshold: 6,
        thresholdLabel: '6 h',
        barLabel: 'hours slept',
        markerLabel: 'rough entry',
      };
      break;
    case 'lateScreenMinutes':
      spec = {
        value: (r) => r?.lateScreenMinutes ?? null,
        highlight: (v) => v > 60,
        marker: (r) => r?.sleepMinutes != null && r.sleepMinutes < 360,
        threshold: 60,
        thresholdLabel: '1 h',
        barLabel: 'minutes on phone after midnight',
        markerLabel: 'slept under 6 h',
      };
      break;
    case 'steps':
      spec = {
        value: (r) => r?.steps ?? null,
        highlight: (v) => v >= 9000,
        marker: good,
        threshold: 9000,
        thresholdLabel: '9k',
        barLabel: 'steps',
        markerLabel: 'good entry',
      };
      break;
    default:
      return null;
  }

  const points = days.map((day) => {
    const r = byDay.get(day);
    const value = spec.value(r);
    return { day, value, highlight: value !== null && spec.highlight(value), marker: spec.marker(r) };
  });
  const values = points.map((p) => p.value ?? 0);
  return {
    points,
    threshold: spec.threshold,
    thresholdLabel: spec.thresholdLabel,
    barLabel: spec.barLabel,
    markerLabel: spec.markerLabel,
    max: Math.max(spec.threshold * 1.25, ...values),
  };
}

/** A day's signal in words: "4 h 50 m slept", "11,240 steps", "95 min on phone after midnight". */
export function formatSignal(spec: Pick<ChartSpec, 'barLabel'>, value: number): string {
  if (spec.barLabel === 'hours slept') {
    const m = Math.round(value * 60);
    return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} m slept`;
  }
  if (spec.barLabel === 'steps') return `${Math.round(value).toLocaleString('en-IN')} steps`;
  return `${Math.round(value)} min on phone after midnight`;
}
